<script setup lang="ts">
import { watch, computed } from 'vue'

interface Props {
  show: boolean
  title?: string
  message: string
  duration?: number
  type?: 'success' | 'error' | 'warning' | 'info'
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'
}

const {
  show,
  title = 'Notifikasi',
  message,
  duration = 3000,
  type = 'success',
  position = 'top-right'
} = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'close'): void
}>()

// Auto close toast after duration
watch(
  () => show,
  (newVal) => {
    if (newVal && duration > 0) {
      setTimeout(() => {
        emit('update:show', false)
        emit('close')
      }, duration)
    }
  }
)

const positionClasses = computed(() => {
  switch (position) {
    case 'top-center':
      return 'top-20 left-1/2 -translate-x-1/2'
    case 'bottom-right':
      return 'bottom-6 right-4 sm:right-6'
    case 'bottom-center':
      return 'bottom-6 left-1/2 -translate-x-1/2'
    case 'top-right':
    default:
      return 'top-20 right-4 sm:right-6'
  }
})
</script>

<template>
  <Teleport to="body">
    <transition name="toast-slide">
      <div 
        v-if="show" 
        :class="[
          'fixed z-[9999] bg-[#1c1917] text-white text-xs px-5 py-3.5 rounded-2xl shadow-2xl border border-stone-800 flex items-center space-x-3.5 backdrop-blur-md max-w-sm sm:max-w-md pointer-events-auto',
          positionClasses
        ]"
      >
        <!-- Indicator Dot based on type -->
        <span 
          :class="{
            'bg-amber-400': type === 'success',
            'bg-rose-500': type === 'error',
            'bg-amber-500': type === 'warning',
            'bg-stone-300': type === 'info'
          }"
          class="w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0"
        ></span>
        
        <div class="flex flex-col text-left min-w-0 pr-1">
          <span class="font-bold tracking-wide text-stone-100 truncate">{{ title }}</span>
          <span class="text-[11px] text-stone-400 mt-0.5 leading-relaxed font-semibold break-words">{{ message }}</span>
        </div>
        
        <!-- Close button -->
        <button 
          @click="emit('update:show', false); emit('close')" 
          class="text-stone-500 hover:text-stone-300 transition-colors pl-2 cursor-pointer font-bold text-sm leading-none flex-shrink-0"
        >
          &times;
        </button>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-slide-enter-from {
  transform: translateY(-16px) scale(0.95);
  opacity: 0;
}
.toast-slide-leave-to {
  transform: translateY(16px) scale(0.95);
  opacity: 0;
}
</style>
