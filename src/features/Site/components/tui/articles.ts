import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import wrapAnsi from "wrap-ansi";

export type TuiArticle = {
  id: string;
  title: string;
  description: string;
  href: string;
  content: string;
};

function extractText(source: string) {
  const body = source.replace(/^---[\s\S]*?---\s*/m, "");
  let inCode = false;
  return body
    .split(/\r?\n/)
    .flatMap((line) => {
      if (/^\s*```/.test(line)) {
        inCode = !inCode;
        return [line];
      }
      if (inCode) {
        return [line];
      }
      if (/^\s*(import|export)\s/.test(line)) {
        return [];
      }
      return [
        line
          .replace(/<\/?[A-Za-z][A-Za-z0-9.-]*(?:\s[^<>]*?)?\s*\/?>/g, "")
          .replace(/\{[^{}]*\}/g, ""),
      ];
    })
    .join("\n")
    .trim();
}

export function loadTuiArticles(): TuiArticle[] {
  const directory = resolve(process.cwd(), "src/articles");
  return readdirSync(directory)
    .filter((file) => {
      return file.endsWith(".mdx");
    })
    .map((file) => {
      const source = readFileSync(resolve(directory, file), "utf8");
      const title =
        source.match(/^title:\s*["']?(.*?)['"]?\s*$/m)?.[1] ??
        file.replace(/\.mdx$/, "").replaceAll("-", " ");
      const description = source.match(/^description:\s*["']?(.*?)\s*["']?$/m)?.[1] ?? "Article";
      return {
        id: file,
        title,
        description,
        href: `/blog/${file.replace(/\.mdx$/, "")}`,
        content: extractText(source),
      };
    });
}

const ansi = {
  reset: "\u001b[0m",
  bold: "\u001b[1m",
  italic: "\u001b[3m",
  cyan: "\u001b[36m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  blue: "\u001b[34m",
  gray: "\u001b[90m",
  magenta: "\u001b[35m",
};
function inline(text: string) {
  return text
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      `${ansi.blue}$1${ansi.reset} ${ansi.gray}($2)${ansi.reset}`,
    )
    .replace(/`([^`]+)`/g, `${ansi.yellow}$1${ansi.reset}`)
    .replace(/\*\*([^*]+)\*\*/g, `${ansi.bold}$1${ansi.reset}`)
    .replace(/(^|[^*])\*([^*]+)\*/g, `$1${ansi.italic}$2${ansi.reset}`)
    .replace(/~~([^~]+)~~/g, `${ansi.gray}$1${ansi.reset}`);
}
function formatMarkdown(markdown: string, title: string, columns: number) {
  const width = Math.min(88, Math.max(40, Math.floor(columns * 0.68)));
  const left = " ".repeat(Math.max(0, Math.floor((columns - width) / 2)));
  const lines = [
    `${ansi.bold}${ansi.cyan}${title}${ansi.reset}`,
    `${ansi.gray}${"─".repeat(title.length)}${ansi.reset}`,
    "",
  ];
  let code = false;
  for (const line of markdown.split(/\r?\n/)) {
    const fence = line.match(/^\s*```(\w*)/);
    if (fence) {
      code = !code;
      lines.push(
        code
          ? `${ansi.gray}┌─ ${fence[1] || "code"} ${"─".repeat(24)}${ansi.reset}`
          : `${ansi.gray}└${"─".repeat(32)}${ansi.reset}`,
        ...(code ? [] : [""]),
      );
      continue;
    }
    if (code) {
      lines.push(`${ansi.gray}│${ansi.reset} ${ansi.green}${line}${ansi.reset}`);
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      lines.push(
        "",
        `${ansi.bold}${heading[1].length < 3 ? ansi.cyan : ansi.magenta}${heading[2]}${ansi.reset}`,
      );
      continue;
    }
    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      lines.push(`${ansi.gray}│${ansi.reset} ${ansi.blue}${inline(quote[1])}${ansi.reset}`);
      continue;
    }
    const item = line.match(/^(\s*)([-+*]|\d+\.)\s+(.*)$/);
    lines.push(
      item ? `${item[1]}${ansi.cyan}${item[2]}${ansi.reset} ${inline(item[3])}` : inline(line),
    );
  }
  const visible = (line: string) => {
    return line.replace(/\u001b\[[0-9;]*m/g, "").length;
  };
  return (
    lines
      .flatMap((line) => {
        return wrapAnsi(line, width, { hard: true, trim: false })
          .split("\n")
          .map((part) => `${left}${part}${" ".repeat(Math.max(0, width - visible(part)))}`);
      })
      .join("\n") + "\n"
  );
}

export function openTuiArticle(article: TuiArticle) {
  if (!process.stdin.isTTY) {
    return;
  }
  const folder = mkdtempSync(resolve(tmpdir(), "site-tui-article-"));
  const file = resolve(folder, "article.txt");
  try {
    writeFileSync(
      file,
      formatMarkdown(article.content, article.title, process.stdout.columns ?? 100),
    );
    process.stdout.write("\u001b[2J\u001b[H");
    if (process.stdin.isRaw && process.stdin.setRawMode) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();
    spawnSync("less", ["-R", file], { stdio: "inherit" });
  } finally {
    if (process.stdin.isTTY && process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    rmSync(folder, { recursive: true, force: true });
    process.stdout.write("\u001b[2J\u001b[H");
  }
}
