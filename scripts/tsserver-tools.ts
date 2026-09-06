#!/usr/bin/env node
// Local semantic tooling using the installed TypeScript language server.
// diagnostics FILE... | references FILE LINE OFFSET | rename FILE LINE OFFSET
// definition FILE LINE OFFSET | quickinfo FILE LINE OFFSET | navto SEARCH
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const [command, ...args] = process.argv.slice(2);
const supported = ["diagnostics", "references", "rename", "definition", "quickinfo", "navto"];
if (!supported.includes(command))
  throw Error(`Usage: tsserver-tools.ts ${supported.join("|")} FILE LINE OFFSET`);
const server = spawn(
  process.execPath,
  [require.resolve("typescript/lib/tsserver.js"), "--disableAutomaticTypingAcquisition"],
  { stdio: ["pipe", "pipe", "pipe"] },
);
let sequence = 0;
let buffer = "";
const pending = new Map<
  number,
  { resolve: (body: unknown) => void; reject: (error: Error) => void }
>();
server.stdout.on("data", (chunk) => {
  buffer += chunk.toString();
  while (true) {
    const boundary = buffer.indexOf("\r\n\r\n");
    if (boundary < 0) return;
    const length = Number(buffer.slice(0, boundary).match(/Content-Length: (\d+)/)?.[1]);
    // tsserver JSON output is ASCII for this repository's paths/symbols.
    if (Buffer.byteLength(buffer.slice(boundary + 4)) < length) return;
    const bytes = Buffer.from(buffer.slice(boundary + 4));
    const message = JSON.parse(bytes.subarray(0, length).toString());
    buffer = bytes.subarray(length).toString().trimStart();
    if (message.type === "response") {
      const wait = pending.get(message.request_seq);
      if (wait) {
        pending.delete(message.request_seq);
        if (message.success) {
          wait.resolve(message.body);
        } else {
          wait.reject(Error(message.message));
        }
      }
    }
  }
});
server.stderr.on("data", (chunk) => process.stderr.write(chunk));
const request = <T = unknown>(command: string, args: Record<string, unknown>): Promise<T> =>
  new Promise((resolve, reject) => {
    const seq = ++sequence;
    pending.set(seq, { resolve: (body) => resolve(body as T), reject });
    server.stdin.write(`${JSON.stringify({ seq, type: "request", command, arguments: args })}\n`);
  });
const timeout = setTimeout(() => {
  server.kill();
  process.exitCode = 1;
  console.error("TypeScript server timed out");
}, 30000);
try {
  const files =
    command === "diagnostics"
      ? args
      : command === "navto"
        ? ["src/forms/orchestration/types.ts"]
        : [args[0]];
  for (const file of files)
    await request("open", {
      file: resolve(file),
      projectRootPath: process.cwd(),
    });
  if (command === "diagnostics") {
    for (const file of files) {
      const diagnostics = [
        ...(await request<unknown[]>("syntacticDiagnosticsSync", { file: resolve(file) })),
        ...(await request<unknown[]>("semanticDiagnosticsSync", { file: resolve(file) })),
      ];
      console.log(JSON.stringify({ file, diagnostics }, null, 2));
      if (diagnostics.length) process.exitCode = 1;
    }
  } else if (command === "navto")
    console.log(
      JSON.stringify(await request("navto", { searchValue: args[0], maxResultCount: 50 }), null, 2),
    );
  else
    console.log(
      JSON.stringify(
        await request(command, {
          file: resolve(args[0]),
          line: Number(args[1]),
          offset: Number(args[2]),
          findInStrings: false,
          findInComments: false,
        }),
        null,
        2,
      ),
    );
} finally {
  clearTimeout(timeout);
  server.kill();
}
