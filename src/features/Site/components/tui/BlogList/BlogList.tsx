import { Box, Text } from "ink";
import { useTuiWorkspaceNavigation } from "@features/Workspace/components/tui/Primitives/Navigation";
import { Table } from "@features/Table/components/tui/Table";
import { useTableModel } from "@features/Table/model";
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
  const model = useTableModel(data, { variant: "articles" });
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold>BLOG ARTICLES</Text>
      <Table
        model={model}
        onSelect={(article) => {
          return navigate(article.href);
        }}
      />
    </Box>
  );
};
