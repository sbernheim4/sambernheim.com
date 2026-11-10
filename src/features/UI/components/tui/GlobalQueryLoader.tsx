import { useIsFetching } from "@tanstack/react-query";
import { Box, Text } from "ink";

export const TuiGlobalQueryLoader = () => {
  const isFetching = useIsFetching() > 0;
  if (!isFetching) {
    return null;
  }
  return (
    <Box marginTop={1}>
      <Text color="yellow">◌ Fetching data…</Text>
    </Box>
  );
};
