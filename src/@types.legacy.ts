export {};
declare global {
  namespace BFMetaSignUtil {
    namespace Buffer {
      type Buffer = import("node:buffer").Buffer;
      type BufferConstructor = typeof import("node:buffer").Buffer;
    }
  }
}
