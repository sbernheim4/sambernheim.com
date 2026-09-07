export const option = <T extends string>(
  value: string,
  options: readonly {
    value: T;
  }[],
): T => {
  const match = options.find((item) => {
    return item.value === value;
  });
  if (!match) {
    throw new Error("Choose a valid option.");
  }
  return match.value;
};
