import { cloneElement, type ReactElement, type ReactNode } from "react";
import { act, render, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import TerminalExample from "../src/routes/experiments/components/ComponentLibrary/TerminalExample";
import { useExampleState } from "../src/routes/experiments/components/ComponentLibrary/useExampleState";

const runtime = vi.hoisted(() => {
  return {
    width: 320,
    height: 385,
    mount: vi.fn(),
    fit: vi.fn(),
    rerender: vi.fn(),
    unmount: vi.fn(),
    disconnect: vi.fn(),
    resizeCallbacks: new Set<() => void>(),
    observerCallbacks: [] as (() => void)[],
    stdout: { columns: 240, rows: 20, emit: vi.fn() },
    terminal: { cols: 40, rows: 22, loadAddon: vi.fn(), onResize: vi.fn() },
  };
});

vi.mock("../src/features/Site/tuiRouter", () => {
  return { tuiRouter: { history: { back: vi.fn() } } };
});
vi.mock("ink-web", () => {
  return { mountInkInXterm: runtime.mount };
});
vi.mock("@xterm/addon-fit", () => {
  return {
    FitAddon: class {
      fit() {
        runtime.fit();
      }
    },
  };
});
vi.mock("ink", async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import("ink")>()),
    useStdout: () => {
      return { stdout: runtime.stdout };
    },
  };
});

beforeEach(() => {
  runtime.width = 320;
  runtime.height = 385;
  runtime.stdout.columns = 240;
  runtime.stdout.rows = 20;
  runtime.stdout.emit.mockClear();
  runtime.resizeCallbacks.clear();
  runtime.observerCallbacks.length = 0;
  runtime.disconnect.mockClear();
  runtime.rerender.mockClear();
  runtime.unmount.mockReset().mockResolvedValue(undefined);
  runtime.terminal.onResize.mockImplementation((callback: () => void) => {
    runtime.resizeCallbacks.add(callback);
    return {
      dispose: () => {
        return runtime.resizeCallbacks.delete(callback);
      },
    };
  });
  runtime.fit.mockReset().mockImplementation(() => {
    runtime.terminal.cols = Math.floor(runtime.width / 8);
    runtime.terminal.rows = Math.floor(runtime.height / 17);
    runtime.resizeCallbacks.forEach((callback) => {
      return callback();
    });
  });
  runtime.mount.mockReset().mockReturnValue({
    term: runtime.terminal,
    rerender: runtime.rerender,
    unmount: runtime.unmount,
  });
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => {
    return runtime.width;
  });
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(() => {
    return runtime.height;
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        runtime.observerCallbacks.push(callback);
      }
      observe() {}
      disconnect() {
        runtime.disconnect();
      }
    },
  );
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn(() => {
      return 1;
    }),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { ready: Promise.resolve() },
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test("fits the public xterm on mount and resize without remounting the shared model", async () => {
  const model = renderHook(() => {
    return useExampleState();
  });
  const view = render(<TerminalExample id="table" {...model.result.current} />);
  await waitFor(() => {
    return expect(runtime.fit).toHaveBeenCalled();
  });
  expect(runtime.mount).toHaveBeenCalledTimes(1);
  const options = runtime.mount.mock.calls[0][1];
  expect(options.termOptions).not.toHaveProperty("cols");
  expect(options.termOptions.theme.background).toBe("#151a20");
  expect(view.container.firstElementChild).toHaveStyle({ height: "100%", background: "#151a20" });

  // The bridge mounts in Ink's separate React root. Render just that bridge
  // against a fake stdout to verify size synchronization independently of canvas.
  const element = runtime.mount.mock.calls[0][0] as ReactElement<{ children?: ReactNode }>;
  const bridge = render(cloneElement(element, {}, null));
  expect(runtime.stdout.columns).toBe(40);
  expect(runtime.stdout.rows).toBe(22);
  expect(runtime.stdout.emit).toHaveBeenCalledWith("resize");

  const callsBeforeResize = runtime.fit.mock.calls.length;
  runtime.width = 200;
  act(() => {
    return runtime.observerCallbacks.forEach((callback) => {
      return callback();
    });
  });
  expect(runtime.fit.mock.calls.length).toBeGreaterThan(callsBeforeResize);
  expect(runtime.stdout.columns).toBe(25);
  expect(runtime.mount).toHaveBeenCalledTimes(1);

  act(() => {
    return model.result.current.tableControls.onQueryChange("Release");
  });
  view.rerender(<TerminalExample id="table" {...model.result.current} />);
  expect(runtime.mount).toHaveBeenCalledTimes(1);
  expect(runtime.rerender).toHaveBeenCalled();
  expect(model.result.current.tableControls.query).toBe("Release");

  bridge.unmount();
  view.unmount();
  expect(runtime.resizeCallbacks.size).toBe(0);
  expect(runtime.disconnect).toHaveBeenCalled();
  expect(runtime.unmount).toHaveBeenCalledTimes(1);
});
