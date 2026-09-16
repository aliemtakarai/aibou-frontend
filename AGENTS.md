# AGENTS.md — Aibou Frontend Development Guidelines

This document provides foundational rules, architectural conventions, and development guidelines for AI agents and human contributors working on `aibou-frontend`.

---

## 1. Project Overview & Tech Stack

`aibou-frontend` is the frontend application for **Aibou**, an enterprise AI conversation agent management platform featuring customizable agent personas, RAG knowledge base integration, third-party marketplace tools, token usage quotas, and live conversation consoles.

- **Framework**: [Vue 3.5+](https://vuejs.org/) (SFC `<script setup lang="ts">`, Composition API)
- **Language**: [TypeScript ~6.0](https://www.typescriptlang.org/) (`erasableSyntaxOnly`, strict checks)
- **Build Tool**: [Vite 8](https://vite.dev/) with `@vitejs/plugin-vue` and `@tailwindcss/vite`
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (`@import "tailwindcss";` with `@theme` config in `src/style.css`)
- **Routing**: [Vue Router](https://router.vuejs.org/) with HTML5 history mode and nested route layouts
- **State Management**: [Pinia](https://pinia.vuejs.org/) & centralized reactive utilities
- **Package Manager**: [Bun](https://bun.sh/) (`bun.lock`)

---

## 2. Workspace & Environment Rules

1. **Package Commands**:
   - Run dev server: `bun run dev`
   - Build preview: `bun run preview`
   - Typecheck & build: `bun run build` (`vue-tsc -b && vite build`)
2. **Terminal Execution Constraints**:
   - **Do NOT execute build or background commands without explicit user instruction.**
   - Preserve existing project files and user changes at all times.
3. **Language Conventions**:
   - **UI & Copy**: Indonesian (`Bahasa Indonesia`) is the standard user-facing language for text, placeholders, labels, toasts, and modal descriptions.
   - **Code & Comments**: English for variables, interfaces, functions, commit messages, and technical documentation.

---

## 3. Directory Structure & Architecture

```text
src/
├── assets/          # Static media (icons, SVGs, logos, hero images)
├── components/
│   └── ui/          # Reusable design system primitives (Button, Card, SvgIcon, etc.)
├── router/
│   └── index.ts     # Route definitions and route guards
├── utils/
│   └── mockData.ts  # Reactive mock datasets and shared helper operations
├── views/
│   ├── AgentDashboardLayout.vue  # Master layout for agent configuration tabs
│   ├── AgentList.vue             # Workspace agents overview & token summary
│   ├── ToolsMarketplace.vue      # Global integrations & tools catalog
│   ├── TokenUsageDetail.vue      # Detailed quota breakdowns & analytics
│   ├── Login.vue / Register.vue  # Authentication flows
│   ├── Onboarding.vue            # Workspace setup wizard
│   └── tabs/                     # Agent sub-tab views:
│       ├── AgentPersona.vue      # Identity, tone, and guardrails
│       ├── AgentKnowledge.vue    # RAG document management
│       ├── AgentSkills.vue       # Tool & integration parameter settings
│       ├── AgentSchedule.vue     # Operating hours & sync crons
│       └── AgentChatConsole.vue  # Live customer chat & sandbox debugger
├── App.vue          # Root shell component (<router-view />)
├── main.ts          # Application entrypoint & plugin mounting
└── style.css        # Tailwind v4 import & theme typography
```

### Component Categories
- **UI Primitives (`src/components/ui/`)**: Stateless or pure presentation components. Always expose customizable props (variant, size, state) and typed slots.
- **Feature Views (`src/views/`)**: Smart page containers responsible for routing context, fetching/mutating data, and orchestrating layouts.
- **Tab Modules (`src/views/tabs/`)**: Domain-specific panels rendered inside `AgentDashboardLayout`. Each tab manages its own localized sub-state and synchronizes with the parent agent ID.

---

## 4. Vue 3.5 & TypeScript Standards

### 4.1. Single File Component (SFC) Layout
Always structure `.vue` files in the standard order:
```vue
<script setup lang="ts">
// 1. Vue core imports
// 2. Router / Pinia / third-party library imports
// 3. Local components & utilities imports
// 4. Type definitions
// 5. Props & Emits (using Vue 3.5 reactive destructuring)
// 6. Reactive state (ref, shallowRef, computed)
// 7. Watchers & lifecycle hooks
// 8. Methods & event handlers
</script>

<template>
  <!-- Semantic markup with Tailwind CSS classes -->
</template>

<style scoped>
/* Only component-specific transitions / animations not feasible in Tailwind */
</style>
```

### 4.2. Vue 3.5 Typed Props & Emits
- Prefer compile-time typed `defineProps<{ ... }>()` with default values via Vue 3.5 reactive props destructuring:
  ```typescript
  // Recommended in Vue 3.5:
  interface Props {
    title: string
    variant?: 'primary' | 'secondary' | 'danger'
    loading?: boolean
    modelValue?: string
  }

  const { title, variant = 'primary', loading = false } = defineProps<Props>()
  ```
- Use typed `defineEmits`:
  ```typescript
  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'change', id: string): void
    (e: 'close'): void
  }>()
  ```
- Use `defineModel()` for two-way bindings where applicable (`const model = defineModel<string>()`).

### 4.3. Type Safety & TypeScript Guidelines
- Enable explicit typing for complex objects. Avoid `any`; use `unknown` with type guards or define explicit interfaces.
- Separate type imports with `import type { ... } from '...'`.
- Keep reactive state immutable or updated via controlled helper functions.

---

## 5. UI Design System & Styling (Tailwind CSS v4)

The project follows a modern, warm, neutral aesthetic with amber accents:

- **Typography**: Plus Jakarta Sans (`font-sans`), loaded via Google Fonts in `index.html`.
- **Background**: Light stone canvas (`bg-[#f5f5f4]`) with white card surfaces (`bg-white`).
- **Primary Text**: Deep warm charcoal (`text-[#1c1917]`) and muted stone (`text-stone-500`, `text-stone-400`).
- **Accent Palette**:
  - Warm Amber: `#f59e0b` / `amber-500` / `amber-600` (buttons, active pills, badges)
  - Dark Charcoal: `#1c1917` / `stone-800` / `stone-900` (primary CTA buttons, headers)
  - Success / Live: `emerald-500` (active agents, connected tools, normal status)
  - Warning / Attention: `amber-500` (approaching quota limits, pending setup)
  - Danger / Alert: `rose-500` / `red-600` (hard stops, delete actions, errors)
- **Card Standards**: Use `Card.vue` (`rounded-2xl`, subtle border `border-stone-200/80`, light shadow `shadow-xs` or `shadow-2xs`).
- **Icons**: Prefer `SvgIcon.vue` for consistent rendering of SVG symbols.

---

## 6. Development & Refactoring Checklist

Before completing any task:
1. Ensure all new components use `<script setup lang="ts">` and TypeScript interfaces.
2. Verify reactive props or values are not detached from reactivity (avoid destructuring `ref` values without `toRefs` or `toValue`).
3. Ensure user-facing text matches Indonesian conversational SaaS terminology.
4. Clean up timers and event listeners in `onUnmounted` or via `onWatcherCleanup`.
5. Check that router navigation links work as expected.
6. Adhere strictly to the workspace skills in `.agents/skills/vue-best-practices/`.
