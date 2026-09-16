# Composables & State Management Guide

This guide establishes the architectural standards for authoring composables and organizing state in Vue 3.5+ applications.

---

## 1. What Makes a Production-Grade Composable

Composables extract and encapsulate stateful logic using Vue's Composition API. A well-designed composable must be:
- **Flexible**: Accept raw primitives, `ref`s, or getter functions (`MaybeRefOrGetter<T>`).
- **Predictable**: Return a plain object with reactive `ref`s and helper methods.
- **Self-Cleaning**: Clean up timers, event listeners, and pending network requests using `onScopeDispose()`.
- **Type-Safe**: Provide explicit TypeScript generics and return types.

---

## 2. Parameter Normalization: `MaybeRefOrGetter<T>` & `toValue()`

Always use `MaybeRefOrGetter<T>` for parameters that might be dynamic:

```typescript
import { toValue, computed, type MaybeRefOrGetter } from 'vue'

export function useStringFormatter(input: MaybeRefOrGetter<string>) {
  // toValue() unwraps refs, calls getters, or returns raw values cleanly:
  const uppercase = computed(() => toValue(input).toUpperCase())
  const length = computed(() => toValue(input).length)

  return { uppercase, length }
}
```

### Usage Flexibility
```typescript
// With a static string:
useStringFormatter('hello')

// With a ref:
const title = ref('hello')
useStringFormatter(title)

// With a getter / computed / destructured prop:
useStringFormatter(() => props.title)
```

---

## 3. The Canonical Composable Pattern

Here is the universal anatomy of a production-grade composable:

```typescript
import { 
  ref, 
  shallowRef, 
  computed, 
  watch, 
  toValue, 
  onScopeDispose,
  type MaybeRefOrGetter 
} from 'vue'

export interface UseResourceOptions {
  immediate?: boolean
  debounceMs?: number
}

export function useResource<T>(
  query: MaybeRefOrGetter<string>,
  fetcher: (q: string, signal: AbortSignal) => Promise<T>,
  options: UseResourceOptions = {}
) {
  const { immediate = true, debounceMs = 0 } = options

  // State
  const data = shallowRef<T | null>(null)
  const error = shallowRef<Error | null>(null)
  const isLoading = ref<boolean>(false)

  let abortController: AbortController | null = null

  const execute = async () => {
    // Abort previous in-flight call
    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()

    isLoading.value = true
    error.value = null

    try {
      const result = await fetcher(toValue(query), abortController.signal)
      data.value = result
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        error.value = err instanceof Error ? err : new Error(String(err))
      }
    } finally {
      isLoading.value = false
    }
  }

  // Automatic execution & watch
  if (immediate) {
    execute()
  }

  watch(() => toValue(query), () => {
    execute()
  })

  // Self-cleaning: triggers when parent component unmounts or effect scope ends
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
```

---

## 4. Pinia Setup Store Conventions

When creating Pinia stores, prefer **Setup Stores** (`defineStore('name', () => { ... })`) for consistent syntax with `<script setup>`.

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserProfile {
  id: string
  name: string
  role: string
}

export const useUserStore = defineStore('user', () => {
  // State: refs & shallowRefs
  const profile = ref<UserProfile | null>(null)
  const token = ref<string | null>(null)

  // Getters: computed
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')

  // Actions: regular functions
  function setSession(newProfile: UserProfile, newToken: string) {
    profile.value = newProfile
    token.value = newToken
  }

  function clearSession() {
    profile.value = null
    token.value = null
  }

  return {
    profile,
    token,
    isAuthenticated,
    isAdmin,
    setSession,
    clearSession
  }
})
```

### Avoiding Reactivity Loss with `storeToRefs`
```typescript
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// ❌ WRONG: Destructuring breaks reactivity!
const { isAuthenticated, profile } = userStore

// ✅ CORRECT: Extract state and getters with storeToRefs:
const { isAuthenticated, profile } = storeToRefs(userStore)

// Actions can be destructured directly:
const { setSession, clearSession } = userStore
```
