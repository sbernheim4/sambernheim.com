import type { ComponentProps, ReactNode } from "react";
import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  useParams,
} from "@tanstack/react-router";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { ExampleProps } from "../src/routes/experiments/components/ComponentLibrary/useExampleState";
import { TooltipProvider } from "../src/features/UI/components/ui/tooltip";
import { ComponentLibrary } from "../src/routes/experiments/components/ComponentLibrary/ComponentLibrary";
import { ComponentExample } from "../src/routes/experiments/components/ComponentLibrary/ComponentExample";
import type { ComponentId } from "../src/routes/experiments/components/ComponentLibrary/catalog";
import { CommandPaletteProvider, useCommandAction } from "../src/features/CommandPalette/model";
import { useState } from "react";

const PaletteFixture = () => {
  const [counter, setCounter] = useState(0);
  const { component } = useParams({ strict: false });
  useCommandAction({
    id: "test:increment",
    label: "Increment counter",
    group: "Actions",
    execute: () => {
      return setCounter((value) => {
        return value + 1;
      });
    },
  });
  useCommandAction({
    id: "test:reset",
    label: "Reset counter",
    group: "Actions",
    execute: () => {
      return setCounter(0);
    },
  });
  useCommandAction({
    id: "test:disabled",
    label: "Publish (unavailable)",
    group: "Actions",
    enabled: false,
    execute: () => {
      return setCounter((value) => {
        return value + 1;
      });
    },
  });
  return (
    <>
      <output>Counter: {counter}</output>
      <ComponentExample key={component} selected={component as ComponentId} />
    </>
  );
};

const RoutedExample = () => {
  const { component } = useParams({ strict: false });
  return <ComponentExample key={component} selected={component as ComponentId} />;
};

const renderComponentLibrary = (page: () => ReactNode = RoutedExample) => {
  const rootRoute = createRootRoute({
    component: () => {
      return <Outlet />;
    },
  });
  const layoutRoute = createRoute({
    getParentRoute: () => {
      return rootRoute;
    },
    path: "/experiments/components",
    component: ComponentLibrary,
  });
  const exampleRoute = createRoute({
    getParentRoute: () => {
      return layoutRoute;
    },
    path: "/$component",
    component: page,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([layoutRoute.addChildren([exampleRoute])]),
    history: createMemoryHistory({ initialEntries: ["/experiments/components/text"] }),
  });
  return render(
    <TooltipProvider>
      <CommandPaletteProvider>
        <RouterProvider router={router} />
      </CommandPaletteProvider>
    </TooltipProvider>,
  );
};

const renderLibraryWithPaletteFixture = () => {
  return renderComponentLibrary(PaletteFixture);
};

// Keep the real DOM renderers while observing the model boundary. This catches
// regressions where two synchronized stores replace a single shared instance.
const renderedModels = vi.hoisted(() => {
  return {
    command: vi.fn(),
    table: vi.fn(),
    terminal: vi.fn(),
  };
});
vi.mock("../src/features/CommandPalette/components/web/CommandPalette", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../src/features/CommandPalette/components/web/CommandPalette")
    >();
  return {
    ...actual,
    CommandPalette: (props: ComponentProps<typeof actual.CommandPalette>) => {
      renderedModels.command(props.model);
      return <actual.CommandPalette {...props} />;
    },
  };
});
vi.mock("../src/features/Table/components/web/Table", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../src/features/Table/components/web/Table")>();
  return {
    ...actual,
    Table: (props: ComponentProps<typeof actual.Table>) => {
      renderedModels.table(props.model);
      return <actual.Table {...props} />;
    },
  };
});

// Exercise the shared state crossing the terminal boundary without a canvas.
// The actual Ink key handlers are covered separately in component-library-tui.
vi.mock("../src/routes/experiments/components/ComponentLibrary/TerminalExample", () => {
  return {
    default: (props: ExampleProps) => {
      renderedModels.terminal(props);
      return (
        <div data-testid="terminal-example">
          {props.id}
          <output aria-label="Terminal command query">{props.commandState.query}</output>
          <output aria-label="Terminal command selection">{props.commandState.selected}</output>
          <button
            onClick={() => {
              return props.commandState.setQuery("Reset");
            }}
          >
            Terminal search reset
          </button>
          <button
            onClick={() => {
              return props.commandActions[0].execute();
            }}
          >
            Terminal increment
          </button>
          <output aria-label="Terminal row filter">{props.tableControls.query}</output>
          <output aria-label="Terminal row selection">{props.tableControls.selectedId}</output>
          <output aria-label="Terminal sorting">
            {JSON.stringify(props.tableControls.sorting)}
          </output>
          <button
            onClick={() => {
              return props.tableControls.onQueryChange("Release");
            }}
          >
            Terminal filter release
          </button>
          <button
            onClick={() => {
              return props.tableControls.onSelectedIdChange("release");
            }}
          >
            Terminal select release
          </button>
          <button
            onClick={() => {
              return props.tableControls.onSortingChange([{ id: "name", desc: true }]);
            }}
          >
            Terminal sort descending
          </button>
          <props.form.Subscribe
            selector={(state) => {
              return state.values;
            }}
          >
            {(values) => {
              return (
                <>
                  <output aria-label="Terminal title">{values.title}</output>
                  <output aria-label="Terminal status">{values.status}</output>
                </>
              );
            }}
          </props.form.Subscribe>
          <button
            onClick={() => {
              return props.form.setFieldValue("title", "From terminal");
            }}
          >
            Terminal edit title
          </button>
          <button
            onClick={() => {
              return props.form.setFieldValue("status", "done");
            }}
          >
            Terminal complete
          </button>
          <output aria-label="Terminal tab">{props.tab}</output>
          <button
            onClick={() => {
              return props.onTabChange("overview");
            }}
          >
            Terminal overview
          </button>
          <output aria-label="Terminal disclosure">{String(props.sectionOpen)}</output>
          <button
            onClick={() => {
              return props.onSectionOpenChange(!props.sectionOpen);
            }}
          >
            Terminal toggle
          </button>
          <output aria-label="Terminal date mode">{props.dateMode}</output>
          <button
            onClick={() => {
              return props.onDateModeChange("local");
            }}
          >
            Terminal local
          </button>
        </div>
      );
    },
  };
});
beforeEach(() => {
  renderedModels.command.mockClear();
  renderedModels.table.mockClear();
  renderedModels.terminal.mockClear();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  return vi.unstubAllGlobals();
});
Object.defineProperty(document, "fonts", {
  configurable: true,
  value: { ready: Promise.resolve() },
});

test("edits real form fields and resets both preview lifecycles", async () => {
  const user = userEvent.setup();
  renderComponentLibrary();
  expect(await screen.findByTestId("terminal-example")).toHaveTextContent("text");
  await user.clear(screen.getByLabelText("Title"));
  await user.type(screen.getByLabelText("Title"), "A different project");
  expect(screen.getByLabelText("Title")).toHaveValue("A different project");
  await user.click(screen.getByRole("button", { name: "Reset examples" }));
  expect(screen.getByLabelText("Title")).toHaveValue("Website refresh");
  await user.click(screen.getByRole("link", { name: "Radio group" }));
  await user.click(screen.getByRole("radio", { name: "Complete" }));
  expect(screen.getByRole("radio", { name: "Complete" })).toBeChecked();
  expect(screen.getByTestId("terminal-example")).toHaveTextContent("radio");
  expect(screen.getByRole("heading", { name: "Radio group" })).toBeVisible();
});

test("filters catalog navigation, handles no matches, and changes paired examples", async () => {
  const user = userEvent.setup();
  renderComponentLibrary();
  await screen.findByTestId("terminal-example");
  await user.type(screen.getByLabelText("Find a component"), "Detail tabs");
  expect(screen.queryByRole("link", { name: "Text field" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("link", { name: "Detail tabs" }));
  expect(screen.getByTestId("terminal-example")).toHaveTextContent("tabs");
  await user.click(screen.getByRole("tab", { name: "Activity" }));
  expect(screen.getByRole("tabpanel")).toHaveTextContent("Added a release task.");
  await user.clear(screen.getByLabelText("Find a component"));
  await user.type(screen.getByLabelText("Find a component"), "nonexistent");
  expect(screen.getByText("No matching components.")).toHaveAttribute("role", "status");
});

test("Tab exits the terminal preview to a visible control", async () => {
  renderComponentLibrary();
  const terminal = await screen.findByTestId("terminal-example");
  fireEvent.keyDown(terminal, { key: "Tab" });
  expect(screen.getByRole("button", { name: "Reset examples" })).toHaveFocus();
});

test("shares form values in both directions for every field example", async () => {
  const user = userEvent.setup();
  renderComponentLibrary();
  await screen.findByTestId("terminal-example");
  await user.clear(screen.getByLabelText("Title"));
  await user.type(screen.getByLabelText("Title"), "From web");
  expect(screen.getByLabelText("Terminal title")).toHaveTextContent("From web");
  await user.click(screen.getByRole("button", { name: "Terminal edit title" }));
  expect(screen.getByLabelText("Title")).toHaveValue("From terminal");
  for (const name of ["Select", "Radio group", "Autocomplete"]) {
    await user.click(screen.getByRole("link", { name }));
    if (name === "Select") {
      fireEvent.change(
        screen.getByRole("combobox", { name: "Status" }).parentElement!.querySelector("select")!,
        { target: { value: "active" } },
      );
    } else if (name === "Radio group") {
      await user.click(screen.getByRole("radio", { name: "In progress" }));
    } else {
      await user.clear(screen.getByLabelText("Status"));
      await user.type(screen.getByLabelText("Status"), "active");
    }
    expect(screen.getByLabelText("Terminal status")).toHaveTextContent("active");
    await user.click(screen.getByRole("button", { name: "Terminal complete" }));
    if (name === "Select") {
      expect(screen.getByRole("combobox", { name: "Status" })).toHaveTextContent("Complete");
    } else if (name === "Radio group") {
      expect(screen.getByRole("radio", { name: "Complete" })).toBeChecked();
    } else {
      expect(screen.getByLabelText("Status")).toHaveValue("done");
    }
    await user.click(screen.getByRole("button", { name: "Reset examples" }));
    expect(screen.getByLabelText("Terminal status")).toHaveTextContent("planned");
  }
});

test("shares tab, disclosure, and date mode in both directions", async () => {
  const user = userEvent.setup();
  renderComponentLibrary();
  await screen.findByTestId("terminal-example");
  await user.click(screen.getByRole("link", { name: "Detail tabs" }));
  await user.click(screen.getByRole("tab", { name: "Activity" }));
  expect(screen.getByLabelText("Terminal tab")).toHaveTextContent("activity");
  await user.click(screen.getByRole("button", { name: "Terminal overview" }));
  expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
  await user.click(screen.getByRole("link", { name: "Detail section" }));
  const disclosure = screen.getByText("Project details").closest("details")!;
  disclosure.open = false;
  fireEvent(disclosure, new Event("toggle"));
  await waitFor(() => {
    return expect(screen.getByLabelText("Terminal disclosure")).toHaveTextContent("false");
  });
  await user.click(screen.getByRole("button", { name: "Terminal toggle" }));
  expect(disclosure).toHaveAttribute("open");
  await user.click(screen.getByRole("link", { name: "Cycleable date & time" }));
  await user.click(screen.getByRole("button", { name: /Format: UTC/ }));
  expect(screen.getByLabelText("Terminal date mode")).toHaveTextContent("relative");
  await user.click(screen.getByRole("button", { name: "Terminal local" }));
  expect(screen.getByRole("button", { name: /Format: Local/ })).toHaveAttribute(
    "data-mode",
    "local",
  );
  await user.click(screen.getByRole("button", { name: "Reset examples" }));
  expect(screen.getByLabelText("Terminal date mode")).toHaveTextContent("utc");
});

test("command palette shares search, selection, actions, and reset", async () => {
  const user = userEvent.setup();
  renderLibraryWithPaletteFixture();
  await screen.findByTestId("terminal-example");
  await user.click(screen.getByRole("link", { name: "Command palette" }));
  await user.type(await screen.findByLabelText("Search commands"), "Increment");
  expect(screen.getByLabelText("Terminal command query")).toHaveTextContent("Increment");
  await user.keyboard("{Enter}");
  expect(screen.getByText("Counter: 1")).toBeVisible();
  expect(screen.getByLabelText("Search commands")).toHaveValue("");
  fireEvent.keyDown(screen.getByLabelText("Search commands"), { key: "ArrowDown" });
  expect(screen.getByLabelText("Terminal command selection")).toHaveTextContent("1");
  expect(screen.getByRole("option", { name: "Publish (unavailable)" })).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "Terminal search reset" }));
  expect(screen.getByLabelText("Search commands")).toHaveValue("Reset");
  await user.click(screen.getByRole("button", { name: "Terminal increment" }));
  expect(screen.getByText("Counter: 2")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Reset examples" }));
  expect(screen.getByText("Counter: 2")).toBeVisible();
});

test("table shares filtering, sorting, and selection by record ID", async () => {
  const user = userEvent.setup();
  renderComponentLibrary();
  await screen.findByTestId("terminal-example");
  await user.click(screen.getByRole("link", { name: "Table" }));
  await user.click(screen.getByRole("button", { name: "Release notes" }));
  expect(screen.getByLabelText("Terminal row selection")).toHaveTextContent("release");
  await user.click(screen.getByRole("button", { name: "Name" }));
  expect(screen.getByLabelText("Terminal sorting")).toHaveTextContent('"desc":false');
  expect(screen.getByRole("button", { name: "Release notes" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await user.click(screen.getByRole("button", { name: "Terminal sort descending" }));
  expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
    "aria-sort",
    "descending",
  );
  await user.type(screen.getByLabelText("Filter rows"), "no match");
  expect(screen.getByText("No matching records.")).toBeVisible();
  expect(screen.getByLabelText("Terminal row filter")).toHaveTextContent("no match");
  await user.click(screen.getByRole("button", { name: "Terminal filter release" }));
  expect(screen.getByLabelText("Filter rows")).toHaveValue("Release");
  expect(screen.getByRole("button", { name: "Release notes" })).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Terminal select release" }));
  expect(screen.getByRole("button", { name: "Release notes" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("both palette renderers receive the exact same model, results, and execution function", async () => {
  const user = userEvent.setup();
  renderLibraryWithPaletteFixture();
  await screen.findByTestId("terminal-example");
  await user.click(screen.getByRole("link", { name: "Command palette" }));
  await screen.findByLabelText("Search commands");
  const expectSharedPalette = () => {
    const terminal = renderedModels.terminal.mock.lastCall![0] as ExampleProps;
    const web = renderedModels.command.mock.lastCall![0] as ExampleProps["commandModel"];
    expect(web).toBe(terminal.commandModel);
    expect(web.results).toBe(terminal.commandModel.results);
    expect(web.run).toBe(terminal.commandModel.run);
    return web;
  };
  expect(expectSharedPalette().results).toHaveLength(3);
  await user.type(screen.getByLabelText("Search commands"), "Increment");
  expect(
    expectSharedPalette().results.map((action) => {
      return action.id;
    }),
  ).toEqual(["test:increment"]);
  await user.keyboard("{Enter}");
  expectSharedPalette();
  expect(screen.getByText("Counter: 1")).toBeVisible();
});

test("both table renderers receive one model and one TanStack table instance", async () => {
  const user = userEvent.setup();
  renderComponentLibrary();
  await screen.findByTestId("terminal-example");
  await user.click(screen.getByRole("link", { name: "Table" }));
  const expectSharedTable = () => {
    const terminal = renderedModels.terminal.mock.lastCall![0] as ExampleProps;
    const web = renderedModels.table.mock.lastCall![0] as ExampleProps["tableModel"];
    expect(web).toBe(terminal.tableModel);
    expect(web.table).toBe(terminal.tableModel.table);
    expect(web.rows).toBe(terminal.tableModel.rows);
    expect(web.table.getRowModel()).toBe(terminal.tableModel.table.getRowModel());
    return web;
  };
  expect(expectSharedTable().rows).toHaveLength(3);
  await user.click(screen.getByRole("button", { name: "Name" }));
  expect(expectSharedTable().controls?.sorting).toEqual([{ id: "name", desc: false }]);
  await user.type(screen.getByLabelText("Filter rows"), "Release");
  expect(
    expectSharedTable().rows.map((row) => {
      return row.id;
    }),
  ).toEqual(["release"]);
  await user.click(screen.getByRole("button", { name: "Release notes" }));
  expect(expectSharedTable().controls?.selectedId).toBe("release");
});

test("column filters share the table model, combine with global search, and reset together", async () => {
  const user = userEvent.setup();
  renderComponentLibrary();
  await screen.findByTestId("terminal-example");
  await user.click(screen.getByRole("link", { name: "Table" }));
  const expectSharedRows = (ids: string[]) => {
    const terminal = renderedModels.terminal.mock.lastCall![0] as ExampleProps;
    const web = renderedModels.table.mock.lastCall![0] as ExampleProps["tableModel"];
    expect(web).toBe(terminal.tableModel);
    expect(web.table).toBe(terminal.tableModel.table);
    expect(web.rows).toBe(terminal.tableModel.rows);
    expect(
      web.rows.map((row) => {
        return row.id;
      }),
    ).toEqual(ids);
  };
  expectSharedRows(["design", "release", "tests"]);
  const setColumnFilter = (column: string, value: string) => {
    return act(() => {
      const terminal = renderedModels.terminal.mock.lastCall![0] as ExampleProps;
      terminal.tableModel.table.getColumn(column)?.setFilterValue(value);
    });
  };
  expect(screen.queryByRole("textbox", { name: "Filter Status" })).not.toBeInTheDocument();
  setColumnFilter("status", "Planned");
  expectSharedRows(["release"]);
  expect(screen.getByRole("button", { name: "Release notes" })).toBeVisible();
  expect(screen.queryByRole("button", { name: "Design review" })).not.toBeInTheDocument();
  await user.type(screen.getByLabelText("Filter rows"), "Design");
  expectSharedRows([]);
  expect(screen.getByText("No matching records.")).toBeVisible();
  await user.clear(screen.getByLabelText("Filter rows"));
  expectSharedRows(["release"]);
  setColumnFilter("status", "Complete");
  expect(
    (renderedModels.terminal.mock.lastCall![0] as ExampleProps).tableModel.table
      .getColumn("status")
      ?.getFilterValue(),
  ).toBe("Complete");
  expectSharedRows(["tests"]);
  setColumnFilter("name", "Add");
  setColumnFilter("summary", "key");
  expectSharedRows(["tests"]);
  await user.type(screen.getByLabelText("Filter rows"), "tests");
  await user.click(screen.getByRole("button", { name: "Reset examples" }));
  expect(screen.getByLabelText("Filter rows")).toHaveValue("");
  expect(
    (renderedModels.terminal.mock.lastCall![0] as ExampleProps).tableModel.controls?.columnFilters,
  ).toEqual([]);
  expect(
    screen.queryByRole("textbox", { name: /^Filter (Name|Status|Details)$/ }),
  ).not.toBeInTheDocument();
  expectSharedRows(["design", "release", "tests"]);
});
