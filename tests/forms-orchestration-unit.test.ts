import { describe, expect, test } from "vitest";
import { compileSavePlan } from "../src/forms/orchestration/plan";
import { executeGraph } from "../src/forms/orchestration/scheduler";
import type { AnyForm } from "../src/forms/orchestration/types";

const form = (id: string, dependencies: readonly string[] = []): AnyForm => {
  return {
    id,
    dependencies: dependencies.map((dependency) => {
      return { id: dependency };
    }),
    snapshot: () => {
      return {};
    },
    validate: () => {
      return { valid: true };
    },
    endpoint: {
      mutationFn: async () => {
        return {};
      },
    },
    form: {
      reset: () => {},
    },
  };
};

describe("compileSavePlan", () => {
  test("rejects invalid graphs without an executable plan", () => {
    const result = compileSavePlan([form("a", ["missing"]), form("a")]);

    expect(result.plan).toBeUndefined();
    expect(
      result.errors.map((error) => {
        return error.message;
      }),
    ).toEqual(["Duplicate form ID: a", "Missing dependency missing for a."]);
  });

  test("resolves normal and undo prerequisites", () => {
    const a = form("a");
    const b = form("b", ["a"]);
    const c = form("c", ["b"]);

    const save = compileSavePlan([c, b, a], "save").plan!;
    const undo = compileSavePlan([a, b, c], "undo").plan!;

    expect(save.nodes.get("c")?.prerequisites).toEqual(["b"]);
    expect(undo.nodes.get("b")?.prerequisites).toEqual(["c"]);
    expect(undo.nodes.get("a")?.prerequisites).toEqual(["b"]);
  });
});

describe("executeGraph", () => {
  test("waits for prerequisites and returns declaration-ordered results", async () => {
    const started: string[] = [];
    const result = await executeGraph([
      {
        id: "c",
        prerequisites: ["b"],
        run: async () => {
          started.push("c");
          return "c";
        },
      },
      {
        id: "b",
        prerequisites: ["a"],
        run: async () => {
          started.push("b");
          return "b";
        },
      },
      {
        id: "a",
        prerequisites: [],
        run: async () => {
          started.push("a");
          return "a";
        },
      },
    ]);

    expect(started).toEqual(["a", "b", "c"]);
    expect([...result.entries()]).toEqual([
      ["c", { status: "completed", value: "c" }],
      ["b", { status: "completed", value: "b" }],
      ["a", { status: "completed", value: "a" }],
    ]);
  });

  test("propagates failures to descendants", async () => {
    const result = await executeGraph([
      {
        id: "a",
        prerequisites: [],
        run: async () => {
          throw new Error("failed");
        },
      },
      {
        id: "b",
        prerequisites: ["a"],
        run: async () => {
          return "b";
        },
      },
    ]);

    expect(result.get("a")?.status).toBe("failed");
    expect(result.get("b")).toEqual({ status: "skipped", blockedBy: ["a"] });
  });

  test("enforces max concurrency", async () => {
    let active = 0;
    let maximum = 0;
    const nodes = ["a", "b", "c"].map((id) => {
      return {
        id,
        prerequisites: [],
        run: async () => {
          active += 1;
          maximum = Math.max(maximum, active);
          await Promise.resolve();
          active -= 1;
          return id;
        },
      };
    });

    await executeGraph(nodes, { concurrency: 2 });
    expect(maximum).toBe(2);
  });
});
