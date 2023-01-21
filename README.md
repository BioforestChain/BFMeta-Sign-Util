# @bfmeta/sign-util

    BFMeta 生成签名的工具包

## 使用

```node
export class CryptoHelper
  implements BFMetaSignUtil.CryptoHelperInterface
{
  async sha256(msg: string | Uint8Array) {
    if (msg instanceof Uint8Array) {
      return crypto.createHash("sha256").update(msg).digest();
    }
    return crypto
      .createHash("sha256")
      .update(new Uint8Array(Buffer.from(msg)))
      .digest();
  }

  async md5(data?: any): any {
    const hash = crypto.createHash("md5");
    if (data) {
      return hash.update(data).digest();
    }
    return hash;
  }

  async ripemd160(data?: any): any {
    const hash = crypto.createHash("ripemd160");
    if (data) {
      return hash.update(data).digest();
    }
    return hash;
  }
}

import { BFMetaSignUtil } from "@bfmeta/sign-util";
(async () => {
  const cryptoHelper = new CryptoHelper();
  const bfmetaSignUtil = new BFMetaSignUtil("c", Buffer as any, cryptoHelper);

  const keypair = await bfmetaSignUtil.createKeypair("123");
  const keypair2 = bfmetaSignUtil.createKeypairBySecretKey(keypair.secretKey);
  console.log(keypair2.publicKey.toString("hex"));
  // 获取公钥
  const publicKey = keypair.publicKey.toString("hex");
  console.log(publicKey);
  // 获取地址
  const address = bfmetaSignUtil.getAddressFromPublicKey(keypair.publicKey);
  console.log(address);
  console.log(bfmetaSignUtil.getAddressFromPublicKeyString(publicKey));
  // 校验地址
  console.log(bfmetaSignUtil.isAddress(address));
  console.log(bfmetaSignUtil.isAddress("abc"));
  // 生成签名
  const msg = new Uint8Array(Buffer.from("abc"));
  const signature = await bfmetaSignUtil.detachedSign(msg, keypair.secretKey);
  console.log(signature.toString("hex"));
  console.log(bfmetaSignUtil.signToString(msg, keypair.secretKey));
  // 验证签名
  const result = bfmetaSignUtil.detachedVeriy(msg, signature, keypair.publicKey);
  console.log(result);
})();
```
