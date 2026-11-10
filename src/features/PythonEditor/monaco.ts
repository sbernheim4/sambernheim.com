import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor/editor/editor.api.js";
import "monaco-editor/languages/definitions/python/register.js";
import "monaco-editor/editor/contrib/hover/browser/hoverContribution.js";
import "monaco-editor/editor/contrib/suggest/browser/suggestController.js";
import "monaco-editor/editor/contrib/parameterHints/browser/parameterHints.js";
import "monaco-editor/editor/contrib/inlayHints/browser/inlayHintsContribution.js";
import "monaco-editor/editor/contrib/documentSymbols/browser/documentSymbols.js";

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
