import React, { useMemo, useState } from "react";
import { Box, Text, render, useApp, useInput } from "ink";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SiteLayout } from "./features/Site/components/tui/SiteLayout/SiteLayout";
import { BlogList, BlogListViewContext } from "./features/Site/components/BlogList";
import { TuiBlogList } from "./features/Site/components/tui/BlogList/BlogList";
import { loadTuiArticles, openTuiArticle } from "./features/Site/components/tui/articles";
import type { TuiArticle } from "./features/Site/components/tui/articles";
import { ProcessList } from "./features/Processes/components/ProcessList";
import { TaskList } from "./features/Tasks/components/TaskList";
import { ThreadList } from "./features/Threads/components/ThreadList";
import { ProcessDetail } from "./features/Processes/components/ProcessDetail";
import { TaskDetail } from "./features/Tasks/components/TaskDetail";
import { ThreadDetail } from "./features/Threads/components/ThreadDetail";
import { WorkspaceRendererContext } from "./features/Workspace/components/renderer";
import {
  tuiWorkspaceRenderer,
  TuiWorkspaceNavigation,
} from "./features/Workspace/components/tui/renderer";

type Entity = "tasks" | "processes" | "threads";
type Page = {
  title: string;
  path: string;
  description: string;
  entity?: Entity;
  entityId?: string;
  blogIndex?: boolean;
  article?: TuiArticle;
};
const articles = loadTuiArticles();
const pages: Page[] = [
  { title: "Home", path: "/", description: "Personal site and about" },
  { title: "Blog", path: "/blog", description: "All articles", blogIndex: true },
  ...articles.map((article) => {
    return {
      title: article.title,
      path: article.href,
      description: article.description,
      article,
    };
  }),
  { title: "Python editor", path: "/editor", description: "Interactive Python editor demo" },
  {
    title: "Party math trick",
    path: "/the-party-math-trick-demo",
    description: "Interactive math demo",
  },
  ...(["tasks", "processes", "threads"] as const).map((entity) => {
    return {
      title: `${entity[0].toUpperCase()}${entity.slice(1)}`,
      path: `/form-demo/${entity}`,
      description: "Workspace records",
      entity,
    };
  }),
  ...(["tasks", "processes", "threads"] as const).flatMap((entity) => {
    return [
      {
        title: `Create ${entity}`,
        path: `/form-demo/${entity}/create`,
        description: `Create a ${entity.slice(0, -1)} record`,
      },
      {
        title: `Edit ${entity}`,
        path: `/form-demo/${entity}/:id/edit`,
        description: `Edit a ${entity.slice(0, -1)} record`,
      },
    ];
  }),
];

const resolvePage = (path: string): Page | undefined => {
  const exact = pages.find((page) => {
    return page.path === path;
  });
  if (exact) {
    return exact;
  }
  const match = path.match(/^\/form-demo\/(tasks|processes|threads)\/([^/]+)$/);
  if (!match) {
    return undefined;
  }
  const entity = match[1] as Entity;
  return {
    title: `${entity[0].toUpperCase()}${entity.slice(1)} · ${match[2]}`,
    path,
    description: "Record details",
    entity,
    entityId: match[2],
  };
};

const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TuiApp />
    </QueryClientProvider>
  );
};

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  render(<App />);
}

const TuiApp = () => {
  const [selected, setSelected] = useState(0);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState<Page | null>(null);
  const [history, setHistory] = useState<Page[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { exit } = useApp();
  const matches = useMemo(() => {
    return pages.filter((item) => {
      return `${item.title} ${item.path}`.toLowerCase().includes(filter.toLowerCase());
    });
  }, [filter]);
  const navigateTo = (path: string) => {
    const next = resolvePage(path);
    if (!next) {
      return;
    }
    if (next.article) {
      openTuiArticle(next.article);
    }
    setPage(next);
    setHistory((items) => {
      return [...items.slice(0, historyIndex + 1), next];
    });
    setHistoryIndex((index) => {
      return index + 1;
    });
  };
  useInput((input, key) => {
    if (page && key.ctrl && input === "o") {
      if (historyIndex > 0) {
        const index = historyIndex - 1;
        setHistoryIndex(index);
        setPage(history[index]);
      }
      return;
    }
    if (page && ((key.ctrl && input === "i") || key.tab)) {
      if (historyIndex < history.length - 1) {
        const index = historyIndex + 1;
        setHistoryIndex(index);
        setPage(history[index]);
      }
      return;
    }
    if (key.escape && page) {
      setPage(null);
      return;
    }
    if (page) {
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
      setSelected(matches.length - 1);
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
    <WorkspaceRendererContext.Provider value={tuiWorkspaceRenderer}>
      <TuiWorkspaceNavigation onNavigate={navigateTo}>
        <BlogListViewContext.Provider value={TuiBlogList}>
          <SiteLayout pathname={page?.path ?? "/"} maxWidth={page?.article ? 88 : undefined}>
            {page ? (
              <Box flexDirection="column">
                {!page.blogIndex && (
                  <>
                    <Text bold>{page.title}</Text>
                    <Text>{page.description}</Text>
                    <Text> </Text>
                  </>
                )}
                {page.blogIndex ? (
                  <BlogList articles={articles} />
                ) : page.entityId && page.entity === "processes" ? (
                  <ProcessDetail id={page.entityId} />
                ) : page.entityId && page.entity === "tasks" ? (
                  <TaskDetail id={page.entityId} />
                ) : page.entityId && page.entity === "threads" ? (
                  <ThreadDetail id={page.entityId} />
                ) : page.entity === "processes" ? (
                  <ProcessList />
                ) : page.entity === "tasks" ? (
                  <TaskList />
                ) : page.entity === "threads" ? (
                  <ThreadList />
                ) : page.article ? (
                  <Text dimColor>
                    Article opened in less. Ctrl+O returns to the previous route.
                  </Text>
                ) : (
                  <Text dimColor>
                    This route is registered. Its feature screen is not implemented in the TUI yet.
                  </Text>
                )}
              </Box>
            ) : (
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
            )}
          </SiteLayout>
        </BlogListViewContext.Provider>
      </TuiWorkspaceNavigation>
    </WorkspaceRendererContext.Provider>
  );
};
