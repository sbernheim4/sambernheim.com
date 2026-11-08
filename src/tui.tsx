import { ArticleViewer } from "./features/Site/components/tui/Article/ArticleViewer";
import { useState } from "react";
import { Box, Text, render, useInput } from "ink";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
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
import { loadTuiArticles } from "./features/Site/components/tui/articles";
import { Home } from "./features/Site/components/tui/Home";
import { FormDemoHome } from "./features/Workspace/components/tui/FormDemoHome";
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

const articles = loadTuiArticles();
const queryClient = new QueryClient();

export const App = () => {
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
                        return <TuiScreen key={JSON.stringify(route)} route={route} />;
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

const TuiScreen = ({ route }: { route: TuiRoute }) => {
  const pathname = useTuiPathname();
  const navigate = useTuiNavigate();
  const [lastKey, setLastKey] = useState("");
  const [inputMode, setInputMode] = useState<TuiInputMode>("normal");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const navigateTo = (path: string) => {
    void navigate({ to: path as "/" });
  };
  useInput((input, key) => {
    if (paletteOpen) {
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
      if (inputMode === "insert" && (route.page === "home" || route.page === "form-demo")) {
        setInputMode("normal");
      } else {
        tuiRouter.history.back();
      }
    }
  });
  return (
    <TuiInputModeProvider mode={inputMode} setMode={setInputMode} paletteOpen={paletteOpen}>
      <TuiWorkspaceNavigation onNavigate={navigateTo}>
        <TuiNavigationCommands route={route} />
        <SiteLayout pathname={pathname} maxWidth={route.page === "article" ? 88 : undefined}>
          <Box flexDirection="column" display={paletteOpen ? "none" : "flex"}>
            {route.page === "home" ? (
              <Home />
            ) : route.page === "form-demo" ? (
              <FormDemoHome />
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
        </SiteLayout>
      </TuiWorkspaceNavigation>
    </TuiInputModeProvider>
  );
};

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  render(<App />);
}
