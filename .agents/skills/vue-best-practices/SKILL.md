---
name: vue-best-practices
description: Comprehensive, reusable guide and reference patterns for developing, refactoring, and optimizing modern Vue 3.5+ applications using TypeScript, Composition API, Pinia, and Tailwind CSS. Use this skill whenever writing, reviewing, or refactoring Vue components, composables, stores, or lifecycle patterns.
---

# Universal Vue 3.5+ Best Practices Guide

This skill provides a reusable, framework-agnostic set of guidelines, design patterns, and reference implementations for building production-grade **Vue 3.5+** applications with **TypeScript** and the **Composition API**.

---

## Quick Reference & Sub-Documentation

- **Vue 3.5+ Core Features**: [references/vue-3-5-features.md](references/vue-3-5-features.md)
  - Reactive Props Destructuring, `defineModel()`, `useTemplateRef()`, `onWatcherCleanup()`, Typed & Generic Slots (`defineSlots`), and Generic Components (`generic="T"`).
- **Composables & State Management**: [references/composables-and-state.md](references/composables-and-state.md)
  - Universal composable conventions (`use...`), `MaybeRefOrGetter<T>`, `toValue()`, lifecycle cleanup with `onScopeDispose()`, and Pinia setup stores.
- **Component Architecture & Design Patterns**: [references/component-patterns.md](references/component-patterns.md)
  - Smart vs. Presentational separation, Compound Components via `provide()` / `inject()` with `InjectionKey<T>`, and Renderless / Headless UI patterns.
- **Performance & Reactivity Pitfalls**: [references/performance-and-pitfalls.md](references/performance-and-pitfalls.md)
  - `ref()` vs `shallowRef()`, memory leak prevention, computed caching rules, and DOM virtualization strategies.

### Reference Implementations
- **Reusable Modal UI Component**: [examples/BaseModal.vue](examples/BaseModal.vue) (Teleport, transitions, keyboard events, `defineModel`, slots)
- **Generic Data Table Component**: [examples/GenericDataTable.vue](examples/GenericDataTable.vue) (Generic `<script setup generic="T">`, `defineSlots`, sorting, selection)
- **Reusable Filter Composable**: [examples/useFilterableList.ts](examples/useFilterableList.ts) (`MaybeRefOrGetter`, search, multi-field filtering, pagination)
- **Async State & Fetching Composable**: [examples/useAsyncState.ts](examples/useAsyncState.ts) (AbortController, error handling, `onScopeDispose`)

---

## 1. Single File Component (SFC) Standards

Every Vue SFC must follow a standardized top-to-bottom layout:

```vue
<script setup lang="ts">
// 1. Vue core imports
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// 2. Third-party library & router/store imports
import { useRouter, useRoute } from 'vue-router'

// 3. Local components, composables, & utilities imports
import BaseButton from '@/components/ui/BaseButton.vue'
import { useFilterableList } from '@/composables/useFilterableList'

// 4. TypeScript interfaces & types
interface Props {
  title: string
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
}

// 5. Props & Emits declarations (using Vue 3.5 reactive destructuring)
const {
  title,
  disabled = false,
  variant = 'primary'
} = defineProps<Props>()

const emit = defineEmits<{
  (e: 'submit', payload: { id: string }): void
  (e: 'cancel'): void
}>()

// 6. Two-way bindings via defineModel (Vue 3.4+)
const search = defineModel<string>('search', { default: '' })

// 7. Reactive state (ref, shallowRef)
const isSubmitting = ref(false)

// 8. Computed properties
const buttonClasses = computed(() => [
  'font-semibold rounded-xl transition-colors',
  variant === 'primary' ? 'bg-stone-900 text-white hover:bg-black' : 'bg-stone-100 text-stone-700'
])

// 9. Watchers & lifecycle hooks
onMounted(() => {
  // Setup logic
})

// 10. Event handlers & methods
const handleSubmit = async () => {
  if (disabled || isSubmitting.value) return
  isSubmitting.value = true
  try {
    emit('submit', { id: 'item-1' })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="component-wrapper">
    <!-- Clean semantic markup -->
    <header class="flex items-center justify-between pb-4">
      <h2 class="text-lg font-bold text-stone-900">{{ title }}</h2>
      <slot name="actions" />
    </header>

    <main>
      <slot :loading="isSubmitting" />
    </main>
  </div>
</template>

<style scoped>
/* Scoped styles only for animations or rules not expressible in utility CSS */
</style>
```

---

## 2. Core Coding Rules & Best Practices

### 2.1. Props & Two-Way Binding
1. **Always use compile-time typed `defineProps<Props>()`**:
   - Destructure directly to assign default values.
   - Do NOT wrap destructured props in `toRefs()` in Vue 3.5+, as reactive props destructuring is native and compiler-optimized.
2. **Use `defineModel()` instead of manual `modelValue` + `update:modelValue`**:
   - Supports default values, modifiers, and multiple named models:
     ```typescript
     const activeTab = defineModel<string>('tab', { default: 'overview' })
     ```

### 2.2. Typed Emits & Events
- Declare event names and payload signatures strictly with `defineEmits<{ ... }>()`.
- Avoid string-array syntax (`defineEmits(['change'])`) because it sacrifices type safety.

### 2.3. Reactivity Preservation
- **Never destructure a reactive object directly**:
  ```typescript
  // ❌ BAD: Destructuring breaks reactivity!
  const { user, token } = reactiveState

  // ✅ GOOD: Use toRefs() or keep access via object.property
  const { user, token } = toRefs(reactiveState)

  // ✅ GOOD for Pinia stores: Use storeToRefs()
  const { user, token } = storeToRefs(userStore)
  ```
- **When passing reactive state to composables or utilities**:
  - Accept `MaybeRefOrGetter<T>` and resolve with `toValue(param)`.
  - Pass getter functions `() => prop.value` instead of raw primitives.

### 2.4. Lifecycle & Resource Cleanup
- Never leave timers, observers (`ResizeObserver`, `IntersectionObserver`), WebSockets, or global DOM listeners uncleaned.
- Register cleanup in `onUnmounted` or `onScopeDispose`:
  ```typescript
  onMounted(() => window.addEventListener('resize', handleResize))
  onUnmounted(() => window.removeEventListener('resize', handleResize))
  ```
- In watchers, prefer `onWatcherCleanup()` to abort pending network requests.

---

## 3. General Review Checklist for Vue SFCs

Before marking any Vue component task complete:

- [ ] Uses `<script setup lang="ts">` with clean, top-down section ordering.
- [ ] Props are strongly typed via TypeScript interface and destructured with defaults.
- [ ] Two-way data binding uses `defineModel()` where appropriate.
- [ ] Emits are strictly typed with payload signatures.
- [ ] All `v-for` loops use a unique, stable `:key` (never array index if the list can change).
- [ ] No side effects occur inside `computed()` getters.
- [ ] Large, read-only datasets utilize `shallowRef()` instead of `ref()`.
- [ ] Event listeners, intervals, and observers are cleaned up in `onUnmounted` or `onScopeDispose`.
- [ ] UI is fully accessible with semantic markup, proper ARIA attributes, and keyboard navigation.
