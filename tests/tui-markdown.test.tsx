// @vitest-environment node
import { assert, test } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { createElement } from "react";
import { renderToString, Text } from "ink";
import { compileMarkdown } from "../src/features/Site/components/tui/Article/markdown/compile";
import { markdownComponents } from "../src/features/Site/components/tui/Article/markdown/primitives";
import { ArticleFocusProvider } from "../src/features/Site/components/tui/Article/ArticleFocus";
import { articleComponents } from "../src/features/Site/components/tui/Article/ArticleComponents";
import { internalLinkPath } from "../src/features/Site/components/tui/Article/markdown/links";
const focusValue = {
  focusedId: null,
  register: () => {
    return () => {};
  },
};

const renderMarkdown = (source: string) => {
  return renderToString(createElement(compileMarkdown(source, markdownComponents)), {
    columns: 80,
  });
};

test("strips module AST nodes and frontmatter, preserving fenced declarations", () => {
  const output = renderMarkdown(`---
title: Hidden metadata
---
import {
  Missing
} from './does-not-exist.js';

export const invisible = 'removed';

# Visible

\`\`\`ts
import { keep } from 'code';
export const answer = 42;
\`\`\`
`);
  assert.match(output, /Visible/);
  assert.match(output, /import \{ keep \}/);
  assert.match(output, /export const answer = 42/);
  assert.notMatch(output, /Hidden metadata|invisible|does-not-exist/);
});

test("renders markdown blocks and explicit HTML as valid Ink", () => {
  const output = renderMarkdown(`# Heading

A **bold** and *italic* [link](https://example.com) with ~~deleted~~ and \`code\`.

> Quoted

3. First
4. Second
   - Nested

- [x] Done
- [ ] Pending

| Name | Value |
| --- | --- |
| Example | 42 |

<div>Explicit <strong>HTML</strong><br />line</div>

![Alt text](image.png)

---
`);
  for (const value of [
    "Heading",
    "bold",
    "https://example.com",
    "Quoted",
    "3. First",
    "4. Second",
    "Nested",
    "[x]",
    "[ ]",
    "Example",
    "42",
    "Explicit HTML",
    "Alt text",
  ]) {
    assert.ok(output.includes(value), `Missing ${value} in ${output}`);
  }
});

test("resolves mapped live components with evaluated expression props", () => {
  const Content = compileMarkdown(
    `import { Live } from './missing';

<Live value={new Date('2025-01-18T00:00:00Z')} />`,
    {
      ...markdownComponents,
      Live: ({ value }: { value: Date }) => {
        return <Text>Live date: {value.toISOString()}</Text>;
      },
    },
  );
  assert.match(renderToString(<Content />), /Live date: 2025-01-18T00:00:00.000Z/);
});

test("reports unsupported custom components clearly", () => {
  assert.throws(() => {
    return compileMarkdown("<Unknown />", markdownComponents);
  }, /Unsupported MDX component: <Unknown>/);
});

test("compiles and renders every current article with stand-in live components", () => {
  const components = { ...markdownComponents };
  for (const name of [
    "CycleableDateTime",
    "GlobalQueryLoader",
    "FakeLoader",
    "FakeGlobalQueryLoader",
    "EntityDetailDensityExample",
  ]) {
    components[name] = () => {
      return <Text>{name}</Text>;
    };
  }
  const directory = new URL("../src/articles/", import.meta.url);
  for (const file of readdirSync(directory).filter((name) => {
    return name.endsWith(".mdx");
  })) {
    const source = readFileSync(new URL(file, directory), "utf8");
    const Content = compileMarkdown(source, components);
    compileMarkdown(source, { ...markdownComponents, ...articleComponents });
    assert.ok(
      renderToString(
        <ArticleFocusProvider value={focusValue}>
          <Content />
        </ArticleFocusProvider>,
        { columns: 100 },
      ).trim(),
      file,
    );
  }
});

test("normalizes internal article links", () => {
  assert.equal(internalLinkPath("/blog/example"), "/blog/example");
  assert.equal(internalLinkPath("sambernheim.com/blog/example"), "/blog/example");
  assert.equal(internalLinkPath("https://www.sambernheim.com/blog/example"), "/blog/example");
  assert.equal(internalLinkPath("https://example.com"), undefined);
  assert.equal(internalLinkPath("//example.com"), undefined);
});

test("inline links register a layout ref and activate workspace navigation", async () => {
  const { PassThrough } = await import("node:stream");
  const { setTimeout: delay } = await import("node:timers/promises");
  const { render } = await import("ink");
  const { TuiWorkspaceNavigation } =
    await import("../src/features/Workspace/components/tui/Primitives/Navigation");
  const controls: import("../src/features/Site/components/tui/Article/ArticleFocus").ArticleControl[] =
    [];
  let destination = "";
  const Content = compileMarkdown("Read [this article](/blog/example) next.", markdownComponents);
  const stdout = Object.assign(new PassThrough(), { columns: 80, rows: 24 });
  stdout.resume();
  const app = render(
    <TuiWorkspaceNavigation
      onNavigate={(path) => {
        destination = path;
      }}
    >
      <ArticleFocusProvider
        value={{
          focusedId: null,
          register: (control) => {
            controls.push(control);
            return () => {};
          },
        }}
      >
        <Content />
      </ArticleFocusProvider>
    </TuiWorkspaceNavigation>,
    { stdout: stdout as unknown as NodeJS.WriteStream, patchConsole: false, exitOnCtrlC: false },
  );
  try {
    await delay(30);
    assert.equal(controls.length, 1);
    assert.ok(controls[0].ref.current);
    controls[0].activate();
    assert.equal(destination, "/blog/example");
  } finally {
    app.unmount();
    stdout.destroy();
  }
});

test("soft source wraps become spaces while explicit breaks and code retain newlines", () => {
  for (const newline of ["\n", "\r\n", "\r"]) {
    const output = renderMarkdown(
      `Intro with my${newline}**favorite${newline}example** continuing.`,
    );
    assert.include(output, "Intro with my favorite example continuing.");
  }
  const breaks = renderMarkdown("First  \nSecond\\\nThird<br />Fourth");
  assert.match(breaks, /First\n+Second\n+Third\nFourth/);

  let code = "";
  const Code = ({ children }: { children?: import("react").ReactNode }) => {
    code = String(children);
    return <Text>{children}</Text>;
  };
  const Content = compileMarkdown("```text\nfirst line\nsecond line\n```", {
    ...markdownComponents,
    code: Code,
  });
  renderToString(<Content />);
  assert.equal(code, "first line\nsecond line\n");
});
