/// <reference lib="dom"/>
import { ByteArray } from "./array";
import { validateBase64, validateHex } from "./validate";

const { fromCharCode } = String;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function encodeUTF8(a: ByteArray): string {
  return textDecoder.decode(a);
}

export function decodeUTF8(s: string): ByteArray {
  return textEncoder.encode(s);
}

export function encodeBase64(a: ByteArray): string {
  return btoa(fromCharCode.apply(null, a as unknown as number[]));
}

export function decodeBase64(s: string): ByteArray {
  validateBase64(s);

  const d = atob(s),
    b = new ByteArray(d.length);

  for (let i = 0; i < d.length; i++) {
    b[i] = d.charCodeAt(i);
  }

  return b;
}
