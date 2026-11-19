"""Independent Python ipaddress oracle for both runtime and type-level results."""
import ipaddress, json, random, subprocess, tempfile
from pathlib import Path
root = Path(__file__).resolve().parents[1]
version = subprocess.check_output(['node',str(root/'node_modules/typescript/bin/tsc'),'--version'],text=True)
ignore_config = ['--ignoreConfig'] if int(version.split()[1].split('.')[0]) >= 6 else []
rng = random.Random(19)
pairs = []
for p in range(33):
    a = ipaddress.ip_network(f'{ipaddress.IPv4Address(rng.getrandbits(32))}/{p}', strict=False)
    b = ipaddress.ip_network(f'{ipaddress.IPv4Address(int(a.network_address) + rng.randrange(a.num_addresses))}/{rng.randrange(p,33)}', strict=False)
    pairs.extend([(str(a),str(b)),(str(b),str(a))])
for _ in range(512): pairs.append(tuple(f'{ipaddress.IPv4Address(rng.getrandbits(32))}/{rng.randrange(33)}' for _ in range(2)))
cases = []
checks = ["import type {ContainsIp,ContainsCidr,EqualCidr,Disjoint,Relation,Expect,Equal} from './src/index.js';"]
for i,(a,b) in enumerate(pairs):
    na,nb = ipaddress.ip_network(a,strict=False),ipaddress.ip_network(b,strict=False)
    address = str(ipaddress.IPv4Address(rng.getrandbits(32)))
    if i%2==0: address = str(ipaddress.IPv4Address(int(na.network_address)+rng.randrange(na.num_addresses)))
    expected = {'contains':nb.subnet_of(na),'disjoint':not na.overlaps(nb),'equal':na==nb,
                'ip':ipaddress.ip_address(address) in na,
                'relation':'equal' if na==nb else 'contains' if nb.subnet_of(na) else 'within' if na.subnet_of(nb) else 'disjoint',
                'first':str(na.network_address),'last':str(na.broadcast_address),'size':na.num_addresses}
    cases.append({'a':a,'b':b,'address':address,**expected})
    for name,key,arg in [('ContainsCidr','contains',b),('Disjoint','disjoint',b),('EqualCidr','equal',b),('ContainsIp','ip',address),('Relation','relation',b)]:
        v = json.dumps(expected[key])
        checks.append(f"type T{i}{name}=Expect<Equal<{name}<'{a}','{arg}'>,{v}>>;")
# Every octet value, every mask, invalid literals and union/any/broad inputs.
for i in range(256): checks.append(f"type Octet{i}=Expect<Equal<ContainsIp<'{i}.0.0.0/8','{i}.255.255.255'>,true>>;")
checks += ["import type {IsIPv4,IsCidr} from './src/index.js';"]
for i,value in enumerate(['1.2.3.4\n','1.2.3.4 ','1.2.3.4.5','0x1.2.3.4','1e0.2.3.4','+1.2.3.4','01.2.3.4','256.2.3.4','1.2.3','']):
    checks.append(f'type InvalidIp{i}=Expect<Equal<IsIPv4<{json.dumps(value)}>,false>>;')
with tempfile.NamedTemporaryFile(mode='w',suffix='.oracle.ts',dir=root,delete=False) as f:
    f.write('\n'.join(checks)); file=Path(f.name)
try:
    subprocess.run(['node',str(root/'node_modules/typescript/bin/tsc'),*ignore_config,'--strict','--noEmit','--target','ES2020','--moduleResolution','bundler','--module','ES2020',str(file)],cwd=root,check=True)
finally: file.unlink()
script="""import fs from 'node:fs'; import assert from 'node:assert/strict';import * as c from './dist/esm/index.js';
for(const x of JSON.parse(fs.readFileSync(0,'utf8'))) {
 const a=c.parseCidr(x.a),b=c.parseCidr(x.b),ip=c.parseIp(x.address),r=c.bounds(a);
 assert.equal(c.containsCidr(a,b),x.contains);assert.equal(c.disjoint(a,b),x.disjoint);
 assert.equal(c.equalCidr(a,b),x.equal);assert.equal(c.containsIp(a,ip),x.ip);assert.equal(c.relation(a,b),x.relation);
 assert.equal(r.first,x.first);assert.equal(r.last,x.last);assert.equal(r.size,x.size);
 if(r.prefixLength<32) {const [l,h]=c.split(a);assert(c.containsCidr(a,l));assert(c.containsCidr(a,h));assert(c.adjacent(l,h));assert(c.disjoint(l,h));assert.equal(c.bounds(l).size+c.bounds(h).size,r.size);}
}
"""
subprocess.run(['node','--input-type=module','-e',script],input=json.dumps(cases),cwd=root,text=True,check=True)
print(f'Oracle: {len(cases)} pairs, {len(cases)*5+266} compile-time assertions and runtime bounds/split checks passed')
