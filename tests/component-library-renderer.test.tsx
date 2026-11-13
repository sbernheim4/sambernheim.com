import type { ComponentProps } from "react";
import { render, renderHook, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import {
  CommandPalette,
  ComponentRendererProvider,
  Table,
  type ComponentRenderer,
} from "../src/routes/experiments/components/ComponentLibrary/renderer";
import { useExampleState } from "../src/routes/experiments/components/ComponentLibrary/useExampleState";

const createRenderer = (name: string) => {
  const palette = vi.fn((_props: ComponentProps<ComponentRenderer["CommandPalette"]>) => {
    return <div data-testid={`${name}-palette`} />;
  });
  const table = vi.fn((_props: ComponentProps<ComponentRenderer["Table"]>) => {
    return <div data-testid={`${name}-table`} />;
  });
  const renderer: ComponentRenderer = {
    CommandPalette: palette,
    Table: table,
    Text: ({ children }) => {
      return <span>{children}</span>;
    },
    Stack: ({ children }) => {
      return <div>{children}</div>;
    },
    DetailTabs: () => {
      return <div />;
    },
    DetailSection: ({ children }) => {
      return <section>{children}</section>;
    },
    CycleableDateTime: () => {
      return <time />;
    },
    Form: ({ children }) => {
      return <form>{children}</form>;
    },
  };
  return { renderer, palette, table };
};

test("one unchanged public JSX tree selects renderers through context and shares its models", () => {
  const { result } = renderHook(() => {
    return useExampleState();
  });
  const { commandModel, tableModel } = result.current;
  const web = createRenderer("web");
  const terminal = createRenderer("terminal");
  // The component names, JSX, and props are identical for both targets.
  const example = (
    <>
      <CommandPalette model={commandModel} />
      <Table model={tableModel} interactive />
    </>
  );
  const { rerender } = render(
    <ComponentRendererProvider renderer={web.renderer}>{example}</ComponentRendererProvider>,
  );
  expect(screen.getByTestId("web-palette")).toBeVisible();
  expect(screen.getByTestId("web-table")).toBeVisible();
  expect(web.palette.mock.lastCall![0].model).toBe(commandModel);
  expect(web.table.mock.lastCall![0].model).toBe(tableModel);
  rerender(
    <ComponentRendererProvider renderer={terminal.renderer}>{example}</ComponentRendererProvider>,
  );
  expect(screen.queryByTestId("web-palette")).not.toBeInTheDocument();
  expect(screen.queryByTestId("web-table")).not.toBeInTheDocument();
  expect(screen.getByTestId("terminal-palette")).toBeVisible();
  expect(screen.getByTestId("terminal-table")).toBeVisible();
  const webPaletteProps = web.palette.mock.lastCall![0];
  const terminalPaletteProps = terminal.palette.mock.lastCall![0];
  const webTableProps = web.table.mock.lastCall![0];
  const terminalTableProps = terminal.table.mock.lastCall![0];
  expect(terminalPaletteProps).toEqual(webPaletteProps);
  expect(terminalPaletteProps.model).toBe(commandModel);
  expect(terminalPaletteProps.model?.run).toBe(webPaletteProps.model?.run);
  expect(terminalTableProps).toEqual(webTableProps);
  expect(terminalTableProps.model).toBe(tableModel);
  expect(terminalTableProps.model?.table).toBe(webTableProps.model?.table);
  expect(terminalTableProps.model?.rows).toBe(webTableProps.model?.rows);
});

test("the public prop API remains identical when explicitly overriding provider models", () => {
  const { result } = renderHook(() => {
    return useExampleState();
  });
  const overrides = result.current;
  const web = createRenderer("web");
  const terminal = createRenderer("terminal");
  const onSelect = vi.fn();
  const example = (
    <>
      <CommandPalette model={overrides.commandModel} mode="modal" />
      <Table model={overrides.tableModel} onSelect={onSelect} interactive />
    </>
  );
  const { rerender } = render(
    <ComponentRendererProvider renderer={web.renderer}>{example}</ComponentRendererProvider>,
  );
  rerender(
    <ComponentRendererProvider renderer={terminal.renderer}>{example}</ComponentRendererProvider>,
  );
  for (const target of [web, terminal]) {
    expect(target.palette.mock.lastCall![0].model).toBe(overrides.commandModel);
    expect(target.palette.mock.lastCall![0].mode).toBe("modal");
    expect(target.table.mock.lastCall![0].model).toBe(overrides.tableModel);
    expect(target.table.mock.lastCall![0].onSelect).toBe(onSelect);
    expect(target.table.mock.lastCall![0].interactive).toBe(true);
  }
  expect(terminal.palette.mock.lastCall![0]).toEqual(web.palette.mock.lastCall![0]);
  expect(terminal.table.mock.lastCall![0]).toEqual(web.table.mock.lastCall![0]);
});
