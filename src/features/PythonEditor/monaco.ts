import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor/editor/editor.api.js";
import "monaco-editor/languages/definitions/python/register.js";

if (typeof self !== "undefined") {
  self.MonacoEnvironment = {
    getWorker: () => {
      return new Worker(
        new URL(
          "../../../node_modules/monaco-editor/esm/vs/editor/editor.worker.js",
          import.meta.url,
        ),
        { type: "module" },
      );
    },
  };
}

loader.config({ monaco });
