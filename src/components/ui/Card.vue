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
      ? 'bg-white/85 border-stone-200/80 backdrop-blur-md' 
      : 'bg-white border-stone-200/80',
      
    // Shadows, padding, and borders
    props.shadow,
    props.rounded,
    props.padding,
    
    // Hover interactions
    props.hoverable 
      ? 'hover:border-stone-300 hover:shadow-[0_8px_30px_rgba(41,37,36,0.05)]' 
      : '',
      
    // Click interactions
    props.clickable 
      ? 'cursor-pointer active:scale-99 hover:bg-stone-50/40' 
      : ''
  ]
})
</script>

<template>
  <div :class="classes">
    <slot></slot>
  </div>
</template>
