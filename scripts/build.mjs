import { execFileSync } from "node:child_process";
import {
  rmSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  copyFileSync,
} from "node:fs";
import ts from "typescript";
rmSync("dist", { recursive: true, force: true });
execFileSync(
  process.execPath,
  ["node_modules/typescript/bin/tsc", "-p", "tsconfig.json"],
  { stdio: "inherit" },
);
mkdirSync("dist/cjs", { recursive: true });
for (const file of readdirSync("src").filter((f) => f.endsWith(".ts"))) {
  const result = ts.transpileModule(readFileSync("src/" + file, "utf8"), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
    },
    fileName: file,
  });
  writeFileSync("dist/cjs/" + file.replace(/\.ts$/, ".js"), result.outputText);
  for (const suffix of [".d.ts", ".d.ts.map"])
    copyFileSync(
      "dist/esm/" + file.replace(/\.ts$/, suffix),
      "dist/cjs/" + file.replace(/\.ts$/, suffix),
    );
}
writeFileSync("dist/cjs/package.json", JSON.stringify({ type: "commonjs" }));
