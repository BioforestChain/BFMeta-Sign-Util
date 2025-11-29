# BFMeta-Sign-Util（中文）
英文版请参见 [README](README.md)。

## 简介
BFMeta 签名工具库，包含密钥生成、地址推导、签名与验签辅助。

## 安装
```bash
pnpm add @bfmeta/sign-util
```

## 使用
```ts
import { BFMetaSignUtil } from "@bfmeta/sign-util";
// 实现 CryptoHelperInterface（sha256、md5、ripemd160）
// 然后生成密钥对、地址，完成签名/验签
```

## 贡献
- 视为 SDK：保持 TypeScript 严格模式，不新增 `any`/`@ts-ignore`。
- 公共加密辅助保持可复用，避免重复代码。
- 新增算法或地址格式需先补测试再发布。
- 分支：`feature/<scope>`、`fix/<issue>`；提交简短动词短语。
