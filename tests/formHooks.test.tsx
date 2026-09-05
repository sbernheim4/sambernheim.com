import { test } from 'node:test'
import assert from 'node:assert/strict'
import { act, create, type ReactTestRenderer } from 'react-test-renderer'
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import { useQueryBackedForm } from '../src/forms/bindings/useQueryBackedForm'
import { useFormOrchestrator } from '../src/forms/query/useFormOrchestrator'
import {
  useOrganizationProfileForm,
  useOrganizationOperationsForm,
} from '../src/features/workspace/hooks/organizationConfigurationForms'
import { useCreateOrganization } from '../src/features/workspace/hooks/mutations'
import { workspaceKeys } from '../src/features/workspace/queries'
import { clearWorkspace } from '../src/features/workspace/clearWorkspace'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
const client = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: 4, gcTime: Infinity },
    },
  })
const delay = () => new Promise<void>((r) => setTimeout(r, 10))
const gate = () => {
  let resolve!: () => void
  const promise = new Promise<void>((r) => {
    resolve = r
  })
  return { resolve, promise }
}
async function mount(qc: QueryClient, render: () => React.ReactNode) {
  function Harness() {
    return render()
  }
  let root!: ReactTestRenderer
  await act(async () => {
    root = create(
      <QueryClientProvider client={qc}>
        <Harness />
      </QueryClientProvider>,
    )
  })
  return {
    update: async () => {
      await act(async () => {
        root.update(
          <QueryClientProvider client={qc}>
            <Harness />
          </QueryClientProvider>,
        )
      })
    },
    dispose: async () => {
      await act(async () => root.unmount())
      qc.clear()
    },
  }
}

test('CRUD query selection initializes mapped values, preserves dirty edits and accepts only the submitted baseline', async () => {
  const qc = client()
  const loaded = gate()
  const refreshed = gate()
  let callback = 0
  let writes = 0
  // Use a typed capture without altering the hook's own inferred types.
  let current: any
  const harness = await mount(qc, () => {
    const query = useQuery({
      queryKey: ['read'],
      queryFn: async () => {
        await loaded.promise
        return { envelope: { name: 'server' } }
      },
      select: (data) => data.envelope,
    })
    current = useQueryBackedForm({
      query,
      toFormData: (data) => ({ display: data.name }),
      toMutationPayload: (v) => ({ name: v.display }),
      endpoint: {
        mutationFn: async (v: { name: string }) => {
          writes++
          return v
        },
        refetchFunctions: [() => refreshed.promise],
        cacheUpdates: [
          { queryKey: () => ['read'], getData: (r) => ({ envelope: r }) },
        ],
      },
      onSuccess: () => {
        callback++
      },
    })
    return (
      <current.form.AppField name="display">{() => null}</current.form.AppField>
    )
  })
  try {
    assert.equal(current.isReady, false)
    await act(async () => {
      loaded.resolve()
      await delay()
    })
    assert.equal(current.isReady, true)
    assert.deepEqual(current.form.state.values, { display: 'server' })
    await act(async () => {
      current.form.setFieldValue('display', 'edit')
      qc.setQueryData(['read'], { envelope: { name: 'background' } })
      await delay()
    })
    assert.equal(current.form.state.values.display, 'edit')
    let pending: Promise<any>
    await act(async () => {
      pending = current.submit()
      await delay()
    })
    assert.equal(current.isSaving, true)
    await act(async () => {
      current.form.setFieldValue('display', 'later')
      refreshed.resolve()
      await pending!
      await delay()
    })
    assert.equal(writes, 1)
    assert.equal(callback, 1)
    assert.equal(current.isSaving, false)
    assert.equal(current.form.state.values.display, 'later')
    assert.equal(current.form.state.isDirty, true)
    assert.deepEqual(current.form.options.defaultValues, { display: 'edit' })
    assert.deepEqual(qc.getQueryData(['read']), { envelope: { name: 'edit' } })
  } finally {
    await harness.dispose()
  }
})

test('domain create mutateAsync owns one mutation, overrides inherited retries and aggregate state includes refresh/effects', async () => {
  const original = globalThis.fetch
  const qc = client()
  const refresh = gate()
  let calls = 0
  let successes = 0
  let current: any
  let mutation: any
  globalThis.fetch = async () => {
    calls++
    return Response.json({ organization: { id: 'new' }, readModelLagMs: 2500 })
  }
  const harness = await mount(qc, () => {
    mutation = useCreateOrganization()
    current = useQueryBackedForm({
      defaultValues: {
        name: 'N',
        sector: 'healthcare' as const,
        status: 'active' as const,
        region: 'east' as const,
      },
      endpoint: {
        mutationFn: mutation.mutateAsync,
        refetchFunctions: [() => refresh.promise],
      },
      onSuccess: () => {
        successes++
      },
    })
    return null
  })
  try {
    let pending: Promise<any>
    await act(async () => {
      pending = current.submit()
      await delay()
    })
    assert.equal(mutation.isPending, false)
    assert.equal(current.isSaving, true)
    assert.equal(qc.getMutationCache().getAll().length, 1)
    assert.equal(qc.getMutationCache().getAll()[0].options.retry, false)
    assert.equal(
      await clearWorkspace(qc, async () =>
        assert.fail('must not clear in refresh phase'),
      ),
      false,
    )
    await act(async () => {
      refresh.resolve()
      await pending!
    })
    assert.equal(calls, 1)
    assert.equal(successes, 1)
    assert.equal(current.isSaving, false)
  } finally {
    globalThis.fetch = original
    await harness.dispose()
  }
})

test('composed domain forms retry only Operations, keep Profile success and preserve failed edits', async () => {
  const qc = client()
  const original = globalThis.fetch
  const log: string[] = []
  let current: any
  const organization = {
    id: 'org-1',
    name: 'Old',
    sector: 'healthcare',
    status: 'active',
    region: 'east',
    updatedAt: '1',
    profileUpdatedAt: '1',
    operationsUpdatedAt: '1',
  }
  globalThis.fetch = async (url, options) => {
    const path = String(url)
    const patch = options?.method === 'PATCH'
    if (patch) {
      log.push(
        path.endsWith('profile') ? 'profile request' : 'operations request',
      )
      if (path.endsWith('operations'))
        return new Response('Unavailable', { status: 503 })
      return Response.json({
        profile: {
          organizationId: 'org-1',
          ...JSON.parse(String(options.body)),
          updatedAt: '2',
        },
        readModelLagMs: 2500,
      })
    }
    if (path.endsWith('/profile'))
      return Response.json({
        organizationId: 'org-1',
        name: 'Old',
        sector: 'healthcare',
        updatedAt: '1',
      })
    if (path.endsWith('/operations'))
      return Response.json({
        organizationId: 'org-1',
        status: 'active',
        region: 'east',
        updatedAt: '1',
      })
    return Response.json(organization)
  }
  const harness = await mount(qc, () => {
    const profile = useOrganizationProfileForm({
      organizationId: 'org-1',
      onSuccess: () => {
        log.push('profile success')
      },
    })
    const operations = useOrganizationOperationsForm({
      organizationId: 'org-1',
      onFailure: () => {
        log.push('operations failure')
      },
    })
    const save = useFormOrchestrator({
      forms: [profile.participant, operations.participant],
      retry: { delayMs: 0 },
      onFailure: () => {
        log.push('group failure')
      },
    })
    current = { profile, operations, save }
    return null
  })
  try {
    await act(delay)
    assert.equal(current.profile.isReady, true)
    assert.equal(current.operations.isReady, true)
    await act(async () => {
      current.profile.form.setFieldValue('displayName', 'Saved')
      current.operations.form.setFieldValue('isActive', false)
    })
    await act(async () => {
      await current.save.submit()
      await delay()
    })
    assert.deepEqual(log, [
      'profile request',
      'operations request',
      'operations request',
      'profile success',
      'operations failure',
      'group failure',
    ])
    assert.equal(current.save.result.outcome, 'partial-failure')
    assert.equal(current.profile.form.state.values.displayName, 'Saved')
    assert.equal(current.operations.form.state.values.isActive, false)
    assert.equal(
      qc.getQueryData<any>(workspaceKeys.organizations.detail('org-1')).name,
      'Saved',
    )
  } finally {
    globalThis.fetch = original
    await harness.dispose()
  }
})

test('legacy facade callbacks run once and default-values create mode remains ready', async () => {
  const qc = client()
  const log: string[] = []
  let current: any
  const harness = await mount(qc, () => {
    current = useQueryBackedForm({
      defaultValues: { name: 'A' },
      endpoint: {
        mutationFn: async (v) => v,
        refetchPolicy: {
          refetchFns: [
            async () => {
              log.push('refresh')
            },
          ],
        },
        cacheUpdates: [
          {
            queryKey: ['legacy'],
            update: (_previous, { response }) => response,
          },
        ],
        afterEffects: [
          () => {
            log.push('endpoint')
          },
        ],
      },
      afterEffects: [
        () => {
          log.push('form')
        },
      ],
    })
    return null
  })
  try {
    assert.equal(current.isReady, true)
    await act(async () => {
      await current.form.handleSubmit()
    })
    assert.deepEqual(log, ['refresh', 'endpoint', 'form'])
    assert.deepEqual(qc.getQueryData(['legacy']), { name: 'A' })
  } finally {
    await harness.dispose()
  }
})

test('read errors and query mapping errors block writes and release the submission lock', async () => {
  for (const mappingError of [false, true]) {
    const qc = client()
    let current: any
    let failures = 0
    let maps = 0
    const harness = await mount(qc, () => {
      const query = useQuery({
        queryKey: ['read-error'],
        queryFn: async () => {
          if (!mappingError) throw new Error('read failed')
          return { name: 'A' }
        },
      })
      current = useQueryBackedForm({
        query,
        toFormData: (data) => {
          maps++
          if (mappingError) throw new Error('mapping failed')
          return { name: data.name }
        },
        endpoint: {
          mutationFn: async (_input: { name: string }) =>
            assert.fail('no writes'),
        },
        onFailure: () => {
          failures++
        },
      })
      return null
    })
    try {
      await act(delay)
      assert.equal(current.isReady, false)
      await act(async () => {
        await current.submit()
      })
      assert.equal(current.save.result.outcome, 'validation-failed')
      assert.equal(current.isSaving, false)
      assert.equal(failures, 1)
      if (!mappingError) assert.equal(maps, 0)
    } finally {
      await harness.dispose()
    }
  }
})

import { legacyFormConfig } from '../src/forms/bindings/legacyFormConfig'
test('compatibility adapter rejects mixed callback styles', () => {
  assert.throws(
    () =>
      legacyFormConfig({
        defaultValues: {},
        endpoint: { mutationFn: async () => ({}), afterEffects: [] },
        onSuccess: () => {},
      }),
    /not both/,
  )
  assert.throws(
    () =>
      legacyFormConfig({
        defaultValues: {},
        endpoint: { mutationFn: async () => ({}) },
        afterEffects: [],
        onFailure: () => {},
      }),
    /not both/,
  )
})
