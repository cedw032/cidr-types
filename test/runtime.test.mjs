import { test } from "node:test";
import assert from "node:assert/strict";
import * as c from "../dist/esm/index.js";
test("strict IPv4 and CIDR parsing", () => {
  for (const x of ["0.0.0.0", "255.255.255.255", "10.0.0.1"])
    assert.equal(c.parseIp(x), x);
  for (const x of [
    "",
    null,
    123,
    "1.2.3",
    "1.2.3.4.5",
    "256.0.0.0",
    "01.2.3.4",
    "-1.2.3.4",
    "1.2.3.4\n",
    "1.2.3.4 ",
  ]) {
    assert.throws(() => c.parseIp(x), TypeError);
    assert.equal(c.tryIp(x), undefined);
    assert.equal(c.isIp(x), false);
  }
  for (const x of ["1.2.3.4/0", "1.2.3.4/32"]) assert.equal(c.cidr(x), x);
  for (const x of [
    "1.2.3.4/33",
    "1.2.3.4/01",
    "1.2.3.4/-1",
    "1.2.3.4/1.5",
    "1.2.3.4/32\n",
    "1.2.3.4/",
    "1.2.3.4/1/2",
    "01.2.3.4/8",
    null,
  ]) {
    assert.throws(() => c.parseCidr(x), TypeError);
    assert.equal(c.tryCidr(x), undefined);
    assert.equal(c.isCidr(x), false);
  }
});
test("literal constructors validate even when called from JavaScript", () => {
  assert.throws(() => c.ip("999.0.0.0"), TypeError);
  assert.throws(() => c.cidr("10.0.0.0/33"), TypeError);
});
test("unsigned integer round trips", () => {
  for (const n of [0, 1, 0x7fffffff, 0x80000000, 0xffffffff])
    assert.equal(c.ipToNumber(c.ipFromNumber(n)), n);
  for (const n of [-1, 0x100000000, NaN, Infinity, 1.5])
    assert.throws(() => c.ipFromNumber(n), RangeError);
  assert.equal(c.compareIp(c.ip("127.255.255.255"), c.ip("128.0.0.0")), -1);
});
test("bounds include /0, /31, /32 and host bits", () => {
  assert.deepEqual(c.bounds(c.cidr("255.255.255.255/0")), {
    first: "0.0.0.0",
    last: "255.255.255.255",
    size: 4294967296,
    prefixLength: 0,
  });
  assert.deepEqual(c.bounds(c.cidr("10.0.0.3/31")), {
    first: "10.0.0.2",
    last: "10.0.0.3",
    size: 2,
    prefixLength: 31,
  });
  assert.deepEqual(c.bounds(c.cidr("255.255.255.255/32")), {
    first: "255.255.255.255",
    last: "255.255.255.255",
    size: 1,
    prefixLength: 32,
  });
  assert.equal(c.normalizeCidr(c.cidr("10.0.0.255/28")), "10.0.0.240/28");
});
test("containment, overlap, equality, adjacency and relation", () => {
  const a = c.cidr("10.0.0.0/24"),
    b = c.cidr("10.0.0.255/28"),
    d = c.cidr("10.0.1.0/24");
  assert(c.containsCidr(a, b));
  assert(!c.containsCidr(b, a));
  assert(c.containsIp(a, c.ip("10.0.0.255")));
  assert(!c.containsIp(a, c.ip("10.0.1.0")));
  assert(c.overlaps(a, b));
  assert(c.disjoint(a, d));
  assert(c.adjacent(a, d));
  assert(c.equalCidr(a, c.cidr("10.0.0.255/24")));
  assert.equal(c.relation(a, a), "equal");
  assert.equal(c.relation(a, b), "contains");
  assert.equal(c.relation(b, a), "within");
  assert.equal(c.relation(a, d), "disjoint");
  assert(!c.adjacent(c.cidr("0.0.0.0/32"), c.cidr("255.255.255.255/32")));
});
test("parent, split and single-address CIDR", () => {
  assert.equal(c.parent(c.cidr("10.0.0.255/24")), "10.0.0.0/23");
  assert.equal(c.parent(c.cidr("0.0.0.0/0")), undefined);
  assert.deepEqual(c.split(c.cidr("10.0.0.255/24")), [
    "10.0.0.0/25",
    "10.0.0.128/25",
  ]);
  assert.deepEqual(c.split(c.cidr("0.0.0.0/0")), ["0.0.0.0/1", "128.0.0.0/1"]);
  assert.throws(() => c.split(c.cidr("1.2.3.4/32")), RangeError);
  assert.equal(c.toCidr(c.ip("1.2.3.4")), "1.2.3.4/32");
});
test("network proves membership and rejects unchecked JS calls too", () => {
  const n = c.network("10.0.0.0/24");
  assert(Object.isFrozen(n));
  for (const method of ["ip", "parseIp"]) {
    assert.equal(n[method]("10.0.0.1"), "10.0.0.1");
    assert.throws(() => n[method]("10.0.1.1"), RangeError);
  }
  for (const method of ["cidrWithin", "parseCidr"]) {
    assert.equal(n[method]("10.0.0.255/28"), "10.0.0.255/28");
    assert.throws(() => n[method]("10.0.0.0/16"), RangeError);
  }
  assert(n.hasIp(c.ip("10.0.0.1")));
  assert(!n.hasIp(c.ip("10.0.1.1")));
  assert(n.hasCidr(c.cidr("10.0.0.0/25")));
  assert(!n.hasCidr(c.cidr("10.0.1.0/24")));
});
test("literal cases execute and retain expected/actual values", () => {
  const n = c.network("10.0.0.0/24");
  assert.deepEqual(n.ipCase("10.0.0.1", true), {
    network: "10.0.0.0/24",
    value: "10.0.0.1",
    expected: true,
    actual: true,
  });
  assert.equal(n.cidrCase("10.0.0.0/16", false).actual, false);
  assert.throws(() => n.ipCase("10.0.1.1", true));
  assert.throws(() => n.cidrCase("10.0.0.0/16", true));
});
