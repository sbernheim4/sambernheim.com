import { spawn } from "node:child_process";
import { createServer } from "vite";

const mode = process.argv[2];

if (mode !== "tui") {
  const child = spawn(
    process.execPath,
    ["node_modules/vite/bin/vite.js", "dev", ...process.argv.slice(2)],
    {
      stdio: "inherit",
    },
  );
  child.on("exit", (code) => {
    return process.exit(code ?? 0);
  });
} else {
  const server = await createServer({
    configFile: "vite.config.ts",
    mode: "tui",
    server: { port: 0 },
    appType: "custom",
  });
  await server.listen();
  let terminal: { unmount: () => void } | undefined;
  let updating = false;
  let pending = false;

  const renderTui = async () => {
    if (updating) {
      pending = true;
      return;
    }
    updating = true;
    try {
      const React = await import("react");
      const Ink = await import("ink");
      const { App } = await server.ssrLoadModule("/src/tui.tsx");
      terminal?.unmount();
      terminal = Ink.render(React.createElement(App));
    } catch (error) {
      console.error("TUI update failed:", error);
    } finally {
      updating = false;
      if (pending) {
        pending = false;
        void renderTui();
      }
    }
  };

  await renderTui();
  server.watcher.on("change", (file) => {
    if (file.includes("/src/") || file.includes("/features/")) {
      void renderTui();
    }
  });
  const shutdown = async () => {
    terminal?.unmount();
    await server.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
