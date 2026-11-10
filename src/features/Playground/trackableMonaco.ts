import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor/editor/editor.api.js";
import trackableSource from "./Trackable.ts?raw";
import "monaco-editor/languages/definitions/typescript/register.js";
import "monaco-editor/editor/contrib/hover/browser/hoverContribution.js";
import "monaco-editor/editor/contrib/suggest/browser/suggestController.js";
import "monaco-editor/editor/contrib/parameterHints/browser/parameterHints.js";
import "monaco-editor/editor/contrib/documentSymbols/browser/documentSymbols.js";
import "monaco-editor/editor/contrib/gotoSymbol/browser/link/goToDefinitionAtPosition.js";
import {
  getTypeScriptWorker,
  ScriptTarget,
  typescriptDefaults,
  type Diagnostic,
} from "monaco-editor/languages/features/typescript/register.js";
import type { editor } from "monaco-editor";

if (typeof self !== "undefined") {
  self.MonacoEnvironment = {
    getWorker: (_moduleId, label) => {
      if (label === "typescript" || label === "javascript") {
        return new Worker(
          new URL(
            "../../../node_modules/monaco-editor/esm/vs/languages/features/typescript/ts.worker.js",
            import.meta.url,
          ),
          { type: "module" },
        );
      }
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

typescriptDefaults.setCompilerOptions({
  allowNonTsExtensions: true,
  noEmit: false,
  strict: true,
  target: ScriptTarget.ES2020,
});

// Keep the example short while exposing the real Trackable API to TypeScript.
// Removing the exports makes these names available as globals in the example model.
if (typeof window !== "undefined") {
  typescriptDefaults.addExtraLib(
    trackableSource.replace(/^export /gm, ""),
    "file:///trackable-runtime.ts",
  );
}

const diagnosticMessage = (diagnostic: Diagnostic, model: editor.ITextModel): string => {
  const position = model.getPositionAt(diagnostic.start ?? 0);
  const message =
    typeof diagnostic.messageText === "string"
      ? diagnostic.messageText
      : diagnostic.messageText.messageText;
  return `${position.lineNumber}:${position.column} TS${diagnostic.code}: ${message}`;
};

/** Type-check and emit the exact Monaco model that is visible in the editor. */
export const compileTrackableSource = async (
  model: editor.ITextModel,
): Promise<{ code: string; diagnostics: string[] }> => {
  const workerFactory = await getTypeScriptWorker();
  const worker = await workerFactory(model.uri);
  const fileName = model.uri.toString();
  const [syntactic, semantic, options] = await Promise.all([
    worker.getSyntacticDiagnostics(fileName),
    worker.getSemanticDiagnostics(fileName),
    worker.getCompilerOptionsDiagnostics(fileName),
  ]);
  const diagnostics = [...syntactic, ...semantic, ...options]
    .filter((diagnostic) => {
      return diagnostic.category === 1;
    })
    .map((diagnostic) => {
      return diagnosticMessage(diagnostic, model);
    });
  if (diagnostics.length > 0) {
    return { code: "", diagnostics };
  }
  const output = await worker.getEmitOutput(fileName);
  if (output.emitSkipped || output.outputFiles.length === 0) {
    return { code: "", diagnostics: ["TypeScript could not emit JavaScript for this example."] };
  }
  const js = output.outputFiles.find((file) => {
    return file.name.endsWith(".js");
  });
  if (!js) {
    return { code: "", diagnostics: ["TypeScript emitted no JavaScript for this example."] };
  }
  return { code: js.text, diagnostics: [] };
};
