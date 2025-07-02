import { ByteArray } from "./array.js";
import { SecretBoxLength } from "./secretbox.js";
import { BoxLength } from "./box.js";

export function checkLengths(k: ByteArray, n: ByteArray) {
  if (k.length !== SecretBoxLength.Key) throw new Error("bad key size");
  if (n.length !== SecretBoxLength.Nonce) throw new Error("bad nonce size");
}

export function checkBoxLengths(pk: ByteArray, sk: ByteArray) {
  if (pk.length !== BoxLength.PublicKey) throw new Error("bad public key size");
  if (sk.length !== BoxLength.SecretKey) throw new Error("bad secret key size");
}

export function checkArrayTypes(...arrays: ByteArray[]) {
  for (const array of arrays) {
    if (!(array instanceof Uint8Array)) {
      throw new TypeError("unexpected type, use ByteArray");
    }
  }
}
