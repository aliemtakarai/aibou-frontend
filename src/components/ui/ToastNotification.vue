<script setup lang="ts">
import { watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Notifikasi'
  },
  message: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 3000
  },
  type: {
    type: String,
    default: 'success', // 'success' | 'error' | 'warning' | 'info'
    validator: (value: string) => ['success', 'error', 'warning', 'info'].includes(value)
  }
})

const emit = defineEmits(['update:show', 'close'])

// Auto close toast after duration
watch(
  () => props.show,
  (newVal) => {
    if (newVal && props.duration > 0) {
      setTimeout(() => {
        emit('update:show', false)
        emit('close')
      }, props.duration)
    }
  }
)
</script>

<template>
  <transition name="toast-slide">
    <div 
      v-if="show" 
      class="fixed top-6 right-6 bg-[#0f172a] text-white text-xs px-5 py-3.5 rounded-2xl shadow-xl border border-slate-800 z-50 flex items-center space-x-3 backdrop-blur-md"
    >
      <!-- Indicator Dot based on type -->
      <span 
        :class="{
          'bg-[#bef264]': type === 'success',
          'bg-rose-500': type === 'error',
          'bg-amber-400': type === 'warning',
          'bg-blue-400': type === 'info'
        }"
        class="w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0"
      ></span>
      
      <div class="flex flex-col text-left">
        <span class="font-bold tracking-wide text-slate-100">{{ title }}</span>
        <span class="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-semibold">{{ message }}</span>
      </div>
      
      <!-- Close button -->
      <button 
        @click="emit('update:show', false); emit('close')" 
        class="text-slate-500 hover:text-slate-300 transition-colors pl-2 cursor-pointer font-bold text-sm leading-none"
      >
        &times;
      </button>
    </div>
  </transition>
</template>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-slide-enter-from {
  transform: translateY(-20px) scale(0.95);
  opacity: 0;
}
.toast-slide-leave-to {
  transform: translateY(20px) scale(0.95);
  opacity: 0;
}
</style>
