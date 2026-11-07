import { defineConfig } from "vitest/config";
import viteReact from "@vitejs/plugin-react";
import { aliases } from "./config/aliases";

export default defineConfig({
  plugins: [viteReact()],
  resolve: {
    alias: aliases,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
