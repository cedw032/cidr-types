type OctetBits = readonly [
  "00000000",
  "00000001",
  "00000010",
  "00000011",
  "00000100",
  "00000101",
  "00000110",
  "00000111",
  "00001000",
  "00001001",
  "00001010",
  "00001011",
  "00001100",
  "00001101",
  "00001110",
  "00001111",
  "00010000",
  "00010001",
  "00010010",
  "00010011",
  "00010100",
  "00010101",
  "00010110",
  "00010111",
  "00011000",
  "00011001",
  "00011010",
  "00011011",
  "00011100",
  "00011101",
  "00011110",
  "00011111",
  "00100000",
  "00100001",
  "00100010",
  "00100011",
  "00100100",
  "00100101",
  "00100110",
  "00100111",
  "00101000",
  "00101001",
  "00101010",
  "00101011",
  "00101100",
  "00101101",
  "00101110",
  "00101111",
  "00110000",
  "00110001",
  "00110010",
  "00110011",
  "00110100",
  "00110101",
  "00110110",
  "00110111",
  "00111000",
  "00111001",
  "00111010",
  "00111011",
  "00111100",
  "00111101",
  "00111110",
  "00111111",
  "01000000",
  "01000001",
  "01000010",
  "01000011",
  "01000100",
  "01000101",
  "01000110",
  "01000111",
  "01001000",
  "01001001",
  "01001010",
  "01001011",
  "01001100",
  "01001101",
  "01001110",
  "01001111",
  "01010000",
  "01010001",
  "01010010",
  "01010011",
  "01010100",
  "01010101",
  "01010110",
  "01010111",
  "01011000",
  "01011001",
  "01011010",
  "01011011",
  "01011100",
  "01011101",
  "01011110",
  "01011111",
  "01100000",
  "01100001",
  "01100010",
  "01100011",
  "01100100",
  "01100101",
  "01100110",
  "01100111",
  "01101000",
  "01101001",
  "01101010",
  "01101011",
  "01101100",
  "01101101",
  "01101110",
  "01101111",
  "01110000",
  "01110001",
  "01110010",
  "01110011",
  "01110100",
  "01110101",
  "01110110",
  "01110111",
  "01111000",
  "01111001",
  "01111010",
  "01111011",
  "01111100",
  "01111101",
  "01111110",
  "01111111",
  "10000000",
  "10000001",
  "10000010",
  "10000011",
  "10000100",
  "10000101",
  "10000110",
  "10000111",
  "10001000",
  "10001001",
  "10001010",
  "10001011",
  "10001100",
  "10001101",
  "10001110",
  "10001111",
  "10010000",
  "10010001",
  "10010010",
  "10010011",
  "10010100",
  "10010101",
  "10010110",
  "10010111",
  "10011000",
  "10011001",
  "10011010",
  "10011011",
  "10011100",
  "10011101",
  "10011110",
  "10011111",
  "10100000",
  "10100001",
  "10100010",
  "10100011",
  "10100100",
  "10100101",
  "10100110",
  "10100111",
  "10101000",
  "10101001",
  "10101010",
  "10101011",
  "10101100",
  "10101101",
  "10101110",
  "10101111",
  "10110000",
  "10110001",
  "10110010",
  "10110011",
  "10110100",
  "10110101",
  "10110110",
  "10110111",
  "10111000",
  "10111001",
  "10111010",
  "10111011",
  "10111100",
  "10111101",
  "10111110",
  "10111111",
  "11000000",
  "11000001",
  "11000010",
  "11000011",
  "11000100",
  "11000101",
  "11000110",
  "11000111",
  "11001000",
  "11001001",
  "11001010",
  "11001011",
  "11001100",
  "11001101",
  "11001110",
  "11001111",
  "11010000",
  "11010001",
  "11010010",
  "11010011",
  "11010100",
  "11010101",
  "11010110",
  "11010111",
  "11011000",
  "11011001",
  "11011010",
  "11011011",
  "11011100",
  "11011101",
  "11011110",
  "11011111",
  "11100000",
  "11100001",
  "11100010",
  "11100011",
  "11100100",
  "11100101",
  "11100110",
  "11100111",
  "11101000",
  "11101001",
  "11101010",
  "11101011",
  "11101100",
  "11101101",
  "11101110",
  "11101111",
  "11110000",
  "11110001",
  "11110010",
  "11110011",
  "11110100",
  "11110101",
  "11110110",
  "11110111",
  "11111000",
  "11111001",
  "11111010",
  "11111011",
  "11111100",
  "11111101",
  "11111110",
  "11111111",
];
type Octet<S extends string> = S extends keyof OctetBits & `${number}`
  ? OctetBits[S]
  : never;
export type PrefixLengthText =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16"
  | "17"
  | "18"
  | "19"
  | "20"
  | "21"
  | "22"
  | "23"
  | "24"
  | "25"
  | "26"
  | "27"
  | "28"
  | "29"
  | "30"
  | "31"
  | "32";
type Take<
  S extends string,
  N extends number,
  Count extends 0[] = [],
  Out extends string = "",
> = Count["length"] extends N
  ? Out
  : S extends `${infer Head}${infer Tail}`
    ? Take<Tail, N, [...Count, 0], `${Out}${Head}`>
    : never;
type IsUnion<T, Whole = T> = T extends Whole
  ? [Whole] extends [T]
    ? false
    : true
  : never;
type IsSingleString<S extends string> = 0 extends 1 & S
  ? false
  : [S] extends [never]
    ? false
    : string extends S
      ? false
      : true extends IsUnion<S>
        ? false
        : true;

export type PrefixLength = PrefixLengthText extends `${infer N extends number}`
  ? N
  : never;
type IpBits<S extends string> =
  S extends `${infer A}.${infer B}.${infer C}.${infer D}`
    ? `${Octet<A>}${Octet<B>}${Octet<C>}${Octet<D>}`
    : never;
type CidrBits<S extends string> =
  S extends `${infer I}/${infer P extends PrefixLengthText}`
    ? P extends `${infer N extends number}`
      ? IpBits<I> extends infer Bits extends string
        ? [Bits] extends [never]
          ? never
          : Take<Bits, N>
        : never
      : never
    : never;
export type IsIPv4<S extends string> =
  IsSingleString<S> extends true
    ? [IpBits<S>] extends [never]
      ? false
      : true
    : false;
export type IsCidr<S extends string> =
  IsSingleString<S> extends true
    ? [CidrBits<S>] extends [never]
      ? false
      : true
    : false;
/** Filters a literal to itself if it is a valid IPv4 address. */
export type IPv4Literal<S extends string> = IsIPv4<S> extends true ? S : never;
export type CidrLiteral<S extends string> = IsCidr<S> extends true ? S : never;
type StartsWith<A extends string, B extends string> = B extends `${A}${string}`
  ? true
  : false;
/** True when address I lies in block C; invalid/nonliteral inputs produce never. */
export type ContainsIp<C extends string, I extends string> = [
  IsCidr<C>,
  IsIPv4<I>,
] extends [true, true]
  ? StartsWith<CidrBits<C>, IpBits<I>>
  : never;
/** Contains includes equality and normalises host bits. */
export type ContainsCidr<A extends string, B extends string> = [
  IsCidr<A>,
  IsCidr<B>,
] extends [true, true]
  ? StartsWith<CidrBits<A>, CidrBits<B>>
  : never;
export type EqualCidr<A extends string, B extends string> = [
  IsCidr<A>,
  IsCidr<B>,
] extends [true, true]
  ? Equal<CidrBits<A>, CidrBits<B>>
  : never;
export type Overlaps<A extends string, B extends string> = [
  IsCidr<A>,
  IsCidr<B>,
] extends [true, true]
  ? ContainsCidr<A, B> extends true
    ? true
    : ContainsCidr<B, A>
  : never;
export type Disjoint<A extends string, B extends string> = [
  IsCidr<A>,
  IsCidr<B>,
] extends [true, true]
  ? Overlaps<A, B> extends true
    ? false
    : true
  : never;
export type Relation<A extends string, B extends string> = [
  IsCidr<A>,
  IsCidr<B>,
] extends [true, true]
  ? EqualCidr<A, B> extends true
    ? "equal"
    : ContainsCidr<A, B> extends true
      ? "contains"
      : ContainsCidr<B, A> extends true
        ? "within"
        : "disjoint"
  : never;
export type IpWithin<I extends string, C extends string> =
  ContainsIp<C, I> extends infer R
    ? [R] extends [never]
      ? never
      : R extends true
        ? I
        : never
    : never;
export type CidrWithinLiteral<B extends string, A extends string> =
  ContainsCidr<A, B> extends infer R
    ? [R] extends [never]
      ? never
      : R extends true
        ? B
        : never
    : never;
/** Compile-time assertion and literal equality helpers for type test cases. */
export type Expect<T extends true> = T;
export type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

/** Canonical IPv4 literals have exactly one spelling per address. */
export type EqualIp<A extends string, B extends string> = [
  IsIPv4<A>,
  IsIPv4<B>,
] extends [true, true]
  ? Equal<A, B>
  : never;
export type IsSubnetOf<B extends string, A extends string> = ContainsCidr<A, B>;
