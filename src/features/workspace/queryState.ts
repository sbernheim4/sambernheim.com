export const composeQueryState = (
  queries: Array<{
    data: unknown;
    isPending: boolean;
    isError: boolean;
    isFetching: boolean;
    errorUpdatedAt: number;
    refetch: () => unknown;
  }>,
) => {
  return {
    hasData: queries.every((q) => {
      return q.data !== undefined;
    }),
    isFetching: queries.some((q) => {
      return q.isFetching;
    }),
    errorUpdatedAt: Math.max(
      ...queries.map((q) => {
        return q.isError ? q.errorUpdatedAt : 0;
      }),
    ),
    isPending: queries.some((q) => {
      return q.isPending;
    }),
    isError: queries.some((q) => {
      return q.isError;
    }),
    refetch: () => {
      return Promise.allSettled(
        queries.map((q) => {
          return q.refetch();
        }),
      );
    },
  };
};

export type WorkspaceQueryState = ReturnType<typeof composeQueryState>;
