import { ref, shallowRef, toValue, onScopeDispose, type MaybeRefOrGetter } from 'vue'

export interface AsyncStateOptions<T> {
  immediate?: boolean
  initialData?: T | null
  onError?: (error: Error) => void
  onSuccess?: (data: T) => void
}

/**
 * Universal composable for handling asynchronous actions and network requests.
 * 
 * Features:
 * - Automatic in-flight request abortion via AbortController
 * - Lifecycle cleanup via onScopeDispose()
 * - Loading, error, and shallow data state tracking
 */
export function useAsyncState<T, Args extends any[] = []>(
  asyncFn: (signal: AbortSignal, ...args: Args) => Promise<T>,
  options: AsyncStateOptions<T> = {}
) {
  const {
    immediate = false,
    initialData = null,
    onError,
    onSuccess
  } = options

  const data = shallowRef<T | null>(initialData)
  const error = shallowRef<Error | null>(null)
  const isLoading = ref<boolean>(false)

  let abortController: AbortController | null = null

  const execute = async (...args: Args): Promise<T | null> => {
    // Cancel prior request if still pending
    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()

    isLoading.value = true
    error.value = null

    try {
      const result = await asyncFn(abortController.signal, ...args)
      data.value = result
      onSuccess?.(result)
      return result
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        // Request was aborted cleanly; ignore
        return null
      }
      const resolvedError = err instanceof Error ? err : new Error(String(err))
      error.value = resolvedError
      onError?.(resolvedError)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Cleanup when component or effect scope unmounts
  onScopeDispose(() => {
    if (abortController) {
      abortController.abort()
    }
  })

  return {
    data,
    error,
    isLoading,
    execute
  }
}
