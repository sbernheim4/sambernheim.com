// @vitest-environment node
import { PassThrough } from "node:stream";
import { setTimeout as delay } from "node:timers/promises";
import { afterEach, expect, test, vi } from "vitest";
import { render } from "ink";
import { TerminalComponentExample } from "../src/routes/experiments/components/ComponentLibrary/TerminalExample";
import { useExampleState } from "../src/routes/experiments/components/ComponentLibrary/useExampleState";
import { CommandPaletteProvider, useCommandAction } from "../src/features/CommandPalette/model";
import type { ComponentId } from "../src/routes/experiments/components/ComponentLibrary/catalog";

vi.mock("ink-web", () => {
  return {
    InkTerminalBox: () => {
      return null;
    },
  };
});
const cleanups: (() => void)[] = [];
afterEach(() => {
  return cleanups.splice(0).forEach((cleanup) => {
    return cleanup();
  });
});

const mount = async (id: ComponentId, columns = 90) => {
  const stdout = Object.assign(new PassThrough(), { columns, rows: 20 });
  const stdin = Object.assign(new PassThrough(), {
    isTTY: true,
    setRawMode: () => {},
    ref: () => {},
    unref: () => {},
  });
  let output = "";
  stdout.on("data", (data) => {
    output = String(data);
  });
  let model!: ReturnType<typeof useExampleState>;
  let actionRuns = 0;
  const Harness = () => {
    // Register fixtures through the real live registry, never production fallback actions.
    useCommandAction({
      id: "test:increment",
      label: "Increment counter",
      group: "Actions",
      execute: () => {
        actionRuns += 1;
      },
    });
    useCommandAction({
      id: "test:reset",
      label: "Reset counter",
      group: "Actions",
      execute: () => {
        actionRuns = 0;
      },
    });
    useCommandAction({
      id: "test:disabled",
      label: "Publish (unavailable)",
      group: "Actions",
      enabled: false,
      execute: () => {
        actionRuns += 1;
      },
    });
    model = useExampleState();
    return <TerminalComponentExample id={id} {...model} />;
  };
  const app = render(
    <CommandPaletteProvider>
      <Harness />
    </CommandPaletteProvider>,
    {
      stdout: stdout as unknown as NodeJS.WriteStream,
      stdin: stdin as unknown as NodeJS.ReadStream,
      debug: true,
      patchConsole: false,
    },
  );
  cleanups.push(() => {
    app.unmount();
    stdin.destroy();
    stdout.destroy();
  });
  await delay(100);
  return {
    model: () => {
      return model;
    },
    actionRuns: () => {
      return actionRuns;
    },
    resize: async (columns: number) => {
      stdout.columns = columns;
      stdout.emit("resize");
      await delay(100);
    },
    text: () => {
      return output.replace(new RegExp(String.fromCharCode(27) + "\\[[0-9;]*m", "g"), "");
    },
    key: async (key: string) => {
      stdin.write(key);
      await delay(100);
    },
    update: async (update: (state: typeof model) => void) => {
      update(model);
      await delay(100);
    },
  };
};

test("terminal text editing updates the shared form and accepts external changes", async () => {
  const app = await mount("text");
  await app.key("x");
  expect(app.model().form.state.values.title).toBe("Website refreshx");
  await app.update((model) => {
    return model.form.setFieldValue("title", "From web");
  });
  expect(app.text()).toContain("From web");
});

test.each(["select", "radio", "autocomplete"] as const)(
  "terminal %s shares selections with the form",
  async (id) => {
    const app = await mount(id);
    await app.key(id === "radio" ? "\u001b[C" : "\u001b[B");
    expect(app.model().form.state.values.status).toBe("active");
    await app.update((model) => {
      return model.form.setFieldValue("status", "done");
    });
    expect(app.text()).toContain(id === "autocomplete" ? "done" : "Complete");
  },
);

test("terminal tabs share controlled selection", async () => {
  const app = await mount("tabs");
  await app.key("l");
  expect(app.model().tab).toBe("activity");
  expect(app.text()).toContain("Added a release task.");
  await app.update((model) => {
    return model.onTabChange("overview");
  });
  expect(app.text()).toContain("Website refresh");
});

test("terminal disclosure and date format update shared state", async () => {
  const section = await mount("section");
  await section.key(" ");
  expect(section.model().sectionOpen).toBe(false);
  expect(section.text()).not.toContain("Small improvements");
  await section.update((model) => {
    return model.onSectionOpenChange(true);
  });
  expect(section.text()).toContain("Small improvements");
  const date = await mount("date");
  await date.key("\r");
  expect(date.model().dateMode).toBe("relative");
  await date.update((model) => {
    return model.onDateModeChange("local");
  });
  expect(date.model().dateMode).toBe("local");
  expect(date.text()).toContain("2026");
});

test("terminal palette shares search and selection, runs actions, and blocks disabled commands", async () => {
  const app = await mount("commands");
  await app.key("/");
  await app.key("Increment");
  expect(app.model().commandState.query).toBe("Increment");
  await app.key("\r");
  expect(app.actionRuns()).toBe(1);
  expect(app.model().commandState.query).toBe("");
  await app.update((model) => {
    return model.commandState.setQuery("Publish");
  });
  await app.key("\r");
  expect(app.actionRuns()).toBe(1);
  await app.update((model) => {
    return model.commandState.setQuery("");
  });
  await app.key("\u001b[B");
  expect(app.model().commandState.selected).toBe(1);
  await app.update((model) => {
    return model.commandState.setQuery("no match");
  });
  expect(app.text()).toContain("No commands found.");
});

test("terminal table shares filters, sort order, and selected record IDs", async () => {
  const app = await mount("table");
  await app.key("\u001b[B");
  expect(app.model().tableControls.selectedId).toBe("release");
  await app.key("1");
  expect(app.model().tableControls.sorting).toEqual([{ id: "name", desc: false }]);
  expect(app.model().tableControls.selectedId).toBe("release");
  await app.key("/");
  await app.key("Release");
  expect(app.model().tableControls.query).toBe("Release");
  expect(app.model().tableControls.selectedId).toBeNull();
  await app.key("\r");
  await app.key("\u001b[B");
  expect(app.model().tableControls.selectedId).toBe("release");
  await app.update((model) => {
    return model.tableControls.onQueryChange("no match");
  });
  expect(app.text()).toContain("No matching records.");
});

test("terminal table aligns plain columns and keeps sample values legible on resize", async () => {
  const app = await mount("table");
  const lines = () => {
    return app
      .text()
      .split("\n")
      .map((line) => {
        return line.trim();
      });
  };
  const header = () => {
    return lines().find((line) => {
      return line.startsWith("Name");
    })!;
  };
  const record = () => {
    return lines().find((line) => {
      return line.startsWith("Design review");
    })!;
  };
  expect(header()).toMatch(/^Name\s+Status\s+Details$/);
  expect(record()).toMatch(/^Design review\s+Active\s+Review screens$/);
  expect(header().indexOf("Status")).toBe(record().indexOf("Active"));
  expect(header().indexOf("Details")).toBe(record().indexOf("Review screens"));
  expect(app.text()).not.toContain("┌");
  await app.resize(46);
  expect(record()).toMatch(/^Design review\s+Active\s+Review screens$/);
  expect(record().length).toBeLessThanOrEqual(42);
  expect(header().indexOf("Status")).toBe(record().indexOf("Active"));
  await app.key("1");
  expect(app.text()).toContain("Name ↑");
});

test("inline terminal palette fills its container at wide and narrow widths", async () => {
  const app = await mount("commands");
  const topBorder = () => {
    return app
      .text()
      .split("\n")
      .map((line) => {
        return line.trim();
      })
      .find((line) => {
        return line.startsWith("╭");
      })!;
  };
  expect(topBorder()).toHaveLength(88);
  await app.resize(46);
  expect(topBorder()).toHaveLength(44);
});

test("Alt+number edits TanStack column filters while plain numbers sort", async () => {
  const app = await mount("table");
  await app.key("\u001b2");
  await app.key("Planned");
  expect(app.model().tableModel.table.getColumn("status")?.getFilterValue()).toBe("Planned");
  expect(
    app.model().tableModel.rows.map((row) => {
      return row.id;
    }),
  ).toEqual(["release"]);
  await app.key("\r");
  await app.key("1");
  expect(app.model().tableControls.sorting).toEqual([{ id: "name", desc: false }]);
  await app.key("\u001b1");
  await app.key("Design");
  expect(app.model().tableModel.table.getColumn("name")?.getFilterValue()).toBe("Design");
  expect(app.model().tableModel.rows).toHaveLength(0);
  await app.update((model) => {
    return model.reset();
  });
  expect(app.model().tableModel.table.state.columnFilters).toEqual([]);
  expect(app.model().tableModel.rows).toHaveLength(3);
});
