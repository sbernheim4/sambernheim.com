// Updates must be idempotent: later replica reads can require replaying them.
export function createCacheReconciliation() {
  const updates: Array<() => void> = []

  return async (refetch: () => Promise<void>, update: () => void) => {
    updates.push(update)
    try {
      await refetch()
    } finally {
      for (const apply of updates) apply()
    }
  }
}
