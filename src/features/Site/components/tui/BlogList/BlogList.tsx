import { Box, Text } from "ink";
import { useTuiWorkspaceNavigation } from "@features/Workspace/components/tui/Primitives/Navigation";
import { EntityTable } from "@features/EntityTable/components/tui/EntityTable";
import type { BlogListView } from "../../BlogList";
export const TuiBlogList: BlogListView = ({ articles }) => {
  const navigate = useTuiWorkspaceNavigation();
  const data = articles.map((article) => {
    return {
      id: article.id,
      name: article.title,
      status: "Article",
      summary: article.description,
      href: article.href,
      publishedAt: article.publishedAt,
    };
  });
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold>BLOG ARTICLES</Text>
      <EntityTable
        variant="articles"
        data={data}
        onSelect={(article) => {
          return navigate(article.href);
        }}
      />
    </Box>
  );
};
