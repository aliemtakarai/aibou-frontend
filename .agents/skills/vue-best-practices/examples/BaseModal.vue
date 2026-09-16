<script setup lang="ts">
import { onMounted, onUnmounted, useId } from 'vue'

interface Props {
  title: string
  subtitle?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}

// Vue 3.5 Reactive Props Destructuring with defaults
const {
  title,
  subtitle = '',
  maxWidth = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true
} = defineProps<Props>()

// Two-way binding for modal visibility (v-model="showModal")
const isOpen = defineModel<boolean>({ default: false })

// Strongly typed emits
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

// Accessible IDs via Vue 3.5 useId()
const titleId = useId()
const descriptionId = useId()

const handleClose = () => {
  isOpen.value = false
  emit('close')
}

const handleBackdropClick = () => {
  if (closeOnBackdrop) {
    handleClose()
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (closeOnEscape && e.key === 'Escape' && isOpen.value) {
    handleClose()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl'
}[maxWidth]
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="subtitle ? descriptionId : undefined"
        @click.self="handleBackdropClick"
      >
        <div 
          class="w-full bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col transform transition-all"
          :class="maxWidthClasses"
        >
          <!-- Header -->
          <header class="flex items-start justify-between p-5 border-b border-stone-100">
            <div>
              <h3 :id="titleId" class="text-base font-bold text-stone-900 leading-tight">
                {{ title }}
              </h3>
              <p v-if="subtitle" :id="descriptionId" class="text-xs text-stone-500 mt-1">
                {{ subtitle }}
              </p>
            </div>

            <button 
              type="button" 
              class="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
              aria-label="Close modal"
              @click="handleClose"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <!-- Body -->
          <main class="p-5 text-xs text-stone-700 overflow-y-auto max-h-[70vh]">
            <slot />
          </main>

          <!-- Footer -->
          <footer class="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end space-x-2">
            <slot name="footer">
              <button 
                type="button" 
                class="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-200/60 transition-colors"
                @click="handleClose"
              >
                Cancel
              </button>
              <button 
                type="button" 
                class="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-black rounded-xl shadow-xs transition-colors"
                @click="emit('confirm')"
              >
                Confirm
              </button>
            </slot>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
