<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  glass: {
    type: Boolean,
    default: false
  },
  hoverable: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: false
  },
  padding: {
    type: String,
    default: 'p-6'
  },
  shadow: {
    type: String,
    default: 'shadow-sm'
  },
  rounded: {
    type: String,
    default: 'rounded-2xl'
  }
})

const classes = computed(() => {
  return [
    // Base styles
    'border transition-all duration-300 relative overflow-hidden',
    
    // Background and border modes
    props.glass 
      ? 'bg-white/80 border-slate-200/80 backdrop-blur-md' 
      : 'bg-white border-slate-200/80',
      
    // Shadows, padding, and borders
    props.shadow,
    props.rounded,
    props.padding,
    
    // Hover interactions
    props.hoverable 
      ? 'hover:border-slate-350 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]' 
      : '',
      
    // Click interactions
    props.clickable 
      ? 'cursor-pointer active:scale-99 hover:bg-slate-50/20' 
      : ''
  ]
})
</script>

<template>
  <div :class="classes">
    <slot></slot>
  </div>
</template>
