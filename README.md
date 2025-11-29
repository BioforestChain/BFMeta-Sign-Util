# BFMeta-Sign-Util (English)
For Chinese version please see [README-zh](README-zh.md).

## Overview
Lightweight BFMeta signing SDK: creates keypairs, derives addresses, signs and verifies payloads. Ships ESM+CJS builds from `src/` through `tsconfig.all.json`.

## Directory & Build
- `src/`  core TS sources (BFMetaSignUtil, CryptoHelperInterface, helpers)
- `scripts/clean.ts`  clear build outputs
- `test/`  sample/validation cases
- Build: `pnpm build` (tsc with `tsconfig.all.json`), watch: `pnpm dev`, clean+rebuild: `pnpm rebuild`
- Outputs: `build/esm`, `build/cjs`, exported via `package.json.exports`

## Usage
```ts
import { BFMetaSignUtil } from "@bfmeta/sign-util";
import crypto from "node:crypto";

class CryptoHelper implements BFMetaSignUtil.CryptoHelperInterface {
  sha256(msg: string | Uint8Array) {
    return crypto.createHash("sha256").update(msg).digest();
  }
  md5(data?: any) { return crypto.createHash("md5").update(data ?? "").digest(); }
  ripemd160(data?: any) { return crypto.createHash("ripemd160").update(data ?? "").digest(); }
}

const util = new BFMetaSignUtil("c", Buffer as any, new CryptoHelper());
const keypair = await util.createKeypair("passphrase");
const addr = util.getAddressFromPublicKey(keypair.publicKey);
const sig = await util.detachedSign(new Uint8Array([1,2,3]), keypair.secretKey);
const ok = util.detachedVeriy(new Uint8Array([1,2,3]), sig, keypair.publicKey);
```

## Contribution Guide
- SDK layer (Layer 2B): keep TS strict; avoid `any` / `@ts-ignore`.
- Shared crypto helpers live in `src/crypto*`; prefer extending rather than duplicating.
- Tests: add cases under `test/` for new hash/addr formats before release.
- Publishing: `pnpm pub` (uses `pnpm publish --no-git-checks`), ensure `pnpm rebuild` passes first.
- Branches: `feature/<scope>` / `fix/<issue>`; concise verb-based commits.
