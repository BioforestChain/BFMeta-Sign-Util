export {};
import type { Buffer } from "node:buffer";
import type {} from './@types.legacy.js'
declare global {
  namespace BFMetaSignUtil {
    namespace Buffer {
      type TypedArray =
        | Uint8Array
        | Uint8ClampedArray
        | Uint16Array
        | Uint32Array
        | Int8Array
        | Int16Array
        | Int32Array
        | Float32Array
        | Float64Array;
      type Binary = Buffer | TypedArray | DataView;
      type BinaryLike = string | Binary;
      type Utf8AsciiLatin1Encoding = "utf8" | "ascii" | "latin1";
      type HexBase64Latin1Encoding = "latin1" | "hex" | "base64";
      type BufferEncoding =
        | "ascii"
        | "utf8"
        | "utf-8"
        | "utf16le"
        | "ucs2"
        | "base64"
        | "latin1"
        | "binary"
        | "hex";
  
      interface Hash {
        update(data: BinaryLike): this;
        update(data: string, input_encoding: Utf8AsciiLatin1Encoding): this;
        digest(): Buffer;
        digest(encoding: HexBase64Latin1Encoding): string;
      }
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
      update(data: BFMetaSignUtil.Buffer.BinaryLike): this;
      update(data: string, input_encoding: BFMetaSignUtil.Buffer.Utf8AsciiLatin1Encoding): this;
      digest(): Buffer;
      digest(encoding: BFMetaSignUtil.Buffer.HexBase64Latin1Encoding): string;
    }
    interface CryptoHelperInterface {
      sha256(msg: string): Promise<Buffer>;
      sha256(msg: Uint8Array): Promise<Buffer>;
      md5(): Promise<CryptoAsyncHash>;
      md5(data: BFMetaSignUtil.Buffer.BinaryLike): Promise<Buffer>;
      ripemd160(): Promise<CryptoAsyncHash>;
      ripemd160(data: BFMetaSignUtil.Buffer.BinaryLike): Promise<Buffer>;
    }
  }
}
