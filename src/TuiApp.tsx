import { ArticleViewer } from "./features/Site/components/tui/Article/ArticleViewer";
import { useState } from "react";
import { Box, Text, useInput } from "ink";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CycleableDateTimeProvider } from "./features/Dates/hooks/useCycleableDateTimeMode";
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
import { CommandPaletteProvider } from "./features/Commands/commands";
import { TuiCommandPalette } from "./features/Commands/components/tui/CommandPalette";
import { TuiNavigationCommands } from "./features/Commands/components/tui/NavigationCommands";
import type { TuiArticle } from "./features/Site/components/tui/articleData";
import { Home } from "./features/Site/components/tui/Home";
import { WorkspaceHome } from "./features/Workspace/components/tui/FormDemoHome";
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
import {
  TuiInputModeProvider,
  type TuiInputMode,
} from "./features/Workspace/components/tui/Primitives/InputMode";

export const TuiApp = ({ articles }: { articles: TuiArticle[] }) => {
  const [queryClient] = useState(() => {
    return new QueryClient();
  });
  return (
    <QueryClientProvider client={queryClient}>
      <FieldPrimitivesContext.Provider value={tuiFieldPrimitives}>
        <CycleableDateTimeProvider>
          <FormEditorRendererContext.Provider value={tuiFormEditorRenderer}>
            <CommandPaletteProvider>
              <FieldFocusProvider>
                <WorkspaceRendererContext.Provider value={tuiWorkspaceRenderer}>
                  <BlogListViewContext.Provider value={TuiBlogList}>
                    <TuiRouterProvider
                      renderRoute={(route) => {
                        return (
                          <TuiScreen
                            key={JSON.stringify(route)}
                            route={route}
                            articles={articles}
                          />
                        );
                      }}
                    />
                  </BlogListViewContext.Provider>
                </WorkspaceRendererContext.Provider>
              </FieldFocusProvider>
            </CommandPaletteProvider>
          </FormEditorRendererContext.Provider>
        </CycleableDateTimeProvider>
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

const TuiScreen = ({ route, articles }: { route: TuiRoute; articles: TuiArticle[] }) => {
  const pathname = useTuiPathname();
  const navigate = useTuiNavigate();
  const [lastKey, setLastKey] = useState("");
  const [inputMode, setInputMode] = useState<TuiInputMode>("normal");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const navigateTo = (path: string) => {
    void navigate({ to: path as "/" });
  };
  useInput((input, key) => {
    if (helpOpen) {
      if (key.escape || input === "?") {
        setHelpOpen(false);
      }
      return;
    }
    if (paletteOpen) {
      return;
    }
    if (input === "?" && inputMode === "normal") {
      setHelpOpen(true);
      setLastKey("");
      return;
    }
    const isForm = route.page === "entity-create" || route.page === "entity-edit";
    if (
      (key.ctrl && input === "k") ||
      (!isForm && inputMode === "normal" && input === "f" && lastKey === "f")
    ) {
      setPaletteOpen(true);
      setInputMode("insert");
      setLastKey("");
      return;
    }
    if (!isForm && inputMode === "normal" && input === "f") {
      setLastKey("f");
      return;
    }
    if (lastKey === "f") {
      setLastKey("");
    }
    if (key.ctrl && input === "o") {
      tuiRouter.history.back();
      return;
    }
    if (key.ctrl && input === "i") {
      tuiRouter.history.forward();
      return;
    }
    if (key.escape) {
      if (route.page === "blog" || route.page === "entity-list" || route.page === "article") {
        return;
      }
      if (inputMode === "insert" && (route.page === "home" || route.page === "workspace")) {
        setInputMode("normal");
      } else {
        tuiRouter.history.back();
      }
    }
  });
  return (
    <TuiInputModeProvider
      mode={inputMode}
      setMode={setInputMode}
      paletteOpen={paletteOpen}
      helpOpen={helpOpen}
    >
      <TuiWorkspaceNavigation onNavigate={navigateTo}>
        <TuiNavigationCommands route={route} />
        <SiteLayout pathname={pathname} maxWidth={route.page === "article" ? 88 : undefined}>
          <Box flexDirection="column" display={paletteOpen ? "none" : "flex"}>
            {route.page === "home" ? (
              <Home />
            ) : route.page === "workspace" ? (
              <WorkspaceHome />
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
              <ArticleViewer
                article={articles.find((article) => {
                  return article.href === `/blog/${route.slug}`;
                })}
              />
            ) : (
              <Text dimColor>
                This route is registered. Its feature screen is not implemented in the TUI yet.
              </Text>
            )}
          </Box>
          {paletteOpen && (
            <TuiCommandPalette
              onClose={() => {
                setPaletteOpen(false);
                setInputMode("normal");
              }}
            />
          )}
          {helpOpen && (
            <Box
              position="absolute"
              flexDirection="column"
              alignSelf="center"
              borderStyle="round"
              borderColor="cyan"
              backgroundColor="black"
              width={58}
              paddingX={3}
              paddingY={2}
              rowGap={1}
              marginTop={2}
            >
              <Text bold color="cyan">
                Keyboard shortcuts
              </Text>
              <Text>j / k Move or scroll</Text>
              <Text>gg / G First / last item</Text>
              <Text>zz Center selection</Text>
              <Text>i or / Search in a list</Text>
              <Text>Enter Open or activate</Text>
              <Text>Tab Focus next control</Text>
              <Text>Esc Back or clear focus</Text>
              <Text>Ctrl+O / Ctrl+I Back / forward</Text>
              <Text>ff Open command palette</Text>
              <Text>? Close this help</Text>
            </Box>
          )}
        </SiteLayout>
      </TuiWorkspaceNavigation>
    </TuiInputModeProvider>
  );
};
