import {
  ip,
  cidr,
  network,
  parseIp,
  parseCidr,
  isIp,
  isCidr,
} from "../src/index.js";
import type {
  IPv4,
  IPAddress,
  Cidr,
  IPv4In,
  CidrWithin,
  ContainsIp,
  ContainsCidr,
  EqualCidr,
  Overlaps,
  Disjoint,
  Relation,
  IsIPv4,
  IsCidr,
  Expect,
  Equal,
  IpWithin,
} from "../src/index.js";
type Cases = [
  Expect<Equal<ContainsIp<"0.0.0.0/0", "255.255.255.255">, true>>,
  Expect<Equal<ContainsIp<"10.0.0.255/24", "10.0.1.0">, false>>,
  Expect<Equal<ContainsCidr<"10.0.0.0/24", "10.0.0.255/28">, true>>,
  Expect<Equal<ContainsCidr<"10.0.0.0/28", "10.0.0.255/24">, false>>,
  Expect<Equal<EqualCidr<"10.0.0.255/24", "10.0.0.0/24">, true>>,
  Expect<Equal<Relation<"10.0.0.0/24", "10.0.0.0/16">, "within">>,
  Expect<Equal<Overlaps<"10.0.0.0/24", "10.0.1.0/24">, false>>,
  Expect<Equal<Disjoint<"10.0.0.0/24", "10.0.1.0/24">, true>>,
  Expect<Equal<IsIPv4<"01.2.3.4">, false>>,
  Expect<Equal<IsCidr<"1.2.3.4/33">, false>>,
  Expect<Equal<ContainsIp<"garbage", "10.0.0.1">, never>>,
  Expect<Equal<ContainsIp<any, "10.0.0.1">, never>>,
  Expect<Equal<ContainsIp<never, "10.0.0.1">, never>>,
  Expect<Equal<ContainsIp<string, "10.0.0.1">, never>>,
  Expect<Equal<ContainsIp<"10.0.0.0/8", "10.0.0.1" | "20.0.0.1">, never>>,
  Expect<Equal<IpWithin<"10.0.0.1", "garbage">, never>>,
];
const base: IPAddress = ip("1.2.3.4");
const exact: IPv4<"1.2.3.4"> = ip("1.2.3.4");
const block: Cidr<"10.0.0.255/24"> = cidr("10.0.0.255/24");
const local = network("10.0.0.0/24");
function connect(address: IPv4In<"10.0.0.0/24">) {
  return address;
}
function addSubnet(subnet: CidrWithin<"10.0.0.0/24">) {
  return subnet;
}
connect(local.ip("10.0.0.1"));
connect(local.parseIp("10.0.0.2"));
addSubnet(local.cidrWithin("10.0.0.17/28"));
addSubnet(local.parseCidr("10.0.0.0/26"));
const addr = parseIp("10.0.0.3");
if (local.hasIp(addr)) connect(addr);
const subnet = parseCidr("10.0.0.0/28");
if (local.hasCidr(subnet)) addSubnet(subnet);
const unknown: unknown = "10.0.0.1";
if (isIp(unknown)) {
  const x: IPv4 = unknown;
}
if (isCidr(unknown)) {
  const x: Cidr = unknown;
}
local.ipCase("10.0.0.1", true);
local.ipCase("10.0.1.1", false);
local.cidrCase("10.0.0.0/25", true);
local.cidrCase("10.0.0.0/16", false);
// @ts-expect-error invalid octet
ip("256.0.0.0");
// @ts-expect-error broad runtime strings use parseIp
ip("" as string);
// @ts-expect-error any is not a verified literal
ip("" as any);
// @ts-expect-error unions must be narrowed first
ip("" as "10.0.0.1" | "20.0.0.1");
// @ts-expect-error prefix invalid
cidr("10.0.0.0/33");
// @ts-expect-error malformed network
network("bad");
// @ts-expect-error outside network
local.ip("10.0.1.1");
// @ts-expect-error parent range cannot widen to accommodate candidate
local.cidrWithin("10.0.0.0/16");
// @ts-expect-error constructor does not establish membership
connect(ip("10.0.0.1"));
// @ts-expect-error dynamic base type needs a membership check
connect(parseIp("10.0.0.1"));
// @ts-expect-error wrong network proof
connect(network("192.168.0.0/16").ip("192.168.1.1"));
// @ts-expect-error a brand is required
connect("10.0.0.1");
// @ts-expect-error literal does not establish subnet membership
addSubnet(cidr("10.0.0.0/25"));
// @ts-expect-error deliberately wrong literal test expectation
local.ipCase("10.0.1.1", true);
// @ts-expect-error deliberately wrong literal subnet test expectation
local.cidrCase("10.0.0.0/16", true);
// @ts-expect-error NoInfer prevents expected boolean from widening address type
local.ipCase("10.0.1.1", true as boolean);

import type {
  RangeBIsContainedByA,
  AAndBAreExclusiveRanges,
  EqualIp,
  IsSubnetOf,
} from "../src/index.js";
type LegacyCases = [
  Expect<
    Equal<RangeBIsContainedByA<Cidr<"10.0.0.0/8">, Cidr<"10.1.0.0/16">>, true>
  >,
  Expect<
    Equal<AAndBAreExclusiveRanges<Cidr<"10.0.0.0/8">, Cidr<"11.0.0.0/8">>, true>
  >,
  Expect<Equal<EqualIp<"1.2.3.4", "1.2.3.4">, true>>,
  Expect<Equal<IsSubnetOf<"10.1.0.0/16", "10.0.0.0/8">, true>>,
];
