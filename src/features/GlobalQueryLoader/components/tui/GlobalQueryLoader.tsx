import { Box, Text } from "ink";
import { useGlobalQueryLoaderModel } from "../../model";

export const GlobalQueryLoader = () => {
  const { visible } = useGlobalQueryLoaderModel();
  if (!visible) {
    return null;
  }
  return (
    <Box marginTop={1}>
      <Text color="yellow">◌ Fetching data…</Text>
    </Box>
  );
};
