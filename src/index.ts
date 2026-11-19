import type {
  IPv4Literal,
  CidrLiteral,
  ContainsIp,
  ContainsCidr,
  IpWithin,
  CidrWithinLiteral,
} from "./types.js";
export type * from "./types.js";

declare const ipBrand: unique symbol;
declare const cidrBrand: unique symbol;
declare const ipRangeBrand: unique symbol;
declare const cidrRangeBrand: unique symbol;
/** Validated IPv4 address. Use ip() for literals, parseIp() for runtime input. */
export type IPv4<S extends string = string> = S & { readonly [ipBrand]: S };
export type IPAddress<S extends string = string> = IPv4<S>;
/** Validated CIDR spelling; host bits are accepted and preserved. */
export type Cidr<S extends string = string> = S & { readonly [cidrBrand]: S };
/** A runtime-checked proof that an IPv4 address belongs to C. */
export type IPv4In<C extends string> = IPv4 & { readonly [ipRangeBrand]: C };
export type CidrWithin<C extends string> = Cidr & {
  readonly [cidrRangeBrand]: C;
};
/** Familiar predicate names from the original experiment, using branded blocks. */
export type RangeBIsContainedByA<A extends Cidr, B extends Cidr> = ContainsCidr<
  A[typeof cidrBrand],
  B[typeof cidrBrand]
>;
export type AAndBAreExclusiveRanges<
  A extends Cidr,
  B extends Cidr,
> = import("./types.js").Disjoint<A[typeof cidrBrand], B[typeof cidrBrand]>;
export type CidrRelation = "equal" | "contains" | "within" | "disjoint";
export interface Bounds {
  readonly first: IPv4;
  readonly last: IPv4;
  readonly size: number;
  readonly prefixLength: number;
}
export interface LiteralCase<
  C extends string,
  S extends string,
  E extends boolean,
> {
  readonly network: C;
  readonly value: S;
  readonly expected: E;
  readonly actual: boolean;
}

function ipv4Number(input: unknown): number {
  if (typeof input !== "string")
    throw new TypeError("Expected a dotted-decimal IPv4 address");
  const parts = input.split(".");
  if (
    parts.length !== 4 ||
    parts.some((part) => {
      const n = Number(part);
      return !Number.isInteger(n) || n < 0 || n > 255 || String(n) !== part;
    })
  )
    throw new TypeError(
      "Expected four canonical decimal octets between 0 and 255",
    );
  return parts.reduce((n, part) => n * 256 + Number(part), 0);
}
function blockInfo(input: unknown): {
  first: number;
  last: number;
  prefix: number;
  size: number;
} {
  if (typeof input !== "string")
    throw new TypeError("Expected an IPv4 CIDR string");
  const parts = input.split("/");
  const prefix = Number(parts[1]);
  if (
    parts.length !== 2 ||
    !Number.isInteger(prefix) ||
    prefix < 0 ||
    prefix > 32 ||
    String(prefix) !== parts[1]
  )
    throw new TypeError(
      "CIDR prefix must be a canonical integer between 0 and 32",
    );
  const address = ipv4Number(parts[0]),
    size = 2 ** (32 - prefix);
  const first = Math.floor(address / size) * size;
  return { first, last: first + size - 1, prefix, size };
}
export function parseIp(input: unknown): IPv4 {
  ipv4Number(input);
  return input as IPv4;
}
export function parseCidr(input: unknown): Cidr {
  blockInfo(input);
  return input as Cidr;
}
export function tryIp(input: unknown): IPv4 | undefined {
  try {
    return parseIp(input);
  } catch {
    return undefined;
  }
}
export function tryCidr(input: unknown): Cidr | undefined {
  try {
    return parseCidr(input);
  } catch {
    return undefined;
  }
}
export function isIp(input: unknown): input is IPv4 {
  return tryIp(input) !== undefined;
}
export function isCidr(input: unknown): input is Cidr {
  return tryCidr(input) !== undefined;
}
/** Literal-only constructor; validates again at runtime for JavaScript callers. */
export function ip<const S extends string>(input: S & IPv4Literal<S>): IPv4<S> {
  return parseIp(input) as IPv4<S>;
}
export function cidr<const S extends string>(
  input: S & CidrLiteral<S>,
): Cidr<S> {
  return parseCidr(input) as Cidr<S>;
}
export function ipToNumber(address: IPv4): number {
  return ipv4Number(address);
}
export function ipFromNumber(value: number): IPv4 {
  if (!Number.isInteger(value) || value < 0 || value > 0xffffffff)
    throw new RangeError("Expected an unsigned 32-bit integer");
  return [
    Math.floor(value / 2 ** 24),
    Math.floor(value / 2 ** 16) % 256,
    Math.floor(value / 256) % 256,
    value % 256,
  ].join(".") as IPv4;
}
export function compareIp(a: IPv4, b: IPv4): -1 | 0 | 1 {
  const x = ipToNumber(a),
    y = ipToNumber(b);
  return x < y ? -1 : x > y ? 1 : 0;
}
export function bounds(block: Cidr): Bounds {
  const b = blockInfo(block);
  return Object.freeze({
    first: ipFromNumber(b.first),
    last: ipFromNumber(b.last),
    size: b.size,
    prefixLength: b.prefix,
  });
}
export function normalizeCidr(block: Cidr): Cidr {
  const b = blockInfo(block);
  return `${ipFromNumber(b.first)}/${b.prefix}` as Cidr;
}
export function containsIp(block: Cidr, address: IPv4): boolean {
  const b = blockInfo(block),
    n = ipv4Number(address);
  return n >= b.first && n <= b.last;
}
export function containsCidr(a: Cidr, b: Cidr): boolean {
  const x = blockInfo(a),
    y = blockInfo(b);
  return y.first >= x.first && y.last <= x.last;
}
export function overlaps(a: Cidr, b: Cidr): boolean {
  const x = blockInfo(a),
    y = blockInfo(b);
  return x.first <= y.last && y.first <= x.last;
}
export function disjoint(a: Cidr, b: Cidr): boolean {
  return !overlaps(a, b);
}
export function equalCidr(a: Cidr, b: Cidr): boolean {
  const x = blockInfo(a),
    y = blockInfo(b);
  return x.first === y.first && x.prefix === y.prefix;
}
/** Adjacent intervals; the prefix lengths may differ. */
export function adjacent(a: Cidr, b: Cidr): boolean {
  const x = blockInfo(a),
    y = blockInfo(b);
  return x.last + 1 === y.first || y.last + 1 === x.first;
}
export function relation(a: Cidr, b: Cidr): CidrRelation {
  return equalCidr(a, b)
    ? "equal"
    : containsCidr(a, b)
      ? "contains"
      : containsCidr(b, a)
        ? "within"
        : "disjoint";
}
export function toCidr(address: IPv4): Cidr {
  return parseCidr(`${parseIp(address)}/32`);
}
export function parent(block: Cidr): Cidr | undefined {
  const b = blockInfo(block);
  return b.prefix === 0
    ? undefined
    : normalizeCidr(parseCidr(`${ipFromNumber(b.first)}/${b.prefix - 1}`));
}
export function split(block: Cidr): readonly [Cidr, Cidr] {
  const b = blockInfo(block);
  if (b.prefix === 32) throw new RangeError("Cannot split a /32");
  return Object.freeze([
    parseCidr(`${ipFromNumber(b.first)}/${b.prefix + 1}`),
    parseCidr(`${ipFromNumber(b.first + b.size / 2)}/${b.prefix + 1}`),
  ]);
}

export interface Network<C extends string> {
  readonly cidr: Cidr<C>;
  ip<const S extends string>(value: S & IpWithin<S, C>): IPv4<S> & IPv4In<C>;
  cidrWithin<const S extends string>(
    value: S & CidrWithinLiteral<S, C>,
  ): Cidr<S> & CidrWithin<C>;
  parseIp(value: unknown): IPv4In<C>;
  parseCidr(value: unknown): CidrWithin<C>;
  hasIp(value: IPv4): value is IPv4In<C>;
  hasCidr(value: Cidr): value is CidrWithin<C>;
  ipCase<const S extends string>(
    value: S & IPv4Literal<S>,
    expected: ContainsIp<C, NoInfer<S>>,
  ): LiteralCase<C, S, ContainsIp<C, S>>;
  cidrCase<const S extends string>(
    value: S & CidrLiteral<S>,
    expected: ContainsCidr<C, NoInfer<S>>,
  ): LiteralCase<C, S, ContainsCidr<C, S>>;
}
/** Curried range constraints prevent TypeScript from widening the enclosing range. */
export function network<const C extends string>(
  value: C & CidrLiteral<C>,
): Network<C> {
  const block = parseCidr(value) as Cidr<C>;
  function checkedIp(value: unknown): IPv4In<C> {
    const address = parseIp(value);
    if (!containsIp(block, address))
      throw new RangeError("IP address is outside the network");
    return address as IPv4In<C>;
  }
  function checkedCidr(value: unknown): CidrWithin<C> {
    const subnet = parseCidr(value);
    if (!containsCidr(block, subnet))
      throw new RangeError("CIDR block is outside the network");
    return subnet as CidrWithin<C>;
  }
  const result: Network<C> = {
    cidr: block,
    ip: <const S extends string>(address: S & IpWithin<S, C>) =>
      checkedIp(address) as IPv4<S> & IPv4In<C>,
    cidrWithin: <const S extends string>(subnet: S & CidrWithinLiteral<S, C>) =>
      checkedCidr(subnet) as Cidr<S> & CidrWithin<C>,
    parseIp: checkedIp,
    parseCidr: checkedCidr,
    hasIp: (address: IPv4): address is IPv4In<C> => containsIp(block, address),
    hasCidr: (subnet: Cidr): subnet is CidrWithin<C> =>
      containsCidr(block, subnet),
    ipCase: (address, expected) => {
      const actual = containsIp(block, parseIp(address));
      if (actual !== expected)
        throw new Error("IP case expectation does not match");
      return Object.freeze({
        network: value,
        value: address,
        expected,
        actual,
      });
    },
    cidrCase: (subnet, expected) => {
      const actual = containsCidr(block, parseCidr(subnet));
      if (actual !== expected)
        throw new Error("CIDR case expectation does not match");
      return Object.freeze({ network: value, value: subnet, expected, actual });
    },
  };
  return Object.freeze(result);
}
