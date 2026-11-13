import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, test, vi } from "vitest";
import {
  CommandPaletteProvider,
  useCommandAction,
  useCommandActions,
  useCommandPalette,
  useCommandPaletteModel,
} from "../src/features/CommandPalette/model";
import { CommandPalette } from "../src/features/CommandPalette/components/web/CommandPalette";
import { SegmentedTabs } from "../src/features/UI/components/web/SegmentedTabs";
import { CommandButton } from "../src/features/CommandPalette/components/web/CommandButton";

const renderWithCommandPalette = (children: ReactNode) => {
  const PaletteHost = ({ children: hostChildren }: { children: ReactNode }) => {
    const actions = useCommandActions();
    const state = useCommandPalette();
    const model = useCommandPaletteModel(actions, state, true);
    return (
      <>
        {hostChildren}
        <CommandPalette model={model} />
      </>
    );
  };
  return render(
    <CommandPaletteProvider>
      <PaletteHost>{children}</PaletteHost>
    </CommandPaletteProvider>,
  );
};

describe("command palette", () => {
  test("automatically registers segmented tabs and activates them", async () => {
    const user = userEvent.setup();
    renderWithCommandPalette(
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
    renderWithCommandPalette(
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

    renderWithCommandPalette(<CustomAction />);
    await user.keyboard("{Control>}k{/Control}");
    await user.click(screen.getByRole("option", { name: "Run test action" }));

    expect(execute).toHaveBeenCalledOnce();
  });

  test("automatically registers buttons and supports button opt-out", async () => {
    const user = userEvent.setup();
    const execute = vi.fn();
    renderWithCommandPalette(
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
