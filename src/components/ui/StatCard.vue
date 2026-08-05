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
      borderColor ? borderColor : 'border-slate-100',
    ]"
    class="space-y-1 w-full text-left"
  >
    <span class="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider block">
      {{ label }}
    </span>
    <div 
      :class="[
        highlight ? 'text-[#4d7c0f]' : 'text-[#0f172a]'
      ]"
      class="text-2xl font-bold flex items-center space-x-1.5"
    >
      <span>{{ value }}</span>
      <slot name="suffix"></slot>
    </div>
    <span v-if="subtitle" class="text-[9.5px] text-slate-450 block font-semibold leading-relaxed">
      {{ subtitle }}
    </span>
  </div>
</template>
