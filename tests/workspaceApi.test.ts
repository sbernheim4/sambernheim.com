import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { createExampleApi } from '../server/example-api.ts'

function harness() {
  const api = createExampleApi({ readModelLagMs: 10 })
  return {
    ...api,
    request: async (method: string, url: string, body?: unknown) => {
      const request = Object.assign(
        Readable.from(body ? [Buffer.from(JSON.stringify(body))] : []),
        { method, url },
      )
      let status = 200
      let data: any
      const response = {
        writeHead: (code: number) => {
          status = code
        },
        end: (text: string) => {
          data = JSON.parse(text)
        },
      }
      await api.handleApiRequest(
        request as IncomingMessage,
        response as unknown as ServerResponse,
      )
      return { status, data }
    },
  }
}

test('child reads, independent ownership, legacy projection, initialization and replica lag', async () => {
  const api = harness()
  try {
    const initial = await api.request('GET', '/api/organizations/org-1/profile')
    assert.equal(initial.data.name, 'Existing Clinic')
    const operations = (
      await api.request('GET', '/api/organizations/org-1/operations')
    ).data
    const profile = (
      await api.request('PATCH', '/api/organizations/org-1/profile', {
        name: ' Renamed ',
        sector: 'finance',
        status: 'paused',
      })
    ).data.profile
    assert.equal(profile.name, 'Renamed')
    assert.equal(profile.status, undefined)
    assert.equal(
      (await api.request('GET', '/api/organizations/org-1/profile')).data.name,
      'Existing Clinic',
    )
    await new Promise((r) => setTimeout(r, 15))
    const summary = (await api.request('GET', '/api/organizations/org-1')).data
    assert.equal(summary.name, 'Renamed')
    assert.equal(summary.status, operations.status)
    assert.equal(summary.operationsUpdatedAt, operations.updatedAt)
    const savedOperations = (
      await api.request('PATCH', '/api/organizations/org-1/operations', {
        status: 'paused',
        region: 'west',
        name: 'wrong owner',
      })
    ).data.operations
    assert.equal(savedOperations.name, undefined)
    const legacy = (
      await api.request('PATCH', '/api/organizations/org-1', {
        name: 'Legacy',
        sector: 'education',
        status: 'active',
        region: 'central',
      })
    ).data.organization
    assert.equal(legacy.name, 'Legacy')
    assert.equal(
      (await api.request('POST', '/api/organizations', { name: 'New Org' }))
        .status,
      400,
    )
    const created = (
      await api.request('POST', '/api/organizations', {
        name: 'New Org',
        sector: 'finance',
        status: 'paused',
        region: 'west',
      })
    ).data.organization
    await new Promise((r) => setTimeout(r, 15))
    assert.equal(
      (await api.request('GET', `/api/organizations/${created.id}/profile`))
        .data.name,
      'New Org',
    )
    assert.equal(
      (await api.request('GET', `/api/organizations/${created.id}/operations`))
        .data.status,
      'active',
    )
    assert.equal(
      (await api.request('GET', '/api/organizations/org-1/profile')).data.name,
      'Legacy',
    )
    assert.equal(
      (await api.request('GET', '/api/organizations/org-1/operations')).data
        .region,
      'central',
    )
    assert.equal(
      (await api.request('GET', '/api/organizations/org-1/projects')).data[0]
        .id,
      'project-1',
    )
    assert.equal(
      (await api.request('GET', '/api/projects/project-1/tasks')).data[0].id,
      'task-1',
    )
  } finally {
    api.dispose()
  }
})

test('missing parents fail, clear removes children and pending replica timers cannot restore data', async () => {
  const api = harness()
  try {
    for (const child of ['profile', 'operations']) {
      assert.equal(
        (await api.request('GET', `/api/organizations/missing/${child}`))
          .status,
        404,
      )
      assert.equal(
        (await api.request('PATCH', `/api/organizations/missing/${child}`, {}))
          .status,
        404,
      )
    }
    await api.request('PATCH', '/api/organizations/org-1/profile', {
      name: 'Pending',
    })
    assert.deepEqual((await api.request('DELETE', '/api/entities')).data, {
      organizations: [],
      projects: [],
      tasks: [],
    })
    await new Promise((r) => setTimeout(r, 15))
    assert.equal(
      (await api.request('GET', '/api/organizations/org-1/profile')).status,
      404,
    )
    assert.equal(
      (await api.request('GET', '/api/organizations/org-1/operations')).status,
      404,
    )
    assert.deepEqual((await api.request('GET', '/api/bootstrap')).data, {
      organizations: [],
      projects: [],
      tasks: [],
    })
  } finally {
    api.dispose()
  }
})
