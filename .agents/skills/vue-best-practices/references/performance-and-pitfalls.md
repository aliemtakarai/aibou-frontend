# Vue 3 Performance Optimization & Reactivity Pitfalls

This reference document outlines performance techniques, memory leak preventions, and reactivity traps in modern Vue 3 applications.

---

## 1. Deep vs. Shallow Reactivity

### 1.1. When to Use `shallowRef()`
`ref()` creates a deep reactive proxy. If your object contains thousands of nested records (e.g., API responses, logs, tabular datasets), Vue traverses the entire hierarchy and creates reactive getters/setters for every key.

- Use `shallowRef()` when:
  - The data structure is large and read-only.
  - You replace the value as a whole rather than mutating nested properties.

```typescript
import { shallowRef } from 'vue'

interface LogEntry {
  id: string
  timestamp: string
  message: string
}

// ✅ GOOD: Shallow reactivity avoids proxying thousands of nested keys
const logs = shallowRef<LogEntry[]>([])

// Mutate by reassigning:
const appendLog = (newEntry: LogEntry) => {
  logs.value = [...logs.value, newEntry]
}
```

### 1.2. Why `ref()` is Preferred Over `reactive()`
The Vue core team generally recommends using `ref()` as the primary reactive primitive:
- `ref()` works consistently for all types (primitives, objects, arrays).
- `reactive()` loses reactivity when destructured or reassigned.
- `ref()` provides clearer visual indication in code (`.value`) of where reactivity is being accessed.

---

## 2. Computed Properties vs. Methods vs. Watchers

| Feature | Cached? | Side Effects Allowed? | Best For |
| :--- | :--- | :--- | :--- |
| `computed()` | ✅ Yes (by reactive dependencies) | ❌ Never | Derived state, filtering, formatting |
| `watch()` | ❌ No | ✅ Yes | Network requests, logging, timers |
| Method in template | ❌ No (runs on every re-render) | ❌ Avoid | Event handlers only |

### The Golden Rule of `computed()`
A `computed()` property must be a **pure function**:
- Never modify other `ref`s inside a computed getter.
- Never trigger asynchronous operations inside a computed getter.

---

## 3. DOM & List Rendering Optimization

### 3.1. Stable Keying in `v-for`
Always use a unique, immutable ID for `:key`:
```vue
<!-- ❌ BAD: Index keys lead to state mismatches and DOM thrashing during reordering -->
<li v-for="(item, index) in items" :key="index">

<!-- ✅ GOOD: Stable unique ID -->
<li v-for="item in items" :key="item.id">
```

### 3.2. `v-memo` for High-Frequency Lists
`v-memo` conditionally skips virtual DOM re-rendering of sub-trees unless specific dependencies change:

```vue
<div v-for="item in largeList" :key="item.id" v-memo="[item.id === selectedId]">
  <p>{{ item.name }}</p>
</div>
```

---

## 4. Resource & Memory Leak Prevention

Uncleaned timers, observers, and listeners remain in memory even after components are unmounted.

### Checklist for Lifecycle Cleanup
```typescript
import { onMounted, onUnmounted } from 'vue'

const timer = ref<ReturnType<typeof setInterval> | null>(null)
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  // 1. Intervals / Timeouts
  timer.value = setInterval(refreshData, 10000)

  // 2. Window / Document listeners
  window.addEventListener('scroll', handleScroll, { passive: true })

  // 3. Observers
  resizeObserver = new ResizeObserver(entries => { /* ... */ })
  resizeObserver.observe(document.body)
})

onUnmounted(() => {
  // Always clean up!
  if (timer.value) clearInterval(timer.value)
  window.removeEventListener('scroll', handleScroll)
  if (resizeObserver) resizeObserver.disconnect()
})
```
