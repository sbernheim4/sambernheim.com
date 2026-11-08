import { evaluateSync } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import type { MDXComponents } from "mdx/types";

type Node = {
  type: string;
  name?: string | null;
  value?: string;
  children?: Node[];
};

// Module declarations are mdxjsEsm nodes; fenced code is a separate node type.
export const compileMarkdown = (source: string, components: MDXComponents) => {
  const mappedComponents = { ...components };
  const prepare = () => {
    return (tree: Node) => {
      const visit = (node: Node) => {
        // Soft source wraps are prose whitespace, not terminal line breaks.
        // Code values and explicit break nodes retain their original semantics.
        if (node.type === "text" && node.value) {
          node.value = node.value.replace(/\r\n|\r|\n/g, " ");
        }
        if (node.children) {
          node.children = node.children.filter((child) => {
            return child.type !== "mdxjsEsm";
          });
          node.children.forEach(visit);
        }
        if ((node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") && node.name) {
          const name = node.name;
          let component: unknown = components;
          for (const part of name.split(".")) {
            component =
              component && Object.prototype.hasOwnProperty.call(component, part)
                ? (component as Record<string, unknown>)[part]
                : undefined;
          }
          if (!component) {
            throw new Error(`Unsupported MDX component: <${name}>`);
          }
          // Explicit lowercase JSX otherwise bypasses MDX's component mapping.
          if (/^[a-z]/.test(name)) {
            const alias = `InkMarkdown_${name.replaceAll("-", "_")}`;
            mappedComponents[alias] = component as MDXComponents[string];
            node.name = alias;
          }
        }
      };
      visit(tree);
    };
  };
  const Content = evaluateSync(source, {
    ...runtime,
    development: false,
    remarkPlugins: [[remarkFrontmatter, ["yaml", "toml"]], remarkGfm, prepare],
    rehypePlugins: [
      () => {
        return (tree: Node) => {
          tree.children = tree.children?.filter((node) => {
            return node.type !== "text" || Boolean(node.value?.trim());
          });
        };
      },
    ],
  }).default;
  return () => {
    return Content({ components: mappedComponents });
  };
};
