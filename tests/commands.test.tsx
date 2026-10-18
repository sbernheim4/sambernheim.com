import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, test, vi } from "vitest";
import {
  CommandPalette,
  CommandPaletteProvider,
  useCommandAction,
} from "../src/shared/commands/commands";
import { SegmentedTabs } from "../src/shared/components/SegmentedTabs";
import { CommandButton } from "../src/shared/components/CommandButton";

const renderWithCommands = (children: ReactNode) => {
  return render(
    <CommandPaletteProvider>
      {children}
      <CommandPalette />
    </CommandPaletteProvider>,
  );
};

describe("command palette", () => {
  test("automatically registers segmented tabs and activates them", async () => {
    const user = userEvent.setup();
    renderWithCommands(
      <SegmentedTabs
        tabs={[
          { value: "one", label: "One", children: <p>First</p> },
          { value: "two", label: "Two", children: <p>Second</p> },
        ]}
      />,
    );

    await user.keyboard("{Control>}k{/Control}");
    expect(screen.getByRole("option", { name: "Two" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Tabs" })).toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "Two" }));

    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute("data-state", "active");
  });

  test("supports explicit opt-out", async () => {
    const user = userEvent.setup();
    renderWithCommands(
      <SegmentedTabs
        tabs={[{ value: "one", label: "Private tab", children: <p>First</p>, command: false }]}
      />,
    );

    await user.keyboard("{Control>}k{/Control}");
    expect(screen.queryByRole("option", { name: "Private tab" })).not.toBeInTheDocument();
  });

  test("executes custom registered actions", async () => {
    const user = userEvent.setup();
    const execute = vi.fn();

    const CustomAction = () => {
      useCommandAction({ id: "test.action", label: "Run test action", execute });
      return null;
    };

    renderWithCommands(<CustomAction />);
    await user.keyboard("{Control>}k{/Control}");
    await user.click(screen.getByRole("option", { name: "Run test action" }));

    expect(execute).toHaveBeenCalledOnce();
  });

  test("automatically registers buttons and supports button opt-out", async () => {
    const user = userEvent.setup();
    const execute = vi.fn();
    renderWithCommands(
      <>
        <CommandButton onClick={execute}>Run button</CommandButton>
        <CommandButton command={false}>Hidden button</CommandButton>
      </>,
    );

    await user.keyboard("{Control>}k{/Control}");
    expect(screen.getByRole("option", { name: "Run button" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Actions" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Hidden button" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "Run button" }));
    expect(execute).toHaveBeenCalledOnce();
  });
});
