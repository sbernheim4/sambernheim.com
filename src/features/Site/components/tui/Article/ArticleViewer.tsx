import { useCallback, useRef, useState } from "react";
import { Box, Text, measureElement, useStdout, type DOMElement } from "ink";
import { useTuiInput } from "@features/Workspace/components/tui/Primitives/InputMode";
import { tuiRouter } from "../../../tuiRouter";
import type { TuiArticle } from "../articles";
import { ArticleMarkdown } from "./Markdown";
import { ArticleFocusProvider, type ArticleControl } from "./ArticleFocus";

const relativeTop = (node: DOMElement | null, ancestor: DOMElement | null) => {
  let top = 0;
  while (node && node !== ancestor) {
    top += node.yogaNode?.getComputedTop() ?? 0;
    node = node.parentNode ?? null;
  }
  return top;
};

export const ArticleViewer = ({ article }: { article?: TuiArticle }) => {
  const { stdout } = useStdout();
  const content = useRef<DOMElement>(null);
  const controls = useRef<ArticleControl[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [lastKey, setLastKey] = useState("");
  const width = Math.max(1, Math.min(88, (stdout.columns ?? 100) - 4));
  const headerLines = Math.ceil(94 / width);
  const height = Math.max(1, (stdout.rows ?? 24) - 9 - headerLines);
  const register = useCallback((control: ArticleControl) => {
    controls.current.push(control);
    return () => {
      controls.current = controls.current.filter((item) => {
        return item.id !== control.id;
      });
    };
  }, []);
  const scroll = (next: number) => {
    const total = content.current ? measureElement(content.current).height : height;
    setOffset(Math.max(0, Math.min(next, total - height)));
  };
  useTuiInput((input, key) => {
    if (key.ctrl || (key.meta && !key.escape)) {
      return;
    }
    const ordered = [...controls.current].sort((a, b) => {
      return (
        relativeTop(a.ref.current, content.current) - relativeTop(b.ref.current, content.current)
      );
    });
    const active = ordered.findIndex((control) => {
      return control.id === focusedId;
    });
    if (key.tab && ordered.length) {
      const index =
        active < 0
          ? key.shift
            ? ordered.length - 1
            : 0
          : (active + (key.shift ? -1 : 1) + ordered.length) % ordered.length;
      const control = ordered[index];
      setFocusedId(control.id);
      const top = relativeTop(control.ref.current, content.current);
      const size = control.ref.current ? measureElement(control.ref.current).height : 1;
      if (top < offset || top + size > offset + height) {
        scroll(top - Math.floor(height / 2));
      }
    } else if (key.return && active >= 0) {
      ordered[active].activate();
    } else if (key.escape) {
      if (focusedId) {
        setFocusedId(null);
      } else {
        tuiRouter.history.back();
      }
    } else if (input === "j" || key.downArrow) {
      setFocusedId(null);
      scroll(offset + 1);
    } else if (input === "k" || key.upArrow) {
      setFocusedId(null);
      scroll(offset - 1);
    } else if (key.pageDown || input === " ") {
      scroll(offset + height);
    } else if (key.pageUp) {
      scroll(offset - height);
    } else if (input === "G") {
      scroll(Number.MAX_SAFE_INTEGER);
    } else if (input === "g" && lastKey === "g") {
      scroll(0);
    } else if (input === "z" && lastKey === "z" && active >= 0) {
      scroll(relativeTop(ordered[active].ref.current, content.current) - Math.floor(height / 2));
    }
    setLastKey(lastKey === input ? "" : input);
  });
  if (!article) {
    return <Text>Article not found. Escape returns to the previous page.</Text>;
  }
  return (
    <ArticleFocusProvider value={{ focusedId, register }}>
      <Box flexDirection="column" width="100%">
        <Box height={height} flexShrink={0} overflow="hidden" flexDirection="column">
          <Box ref={content} flexDirection="column" flexShrink={0} marginTop={-offset}>
            <Box marginBottom={1}>
              <Text bold color="cyan">
                {article.title}
              </Text>
            </Box>
            <ArticleMarkdown source={article.content} />
          </Box>
        </Box>
        <Text dimColor wrap="truncate">
          j/k scroll · gg/G top/end · Tab focus · Enter activate · Esc{" "}
          {focusedId ? "unfocus" : "back"} · zz center
        </Text>
      </Box>
    </ArticleFocusProvider>
  );
};
