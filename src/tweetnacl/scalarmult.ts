import { ByteArray, NumArray } from "./array.js";
import { gf, _9, _121665, addition, subtraction, multiplication, squaring } from "./core.js";
import { sel25519, inv25519, pack25519, unpack25519 } from "./curve25519.js";
import { checkArrayTypes } from "./check.js";

export const enum ScalarLength {
  Scalar = 32, // scalar bytes
  GroupElement = 32, // bytes
}

export function scalarMult(n: ByteArray, p: ByteArray) {
  checkArrayTypes(n, p);

  if (n.length !== ScalarLength.Scalar) throw new Error("bad n size");
  if (p.length !== ScalarLength.GroupElement) throw new Error("bad p size");

  const q = new ByteArray(ScalarLength.GroupElement);

  _scalarMult(q, n, p);

  return q;
}

export function scalarMult_base(n: ByteArray) {
  checkArrayTypes(n);

  if (n.length !== ScalarLength.Scalar) throw new Error("bad n size");

  const q = new ByteArray(ScalarLength.GroupElement);

  _scalarMult_base(q, n);

  return q;
}

// low level

export function _scalarMult(q: ByteArray, n: ByteArray, p: ByteArray): 0 {
  const z: ByteArray = new ByteArray(32);
  const x: NumArray = new NumArray(80);
  const a: NumArray = gf();
  const b: NumArray = gf();
  const c: NumArray = gf();
  const d: NumArray = gf();
  const e: NumArray = gf();
  const f: NumArray = gf();

  let r, i;

  for (i = 0; i < 31; i++) z[i] = n[i];

  z[31] = (n[31] & 127) | 64;
  z[0] &= 248;

  unpack25519(x, p);

  for (i = 0; i < 16; i++) {
    b[i] = x[i];
    d[i] = a[i] = c[i] = 0;
  }

  a[0] = d[0] = 1;

  for (i = 254; i >= 0; --i) {
    r = (z[i >>> 3] >>> (i & 7)) & 1;
    sel25519(a, b, r);
    sel25519(c, d, r);
    addition(e, a, c);
    subtraction(a, a, c);
    addition(c, b, d);
    subtraction(b, b, d);
    squaring(d, e);
    squaring(f, a);
    multiplication(a, c, a);
    multiplication(c, b, e);
    addition(e, a, c);
    subtraction(a, a, c);
    squaring(b, a);
    subtraction(c, d, f);
    multiplication(a, c, _121665);
    addition(a, a, d);
    multiplication(c, c, a);
    multiplication(a, d, f);
    multiplication(d, b, x);
    squaring(b, e);
    sel25519(a, b, r);
    sel25519(c, d, r);
  }

  for (i = 0; i < 16; i++) {
    x[i + 16] = a[i];
    x[i + 32] = c[i];
    x[i + 48] = b[i];
    x[i + 64] = d[i];
  }

  const x32 = x.subarray(32);
  const x16 = x.subarray(16);

  inv25519(x32, x32);
  multiplication(x16, x16, x32);
  pack25519(q, x16);

  return 0;
}

export function _scalarMult_base(q: ByteArray, n: ByteArray): 0 {
  return _scalarMult(q, n, _9);
}
