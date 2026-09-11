<script setup lang="ts">
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  highlight: {
    type: Boolean,
    default: false
  },
  borderColor: {
    type: String,
    default: '' // custom Tailwind border class
  }
})
</script>

<template>
  <div 
    :class="[
      borderColor ? borderColor : 'border-stone-200',
    ]"
    class="space-y-1 w-full text-left"
  >
    <span class="text-[10px] md:text-xs font-semibold text-stone-400 uppercase tracking-wider block">
      {{ label }}
    </span>
    <div 
      :class="[
        highlight ? 'text-amber-700' : 'text-[#1c1917]'
      ]"
      class="text-2xl font-bold flex items-center space-x-1.5"
    >
      <span>{{ value }}</span>
      <slot name="suffix"></slot>
    </div>
    <span v-if="subtitle" class="text-[9.5px] text-stone-500 block font-semibold leading-relaxed">
      {{ subtitle }}
    </span>
  </div>
</template>
