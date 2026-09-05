import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { AnyParticipant, OrchestratorConfig } from '../orchestration/contracts'
import { createOrchestrator, type ExecutionState } from '../orchestration/executor'

export function useFormOrchestrator<const P extends readonly AnyParticipant[]>(config: OrchestratorConfig<P>) {
  const client = useQueryClient()
  const [state, setState] = useState<ExecutionState<P>>({ phase: 'idle', isSaving: false })
  const [executor] = useState(() => createOrchestrator<P>(client, setState))
  const latest = useRef(config)
  latest.current = config
  return { ...state, participants: state.result?.participants, submit: () => executor.submit(latest.current), reset: executor.reset }
}
