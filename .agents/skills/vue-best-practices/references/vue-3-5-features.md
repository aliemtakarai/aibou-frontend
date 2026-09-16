# Modern Vue 3.5+ Features & APIs Guide

This reference provides a comprehensive overview of the modern features, compiler macros, and APIs introduced in **Vue 3.5+**.

---

## 1. Reactive Props Destructuring

In Vue 3.5+, destructuring `defineProps` preserves full reactivity natively at compile time. The compiler transforms destructured identifiers into getters accessing the underlying `props` proxy.

### 1.1. Syntax & Default Values
```vue
<script setup lang="ts">
import { computed, watch } from 'vue'

interface Props {
  count: number
  label?: string
  status?: 'idle' | 'loading' | 'success' | 'error'
}

// Destructuring directly assigns default values without withDefaults:
const { 
  count, 
  label = 'Items', 
  status = 'idle' 
} = defineProps<Props>()

// Retains reactivity inside computed:
const badge = computed(() => `${label}: ${count} [${status.toUpperCase()}]`)

// Watching a destructured prop:
watch(() => count, (newCount, oldCount) => {
  console.log(`Count changed from ${oldCount} to ${newCount}`)
})
</script>
```

### 1.2. Passing Destructured Props to External Functions
When passing a destructured prop to a composable or utility function that expects reactive updates, pass it as a getter function:

```typescript
// ❌ WRONG: Passes static primitive value snapshot
useCounter(count)

// ✅ CORRECT: Passes a getter function so the composable can observe updates
useCounter(() => count)
```

---

## 2. `defineModel()` for Two-Way Bindings

`defineModel()` (stabilized in Vue 3.4 and enhanced in 3.5) declares a two-way binding prop that can be bound via `v-model` in the parent component.

### 2.1. Basic & Named Models
```vue
<!-- CustomInput.vue -->
<script setup lang="ts">
// Default model (v-model="parentVal")
const modelValue = defineModel<string>({ default: '' })

// Named model (v-model:filter="filterVal")
const filter = defineModel<string>('filter', { default: 'all' })
</script>

<template>
  <input v-model="modelValue" />
</template>
```

### 2.2. Model Transformers & Modifiers
Vue 3.5 supports custom modifiers and value transformation on get/set:

```typescript
const [model, modifiers] = defineModel<string, 'trim' | 'uppercase'>({
  set(value) {
    if (modifiers.trim) value = value.trim()
    if (modifiers.uppercase) value = value.toUpperCase()
    return value
  }
})
```

---

## 3. `useTemplateRef()`

Vue 3.5 provides `useTemplateRef()` to dynamically and cleanly obtain typed template element or component instance references.

```vue
<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue'

// Avoids magic string variable name binding:
const inputElement = useTemplateRef<HTMLInputElement>('mainInput')

onMounted(() => {
  inputElement.value?.focus()
})
</script>

<template>
  <input ref="mainInput" type="text" />
</template>
```

Advantages:
- Decouples the JavaScript variable name from the template `ref="..."` attribute.
- Fully typed as `Readonly<ShallowRef<T | null>>`.

---

## 4. `useId()` for Accessible Forms & WAI-ARIA

Vue 3.5 introduces `useId()` to generate unique, SSR-safe, deterministic IDs across the application, ideal for linking `<label for="...">` and `<input id="...">` or `aria-describedby`.

```vue
<script setup lang="ts">
import { useId } from 'vue'

const id = useId()
const hintId = `${id}-hint`
</script>

<template>
  <div class="form-group">
    <label :for="id">Email Address</label>
    <input :id="id" type="email" :aria-describedby="hintId" />
    <span :id="hintId" class="hint">We never share your email.</span>
  </div>
</template>
```

---

## 5. `onWatcherCleanup()`

Vue 3.5 provides `onWatcherCleanup()` to register cleanup callbacks directly inside `watch` and `watchEffect`, eliminating the need to accept `onCleanup` as a function argument.

```typescript
import { watch, onWatcherCleanup } from 'vue'

watch(searchQuery, (query) => {
  const controller = new AbortController()

  fetchSearchResults(query, { signal: controller.signal })

  // Clean up when the query changes or when the watcher is stopped
  onWatcherCleanup(() => {
    controller.abort()
  })
})
```

---

## 6. Generic Components (`generic="..."`)

Vue allows creating generic components directly in `<script setup>`:

```vue
<!-- GenericList.vue -->
<script setup lang="ts" generic="T extends { id: string | number; name: string }">
interface Props {
  items: T[]
  selectedId?: T['id'] | null
}

const { items, selectedId = null } = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select', item: T): void
}>()
</script>

<template>
  <ul class="item-list">
    <li 
      v-for="item in items" 
      :key="item.id" 
      :class="{ active: item.id === selectedId }"
      @click="emit('select', item)"
    >
      <slot name="item" :item="item">
        {{ item.name }}
      </slot>
    </li>
  </ul>
</template>
```

---

## 7. Typed Slots via `defineSlots()`

`defineSlots()` enables strict compile-time type verification for scoped slots and fallback content:

```vue
<script setup lang="ts">
interface User {
  id: string
  name: string
  role: string
}

// Strictly type what slots the component exposes and their scoped properties:
defineSlots<{
  default(props: { user: User; index: number }): any
  header(props: { total: number }): any
  empty(): any
}>()
</script>
```
