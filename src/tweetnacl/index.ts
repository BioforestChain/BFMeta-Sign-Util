export * from "./sign";
export * from "./box";
export * from "./core";
export * from "./hash";
export * from "./curve25519";

import {
  sign_detached,
  sign_detached_verify,
  sign_keyPair_fromSecretKey,
  sign_keyPair_fromSeed,
} from "./sign";
import { BoxLength, box, box_open } from "./box";
import type { ByteArray } from "./array";

export class KeypairHelper implements BFChainSignUtil.KeypairHelperInterface {
  private __buffer: BFChainSignUtil.Buffer.BufferConstructor;
  constructor(buffer: BFChainSignUtil.Buffer.BufferConstructor) {
    this.__buffer = buffer;
  }

  create(secretHash: Uint8Array) {
    const keypair = sign_keyPair_fromSeed(secretHash);
    return {
      secretKey: this.__buffer.from(keypair.secretKey),
      publicKey: this.__buffer.from(keypair.publicKey),
    };
  }

  createBySecretKey(secretKey: ByteArray) {
    const keypair = sign_keyPair_fromSecretKey(secretKey);
    return {
      secretKey: this.__buffer.from(keypair.secretKey),
      publicKey: this.__buffer.from(keypair.publicKey),
    };
  }

  detached_sign(hash: Uint8Array, secretKey: Uint8Array) {
    return this.__buffer.from(sign_detached(hash, secretKey));
  }

  detached_verify(hash: Uint8Array, signatureBuffer: Uint8Array, publicKey: Uint8Array) {
    return sign_detached_verify(hash, signatureBuffer, publicKey);
  }

  box(
    msg: Uint8Array,
    publicKey: Uint8Array,
    secretKey: Uint8Array,
    nonce = new Uint8Array(BoxLength.Nonce),
  ) {
    const encryptedMessage = box(msg, nonce, publicKey, secretKey);
    return { encryptedMessage, nonce };
  }

  open(msg: Uint8Array, nonce: Uint8Array, publicKey: Uint8Array, secretKey: Uint8Array) {
    return box_open(msg, nonce, publicKey, secretKey) || false;
  }
}
