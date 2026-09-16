# Component Architecture & Design Patterns Guide

This guide details recommended component patterns in Vue 3.5+, from presentational separation to compound components and renderless components.

---

## 1. Presentational vs. Container Components

Maintain a clear distinction between dumb presentation components and smart containers:

| Dimension | Presentational (UI Primitives) | Container (Views & Controllers) |
| :--- | :--- | :--- |
| **Purpose** | How things look | How things work |
| **Location** | `src/components/ui/` | `src/views/` |
| **State** | Purely local UI state (open/closed, hover) | Domain data, network state, forms |
| **Data Source** | Props & slots | Stores, APIs, router params |
| **Reusability** | Highly reusable across projects | Application-specific |
| **Side Effects** | Emits events up; no network calls | Dispatches actions, executes mutations |

---

## 2. Compound Components with `provide()` / `inject()`

Compound components work together to provide an intuitive, flexible declarative API (e.g., `Tabs` + `TabList` + `TabPanel`, or `Accordion` + `AccordionItem`).

### 2.1. Typed Injection Keys
Always create a typed `InjectionKey<T>` using `Symbol()` in a shared types file:

```typescript
// types/tabs.ts
import type { InjectionKey, Ref } from 'vue'

export interface TabsContext {
  activeTab: Ref<string>
  registerTab: (id: string) => void
  selectTab: (id: string) => void
}

export const TabsKey: InjectionKey<TabsContext> = Symbol('TabsContext')
```

### 2.2. Parent Component (`Tabs.vue`)
```vue
<script setup lang="ts">
import { ref, provide } from 'vue'
import { TabsKey } from '@/types/tabs'

const modelValue = defineModel<string>({ required: true })

const selectTab = (id: string) => {
  modelValue.value = id
}

provide(TabsKey, {
  activeTab: modelValue,
  registerTab: (id: string) => { /* tracking */ },
  selectTab
})
</script>

<template>
  <div class="tabs-root">
    <slot />
  </div>
</template>
```

### 2.3. Child Component (`TabPanel.vue`)
```vue
<script setup lang="ts">
import { inject, computed } from 'vue'
import { TabsKey } from '@/types/tabs'

interface Props {
  value: string
}

const { value } = defineProps<Props>()

const context = inject(TabsKey)
if (!context) {
  throw new Error('TabPanel must be used inside a <Tabs> component.')
}

const isActive = computed(() => context.activeTab.value === value)
</script>

<template>
  <div v-show="isActive" role="tabpanel" class="tab-panel">
    <slot />
  </div>
</template>
```

---

## 3. Renderless / Headless Components

Renderless components manage behavior, accessibility, and state without rendering any HTML of their own, exposing slots with slot props:

```vue
<!-- HeadlessToggle.vue -->
<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  initial?: boolean
}

const { initial = false } = defineProps<Props>()
const on = ref(initial)

const toggle = () => { on.value = !on.value }
const set = (value: boolean) => { on.value = value }
</script>

<template>
  <slot :on="on" :toggle="toggle" :set="set" />
</template>
```

### Usage
```vue
<HeadlessToggle v-slot="{ on, toggle }">
  <button @click="toggle" :class="on ? 'bg-emerald-500' : 'bg-stone-300'">
    {{ on ? 'Enabled' : 'Disabled' }}
  </button>
</HeadlessToggle>
```

---

## 4. Controlled vs. Uncontrolled Components

- **Controlled**: Component state is fully driven by the parent via `v-model` (`defineModel`).
- **Uncontrolled with Default**: Component holds internal state, initialized via `default...` props, and notifies parents via emits.

Prefer **Controlled via `defineModel()` with a fallback**:
```typescript
const model = defineModel<boolean>({ default: false })
```
This allows the component to work both standalone and connected to a parent `v-model`.
