import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { SaveFlowConfig } from '../types'
import type { AnyParticipant } from '../orchestration/contracts'
import {
  createOrchestrator,
  type ExecutionState,
} from '../orchestration/executor'
import { adaptFlow, FlowSaveError } from '../orchestration/flowAdapter'

export function useSaveFlow<V, C>(config: SaveFlowConfig<V, C>) {
  const queryClient = useQueryClient()
  const latest = useRef(config)
  latest.current = config
  const [state, setState] = useState<ExecutionState<readonly AnyParticipant[]>>(
    { phase: 'idle', isSaving: false },
  )
  const [executor] = useState(() =>
    createOrchestrator<readonly AnyParticipant[]>(queryClient, setState),
  )
  const [data, setData] = useState<C>()
  const [error, setError] = useState<Error | null>(null)
  const active = useRef<Promise<C> | undefined>(undefined)
  const mutateAsync = (values: V): Promise<C> => {
    if (active.current) return active.current
    setError(null)
    active.current = (async () => {
      const flow = adaptFlow(queryClient, latest.current, values)
      const result = await executor.submit(flow.config)
      const context = flow.getContext()
      if (
        result.outcome === 'partial-failure' ||
        result.outcome === 'validation-failed'
      )
        throw new FlowSaveError(result, context)
      setData(context)
      return context
    })()
      .catch((cause) => {
        const error = cause instanceof Error ? cause : new Error(String(cause))
        setError(error)
        throw error
      })
      .finally(() => {
        active.current = undefined
      })
    return active.current
  }
  return {
    ...state,
    data,
    error,
    isPending: state.isSaving,
    mutateAsync,
    mutate: (values: V) => {
      void mutateAsync(values).catch(() => {})
    },
    reset: () => {
      if (executor.reset()) {
        setData(undefined)
        setError(null)
      }
    },
  }
}
