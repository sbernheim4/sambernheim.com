import { test } from 'node:test'
import assert from 'node:assert/strict'
import { QueryClient } from '@tanstack/react-query'
import { adaptFlow } from '../src/forms/orchestration/flowAdapter.ts'
import { createOrchestrator } from '../src/forms/orchestration/executor.ts'

test('dependent endpoint flow shares refresh/cache/callback ordering and retains parent inputs', async () => {
  const qc = new QueryClient(); const log: string[] = []
  const flow = adaptFlow<{ name: string }, { parent?: string }>(qc, {
    buildInitialContext: () => ({}),
    steps: [
      { id: 'parent', buildInput: (_ctx, values) => values.name, mutationFn: async (input) => { log.push('parent'); return { id: input } }, assign: (ctx, response) => ({ ...ctx, parent: response.id }),
        refetchFunctions: [() => { log.push('refresh parent') }], cacheUpdates: [{ queryKey: () => ['parent'], getData: (response) => response.id }], onSuccess: () => { log.push('parent success') } },
      { id: 'child', buildInput: (ctx) => ctx.parent, mutationFn: async (input) => { assert.equal(input, 'A'); log.push('child'); return input },
        refetchFunctions: [() => { log.push('refresh child') }], onSuccess: () => { log.push('child success') } },
    ],
    onSuccess: ({ flowContext }) => { assert.equal(flowContext.parent, 'A'); assert.equal(qc.getQueryData(['parent']), 'A'); log.push('group success') },
  }, { name: 'A' })
  const result = await createOrchestrator(qc).submit(flow.config)
  assert.equal(result.outcome, 'success'); assert.deepEqual(flow.getContext(), { parent: 'A' })
  assert.deepEqual(log, ['parent', 'child', 'refresh parent', 'refresh child', 'parent success', 'child success', 'group success'])
})

test('flow follow-up errors retain successful writes without compensation or recursive failure', async () => {
  const qc = new QueryClient(); let writes = 0
  const flow = adaptFlow(qc, { buildInitialContext: () => ({}), steps: [{ id: 'a', buildInput: () => 1,
    mutationFn: async () => { writes++; return 1 }, refetchFunctions: [() => { throw Error('refresh') }],
    cacheUpdates: [{ queryKey: () => ['a'] }], onSuccess: () => { throw Error('effect') }, compensate: async () => assert.fail('no compensation after follow-up failure') }],
    onFailure: () => assert.fail('no failure callback for persisted writes'),
  }, {})
  const result = await createOrchestrator(qc).submit(flow.config)
  assert.equal(result.outcome, 'saved-with-follow-up-errors'); assert.equal(result.participants.a.status, 'saved'); assert.equal(writes, 1); assert.equal(qc.getQueryData(['a']), 1)
})
