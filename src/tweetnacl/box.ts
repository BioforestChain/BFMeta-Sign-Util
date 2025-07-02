import { ByteArray } from "./array.js";
import { _0 } from "./core.js";
import { _randomBytes } from "./random.js";
import { _hsalsa20, _sigma } from "./salsa20.js";
import { _scalarMult, _scalarMult_base } from "./scalarmult.js";
import { secretbox, secretbox_open, SecretBoxLength } from "./secretbox.js";
import { checkArrayTypes, checkBoxLengths } from "./check.js";

export const enum BoxLength {
  PublicKey = 32, // public key bytes
  SecretKey = 32, // secret key bytes
  SharedKey = 32, // before nm bytes
  Nonce = SecretBoxLength.Nonce, // nonce bytes
  Overhead = SecretBoxLength.Overhead, // zero bytes
}

export interface BoxKeyPair {
  publicKey: ByteArray;
  secretKey: ByteArray;
}

export function box(
  msg: ByteArray,
  nonce: ByteArray,
  publicKey: ByteArray,
  secretKey: ByteArray,
): ByteArray {
  const k = box_before(publicKey, secretKey);

  return secretbox(msg, nonce, k);
}

export function box_before(publicKey: ByteArray, secretKey: ByteArray): ByteArray {
  checkArrayTypes(publicKey, secretKey);
  checkBoxLengths(publicKey, secretKey);

  const k = new ByteArray(BoxLength.SharedKey);

  _box_beforenm(k, publicKey, secretKey);

  return k;
}

export const box_after: (msg: ByteArray, nonce: ByteArray, key: ByteArray) => ByteArray = secretbox;

export function box_open(
  msg: ByteArray,
  nonce: ByteArray,
  publicKey: ByteArray,
  secretKey: ByteArray,
): ByteArray | undefined {
  const k = box_before(publicKey, secretKey);

  return secretbox_open(msg, nonce, k);
}

export const box_open_after: (
  box: ByteArray,
  nonce: ByteArray,
  key: ByteArray,
) => ByteArray | undefined = secretbox_open;

export function box_keyPair(): BoxKeyPair {
  const pk = new ByteArray(BoxLength.PublicKey);
  const sk = new ByteArray(BoxLength.SecretKey);

  _box_keypair(pk, sk);

  return { publicKey: pk, secretKey: sk };
}

export function box_keyPair_fromSecretKey(secretKey: ByteArray): BoxKeyPair {
  checkArrayTypes(secretKey);

  if (secretKey.length !== BoxLength.SecretKey) throw new Error("bad secret key size");

  const pk = new ByteArray(BoxLength.PublicKey);

  _scalarMult_base(pk, secretKey);

  return { publicKey: pk, secretKey: new ByteArray(secretKey) };
}

// low level
function _box_keypair(y: ByteArray, x: ByteArray) {
  _randomBytes(x, 32);

  return _scalarMult_base(y, x);
}

function _box_beforenm(k: ByteArray, y: ByteArray, x: ByteArray) {
  const s = new ByteArray(32);

  _scalarMult(s, x, y);

  return _hsalsa20(k, _0, s, _sigma);
}
