import { Trackable } from "./Trackable";

type RunnerRequest = { type: "prepare"; code: string } | { type: "execute" };

type RunnerResponse =
  | { type: "ready"; value: unknown; queued: readonly unknown[] }
  | { type: "executed"; value: unknown; queued: readonly unknown[]; emitted: readonly unknown[] }
  | { type: "error"; message: string };

type RunnableTrackable = {
  getValue: () => unknown;
  getAnalyticsEvents: () => readonly unknown[];
  execute: (track: (event: unknown) => void) => unknown;
};

const workerScope = globalThis as unknown as {
  onmessage: ((event: MessageEvent<RunnerRequest>) => void) | null;
  postMessage: (message: RunnerResponse) => void;
};

let chain: RunnableTrackable | null = null;

const isRunnableTrackable = (value: unknown): value is RunnableTrackable => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<RunnableTrackable>;
  return (
    typeof candidate.getValue === "function" &&
    typeof candidate.getAnalyticsEvents === "function" &&
    typeof candidate.execute === "function"
  );
};

workerScope.onmessage = ({ data }) => {
  try {
    if (data.type === "prepare") {
      chain = null;
      // The TypeScript worker has already compiled and checked this source.
      // Keeping evaluation in a separate worker lets the page stop long-running code.
      const createChain = new Function("Trackable", `${data.code}\nreturn createChain();`) as (
        trackable: typeof Trackable,
      ) => unknown;
      const result = createChain(Trackable);
      if (!isRunnableTrackable(result)) {
        throw new Error("createChain() must return a Trackable.");
      }
      chain = result;
      workerScope.postMessage({
        type: "ready",
        value: chain.getValue(),
        queued: chain.getAnalyticsEvents(),
      });
      return;
    }

    if (!chain) {
      throw new Error("Run the code before executing the chain.");
    }
    const emitted: unknown[] = [];
    const value = chain.execute((event) => {
      emitted.push(event);
    });
    workerScope.postMessage({
      type: "executed",
      value,
      queued: chain.getAnalyticsEvents(),
      emitted,
    });
  } catch (error) {
    workerScope.postMessage({
      type: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
