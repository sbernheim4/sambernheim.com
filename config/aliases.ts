import { fileURLToPath } from "node:url";

export const aliases = [
  {
    find: /^@\/features$/,
    replacement: fileURLToPath(new URL("../src/features.ts", import.meta.url)),
  },
  {
    find: /^@\/utils$/,
    replacement: fileURLToPath(new URL("../src/utils.ts", import.meta.url)),
  },
  {
    find: /^@\//,
    replacement: fileURLToPath(new URL("../src/", import.meta.url)),
  },
  {
    find: /^@features(?=\/|$)/,
    replacement: fileURLToPath(new URL("../src/features", import.meta.url)),
  },
  {
    find: /^@utils(?=\/|$)/,
    replacement: fileURLToPath(new URL("../src/utils", import.meta.url)),
  },
];
