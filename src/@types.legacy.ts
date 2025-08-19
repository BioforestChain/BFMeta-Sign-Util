export {};
declare global {
  namespace BFMetaSignUtil {
    namespace Buffer {
      type Buffer<TArrayBuffer extends ArrayBufferLike = ArrayBufferLike> =
        globalThis.Buffer<TArrayBuffer>;
      type BufferConstructor = globalThis.BufferConstructor;
    }
  }
}
