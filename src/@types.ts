export {};
export {} from "./@types.legacy.js";

declare global {
  namespace BFMetaSignUtil {
    namespace Buffer {
      type BinaryLike = import("node:crypto").BinaryLike;
      type TextEncoding = import("node:crypto").Encoding;
      type BinaryToTextEncoding = import("node:crypto").BinaryToTextEncoding;
    }
    type Keypair = {
      publicKey: Buffer;
      secretKey: Buffer;
    };

    interface KeypairHelperInterface {
      /**生成公私钥对 */
      create(secretHash: Uint8Array): Keypair;
      /**非对称签名 */
      detached_sign(hash: Uint8Array, secretKey: Uint8Array): Buffer;
      /**非对称验签 */
      detached_verify(
        hash: Uint8Array,
        signatureBuffer: Uint8Array,
        publicKeyBuffer: Uint8Array,
      ): boolean;
      /**非对称加密 */
      box(
        msg: Uint8Array,
        publicKey: Uint8Array,
        secretKey: Uint8Array,
        nonce?: Uint8Array,
      ): {
        nonce: Uint8Array;
        encryptedMessage: Uint8Array;
      };
      /**非对称解密 */
      open(
        msg: Uint8Array,
        nonce: Uint8Array,
        publicKey: Uint8Array,
        secretKey: Uint8Array,
      ): Uint8Array | false;
    }

    interface Ed2curveHelperInterface {
      convertPublicKey(pk: Uint8Array): Uint8Array;
      convertSecretKey(sk: Uint8Array): Uint8Array;
    }

    interface CryptoAsyncHash {
      update(data: Buffer.BinaryLike): this;
      update(data: string, input_encoding: Buffer.TextEncoding): this;
      digest(): Buffer;
      digest(encoding: Buffer.BinaryToTextEncoding): string;
    }
    interface CryptoHelperInterface {
      sha256(msg: string): Promise<Buffer>;
      sha256(msg: Uint8Array): Promise<Buffer>;
      md5(): Promise<CryptoAsyncHash>;
      md5(data: Buffer.BinaryLike): Promise<Buffer>;
      ripemd160(): Promise<CryptoAsyncHash>;
      ripemd160(data: Buffer.BinaryLike): Promise<Buffer>;
    }
  }
}
