import type { BootstrapData } from './types'

export function upsertBootstrap(
  previous: unknown,
  patch: Partial<BootstrapData>,
): BootstrapData {
  const current = previous as BootstrapData | undefined

  return {
    organizations: reconcileWorkspaceRead(current?.organizations ?? [], patch.organizations ?? []) as Organization[],
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

import { replaceEqualDeep } from '@tanstack/query-core'
import type { Organization, OrganizationProfile, OrganizationOperations } from './types'

export function mergeOrganization(previous: Organization | undefined, incoming: Organization): Organization {
  if (!previous) return incoming
  const profileNewer = (incoming.profileUpdatedAt ?? incoming.updatedAt) >= (previous.profileUpdatedAt ?? previous.updatedAt)
  const operationsNewer = (incoming.operationsUpdatedAt ?? incoming.updatedAt) >= (previous.operationsUpdatedAt ?? previous.updatedAt)
  return { ...incoming,
    ...(!profileNewer ? { name: previous.name, sector: previous.sector, profileUpdatedAt: previous.profileUpdatedAt ?? previous.updatedAt } : {}),
    ...(!operationsNewer ? { status: previous.status, region: previous.region, operationsUpdatedAt: previous.operationsUpdatedAt ?? previous.updatedAt } : {}),
    updatedAt: incoming.updatedAt >= previous.updatedAt ? incoming.updatedAt : previous.updatedAt,
  }
}
export function mergeProfile(previous: Organization | undefined, profile: OrganizationProfile) {
  if (!previous) return undefined
  return mergeOrganization(previous, { ...previous, name: profile.name, sector: profile.sector, profileUpdatedAt: profile.updatedAt, updatedAt: profile.updatedAt > previous.updatedAt ? profile.updatedAt : previous.updatedAt })
}
export function mergeOperations(previous: Organization | undefined, operations: OrganizationOperations) {
  if (!previous) return undefined
  return mergeOrganization(previous, { ...previous, status: operations.status, region: operations.region, operationsUpdatedAt: operations.updatedAt, updatedAt: operations.updatedAt > previous.updatedAt ? operations.updatedAt : previous.updatedAt })
}

/** Keep acknowledged versions when a later fetch still comes from the replica.
 * This demo supports removal through clear-all, which removes these caches. */
export function reconcileWorkspaceRead(previous: unknown, incoming: unknown): unknown {
  if (!previous || !incoming) return incoming
  if (Array.isArray(previous) && Array.isArray(incoming)) {
    const byId = new Map(previous.map((item) => [item.id, item]))
    for (const item of incoming) byId.set(item.id, reconcileWorkspaceRead(byId.get(item.id), item))
    return replaceEqualDeep(previous, Array.from(byId.values()))
  }
  if (typeof previous === 'object' && typeof incoming === 'object') {
    if ('organizations' in incoming && 'projects' in incoming && 'tasks' in incoming) {
      const old = previous as BootstrapData; const next = incoming as BootstrapData
      return replaceEqualDeep(previous, { organizations: reconcileWorkspaceRead(old.organizations, next.organizations), projects: reconcileWorkspaceRead(old.projects, next.projects), tasks: reconcileWorkspaceRead(old.tasks, next.tasks) })
    }
    if ('updatedAt' in incoming && 'updatedAt' in previous) {
      if ('sector' in incoming && 'status' in incoming) return replaceEqualDeep(previous, mergeOrganization(previous as Organization, incoming as Organization))
      if (String(previous.updatedAt) > String(incoming.updatedAt)) return previous
    }
  }
  return replaceEqualDeep(previous, incoming)
}
