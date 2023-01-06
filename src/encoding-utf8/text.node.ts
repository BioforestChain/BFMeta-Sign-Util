import { TextDecoder, TextEncoder } from "util";
if ("TextEncoder" in globalThis) {
  if (TextEncoder) {
    (globalThis as any).TextEncoder = TextEncoder;
  }
  if (TextDecoder) {
    (globalThis as any).TextDecoder = TextDecoder;
  }
}
export default () => ({ TextDecoder, TextEncoder });
