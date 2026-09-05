import type { QueryClient, QueryKey } from '@tanstack/react-query'
import { ApiError } from './api.ts'

// A newly created resource can have an acknowledged cache entry while the
// replica still returns 404. Clear-all resets that entry before subsequent reads.
export async function readReplicaResource<T>(
  client: QueryClient,
  key: QueryKey,
  request: () => Promise<T>,
): Promise<T> {
  try {
    return await request()
  } catch (error) {
    const acknowledged = client.getQueryData<T>(key)
    if (
      error instanceof ApiError &&
      error.status === 404 &&
      acknowledged !== undefined
    )
      return acknowledged
    throw error
  }
}
