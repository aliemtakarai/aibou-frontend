<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'danger', 'ghost', 'social'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  }
})

const classes = computed(() => {
  return [
    // Base styles
    'font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 select-none active:scale-98',
    props.disabled || props.loading 
      ? 'opacity-50 cursor-not-allowed pointer-events-none' 
      : 'cursor-pointer',
    props.fullWidth ? 'w-full' : '',
    
    // Size variants
    props.size === 'sm' ? 'px-3 py-2 text-[10px] rounded-lg' : '',
    props.size === 'md' ? 'px-4.5 py-2.5 text-xs' : '',
    props.size === 'lg' ? 'px-6 py-3 text-xs md:text-sm' : '',
    
    // Color style variants
    props.variant === 'primary' 
      ? 'bg-gradient-to-r from-[#0f172a] to-slate-800 hover:from-slate-900 hover:to-black text-white shadow-sm hover:shadow-[0_4px_15px_rgba(15,23,42,0.12)]' 
      : '',
    props.variant === 'secondary' 
      ? 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs' 
      : '',
    props.variant === 'danger' 
      ? 'text-red-655 hover:text-red-800 hover:bg-red-50/50' 
      : '',
    props.variant === 'ghost' 
      ? 'text-slate-500 hover:text-slate-750 hover:bg-slate-50' 
      : '',
    props.variant === 'social' 
      ? 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-750 shadow-2xs' 
      : ''
  ]
})
</script>

<template>
  <button 
    :type="variant === 'primary' ? 'submit' : 'button'"
    :disabled="disabled || loading"
    :class="classes"
  >
    <!-- Spinner loader -->
    <svg 
      v-if="loading" 
      class="animate-spin -ml-1 mr-2 h-4.5 w-4.5 text-current" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    
    <slot></slot>
  </button>
</template>
