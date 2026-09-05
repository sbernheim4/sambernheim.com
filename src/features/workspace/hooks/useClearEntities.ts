import { useIsMutating, useQueryClient } from '@tanstack/react-query'
import { useClearWorkspaceMutation } from './mutations'
import { bootstrapKey } from '../queries'

export function useClearEntities() {
  const queryClient = useQueryClient()
  const activeMutations = useIsMutating()
  const mutation = useClearWorkspaceMutation()


  return {
    ...mutation,
    isDisabled: activeMutations > 0,
    clear: () => {
      if (queryClient.isMutating() === 0) mutation.mutate(undefined, { onSuccess: async (data) => {
        await queryClient.cancelQueries({ queryKey: bootstrapKey })
        queryClient.setQueryData(bootstrapKey, data)
      } })
    },
  }
}
