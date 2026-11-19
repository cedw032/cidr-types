# @chadedwards/cidr-types

IPv4 and CIDR literal types, runtime validation and range membership proofs.
Zero runtime dependencies. TypeScript 5.4+; ESM and CommonJS; Node.js 20+.
The runtime is platform-independent JavaScript and uses no Node APIs.
IPv6 is outside this package's scope.

```sh
npm install @chadedwards/cidr-types
```

## Functions that accept only addresses or subnets in a network

```ts
import { network } from "@chadedwards/cidr-types";
import type { IPv4In, CidrWithin } from "@chadedwards/cidr-types";

const office = network("10.20.0.0/16");

function connect(address: IPv4In<"10.20.0.0/16">) {
  return address;
}
function allocate(subnet: CidrWithin<"10.20.0.0/16">) {
  return subnet;
}

connect(office.ip("10.20.1.5"));
allocate(office.cidrWithin("10.20.16.0/20"));

// @ts-expect-error: outside the office network
connect(office.ip("10.21.1.5"));
// @ts-expect-error: a larger network cannot fit inside the office network
allocate(office.cidrWithin("10.0.0.0/8"));
// @ts-expect-error: a raw string has no validation or membership proof
connect("10.20.1.5");
```

`network()` fixes the parent first. A candidate cannot widen the parent through
TypeScript's generic inference. Both literal construction and runtime parsing
check the value at runtime too, including when called from JavaScript.
The resulting values are strings with compile-time brands; there are no wrapper
objects to serialize, mutate, or unwrap.

## Literal constructors and a base IP address type

```ts
import { ip, cidr, parseIp, parseCidr, tryIp, isIp } from "@chadedwards/cidr-types";
import type { IPv4, IPAddress, Cidr } from "@chadedwards/cidr-types";

const host = ip("192.168.1.5"); // IPv4<'192.168.1.5'>
const block = cidr("192.168.1.255/24"); // Cidr<'192.168.1.255/24'>
const address: IPv4 = host; // IPAddress is an alias for IPv4

// @ts-expect-error: invalid octet
ip("256.1.2.3");
// @ts-expect-error: invalid prefix
cidr("192.168.1.0/33");

const external: unknown = JSON.parse('"192.168.1.6"');
const validated = parseIp(external); // IPv4, or throws TypeError
const optional = tryIp(external); // IPv4 | undefined
if (isIp(external)) {
  const address: IPv4 = external; // runtime type guard
}
```

Literal-only `ip`, `cidr` and `network` reject broad strings, `any` and unions.
Use `parseIp` / `parseCidr` for runtime data, or `tryIp` / `tryCidr` for an
`undefined` result instead of throwing. `isIp` / `isCidr` narrow unknown values.
A base `Cidr` or `IPv4` type is evidence of validation; its generic parameter is
an exact spelling when supplied. Merely writing a type alias validates no value.

## Give runtime input a membership proof

```ts
import { network, parseIp, parseCidr } from "@chadedwards/cidr-types";
import type { IPv4In } from "@chadedwards/cidr-types";

const office = network("10.20.0.0/16");
function connect(address: IPv4In<"10.20.0.0/16">) {
  return address;
}

connect(office.parseIp("10.20.1.5")); // checked, throws RangeError if outside
const candidate = parseIp("10.20.2.3");
if (office.hasIp(candidate)) connect(candidate);

const subnet = parseCidr("10.20.16.0/20");
if (office.hasCidr(subnet)) {
  // subnet is CidrWithin<'10.20.0.0/16'> here
}
```

`office.parseCidr(input)` similarly validates a subnet and returns its membership
proof. Malformed syntax throws `TypeError`; valid but out-of-range input throws
`RangeError`. A proof names the exact parent CIDR spelling: equivalent parent
spellings, or a proof for a child network, require a check in the desired scope.
That deliberate conservatism avoids pretending that structural string brands
encode the entire prefix hierarchy.

## Relationships at compile time

```ts
import type {
  ContainsIp,
  ContainsCidr,
  EqualCidr,
  Relation,
  Expect,
  Equal,
} from "@chadedwards/cidr-types";

type Checks = [
  Expect<Equal<ContainsIp<"10.0.0.0/8", "10.1.2.3">, true>>,
  Expect<Equal<ContainsCidr<"10.0.0.0/8", "10.1.0.0/16">, true>>,
  Expect<Equal<EqualCidr<"10.1.2.3/8", "10.0.0.0/8">, true>>,
  Expect<Equal<Relation<"10.1.0.0/16", "10.0.0.0/8">, "within">>,
];
```

`EqualIp`, `Overlaps`, `Disjoint`, `IsSubnetOf`, `IsIPv4` and `IsCidr` are also
available. `IpWithin<I,C>` and `CidrWithinLiteral<B,A>` filter a valid literal to
itself if it belongs, otherwise to `never`. They are literal filters; the value
proof types are `IPv4In<C>` and `CidrWithin<C>`.

Relationship types accept single raw string literals and return `never` for
malformed, broad, union, `any` or `never` inputs. Validation predicates return
`false` for those inputs. Use `Expect<Equal<Result, true>>` in tests rather than
`Expect<Result>` alone: TypeScript permits `never` as a generic constraint.
The familiar `RangeBIsContainedByA<Cidr<A>,Cidr<B>>` and
`AAndBAreExclusiveRanges<Cidr<A>,Cidr<B>>` names are available for branded blocks.

## Construct test cases directly from literals

```ts
import { network } from "@chadedwards/cidr-types";

const office = network("10.20.0.0/16");
const cases = [
  office.ipCase("10.20.1.5", true),
  office.ipCase("10.21.1.5", false),
  office.cidrCase("10.20.16.0/20", true),
  office.cidrCase("10.0.0.0/8", false),
];
// Each immutable case contains network, value, expected and actual.
for (const test of cases) console.assert(test.actual === test.expected);

// @ts-expect-error: compiler computes false for this address
office.ipCase("10.21.1.5", true);
```

The compiler verifies each expectation; constructing a case also runs the
runtime calculation and throws if the expectation disagrees. `NoInfer` keeps
the expectation from widening the input literal. These are ordinary objects
that work with any test framework.

## Runtime network utilities

All functions below accept validated/branded values. Use constructors or parsers
at the boundary rather than assertions.

| Operation                                             | Result                                                |
| ----------------------------------------------------- | ----------------------------------------------------- |
| `containsIp(block, address)`                          | Membership boolean                                    |
| `containsCidr(parent, child)`                         | Containment boolean, equality included                |
| `equalCidr(a, b)`, `overlaps(a, b)`, `disjoint(a, b)` | Relationship booleans                                 |
| `adjacent(a, b)`                                      | Intervals touch without overlap; sizes may differ     |
| `relation(a, b)`                                      | `equal`, `contains`, `within` or `disjoint`           |
| `normalizeCidr(block)`                                | Canonical network address with original prefix length |
| `bounds(block)`                                       | Immutable `{ first, last, size, prefixLength }`       |
| `parent(block)`                                       | Canonical immediate supernet, or `undefined` for `/0` |
| `split(block)`                                        | Immutable pair of immediate subnets; throws on `/32`  |
| `toCidr(address)`                                     | Single-address `/32` block                            |
| `ipToNumber(address)`, `ipFromNumber(n)`              | Unsigned 32-bit conversion                            |
| `compareIp(a, b)`                                     | `-1`, `0` or `1`                                      |

Canonical decimal octets and prefixes only: no leading zeros, signs, whitespace,
hexadecimal, IPv6, integer IP notation or shorthand. Host bits in a CIDR are
accepted and preserved by `cidr`; relationships normalise them. `/0`, `/31`
and `/32` are supported. Bounds include **every address**, including network and
broadcast addresses: this library makes no claim that an address is usable as
a host under a particular routing policy. No enumeration of large address spaces
is needed. Runtime calculations use exact unsigned numeric arithmetic, not signed
32-bit bitwise operators.

## Guarantees and limits

Literal types compute relationships through significant binary prefixes. Runtime
operations independently parse decimal addresses and compare numeric intervals.
Tests compare both against Python's standard-library `ipaddress` model.
Type brands prevent accidental misuse in checked TypeScript; `as`, `any`, ignored
errors, untyped code or a forged declaration can defeat static guarantees.
Runtime constructors and range checks validate again. A network membership proof
is not permission to access a network, a check of routability, or a security
boundary against untrusted code executing in the same process.

## Development

```sh
npm ci
npm test
```

The suite covers negative compilation tests, runtime boundaries, 578 generated
network pairs against Python `ipaddress`, all octet values and package-consumer
checks for ESM, CommonJS and both declaration entry points. Python 3 is needed
for the independent test oracle, not by the published library. `npm pack` ships
only compiled outputs, original library source, README and MIT license.

The original experiment and the measured AI-assisted rewrite are discussed in
[Modelling CIDR Block Relationships in TypeScript](https://chadedwards.com.au/blog/cidr-typescript/).
This library develops that prefix representation into a value API with runtime
validation and deliberately explicit range proofs. AI assisted its implementation;
Chad Edwards is the author and maintainer.
