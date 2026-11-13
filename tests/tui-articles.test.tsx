// @vitest-environment node
import { PassThrough } from "node:stream";
import { setTimeout as delay } from "node:timers/promises";
import { afterEach, describe, expect, it } from "vitest";
import { render } from "ink";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ArticleViewer } from "../src/features/Site/components/tui/Article/ArticleViewer";
import { compileArticleMarkdown } from "../src/features/Site/components/tui/Article/Markdown";
import { loadTuiArticles } from "../src/features/Site/components/tui/articles";
import { publishedArticleFiles } from "../src/features/Site/articleCatalog";
import { CycleableDateTimeProvider } from "../src/features/Dates/hooks/useCycleableDateTimeMode";
import { CommandPaletteProvider } from "../src/features/CommandPalette/model";
import { TuiInputModeProvider } from "../src/features/Workspace/components/tui/Primitives/InputMode";

const cleanups: (() => void)[] = [];
afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => {
    cleanup();
  });
});
const mount = (source: string, rows = 30) => {
  const stdout = Object.assign(new PassThrough(), { columns: 100, rows });
  const stdin = Object.assign(new PassThrough(), {
    isTTY: true,
    setRawMode: () => {},
    ref: () => {},
    unref: () => {},
  });
  let output = "";
  stdout.on("data", (data) => {
    output = String(data);
  });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const app = render(
    <QueryClientProvider client={client}>
      <CommandPaletteProvider>
        <CycleableDateTimeProvider>
          <TuiInputModeProvider mode="normal" setMode={() => {}} paletteOpen={false}>
            <ArticleViewer
              article={{
                id: "test",
                title: "Article",
                description: "Test",
                publishedAt: "2026-01-01",
                href: "/blog/test",
                content: source,
              }}
            />
          </TuiInputModeProvider>
        </CycleableDateTimeProvider>
      </CommandPaletteProvider>
    </QueryClientProvider>,
    {
      stdout: stdout as unknown as NodeJS.WriteStream,
      stdin: stdin as unknown as NodeJS.ReadStream,
      debug: true,
      patchConsole: false,
    },
  );
  cleanups.push(() => {
    app.unmount();
    client.clear();
    stdin.destroy();
    stdout.destroy();
  });
  return {
    text: () => {
      return output.replace(new RegExp(String.fromCharCode(27) + "\\[[0-9;]*m", "g"), "");
    },
    key: async (value: string) => {
      stdin.write(value);
      await delay(100);
    },
  };
};

describe("TUI articles", () => {
  it("uses only published articles in newest-first order and canonical slugs", () => {
    const articles = loadTuiArticles();
    expect(articles).toHaveLength(publishedArticleFiles.length);
    expect(articles[0].id).toBe("higher-level-primitives");
    expect(
      articles.some((article) => {
        return article.id.includes("tools");
      }),
    ).toBe(false);
    expect(
      articles.find((article) => {
        return article.id === "rerender-with-router";
      })?.href,
    ).toBe("/blog/rerender-with-router");
    expect(
      articles.every((article, index) => {
        return index === 0 || articles[index - 1].publishedAt >= article.publishedAt;
      }),
    ).toBe(true);
    expect(
      articles.every((article) => {
        return article.description !== "Article";
      }),
    ).toBe(true);
  });
  it("compiles all published MDX, including real component expressions", () => {
    for (const article of loadTuiArticles()) {
      expect(() => {
        compileArticleMarkdown(article.content);
      }, article.id).not.toThrow();
    }
  });
  it("focuses a live date, cycles it with Enter, and releases focus with Escape", async () => {
    const view = mount('<CycleableDateTime value={new Date("2026-01-01T12:00:00Z")} />');
    await delay(150);
    expect(view.text()).toContain("[UTC]");
    await view.key("\t");
    expect(view.text()).toContain("Enter");
    await view.key("\r");
    expect(view.text()).toContain("[Relative]");
    await view.key("\u001b");
    expect(view.text()).toContain("Esc back");
    await view.key("\r");
    expect(view.text()).toContain("[Relative]");
  });
  it("scrolls to interactive controls in the real UX article", async () => {
    const article = loadTuiArticles().find((item) => {
      return item.id === "ux-design-patterns";
    });
    const view = mount(article!.content);
    await delay(150);
    await view.key("\t");
    expect(view.text()).toContain("[UTC]");
    await view.key("\r");
    expect(view.text()).toContain("[Relative]");
    await view.key("\t");
    await view.key("\t");
    await view.key("\t");
    expect(view.text()).toContain("Activate to fire a refetch");
    await view.key("\r");
    expect(view.text()).toContain("Loading...");
  });
  it("scrolls mounted article content to the end and back without corrupting code", async () => {
    const view = mount(
      "```ts\nexport const track = (value) => { return value + 3; };\n```\n\n" +
        Array.from({ length: 40 }, (_, i) => {
          return `Paragraph ${i}`;
        }).join("\n\n"),
    );
    await delay(150);
    expect(view.text()).toContain("return value + 3;");
    expect(view.text()).not.toContain("Paragraph 39");
    await view.key("G");
    expect(view.text()).toContain("Paragraph 39");
    await view.key("g");
    await view.key("g");
    expect(view.text()).toContain("return value + 3;");
    expect(view.text()).not.toContain("Paragraph 39");
  });
});
