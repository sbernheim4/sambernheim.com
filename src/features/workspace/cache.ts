import type { BootstrapData } from './types'

export function upsertBootstrap(
  previous: unknown,
  patch: Partial<BootstrapData>,
): BootstrapData {
  const current = previous as BootstrapData | undefined

  return {
    organizations: upsertById(
      current?.organizations ?? [],
      patch.organizations ?? [],
    ),
    projects: upsertById(current?.projects ?? [], patch.projects ?? []),
    tasks: upsertById(current?.tasks ?? [], patch.tasks ?? []),
  }
}

function upsertById<TItem extends { id: string; updatedAt: string }>(
  current: TItem[],
  incoming: TItem[],
) {
  const next = new Map(current.map((item) => [item.id, item]))

  for (const item of incoming) {
    const previous = next.get(item.id)
    if (!previous || item.updatedAt >= previous.updatedAt) {
      next.set(item.id, item)
    }
  }

  return Array.from(next.values())
}
