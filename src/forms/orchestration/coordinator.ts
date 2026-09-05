import type { QueryClient } from '@tanstack/react-query'

// Per-client lifecycle ownership includes reconciliation/effects, not just requests.
const coordinators = new WeakMap<QueryClient, ReturnType<typeof createCoordinator>>()
function createCoordinator() {
  let active = 0
  let clearing = false
  const listeners = new Set<() => void>()
  const emit = () => listeners.forEach((listener) => listener())
  return {
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } },
    getSnapshot: () => active + Number(clearing),
    begin: () => {
      if (clearing) throw new Error('Workspace is being cleared.')
      active++; emit()
      return () => { active--; emit() }
    },
    beginClear: () => {
      if (active || clearing) return undefined
      clearing = true; emit()
      return () => { clearing = false; emit() }
    },
  }
}
export function lifecycleCoordinator(client: QueryClient) {
  let coordinator = coordinators.get(client)
  if (!coordinator) { coordinator = createCoordinator(); coordinators.set(client, coordinator) }
  return coordinator
}
