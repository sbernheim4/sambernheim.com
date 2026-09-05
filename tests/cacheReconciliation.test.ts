import assert from 'node:assert/strict'
import test from 'node:test'
import { QueryClient } from '@tanstack/react-query'
import { createCacheReconciliation } from '../src/forms/query/cacheReconciliation.ts'
import { bootstrapKey } from '../src/features/workspace/queries.ts'
import { upsertBootstrap } from '../src/features/workspace/cache.ts'

test('all successful saves remain visible after subsequent lagging refetches', async () => {
  const client = new QueryClient()
  const reconcile = createCacheReconciliation()
  const empty = { organizations: [], projects: [], tasks: [] }
  const organization = {
    id: 'org-1', name: 'Test', sector: 'healthcare' as const,
    status: 'active' as const, region: 'east' as const, updatedAt: '2026-09-05',
  }
  const project = {
    id: 'project-1', organizationId: organization.id, name: 'Project',
    priority: 'high' as const, phase: 'planning' as const,
    budget: '$50k', updatedAt: '2026-09-05',
  }
  const task = {
    id: 'task-1', organizationId: organization.id, projectId: project.id,
    title: 'Task', owner: 'alex' as const, status: 'todo' as const,
    dueWindow: 'this-week' as const, updatedAt: '2026-09-05',
  }
  const patches = [
    { organizations: [organization] }, { projects: [project] }, { tasks: [task] },
  ]
  for (const patch of patches) {
    await reconcile(async () => {
      await client.fetchQuery({ queryKey: bootstrapKey, queryFn: async () => empty })
    }, () => {
      client.setQueryData(bootstrapKey, (previous: unknown) => upsertBootstrap(previous, patch))
    })
  }
  assert.deepEqual(client.getQueryData(bootstrapKey), {
    organizations: [organization], projects: [project], tasks: [task],
  })
  client.clear()
})

test('a failed refetch still reconciles successful writes', async () => {
  const reconcile = createCacheReconciliation()
  const applied: string[] = []
  await reconcile(async () => {}, () => { applied.push('A') })
  applied.length = 0
  await assert.rejects(reconcile(async () => { throw new Error('offline') }, () => {
    applied.push('B')
  }), /offline/)
  assert.deepEqual(applied, ['A', 'B'])
})
