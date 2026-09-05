import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type {
  AnyParticipant,
  OrchestratorConfig,
} from '../orchestration/contracts'
import {
  createOrchestrator,
  type ExecutionState,
} from '../orchestration/executor'

type OrchestratedBinding = {
  form: { state: { isDirty: boolean } }
  participant: AnyParticipant
}
type OrchestratedInput = AnyParticipant | OrchestratedBinding
type ParticipantsOf<T extends readonly OrchestratedInput[]> = {
  [K in keyof T]: T[K] extends { participant: infer P }
    ? P
    : T[K] extends AnyParticipant
      ? T[K]
      : never
}

export function useFormOrchestrator<const T extends readonly OrchestratedInput[]>(
  config: Omit<OrchestratorConfig<ParticipantsOf<T>>, 'forms'> & {
    forms: T
    includePristine?: boolean
  },
) {
  const client = useQueryClient()
  const [state, setState] = useState<ExecutionState<ParticipantsOf<T>>>({
    phase: 'idle',
    isSaving: false,
  })
  const [executor] = useState(() =>
    createOrchestrator<ParticipantsOf<T>>(client, setState),
  )
  const latest = useRef(config)
  latest.current = config
  return {
    ...state,
    participants: state.result?.participants,
    submit: () => {
      const candidateForms = latest.current.includePristine
        ? latest.current.forms
        : latest.current.forms.filter((item) =>
            'form' in item ? item.form.state.isDirty : true,
          )
      const dirty = candidateForms
        .map((item) => ('participant' in item ? item.participant : item)) as ParticipantsOf<T>
      if (!dirty.length) return Promise.resolve(undefined)
      const { includePristine: _includePristine, ...submitConfig } =
        latest.current
      return executor.submit({
        ...(submitConfig as Omit<OrchestratorConfig<ParticipantsOf<T>>, 'forms'>),
        forms: dirty,
      })
    },
    reset: executor.reset,
  }
}
