import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../node_modules/ink-web/dist/index.js", import.meta.url);
const source = await readFile(file, "utf8");
const original = "  str = str.replaceAll(CLEAR_TERMINAL, CURSOR_HOME);\n";
if (source.includes(original)) {
  await writeFile(file, source.replace(original, ""));
} else if (!source.includes("function filterStdoutChunk(str) {\n  return str;\n}")) {
  throw new Error(
    "Unexpected ink-web filterStdoutChunk implementation; review the patch before installing.",
  );
}
