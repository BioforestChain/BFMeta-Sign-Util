import { AsymmetricUtil } from "../src";
import { CryptoHelper } from "./cryptoHelper";

(async () => {
  const cryptoHelper = new CryptoHelper();
  const asymmetricUtil = new AsymmetricUtil("c", Buffer as any, cryptoHelper);

  // 生成公私钥对
  const keypair = await asymmetricUtil.createKeypair("123");
  console.log("生成公私钥对", keypair);
  // 根据私钥(buffer)生成公私钥对
  const keypair2 = await asymmetricUtil.createKeypairBySecretKey(keypair.secretKey);
  console.log("根据私钥(buffer)生成公私钥对", keypair2);
  // 根据私钥(hex)生成公私钥对
  const keypair3 = await asymmetricUtil.createKeypairBySecretKeyString(
    keypair.secretKey.toString("hex"),
  );
  console.log("根据私钥(hex)生成公私钥对", keypair3);
  // 获取公钥
  const publicKey = await asymmetricUtil.getPublicKeyFromSecret("123");
  console.log("获取公钥", publicKey);
  // 获取安全公钥
  const secondPublicKey = await asymmetricUtil.getSecondPublicKeyStringFromSecretAndSecondSecret(
    "123",
    "1",
  );
  console.log("获取安全公钥", secondPublicKey);
  // 获取安全公钥
  const secondPublicKeyV2 =
    await asymmetricUtil.getSecondPublicKeyStringFromSecretAndSecondSecretV2("123", "1");
  console.log("获取老版安全公钥", secondPublicKeyV2);
  // 签名
  const msg = new Uint8Array(Buffer.from("abc"));
  const signature = await asymmetricUtil.detachedSign(msg, keypair.secretKey);
  console.log("签名", signature);
  // 签名
  const detachedVeriy = await asymmetricUtil.detachedVeriy(msg, signature, keypair.publicKey);
  console.log("签名", detachedVeriy);
  // 签名并且转成 hex 字符串
  const signToString = await asymmetricUtil.signToString(msg, keypair.secretKey);
  console.log("签名并且转成 hex 字符串", signToString);
  // 根据 公钥（hex） 生成地址（base58）
  const address = await asymmetricUtil.getAddressFromPublicKeyString(
    keypair.publicKey.toString("hex"),
  );
  console.log("根据 公钥（hex） 生成地址（base58）", address);
  // 根据公钥 （Uint8Array） 生成地址（base58）
  const address1 = await asymmetricUtil.getAddressFromPublicKey(keypair.publicKey);
  console.log("根据公钥 （Uint8Array） 生成地址（base58）", address1);
  // 根据公钥（Uint8Array）生成地址的二进制数据
  const address2 = await asymmetricUtil.getBinaryAddressFromPublicKey(keypair.publicKey);
  console.log("根据公钥（Uint8Array）生成地址的二进制数据", address2);
  // 判断地址是否符合规范
  const isAddress = await asymmetricUtil.isAddress(address);
  console.log("判断地址是否符合规范", isAddress);
})();
