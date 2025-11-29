# BFMeta-Sign-Util (English)
For Chinese version please see [README-zh](README-zh.md).

## Overview
Lightweight signing utility library for BFMeta: key generation, address derivation, signing and verification helpers.

## Installation
```bash
pnpm add @bfmeta/sign-util
```

## Usage
```ts
import { BFMetaSignUtil } from "@bfmeta/sign-util";
// implement CryptoHelperInterface (sha256, md5, ripemd160)
// then create keypairs, addresses, and sign/verify messages
```

## Contribution
- Treat as SDK (TS strict, no `any`/`@ts-ignore`).
- Keep common crypto helpers reusable; avoid duplication.
- Add tests for new algorithms or address formats before release.
- Branch naming: `feature/<scope>`, `fix/<issue>`; concise commit messages.
