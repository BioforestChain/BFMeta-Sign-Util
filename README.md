# @bfchain/sign-util

    钱包工具包

## 使用

```node
export class CryptoHelper
  implements BFChainSignUtil.CryptoHelperInterface
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

import { AsymmetricUtil } from "@bfchain/sign-util";
(async () => {
  const cryptoHelper = new CryptoHelper();
  const asymmetricUtil = new AsymmetricUtil("c", Buffer as any, cryptoHelper);

  const keypair = await asymmetricUtil.createKeypair("123");
  const keypair2 = asymmetricUtil.createKeypairBySecretKey(keypair.secretKey);
  console.log(keypair2.publicKey.toString("hex"));
  // 获取公钥
  const publicKey = keypair.publicKey.toString("hex");
  console.log(publicKey);
  // 获取地址
  const address = asymmetricUtil.getAddressFromPublicKey(keypair.publicKey);
  console.log(address);
  console.log(asymmetricUtil.getAddressFromPublicKeyString(publicKey));
  // 校验地址
  console.log(asymmetricUtil.isAddress(address));
  console.log(asymmetricUtil.isAddress("abc"));
  // 生成签名
  const msg = new Uint8Array(Buffer.from("abc"));
  const signature = await asymmetricUtil.detachedSign(msg, keypair.secretKey);
  console.log(signature.toString("hex"));
  console.log(asymmetricUtil.signToString(msg, keypair.secretKey));
  // 验证签名
  const result = asymmetricUtil.detachedVeriy(msg, signature, keypair.publicKey);
  console.log(result);
})();
```
