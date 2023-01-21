import { Base58Helper } from "../base58";
import { ed2curveHelper } from "../ed2curve";
import { KeypairHelper } from "../tweetnacl";
import { encodeUTF8ToBinary } from "../encoding-utf8";
import { utf8Slice } from "../oldBuffer";

const FROZEN_PK_ADD_WM = new WeakMap<Uint8Array, BFMetaSignUtil.Buffer.Buffer>();

export class BFMetaSignUtil {
  private __prefix = "b";
  private __buffer: BFMetaSignUtil.Buffer.BufferConstructor;
  private __keypairHelper: KeypairHelper;
  private __cryptoHelper: BFMetaSignUtil.CryptoHelperInterface;
  private __base58Helper: Base58Helper;

  constructor(
    prefix: string,
    buffer: BFMetaSignUtil.Buffer.BufferConstructor,
    cryptoHelper: BFMetaSignUtil.CryptoHelperInterface,
  ) {
    this.__prefix = prefix;
    this.__buffer = buffer;
    this.__cryptoHelper = cryptoHelper;
    this.__keypairHelper = new KeypairHelper(buffer);
    this.__base58Helper = new Base58Helper(cryptoHelper, buffer);
  }

  /**
   * 判断地址是否符合规范
   * @param address 地址
   */
  async isAddress(address: any) {
    if (typeof address !== "string") {
      return false;
    }
    if (!/^[0-9]{1,20}$/g.test(address)) {
      if (address[0] !== this.__prefix) {
        return false;
      }
      if (!(await this.__base58Helper.decodeUnsafe(address.slice(1)))) {
        return false;
      }
    } else {
      return false;
    }

    return true;
  }

  /**
   * 生成公私钥对
   *
   * @param secret
   * @returns
   */
  async createKeypair(secret: string) {
    return this.__keypairHelper.create(await this.__cryptoHelper.sha256(secret));
  }

  /**
   * 根据私钥生成公私钥对
   *
   * @param secretKey
   * @returns
   */
  createKeypairBySecretKey(secretKey: Uint8Array) {
    return this.__keypairHelper.createBySecretKey(secretKey);
  }

  /**
   * 根据私钥生成公私钥对
   *
   * @param secretKey
   * @returns
   */
  createKeypairBySecretKeyString(secretKey: string) {
    return this.__keypairHelper.createBySecretKey(this.__buffer.from(secretKey, "hex"));
  }

  /**
   * 获取公钥
   *
   * @param secret
   * @returns
   */
  async getPublicKeyFromSecret(secret: string) {
    return (await this.createKeypair(secret)).publicKey.toString("hex");
  }

  /**
   * 根据公钥（Uint8Array）生成地址的二进制数据
   *
   * @param publicKey
   * @returns
   */
  async getBinaryAddressFromPublicKey(publicKey: Uint8Array) {
    const cachedResult = FROZEN_PK_ADD_WM.get(publicKey);
    if (cachedResult) return cachedResult;

    const h1 = await this.__cryptoHelper.sha256(publicKey);
    const h2 = await this.__cryptoHelper.ripemd160(h1);

    FROZEN_PK_ADD_WM.set(publicKey, h2);
    return h2;
  }

  /**
   * 根据公钥 （Uint8Array） 生成地址（base58）
   *
   * @param publicKey
   * @param prefix
   * @returns
   */
  async getAddressFromPublicKey(publicKey: Uint8Array, prefix = this.__prefix) {
    const address =
      prefix +
      (await this.__base58Helper.encode(await this.getBinaryAddressFromPublicKey(publicKey)));
    return address;
  }

  /**
   * 根据 公钥（hex） 生成地址（base58）
   *
   * @param publicKey
   * @param prefix
   * @returns
   */
  async getAddressFromPublicKeyString(publicKey: string, prefix = this.__prefix) {
    const address =
      prefix +
      (await this.__base58Helper.encode(
        await this.getBinaryAddressFromPublicKey(this.__buffer.from(publicKey, "hex")),
      ));
    return address;
  }

  /**
   * 根据主密码生成地址
   *
   * @param secret
   * @returns
   */
  async getAddressFromSecret(secret: string) {
    const keypair = await this.createKeypair(secret);
    return await this.getAddressFromPublicKey(keypair.publicKey);
  }

  /**
   * 根据主密码和二次密码生成密钥对
   * 这里虽然用了md5,当因为sha256后,所以还算安全,不过也许可以换一种更加友好的方式
   *
   * @param secret 主密码
   * @param secondSecret 安全密码
   */
  async createSecondKeypair(secret: string, secondSecret: string) {
    const md5Second = `${secret}-${(
      await this.__cryptoHelper.md5(encodeUTF8ToBinary(secondSecret))
    ).toString("hex")}`;
    const secondHash = await this.__cryptoHelper.sha256(encodeUTF8ToBinary(md5Second));
    return this.createKeypair(utf8Slice(secondHash, 0, secondHash.length));
  }

  /**
   * 获取安全公钥
   * @param secret
   * @param secondSecret
   * @returns
   */
  async getSecondPublicKeyFromSecretAndSecondSecret(secret: string, secondSecret: string) {
    return (await this.createSecondKeypair(secret, secondSecret)).publicKey;
  }

  /**
   * 根据私钥获取公钥String
   *
   * @param secret
   * @param secondSecret
   * @param encode
   * @returns
   */
  async getSecondPublicKeyStringFromSecretAndSecondSecret(
    secret: string,
    secondSecret: string,
    encode = "hex",
  ) {
    return (await this.getSecondPublicKeyFromSecretAndSecondSecret(secret, secondSecret)).toString(
      encode,
    );
  }

  /**
   * 校验二次密码公钥是否正确
   * @param secret 主密码
   * @param secondSecret 二次密码
   * @param secondPublicKey 二次密码公钥
   */
  async checkSecondSecret(secret: string, secondSecret: string, secondPublicKey: string) {
    return (
      (await this.getSecondPublicKeyStringFromSecretAndSecondSecret(secret, secondSecret)) ===
      secondPublicKey
    );
  }

  /**
   * 根据安全密码的公私钥对
   *
   * @param secret
   * @param secondSecret
   * @returns
   */
  createSecondKeypairV2(secret: string, secondSecret: string) {
    return this.createKeypair(`v2:${secret}-${secondSecret}`);
  }

  /**
   * 获取安全公钥
   * @param secret
   * @param secondSecret
   * @returns
   */
  async getSecondPublicKeyFromSecretAndSecondSecretV2(secret: string, secondSecret: string) {
    return (await this.createSecondKeypairV2(secret, secondSecret)).publicKey;
  }

  /**
   * 根据私钥获取公钥String
   *
   * @param secret
   * @param secondSecret
   * @param encode
   * @returns
   */
  async getSecondPublicKeyStringFromSecretAndSecondSecretV2(
    secret: string,
    secondSecret: string,
    encode = "hex",
  ) {
    return (
      await this.getSecondPublicKeyFromSecretAndSecondSecretV2(secret, secondSecret)
    ).toString(encode);
  }

  /**
   * 校验二次密码公钥是否正确
   * @param secret 主密码
   * @param secondSecret 二次密码
   * @param secondPublicKey 二次密码公钥
   */
  async checkSecondSecretV2(secret: string, secondSecret: string, secondPublicKey: string) {
    return (
      (await this.getSecondPublicKeyStringFromSecretAndSecondSecretV2(secret, secondSecret)) ===
      secondPublicKey
    );
  }

  /**
   * 签名
   *
   * @param keypair
   * @param hash
   */
  async detachedSign(message: Uint8Array, secretKey: Uint8Array) {
    const hash = await this.__cryptoHelper.sha256(message);
    return await this.__keypairHelper.detached_sign(hash, secretKey);
  }

  /**
   * 验证签名
   *
   * @param message
   * @param signatureBuffer
   * @param publicKeyBuffer
   * @returns
   */
  async detachedVeriy(
    message: Uint8Array,
    signatureBuffer: Uint8Array,
    publicKeyBuffer: Uint8Array,
  ) {
    const hash = await this.__cryptoHelper.sha256(message);
    return this.__keypairHelper.detached_verify(hash, signatureBuffer, publicKeyBuffer);
  }

  /**
   * 签名并且转成 hex 字符串
   *
   * @param message
   * @param secretKey
   * @returns
   */
  async signToString(message: Uint8Array, secretKey: Uint8Array) {
    const detachedSign = await this.detachedSign(message, secretKey);
    return detachedSign.toString("hex");
  }

  /**
   * 非对称加密
   *
   * @param msg
   * @param decryptPK
   * @param encryptSK
   */
  asymmetricEncrypt(msg: Uint8Array, decryptPK: Uint8Array, encryptSK: Uint8Array) {
    const curveDecryptPK = ed2curveHelper.convertPublicKey(decryptPK);
    if (!curveDecryptPK) {
      throw new Error("decryptPK convertPublicKey fail");
    }
    const curveEncryptSK = ed2curveHelper.convertSecretKey(encryptSK);
    return this.__keypairHelper.box(msg, curveDecryptPK, curveEncryptSK);
  }

  /**
   * 非对称解密
   *
   * @param encryptedMessage
   * @param nonce
   * @param encryptPK
   * @param decryptSK
   */
  asymmetricDecrypt(
    encryptedMessage: Uint8Array,
    encryptPK: Uint8Array,
    decryptSK: Uint8Array,
    nonce = new Uint8Array(24),
  ) {
    const curveEncryptPK = ed2curveHelper.convertPublicKey(encryptPK);
    if (!curveEncryptPK) {
      throw new Error("decryptPK convertPublicKey fail");
    }
    const curveDecryptSK = ed2curveHelper.convertSecretKey(decryptSK);
    const decryptedMessage = this.__keypairHelper.open(
      encryptedMessage,
      nonce,
      curveEncryptPK,
      curveDecryptSK,
    );
    return decryptedMessage;
  }
}
