import { participantDefinition } from './contracts.ts'
import type { AnyParticipant, AsyncMutation, Input, Participant, ParticipantConfig, Response } from './contracts.ts'

export function createParticipant<const Id extends string, V, M extends AsyncMutation, const D extends readonly AnyParticipant[] = readonly []>(
  config: ParticipantConfig<Id, V, M, D>,
): Participant<Id, V, Input<M>, Response<M>> {
  return {
    id: config.id,
    [participantDefinition]: {
      ...config,
      dependencies: config.dependencies?.map((dependency) => dependency.id) ?? [],
      map: config.toMutationPayload ?? ((values) => values),
      retry: config.retry && { ...config.retry },
      endpoint: {
        ...config.endpoint,
        cacheUpdates: config.endpoint.cacheUpdates?.map((target) => ({ ...target })),
        refetchFunctions: config.endpoint.refetchFunctions?.slice(),
        invalidateQueryKeys: config.endpoint.invalidateQueryKeys?.map((key) => [...key]),
      },
    },
  }
}
