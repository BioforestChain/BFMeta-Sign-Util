export class Base58 {
  private ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  private BASE = this.ALPHABET.length;
  private LEADER = this.ALPHABET.charAt(0);

  private ALPHABET_MAP: { [key: string]: number | undefined } = {};
  constructor() {
    // pre-compute lookup table
    for (let z = 0; z < this.ALPHABET.length; z++) {
      const x = this.ALPHABET.charAt(z);

      if (this.ALPHABET_MAP[x] !== undefined) throw new TypeError(x + " is ambiguous");
      this.ALPHABET_MAP[x] = z;
    }
  }

  encode(source: Uint8Array) {
    if (source.length === 0) return "";

    const digits = [0];
    for (let i = 0; i < source.length; ++i) {
      let carry = source[i];
      for (let j = 0; j < digits.length; ++j) {
        carry += digits[j] << 8;
        digits[j] = carry % this.BASE;
        carry = (carry / this.BASE) | 0;
      }

      while (carry > 0) {
        digits.push(carry % this.BASE);
        carry = (carry / this.BASE) | 0;
      }
    }

    let string = "";

    // deal with leading zeros
    for (let k = 0; source[k] === 0 && k < source.length - 1; ++k) string += this.ALPHABET[0];
    // convert digits to a string
    for (let q = digits.length - 1; q >= 0; --q) string += this.ALPHABET[digits[q]];

    return string;
  }

  // /**
  //  * 使用BigInt，能带来100%+的性能提升
  //  * @param source
  //  */
  // bigintEncode(source: Uint8Array) {
  //   let bi = BigInt(`0x${decodeBinaryToHex(source)}`);
  //   const digits: number[] = [];
  //   while (bi > 0) {
  //     digits[digits.length] = Number(bi % 58n);
  //     bi /= 58n;
  //   }
  //   let string = "";
  //   for (let q = digits.length - 1; q >= 0; --q) string += this.ALPHABET[digits[q]];
  //   return string;
  // }

  decodeUnsafe(string: string) {
    if (string.length === 0) return new Uint8Array();

    const bytes = [0];
    for (let i = 0; i < string.length; i++) {
      let value = this.ALPHABET_MAP[string[i]];
      if (value === undefined) return;

      let carry = value;
      for (let j = 0; j < bytes.length; ++j) {
        carry += bytes[j] * this.BASE;
        bytes[j] = carry & 0xff;
        carry >>= 8;
      }

      while (carry > 0) {
        bytes.push(carry & 0xff);
        carry >>= 8;
      }
    }

    // deal with leading zeros
    for (let k = 0; string[k] === this.LEADER && k < string.length - 1; ++k) {
      bytes.push(0);
    }

    return new Uint8Array(bytes).reverse();
  }

  decode(string: string) {
    const buffer = this.decodeUnsafe(string);
    if (buffer) return buffer;

    throw new Error("Non-base" + this.BASE + " character");
  }
}

export const base58 = new Base58();
