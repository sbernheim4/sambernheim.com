import { Box, Text } from "ink";
import { EntityTable } from "@features/EntityTable/components/tui/EntityTable";
import type { EntityTableRecord } from "@features/EntityTable/model";

export function BlogList({
  articles,
  onNavigate,
}: {
  articles: EntityTableRecord[];
  onNavigate: (path: string) => void;
}) {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold>BLOG ARTICLES</Text>
      <EntityTable
        data={articles}
        onSelect={(article) => {
          return onNavigate(article.href);
        }}
      />
    </Box>
  );
}
