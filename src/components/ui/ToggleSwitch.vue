<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue'])

const toggle = () => {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <div class="flex items-center space-x-2 select-none">
    <div 
      @click="toggle"
      :class="[
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        size === 'sm' ? 'w-7.5 h-4' : 'w-8.5 h-4.5',
        modelValue ? 'bg-[#1c1917]' : 'bg-stone-200'
      ]"
      class="relative rounded-full transition-all duration-200"
    >
      <div 
        :class="[
          size === 'sm' ? 'h-3 w-3 top-[2px] left-[2px]' : 'h-3.5 w-3.5 top-[2px] left-[2px]',
          modelValue ? (size === 'sm' ? 'translate-x-3.5' : 'translate-x-4') : 'translate-x-0'
        ]"
        class="absolute bg-white rounded-full transition-transform duration-200 shadow-sm border border-stone-100"
      ></div>
    </div>
    <span 
      v-if="label" 
      :class="[
        disabled ? 'text-stone-400' : 'text-stone-700',
        size === 'sm' ? 'text-[9px]' : 'text-[9.5px]'
      ]"
      class="font-bold uppercase tracking-wider"
    >
      {{ label }}
    </span>
  </div>
</template>
