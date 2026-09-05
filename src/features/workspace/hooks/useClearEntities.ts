import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query'
import { clearEntities } from '../api'
import { bootstrapKey } from '../queries'

export function useClearEntities() {
  const queryClient = useQueryClient()
  const activeMutations = useIsMutating()
  const mutation = useMutation({
    mutationFn: clearEntities,
    onSuccess: async (data) => {
      await queryClient.cancelQueries({ queryKey: bootstrapKey })
      queryClient.setQueryData(bootstrapKey, data)
    },
  })

  return {
    ...mutation,
    isDisabled: activeMutations > 0,
    clear: () => {
      if (queryClient.isMutating() === 0) mutation.mutate()
    },
  }
}
