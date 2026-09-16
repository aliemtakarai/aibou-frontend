<script setup lang="ts" generic="T extends Record<string, any>>">
import { ref, computed } from 'vue'

export interface Column<RowType> {
  key: string
  label: string
  sortable?: boolean
  width?: string
  formatter?: (val: any, row: RowType) => string
}

interface Props {
  data: T[]
  columns: Column<T>[]
  rowKey?: keyof T
  emptyText?: string
}

const {
  data,
  columns,
  rowKey = 'id' as keyof T,
  emptyText = 'No data available.'
} = defineProps<Props>()

// Two-way binding for selected rows
const selectedRows = defineModel<T[]>('selected', { default: () => [] })

// Typed slots via defineSlots
defineSlots<{
  [key: `cell-${string}`]: (props: { row: T; value: any; index: number }) => any
  empty?: () => any
  header?: (props: { column: Column<T> }) => any
}>()

// Sorting state
const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

const handleSort = (column: Column<T>) => {
  if (!column.sortable) return

  if (sortKey.value === column.key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = column.key
    sortOrder.value = 'asc'
  }
}

const sortedData = computed(() => {
  if (!sortKey.value) return data

  const key = sortKey.value
  const order = sortOrder.value === 'asc' ? 1 : -1

  return [...data].sort((a, b) => {
    const valA = a[key]
    const valB = b[key]

    if (valA == null) return 1
    if (valB == null) return -1

    if (typeof valA === 'number' && typeof valB === 'number') {
      return (valA - valB) * order
    }

    return String(valA).localeCompare(String(valB)) * order
  })
})
</script>

<template>
  <div class="w-full border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
    <table class="w-full text-left text-xs text-stone-700 border-collapse">
      <thead class="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
        <tr>
          <th 
            v-for="col in columns" 
            :key="col.key"
            :style="{ width: col.width }"
            class="p-3.5 select-none"
            :class="{ 'cursor-pointer hover:text-stone-900': col.sortable }"
            @click="handleSort(col)"
          >
            <div class="flex items-center space-x-1.5">
              <slot name="header" :column="col">
                <span>{{ col.label }}</span>
              </slot>
              <span v-if="col.sortable && sortKey === col.key" class="text-stone-900">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </div>
          </th>
        </tr>
      </thead>

      <tbody class="divide-y divide-stone-100 font-medium">
        <tr 
          v-for="(row, index) in sortedData" 
          :key="String(row[rowKey] ?? index)"
          class="hover:bg-stone-50/60 transition-colors"
        >
          <td 
            v-for="col in columns" 
            :key="col.key"
            class="p-3.5"
          >
            <!-- Dynamically scoped slot per column key: #cell-status="{ row, value }" -->
            <slot 
              :name="`cell-${col.key}`" 
              :row="row" 
              :value="row[col.key]" 
              :index="index"
            >
              {{ col.formatter ? col.formatter(row[col.key], row) : (row[col.key] ?? '—') }}
            </slot>
          </td>
        </tr>

        <!-- Empty State -->
        <tr v-if="sortedData.length === 0">
          <td :colspan="columns.length" class="p-8 text-center text-stone-400">
            <slot name="empty">
              {{ emptyText }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
