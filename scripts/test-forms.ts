// Bundle TS/TSX test imports with the existing build tool; keep React/Query
// external so mounted hooks and the test renderer share one module instance.
import { build } from "esbuild";
import { readdir, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
const tests = (await readdir("tests")).filter((file) => {
  return /\.test\.tsx?$/.test(file);
});
const outdir = resolve("node_modules/.cache/form-tests");
await mkdir(outdir, { recursive: true });
await writeFile(resolve(outdir, "package.json"), JSON.stringify({ type: "module" }));
await build({
  entryPoints: tests.map((file) => {
    return `tests/${file}`;
  }),
  outdir,
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  sourcemap: "inline",
  logLevel: "warning",
});
const result = spawnSync(
  process.execPath,
  [
    "--import",
    resolve("scripts/test-setup.mjs"),
    "--test",
    ...tests.map((file) => {
      return `${outdir}/${file.replace(/\.tsx?$/, ".js")}`;
    }),
  ],
  { stdio: "inherit" },
);
process.exitCode = result.status ?? 1;
