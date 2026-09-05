import { useQuery } from '@tanstack/react-query'
import { fetchBootstrap } from '../api'
import { bootstrapKey } from '../queries'

export function useWorkspaceResources() {
  return useQuery({ queryKey: bootstrapKey, queryFn: fetchBootstrap, staleTime: 5_000 })
}
