import { InkTerminalBox } from "ink-web";
import type { ITerminalOptions } from "@xterm/xterm";
import { useTheme } from "@/features/Theme/ThemeProvider";
import { TuiApp } from "@/TuiApp";
import { newestArticlesFirst, publishedArticleFiles } from "@/features/Site/articleCatalog";
import { parseTuiArticle } from "@/features/Site/components/tui/articleData";
import "ink-web/css";
import "@xterm/xterm/css/xterm.css";

const sources = import.meta.glob<string>("../../../articles/*.mdx", {
  query: "?raw",
  import: "default",
  eager: true,
});
const articles = newestArticlesFirst(
  publishedArticleFiles.map((file) => {
    return parseTuiArticle(sources[`../../../articles/${file}.mdx`]);
  }),
);

export default function BrowserTerminal() {
  const { theme } = useTheme();
  const terminalTheme =
    theme === "light"
      ? {
          background: "#fffdf8",
          foreground: "#1e2427",
          cursor: "#216b5e",
          black: "#fffdf8",
          red: "#a13c3c",
          green: "#216b5e",
          yellow: "#805000",
          blue: "#245c98",
          magenta: "#82468a",
          cyan: "#216b5e",
          white: "#1e2427",
          brightBlack: "#53615d",
          brightRed: "#a13c3c",
          brightGreen: "#216b5e",
          brightYellow: "#805000",
          brightBlue: "#245c98",
          brightMagenta: "#82468a",
          brightCyan: "#216b5e",
          brightWhite: "#1e2427",
          selectionBackground: "#ccd5d0",
        }
      : {
          background: "#151a20",
          foreground: "#e6e8eb",
          cursor: "#8fc7ed",
          black: "#151a20",
          red: "#f19a9a",
          green: "#a7e0c6",
          yellow: "#e4c27d",
          blue: "#8fc7ed",
          magenta: "#d8a9e3",
          cyan: "#8fc7ed",
          white: "#e6e8eb",
          brightBlack: "#9da8b5",
          brightRed: "#f19a9a",
          brightGreen: "#a7e0c6",
          brightYellow: "#e4c27d",
          brightBlue: "#8fc7ed",
          brightMagenta: "#d8a9e3",
          brightCyan: "#8fc7ed",
          brightWhite: "#e6e8eb",
          selectionBackground: "#354842",
        };
  return (
    <InkTerminalBox
      rows={34}
      focus={false}
      termOptions={
        {
          // Start wider than the viewport: ink-web measures columns before xterm's
          // FitAddon applies the actual font metrics. The first fit then narrows
          // the terminal and makes Ink render at the measured width immediately.
          cols: 240,
          fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
          fontSize: 13,
          lineHeight: 1.2,
          cursorBlink: true,
          screenReaderMode: true,
          minimumContrastRatio: 4.5,
          theme: terminalTheme,
        } as ITerminalOptions
      }
      loading={
        <p className="terminal-loading" role="status">
          Starting the site TUI…
        </p>
      }
    >
      <TuiApp articles={articles} />
    </InkTerminalBox>
  );
}
