import { useMemo, useState } from "react";
import { Box, Text, render, useApp, useInput } from "ink";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SiteLayout } from "./features/Site/components/tui/SiteLayout/SiteLayout";
import {
  TuiRouterProvider,
  tuiRouter,
  useTuiNavigate,
  useTuiPathname,
  type TuiRoute,
} from "./features/Site/tuiRouter";
import { BlogList, BlogListViewContext } from "./features/Site/components/BlogList";
import { TuiBlogList } from "./features/Site/components/tui/BlogList/BlogList";
import { FieldPrimitivesContext } from "./features/Forms/components/fields";
import { tuiFieldPrimitives } from "./features/Forms/components/fields/tui";
import { FieldFocusProvider } from "./features/Forms/components/fields/tui/FieldFocus";
import { FormEditorRendererContext } from "./features/Forms/components/editor/renderer";
import { tuiFormEditorRenderer } from "./features/Forms/components/editor/tui";
import { loadTuiArticles, openTuiArticle } from "./features/Site/components/tui/articles";
import { ProcessList } from "./features/Processes/components/ProcessList";
import { TaskList } from "./features/Tasks/components/TaskList";
import { ThreadList } from "./features/Threads/components/ThreadList";
import { ProcessDetail } from "./features/Processes/components/ProcessDetail";
import { TaskDetail } from "./features/Tasks/components/TaskDetail";
import { ThreadDetail } from "./features/Threads/components/ThreadDetail";
import { ProcessCreatePage, ProcessEditPage } from "./features/Processes/components/ProcessForms";
import { TaskCreatePage, TaskEditPage } from "./features/Tasks/components/TaskForms";
import { ThreadCreatePage, ThreadEditPage } from "./features/Threads/components/ThreadForms";
import { WorkspaceRendererContext } from "./features/Workspace/components/renderer";
import {
  tuiWorkspaceRenderer,
  TuiWorkspaceNavigation,
} from "./features/Workspace/components/tui/renderer";

const articles = loadTuiArticles();
const pages = [
  { title: "Home", path: "/", description: "Personal site and about" },
  { title: "Blog", path: "/blog", description: "All articles" },
  ...articles.map((article) => {
    return { title: article.title, path: article.href, description: article.description };
  }),
  { title: "Python editor", path: "/editor", description: "Interactive Python editor demo" },
  {
    title: "Party math trick",
    path: "/the-party-math-trick-demo",
    description: "Interactive math demo",
  },
  ...(["tasks", "processes", "threads"] as const).flatMap((entity) => {
    return [
      {
        title: `${entity[0].toUpperCase()}${entity.slice(1)}`,
        path: `/form-demo/${entity}`,
        description: "List records",
      },
      {
        title: `Create ${entity === "processes" ? "process" : entity.slice(0, -1)}`,
        path: `/form-demo/${entity}/create`,
        description: "Create a record",
      },
    ];
  }),
];
const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <FieldPrimitivesContext.Provider value={tuiFieldPrimitives}>
        <FormEditorRendererContext.Provider value={tuiFormEditorRenderer}>
          <FieldFocusProvider>
            <WorkspaceRendererContext.Provider value={tuiWorkspaceRenderer}>
              <BlogListViewContext.Provider value={TuiBlogList}>
                <TuiRouterProvider
                  renderRoute={(route) => {
                    return <TuiScreen route={route} />;
                  }}
                />
              </BlogListViewContext.Provider>
            </WorkspaceRendererContext.Provider>
          </FieldFocusProvider>
        </FormEditorRendererContext.Provider>
      </FieldPrimitivesContext.Provider>
    </QueryClientProvider>
  );
};

const FormScreen = ({
  route,
}: {
  route: Extract<TuiRoute, { page: "entity-create" | "entity-edit" }>;
}) => {
  const [activeTab, setActiveTab] = useState("entity");
  const props = { activeTab, onActiveTabChange: setActiveTab };
  if (route.page === "entity-create") {
    if (route.entity === "tasks") {
      return <TaskCreatePage {...props} />;
    }
    if (route.entity === "processes") {
      return <ProcessCreatePage {...props} />;
    }
    return <ThreadCreatePage {...props} />;
  }
  if (route.entity === "tasks") {
    return <TaskEditPage id={route.id} {...props} />;
  }
  if (route.entity === "processes") {
    return <ProcessEditPage id={route.id} {...props} />;
  }
  return <ThreadEditPage id={route.id} {...props} />;
};

const TuiScreen = ({ route }: { route: TuiRoute }) => {
  const pathname = useTuiPathname();
  const navigate = useTuiNavigate();
  const [selected, setSelected] = useState(0);
  const [filter, setFilter] = useState("");
  const [lastKey, setLastKey] = useState("");
  const { exit } = useApp();
  const matches = useMemo(() => {
    return pages.filter((item) => {
      return `${item.title} ${item.path}`.toLowerCase().includes(filter.toLowerCase());
    });
  }, [filter]);
  const navigateTo = (path: string) => {
    const article = articles.find((item) => {
      return item.href === path;
    });
    if (article) {
      openTuiArticle(article);
    }
    void navigate({ to: path as "/" });
  };
  useInput((input, key) => {
    if (key.ctrl && input === "o") {
      tuiRouter.history.back();
      return;
    }
    if (key.ctrl && input === "i") {
      tuiRouter.history.forward();
      return;
    }
    if (route.page !== "home") {
      if (key.escape) {
        navigateTo("/");
      }
      return;
    }
    if (key.upArrow || input === "k") {
      setSelected((index) => {
        return Math.max(0, index - 1);
      });
    } else if (key.downArrow || input === "j") {
      setSelected((index) => {
        return Math.min(matches.length - 1, index + 1);
      });
    } else if (input === "G") {
      setSelected(Math.max(0, matches.length - 1));
    } else if (input === "g" && lastKey === "g") {
      setSelected(0);
      setLastKey("");
    } else if (input === "g") {
      setLastKey("g");
    } else if (key.backspace || key.delete) {
      setFilter((value) => {
        return value.slice(0, -1);
      });
    } else if (key.return && matches[selected]) {
      navigateTo(matches[selected].path);
    } else if (input === "q") {
      exit();
    } else if (input && !key.ctrl && !key.meta) {
      setFilter((value) => {
        return value + input;
      });
      setSelected(0);
    }
  });
  const current = matches[selected];
  return (
    <TuiWorkspaceNavigation onNavigate={navigateTo}>
      <SiteLayout pathname={pathname} maxWidth={route.page === "article" ? 88 : undefined}>
        {route.page === "home" ? (
          <>
            <Text dimColor>↑/↓ or j/k navigate · type to filter · Enter open · q quit</Text>
            <Text>
              Route filter: <Text color="yellow">{filter || "(all routes)"}</Text>
            </Text>
            <Box marginTop={1}>
              <Box flexDirection="column" width="50%">
                {matches.map((item, index) => {
                  return (
                    <Text key={item.path} color={index === selected ? "green" : undefined}>
                      {index === selected ? "› " : "  "}
                      {item.title}
                    </Text>
                  );
                })}
              </Box>
              {current && (
                <Box flexDirection="column" paddingLeft={2}>
                  <Text bold>{current.title}</Text>
                  <Text color="cyan">{current.path}</Text>
                  <Text>{current.description}</Text>
                </Box>
              )}
            </Box>
          </>
        ) : route.page === "blog" ? (
          <BlogList articles={articles} />
        ) : route.page === "entity-list" ? (
          route.entity === "tasks" ? (
            <TaskList />
          ) : route.entity === "processes" ? (
            <ProcessList />
          ) : (
            <ThreadList />
          )
        ) : route.page === "entity-detail" ? (
          route.entity === "tasks" ? (
            <TaskDetail id={route.id} />
          ) : route.entity === "processes" ? (
            <ProcessDetail id={route.id} />
          ) : (
            <ThreadDetail id={route.id} />
          )
        ) : route.page === "entity-create" || route.page === "entity-edit" ? (
          <FormScreen route={route} />
        ) : route.page === "article" ? (
          <Text dimColor>Article opened in less. Ctrl+O returns to the previous route.</Text>
        ) : (
          <Text dimColor>
            This route is registered. Its feature screen is not implemented in the TUI yet.
          </Text>
        )}
      </SiteLayout>
    </TuiWorkspaceNavigation>
  );
};

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  render(<App />);
}
