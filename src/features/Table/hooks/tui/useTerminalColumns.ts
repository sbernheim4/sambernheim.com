import { useEffect, useState } from "react";
import { useStdout } from "ink";

export const useTerminalColumns = () => {
  const { stdout } = useStdout();
  const [columns, setColumns] = useState(stdout.columns ?? 100);

  useEffect(() => {
    const updateColumns = () => {
      setColumns(stdout.columns ?? 100);
    };

    stdout.on("resize", updateColumns);
    updateColumns();
    return () => {
      stdout.off("resize", updateColumns);
    };
  }, [stdout]);

  return columns;
};
