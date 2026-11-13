import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  Outlet,
  type AnyRoute,
  RouterProvider,
} from "@tanstack/react-router";
import { beforeEach, afterEach, expect, test, vi } from "vitest";
import { TooltipProvider } from "../src/features/UI/components/ui/tooltip";
import { Route as ComponentsLayoutRoute } from "../src/routes/experiments/components/route";
import { Route as ComponentExampleRoute } from "../src/routes/experiments/components.$component";
import type { ExampleProps } from "../src/routes/experiments/components/ComponentLibrary/useExampleState";

vi.mock("../src/routes/experiments/components/ComponentLibrary/TerminalExample", () => {
  return {
    default: ({ id }: ExampleProps) => {
      return <div data-testid="terminal-preview">{id}</div>;
    },
  };
});
beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { ready: Promise.resolve() },
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const mount = async (url: string) => {
  const root = createRootRoute({
    component: () => {
      return (
        <TooltipProvider>
          <Outlet />
        </TooltipProvider>
      );
    },
  });
  // Reuse the actual route component and validator with a lightweight test root.
  const layoutOptions = {
    ...ComponentsLayoutRoute.options,
    getParentRoute: () => {
      return root;
    },
    path: "/experiments/components",
  };
  const layoutRoute = ComponentsLayoutRoute.update(layoutOptions);
  const exampleOptions = {
    ...ComponentExampleRoute.options,
    getParentRoute: () => {
      return layoutRoute;
    },
    path: "/experiments/components/$component",
  };
  const exampleRoute = ComponentExampleRoute.update(exampleOptions);
  const history = createMemoryHistory({ initialEntries: [url] });
  const router = createRouter({
    routeTree: root.addChildren([layoutRoute.addChildren([exampleRoute]) as AnyRoute]),
    history,
    scrollRestoration: true,
  });
  await router.load();
  render(<RouterProvider router={router} />);
  if (/\/experiments\/components\/[^/]+$/.test(url)) {
    await screen.findByTestId("terminal-preview");
  }
  return { history, router, user: userEvent.setup() };
};

test("opens a component route and changes component routes through the sidebar", async () => {
  const { history, user } = await mount("/experiments/components/table");
  expect(screen.getByRole("heading", { name: "Table" })).toBeVisible();
  expect(screen.getByTestId("terminal-preview")).toHaveTextContent("table");
  await user.click(screen.getByRole("link", { name: "Command palette" }));
  await waitFor(() => {
    return expect(history.location.pathname).toBe("/experiments/components/commands");
  });
  expect(screen.getByRole("heading", { name: "Command palette", level: 2 })).toBeVisible();
  expect(screen.getByTestId("terminal-preview")).toHaveTextContent("commands");
  await act(async () => {
    history.back();
  });
  await waitFor(() => {
    return expect(screen.getByRole("heading", { name: "Table" })).toBeVisible();
  });
  await act(async () => {
    history.forward();
  });
  await waitFor(() => {
    return expect(screen.getByTestId("terminal-preview")).toHaveTextContent("commands");
  });
});

test("the component library parent route renders its outlet without a default example", async () => {
  const { history } = await mount("/experiments/components");
  expect(history.location.pathname).toBe("/experiments/components");
  expect(screen.queryByRole("heading", { name: "Text field" })).not.toBeInTheDocument();
  expect(screen.queryByTestId("terminal-preview")).not.toBeInTheDocument();
});

test("the text field also has its own component route", async () => {
  const { history } = await mount("/experiments/components/text");
  expect(history.location.pathname).toBe("/experiments/components/text");
  expect(screen.getByRole("heading", { name: "Text field" })).toBeVisible();
});

test("changing the component updates history without resetting the page scroll", async () => {
  const { history, router, user } = await mount("/experiments/components/table");
  const navigate = vi.spyOn(router, "navigate");
  // The app enables router scroll restoration. Observe its actual scroll calls
  // rather than relying on JSDOM to implement viewport layout or scrollY.
  vi.mocked(window.scrollTo).mockClear();
  await user.click(screen.getByRole("link", { name: "Command palette" }));
  await waitFor(() => {
    return expect(history.location.pathname).toBe("/experiments/components/commands");
  });
  expect(navigate).toHaveBeenCalledWith(expect.objectContaining({ resetScroll: false }));
  expect(window.scrollTo).not.toHaveBeenCalled();
  expect(screen.getByTestId("terminal-preview")).toHaveTextContent("commands");
  await act(async () => {
    history.back();
  });
  await waitFor(() => {
    return expect(screen.getByTestId("terminal-preview")).toHaveTextContent("table");
  });
  await act(async () => {
    history.forward();
  });
  await waitFor(() => {
    return expect(screen.getByTestId("terminal-preview")).toHaveTextContent("commands");
  });
});
