// Exercise the actual npm tarball from a clean consumer, including declarations.
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import ts from "typescript";
const ignoreConfig =
  Number(ts.versionMajorMinor.split(".")[0]) >= 6 ? ["--ignoreConfig"] : [];
import { resolve, join } from "node:path";
const root = resolve(".");
const packed = JSON.parse(
  execFileSync("npm", ["pack", "--json", "--ignore-scripts"], {
    encoding: "utf8",
  }),
)[0];
const dir = mkdtempSync(join(tmpdir(), "cidr-consumer-"));
try {
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  execFileSync(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--cache",
      join(tmpdir(), "cidr-npm-cache"),
      resolve(packed.filename),
    ],
    { cwd: dir, stdio: "pipe" },
  );
  const mod = join(dir, "node_modules/@cedw032/cidr-types");
  if (!existsSync(join(mod, "src/index.ts")))
    throw Error("Missing source-map target");
  for (const [name, source] of [
    [
      "esm.mjs",
      "import {ip} from '@cedw032/cidr-types'; if(ip('1.2.3.4')!=='1.2.3.4') throw Error('ESM');",
    ],
    [
      "cjs.cjs",
      "const {cidr}=require('@cedw032/cidr-types'); if(cidr('1.2.3.4/24')!=='1.2.3.4/24') throw Error('CJS');",
    ],
  ]) {
    writeFileSync(join(dir, name), source);
    execFileSync(process.execPath, [name], { cwd: dir, stdio: "inherit" });
  }
  const source =
    "import {network} from '@cedw032/cidr-types'; const n=network('10.0.0.0/8'); n.ip('10.1.2.3');\n// @ts-expect-error out of range\nn.ip('11.1.2.3');";
  for (const ext of ["mts", "cts"]) {
    const file = join(dir, "consumer." + ext);
    writeFileSync(file, source);
    execFileSync(
      process.execPath,
      [
        join(root, "node_modules/typescript/bin/tsc"),
        ...ignoreConfig,
        "--strict",
        "--noEmit",
        "--module",
        "Node16",
        "--moduleResolution",
        "Node16",
        file,
      ],
      { stdio: "inherit" },
    );
  }
  console.log(
    `Tarball smoke: ESM + CommonJS + both declaration entry points passed (${packed.size} bytes packed)`,
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
  rmSync(packed.filename, { force: true });
}
