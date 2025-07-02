import {
  _hash,
  gf,
  multiplication,
  subtraction,
  addition,
  gf1,
  pack25519,
  inv25519,
  unpackneg,
} from "../tweetnacl/index.js";

/**
 * Converts Ed25519 public key to Curve25519 public key.
 *
 * montgomeryX = (edwardsY + 1)*inverse(1 - edwardsY) mod p
 */
export function convertPublicKey(pk: Uint8Array) {
  let z = new Uint8Array(32),
    q = [gf(), gf(), gf(), gf()],
    a = gf(),
    b = gf();

  if (unpackneg(q, pk)) {
    throw new TypeError("invalid public key");
  }

  let y = q[1];

  addition(a, gf1, y);
  subtraction(b, gf1, y);
  inv25519(b, b);
  multiplication(a, a, b);

  pack25519(z, a);
  return z;
}

/**
 * Converts Ed25519 secret key to Curve25519 secret key.
 *
 */
export function convertSecretKey(sk: Uint8Array) {
  let d = new Uint8Array(64),
    o = new Uint8Array(32),
    i;
  _hash(d, sk, 32);
  d[0] &= 248;
  d[31] &= 127;
  d[31] |= 64;
  for (i = 0; i < 32; i++) o[i] = d[i];
  for (i = 0; i < 64; i++) d[i] = 0;
  return o;
}
