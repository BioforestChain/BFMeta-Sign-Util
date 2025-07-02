import { ByteArray, NumArray } from "./array.js";
import { _verify_32 } from "./verify.js";
import {
  gf,
  gf0,
  gf1,
  D2,
  addition,
  D,
  squaring,
  multiplication,
  X,
  Y,
  subtraction,
  I,
} from "./core.js";
import { _randomBytes } from "./random.js";
import {
  set25519,
  sel25519,
  inv25519,
  pack25519,
  unpack25519,
  par25519,
  neq25519,
} from "./curve25519.js";
import { _hash } from "./hash.js";
import { checkArrayTypes } from "./check.js";

export const enum SignLength {
  PublicKey = 32, // public key bytes
  SecretKey = 64, // secret key bytes
  Seed = 32, // seed bytes
  Signature = 64, // signature bytes
}

export interface SignKeyPair {
  publicKey: ByteArray;
  secretKey: ByteArray;
}

export function sign(msg: ByteArray, secretKey: ByteArray): ByteArray {
  checkArrayTypes(msg, secretKey);

  if (secretKey.length !== SignLength.SecretKey) throw new Error("bad secret key size");

  const signedMsg = new ByteArray(SignLength.Signature + msg.length);

  _sign(signedMsg, msg, msg.length, secretKey);

  return signedMsg;
}

export function sign_open(signedMsg: ByteArray, publicKey: ByteArray): ByteArray | undefined {
  checkArrayTypes(signedMsg, publicKey);

  if (publicKey.length !== SignLength.PublicKey) throw new Error("bad public key size");

  const tmp = new ByteArray(signedMsg.length);

  const mlen = _sign_open(tmp, signedMsg, signedMsg.length, publicKey);

  if (mlen < 0) return;

  const m = new ByteArray(mlen);

  for (let i = 0; i < m.length; i++) m[i] = tmp[i];

  return m;
}

export function sign_detached(msg: ByteArray, secretKey: ByteArray): ByteArray {
  const signedMsg = sign(msg, secretKey);

  const sig = new ByteArray(SignLength.Signature);

  for (let i = 0; i < sig.length; i++) sig[i] = signedMsg[i];

  return sig;
}

export function sign_detached_verify(
  msg: ByteArray,
  sig: ByteArray,
  publicKey: ByteArray,
): boolean {
  checkArrayTypes(msg, sig, publicKey);

  if (sig.length !== SignLength.Signature) throw new Error("bad signature size");

  if (publicKey.length !== SignLength.PublicKey) throw new Error("bad public key size");

  const sm = new ByteArray(SignLength.Signature + msg.length);
  const m = new ByteArray(SignLength.Signature + msg.length);

  sm.set(sig);
  sm.set(msg, SignLength.Signature);

  return _sign_open(m, sm, sm.length, publicKey) >= 0;
}

export function sign_keyPair(): SignKeyPair {
  const pk = new ByteArray(SignLength.PublicKey);
  const sk = new ByteArray(SignLength.SecretKey);

  _sign_keypair(pk, sk, false);

  return { publicKey: pk, secretKey: sk };
}

export function sign_keyPair_fromSecretKey(secretKey: ByteArray): SignKeyPair {
  checkArrayTypes(secretKey);

  if (secretKey.length !== SignLength.SecretKey) throw new Error("bad secret key size");

  const pk = new ByteArray(SignLength.PublicKey);

  for (let i = 0; i < pk.length; i++) pk[i] = secretKey[32 + i];

  return { publicKey: pk, secretKey: new ByteArray(secretKey) };
}

export function sign_keyPair_fromSeed(seed: ByteArray): SignKeyPair {
  checkArrayTypes(seed);

  if (seed.length !== SignLength.Seed) throw new Error("bad seed size");

  const pk = new ByteArray(SignLength.PublicKey);
  const sk = new ByteArray(SignLength.SecretKey);

  for (let i = 0; i < 32; i++) sk[i] = seed[i];

  _sign_keypair(pk, sk, true);

  return { publicKey: pk, secretKey: sk };
}

// low level

function _sign_keypair(pk: ByteArray, sk: ByteArray, seeded: boolean): number {
  const d = new ByteArray(64);
  const p = [gf(), gf(), gf(), gf()];
  let i;

  if (!seeded) _randomBytes(sk, 32);

  _hash(d, sk, 32);
  d[0] &= 248;
  d[31] &= 127;
  d[31] |= 64;

  scalarbase(p, d);
  pack(pk, p);

  for (i = 0; i < 32; i++) sk[i + 32] = pk[i];

  return 0;
}

// Note: difference from C - smlen returned, not passed as argument.
function _sign(sm: ByteArray, m: ByteArray, n: number, sk: ByteArray): number {
  const d = new ByteArray(64),
    h = new ByteArray(64),
    r = new ByteArray(64);
  const x = new NumArray(64);
  const p = [gf(), gf(), gf(), gf()];
  let i, j;

  _hash(d, sk, 32);

  d[0] &= 248;
  d[31] &= 127;
  d[31] |= 64;

  const smlen = n + 64;

  for (i = 0; i < n; i++) sm[64 + i] = m[i];
  for (i = 0; i < 32; i++) sm[32 + i] = d[32 + i];

  _hash(r, sm.subarray(32), n + 32);
  reduce(r);
  scalarbase(p, r);
  pack(sm, p);

  for (i = 32; i < 64; i++) sm[i] = sk[i];

  _hash(h, sm, n + 64);
  reduce(h);

  for (i = 0; i < 64; i++) x[i] = 0;
  for (i = 0; i < 32; i++) x[i] = r[i];
  for (i = 0; i < 32; i++) {
    for (j = 0; j < 32; j++) {
      x[i + j] += h[i] * d[j];
    }
  }

  modL(sm.subarray(32), x);

  return smlen;
}

function _sign_open(m: ByteArray, sm: ByteArray, n: number, pk: ByteArray): number {
  const t = new ByteArray(32),
    h = new ByteArray(64);
  const p = [gf(), gf(), gf(), gf()],
    q = [gf(), gf(), gf(), gf()];
  let i, mlen;

  mlen = -1;

  if (n < 64 || unpackneg(q, pk)) return -1;

  for (i = 0; i < n; i++) m[i] = sm[i];
  for (i = 0; i < 32; i++) m[i + 32] = pk[i];

  _hash(h, m, n);
  reduce(h);
  scalarmult(p, q, h);

  scalarbase(q, sm.subarray(32));

  add(p, q);
  pack(t, p);

  n -= 64;

  if (_verify_32(sm, 0, t, 0)) {
    for (i = 0; i < n; i++) m[i] = 0;
    return -1;
  }

  for (i = 0; i < n; i++) m[i] = sm[i + 64];

  mlen = n;

  return mlen;
}

export function scalarbase(p: NumArray[], s: ByteArray) {
  const q = [gf(), gf(), gf(), gf()];

  set25519(q[0], X);
  set25519(q[1], Y);
  set25519(q[2], gf1);

  multiplication(q[3], X, Y);

  scalarmult(p, q, s);
}

export function scalarmult(p: NumArray[], q: NumArray[], s: ByteArray) {
  let b, i;

  set25519(p[0], gf0);
  set25519(p[1], gf1);
  set25519(p[2], gf1);
  set25519(p[3], gf0);

  for (i = 255; i >= 0; --i) {
    b = (s[(i / 8) | 0] >> (i & 7)) & 1;
    cswap(p, q, b);
    add(q, p);
    add(p, p);
    cswap(p, q, b);
  }
}

export function pack(r: ByteArray, p: NumArray[]) {
  const tx = gf(),
    ty = gf(),
    zi = gf();

  inv25519(zi, p[2]);

  multiplication(tx, p[0], zi);
  multiplication(ty, p[1], zi);

  pack25519(r, ty);

  r[31] ^= par25519(tx) << 7;
}

export function unpackneg(r: NumArray[], p: ByteArray) {
  const t = gf(),
    chk = gf(),
    num = gf(),
    den = gf(),
    den2 = gf(),
    den4 = gf(),
    den6 = gf();

  set25519(r[2], gf1);
  unpack25519(r[1], p);
  squaring(num, r[1]);
  multiplication(den, num, D);
  subtraction(num, num, r[2]);
  addition(den, r[2], den);

  squaring(den2, den);
  squaring(den4, den2);
  multiplication(den6, den4, den2);
  multiplication(t, den6, num);
  multiplication(t, t, den);

  pow2523(t, t);
  multiplication(t, t, num);
  multiplication(t, t, den);
  multiplication(t, t, den);
  multiplication(r[0], t, den);

  squaring(chk, r[0]);
  multiplication(chk, chk, den);
  if (neq25519(chk, num)) multiplication(r[0], r[0], I);

  squaring(chk, r[0]);
  multiplication(chk, chk, den);
  if (neq25519(chk, num)) return -1;

  if (par25519(r[0]) === p[31] >> 7) subtraction(r[0], gf0, r[0]);

  multiplication(r[3], r[0], r[1]);
  return 0;
}

function reduce(r: ByteArray) {
  const x = new NumArray(64);
  let i;

  for (i = 0; i < 64; i++) x[i] = r[i];
  for (i = 0; i < 64; i++) r[i] = 0;

  modL(r, x);
}

const L = new NumArray([
  0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2, 0xde, 0xf9, 0xde, 0x14, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x10,
]);

function modL(r: ByteArray, x: NumArray) {
  let carry, i, j, k;

  for (i = 63; i >= 32; --i) {
    carry = 0;

    for (j = i - 32, k = i - 12; j < k; ++j) {
      x[j] += carry - 16 * x[i] * L[j - (i - 32)];
      carry = Math.floor((x[j] + 128) / 256);
      x[j] -= carry * 256;
    }

    x[j] += carry;
    x[i] = 0;
  }

  carry = 0;

  for (j = 0; j < 32; j++) {
    x[j] += carry - (x[31] >> 4) * L[j];
    carry = x[j] >> 8;
    x[j] &= 255;
  }

  for (j = 0; j < 32; j++) x[j] -= carry * L[j];

  for (i = 0; i < 32; i++) {
    x[i + 1] += x[i] >> 8;
    r[i] = x[i] & 255;
  }
}

function add(p: NumArray[], q: NumArray[]) {
  const a = gf(),
    b = gf(),
    c = gf(),
    d = gf(),
    e = gf(),
    f = gf(),
    g = gf(),
    h = gf(),
    t = gf();

  subtraction(a, p[1], p[0]);
  subtraction(t, q[1], q[0]);
  multiplication(a, a, t);
  addition(b, p[0], p[1]);
  addition(t, q[0], q[1]);
  multiplication(b, b, t);
  multiplication(c, p[3], q[3]);
  multiplication(c, c, D2);
  multiplication(d, p[2], q[2]);
  addition(d, d, d);
  subtraction(e, b, a);
  subtraction(f, d, c);
  addition(g, d, c);
  addition(h, b, a);

  multiplication(p[0], e, f);
  multiplication(p[1], h, g);
  multiplication(p[2], g, f);
  multiplication(p[3], e, h);
}

function cswap(p: NumArray[], q: NumArray[], b: number) {
  for (let i = 0; i < 4; i++) {
    sel25519(p[i], q[i], b);
  }
}

function pow2523(o: NumArray, i: NumArray) {
  const c = gf();
  let a;

  for (a = 0; a < 16; a++) c[a] = i[a];

  for (a = 250; a >= 0; a--) {
    squaring(c, c);
    if (a !== 1) multiplication(c, c, i);
  }

  for (a = 0; a < 16; a++) o[a] = c[a];
}
