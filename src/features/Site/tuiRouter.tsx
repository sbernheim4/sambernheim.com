import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import {
  RouterContextProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
} from "@tanstack/react-router";

export type TuiEntity = "tasks" | "processes" | "threads";
export type TuiRoute =
  | { page: "home" | "blog" | "form-demo" | "editor" | "party-math" }
  | { page: "article"; slug: string }
  | { page: "entity-list"; entity: TuiEntity }
  | { page: "entity-create"; entity: TuiEntity }
  | { page: "entity-detail"; entity: TuiEntity; id: string }
  | { page: "entity-edit"; entity: TuiEntity; id: string };

const rootRoute = createRootRoute();
const route = (path: string) => {
  return createRoute({
    getParentRoute: () => {
      return rootRoute;
    },
    path,
  });
};
const routes = [
  route("/"),
  route("/blog"),
  route("/blog/$slug"),
  route("/form-demo"),
  route("/editor"),
  route("/the-party-math-trick-demo"),
  ...(["tasks", "processes", "threads"] as const).flatMap((entity) => {
    const id = entity === "tasks" ? "$taskId" : entity === "processes" ? "$processId" : "$threadId";
    return [
      route(`/form-demo/${entity}`),
      route(`/form-demo/${entity}/create`),
      route(`/form-demo/${entity}/${id}`),
      route(`/form-demo/${entity}/${id}/edit`),
    ];
  }),
];

const pathnameState = globalThis as typeof globalThis & { __siteTuiPathname?: string };
export const tuiHistory = createMemoryHistory({
  initialEntries: [pathnameState.__siteTuiPathname ?? import.meta.hot?.data.pathname ?? "/"],
});
export const tuiRouter = createRouter({
  routeTree: rootRoute.addChildren(routes),
  history: tuiHistory,
  isServer: true,
});
const PathnameContext = createContext("/");
const subscribe = (onChange: () => void) => {
  return tuiHistory.subscribe(onChange);
};
const getPathname = () => {
  return tuiHistory.location.pathname;
};

const resolveRoute = (pathname: string): TuiRoute => {
  if (pathname === "/") {
    return { page: "home" };
  }
  if (pathname === "/blog") {
    return { page: "blog" };
  }
  if (pathname === "/form-demo") {
    return { page: "form-demo" };
  }
  if (pathname === "/editor") {
    return { page: "editor" };
  }
  if (pathname === "/the-party-math-trick-demo") {
    return { page: "party-math" };
  }
  const article = pathname.match(/^\/blog\/([^/]+)$/);
  if (article) {
    return { page: "article", slug: article[1] };
  }
  const entity = pathname.match(
    /^\/form-demo\/(tasks|processes|threads)(?:\/([^/]+))?(?:\/(edit))?$/,
  );
  if (entity) {
    const name = entity[1] as TuiEntity;
    if (!entity[2]) {
      return { page: "entity-list", entity: name };
    }
    if (entity[2] === "create") {
      return { page: "entity-create", entity: name };
    }
    return entity[3]
      ? { page: "entity-edit", entity: name, id: entity[2] }
      : { page: "entity-detail", entity: name, id: entity[2] };
  }
  return { page: "home" };
};

export const TuiRouterProvider = ({
  renderRoute,
}: {
  renderRoute: (route: TuiRoute) => ReactNode;
}) => {
  const pathname = useSyncExternalStore(subscribe, getPathname, getPathname);
  useEffect(() => {
    pathnameState.__siteTuiPathname = pathname;
  }, [pathname]);
  return (
    <RouterContextProvider router={tuiRouter}>
      <PathnameContext.Provider value={pathname}>
        {renderRoute(resolveRoute(pathname))}
      </PathnameContext.Provider>
    </RouterContextProvider>
  );
};

if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    data.pathname = tuiHistory.location.pathname;
    pathnameState.__siteTuiPathname = data.pathname;
  });
}
export const useTuiNavigate = () => {
  return useNavigate();
};
export const useTuiPathname = () => {
  return useContext(PathnameContext);
};
