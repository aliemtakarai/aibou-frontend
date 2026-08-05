<script setup lang="ts">
const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'error', // 'success' | 'error' | 'warning' | 'info'
    validator: (value: string) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  dismissible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
</script>

<template>
  <div 
    :class="{
      'bg-rose-50 border-rose-200 text-rose-700': type === 'error',
      'bg-emerald-50 border-emerald-200 text-emerald-800': type === 'success',
      'bg-amber-50 border-amber-200 text-amber-800': type === 'warning',
      'bg-blue-50 border-blue-200 text-blue-800': type === 'info'
    }"
    class="border text-xs px-4 py-3 rounded-xl flex items-center justify-between space-x-2.5 animate-fade-in"
  >
    <div class="flex items-center space-x-2.5">
      <!-- Error Icon -->
      <svg v-if="type === 'error'" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>

      <!-- Success Icon -->
      <svg v-else-if="type === 'success'" class="w-4 h-4 flex-shrink-0 text-emerald-600 animate-pulse" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>

      <!-- Warning Icon -->
      <svg v-else-if="type === 'warning'" class="w-4 h-4 flex-shrink-0 text-amber-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>

      <!-- Info Icon -->
      <svg v-else class="w-4 h-4 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>

      <span class="font-semibold leading-relaxed">{{ message }}</span>
    </div>

    <!-- Dismiss Button -->
    <button 
      v-if="dismissible" 
      @click="emit('close')"
      class="text-slate-450 hover:text-slate-700 transition-colors cursor-pointer text-sm font-bold pl-2"
    >
      &times;
    </button>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
