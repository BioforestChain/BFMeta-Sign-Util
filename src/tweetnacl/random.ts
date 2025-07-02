import { ByteArray } from "./array.js";

export function randomBytes(n: number): ByteArray {
  const b = new ByteArray(n);
  _randomBytes(b, n);
  return b;
}
const QUOTE = 1 << 16;

export function _randomBytes(x: ByteArray, n: number) {
  for (let i = 0; i < n; i += QUOTE) {
    crypto.getRandomValues(x.subarray(i, i + Math.min(n - i, QUOTE)));
  }
}
