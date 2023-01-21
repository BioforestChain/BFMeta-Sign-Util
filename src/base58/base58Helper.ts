import { base58 } from "./base58";

export class Base58Helper {
  private __buffer: BFMetaSignUtil.Buffer.BufferConstructor;
  private __cryptoHelper: BFMetaSignUtil.CryptoHelperInterface;
  constructor(
    cryptoHelper: BFMetaSignUtil.CryptoHelperInterface,
    buffer: BFMetaSignUtil.Buffer.BufferConstructor,
  ) {
    this.__buffer = buffer;
    this.__cryptoHelper = cryptoHelper;
  }

  bs58 = base58;

  async sha256x2(buffer: Uint8Array) {
    const tmp = await this.__cryptoHelper.sha256(buffer);
    return await this.__cryptoHelper.sha256(tmp);
  }

  async encode(payload: Uint8Array) {
    // const cachedRes = FORZEN_ENCODED_RES_WM.get(payload);
    // if (cachedRes) return cachedRes;

    const result = this.bs58.encode(
      this.__buffer.concat([payload, await this.sha256x2(payload)], payload.length + 4),
    );
    // if (Object.isFrozen(payload)) {
    //   FORZEN_ENCODED_RES_WM.set(payload, result);
    // }
    return result;
  }

  async decodeRaw(buffer: Uint8Array) {
    let payload = buffer.slice(0, -4);
    let checksum = buffer.slice(-4);
    let newChecksum = await this.sha256x2(payload);

    if (
      (checksum[0] ^ newChecksum[0]) |
      (checksum[1] ^ newChecksum[1]) |
      (checksum[2] ^ newChecksum[2]) |
      (checksum[3] ^ newChecksum[3])
    )
      return;

    return this.__buffer.from(payload);
  }

  decodeUnsafe(string: string) {
    let buffer = this.bs58.decodeUnsafe(string);
    if (!buffer) return;

    return this.decodeRaw(buffer);
  }

  decode(string: string) {
    let buffer = this.bs58.decode(string);
    let payload = this.decodeRaw(buffer);
    if (!payload) throw new Error("Invalid checksum");
    return payload;
  }
}
