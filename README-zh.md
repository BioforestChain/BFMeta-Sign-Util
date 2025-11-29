# BFMeta-Sign-Util（中文）
英文版请参见 [README](README.md)。

## 简介
BFMeta 签名工具库：生成密钥、推导地址、签名与验签。源码在 `src/`，通过 `tsconfig.all.json` 输出 ESM/CJS 双构建。

## 目录与构建
- `src/`：核心 TS 实现（BFMetaSignUtil、CryptoHelperInterface、辅助方法）
- `scripts/clean.ts`：清理构建产物
- `test/`：示例与验证用例
- 构建：`pnpm build`；监听：`pnpm dev`；清理+重建：`pnpm rebuild`
- 产物：`build/esm`、`build/cjs`，由 `package.json.exports` 导出

## 使用示例
```ts
import { BFMetaSignUtil } from "@bfmeta/sign-util";
import crypto from "node:crypto";

class CryptoHelper implements BFMetaSignUtil.CryptoHelperInterface {
  sha256(msg) { return crypto.createHash("sha256").update(msg).digest(); }
  md5(data) { return crypto.createHash("md5").update(data ?? "").digest(); }
  ripemd160(data) { return crypto.createHash("ripemd160").update(data ?? "").digest(); }
}

const util = new BFMetaSignUtil("c", Buffer as any, new CryptoHelper());
const keypair = await util.createKeypair("passphrase");
const addr = util.getAddressFromPublicKey(keypair.publicKey);
const sig = await util.detachedSign(new Uint8Array([1,2,3]), keypair.secretKey);
```

## 贡献规范
- SDK（Layer 2B）：保持 TS 严格，避免 `any`/`@ts-ignore`。
- 公共加密逻辑集中在 `src/`，优先复用/扩展而非复制。
- 新增算法、地址格式需在 `test/` 补充用例后再发布。
- 发布：先跑 `pnpm rebuild`，再用 `pnpm pub`。
- 分支：`feature/<scope>`、`fix/<issue>`；提交用动词短语。
