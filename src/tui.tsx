import React, { useMemo, useState } from "react";
import { Box, Text, render, useInput } from "ink";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

type Page = { title: string; path: string; description: string };
const articlesDir = resolve(process.cwd(), "src/articles");
const articles: Page[] = readdirSync(articlesDir).filter(file => file.endsWith(".mdx")).map(file => {
  const source = readFileSync(resolve(articlesDir, file), "utf8");
  const title = source.match(/^title:\s*["']?(.*?)["']?\s*$/m)?.[1] ?? file.replace(/\.mdx$/, "").replaceAll("-", " ");
  return { title, path: `/blog/${file.replace(/\.mdx$/, "")}`, description: "Article" };
});
const pages: Page[] = [
  { title: "Home", path: "/", description: "Personal site and about" },
  { title: "Blog", path: "/blog", description: "All articles" },
  ...articles,
  { title: "Python editor", path: "/editor", description: "Interactive Python editor demo" },
  { title: "Party math trick", path: "/the-party-math-trick-demo", description: "Interactive math demo" },
  ...["tasks", "processes", "threads"].map(entity => ({ title: `${entity[0].toUpperCase()}${entity.slice(1)}`, path: `/form-demo/${entity}`, description: "Workspace records" })),
];

function App() {
  const [selected, setSelected] = useState(0);
  const [search, setSearch] = useState("");
  const matches = useMemo(() => pages.filter(page => `${page.title} ${page.path}`.toLowerCase().includes(search.toLowerCase())), [search]);
  useInput((input, key) => {
    if (key.upArrow) setSelected(index => Math.max(0, index - 1));
    else if (key.downArrow) setSelected(index => Math.min(matches.length - 1, index + 1));
    else if (key.backspace || key.delete) setSearch(value => value.slice(0, -1));
    else if (key.return) setSearch("");
    else if (input === "q" || key.escape) process.exit(0);
    else if (input && !key.ctrl && !key.meta) { setSearch(value => value + input); setSelected(0); }
  });
  const current = matches[selected];
  return <Box flexDirection="column" padding={1}>
    <Text bold color="cyan">Samuel Bernheim · Site TUI</Text>
    <Text dimColor>↑/↓ navigate · type to filter · Enter select · Esc/q quit</Text>
    <Text> </Text>
    <Text>Route filter: <Text color="yellow">{search || "(all routes)"}</Text></Text>
    <Box marginTop={1}>
      <Box flexDirection="column" width="50%">
        {matches.map((page, index) => <Text key={page.path} color={index === selected ? "green" : undefined}>
          {index === selected ? "› " : "  "}{page.title}
        </Text>)}
      </Box>
      {current && <Box flexDirection="column" paddingLeft={2}>
        <Text bold>{current.title}</Text><Text color="cyan">{current.path}</Text><Text>{current.description}</Text>
        <Text dimColor>Use this route in the web app to open its full interactive view.</Text>
      </Box>}
    </Box>
  </Box>;
}

render(<App />);
