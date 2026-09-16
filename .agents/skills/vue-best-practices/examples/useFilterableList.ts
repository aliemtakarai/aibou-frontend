import { ref, computed, toValue, type MaybeRefOrGetter } from 'vue'

export interface FilterOptions<T> {
  searchFields?: (keyof T)[]
  initialSearch?: string
  initialPageSize?: number
  predicate?: (item: T) => boolean
}

/**
 * Universal composable for filtering, searching, and paginating arrays of items.
 * 
 * Demonstrates:
 * - MaybeRefOrGetter<T[]> for flexible reactive input sources
 * - toValue() for input normalization
 * - Pure computed derivations without side-effects
 */
export function useFilterableList<T extends Record<string, any>>(
  source: MaybeRefOrGetter<T[]>,
  options: FilterOptions<T> = {}
) {
  const {
    searchFields = [],
    initialSearch = '',
    initialPageSize = 10,
    predicate
  } = options

  const searchQuery = ref(initialSearch)
  const currentPage = ref(1)
  const pageSize = ref(initialPageSize)

  // Filtered dataset
  const filteredItems = computed(() => {
    const list = toValue(source)
    const query = searchQuery.value.trim().toLowerCase()

    return list.filter((item) => {
      // 1. Custom predicate filter
      if (predicate && !predicate(item)) {
        return false
      }

      // 2. Search query match
      if (!query) return true

      if (searchFields.length > 0) {
        return searchFields.some((field) => {
          const val = item[field]
          return val != null && String(val).toLowerCase().includes(query)
        })
      }

      // Default: search all string/number fields on item
      return Object.values(item).some((val) => {
        return val != null && String(val).toLowerCase().includes(query)
      })
    })
  })

  // Pagination
  const totalItems = computed(() => filteredItems.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize.value)))

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredItems.value.slice(start, start + pageSize.value)
  })

  const resetFilters = () => {
    searchQuery.value = ''
    currentPage.value = 1
  }

  const setPage = (page: number) => {
    currentPage.value = Math.max(1, Math.min(page, totalPages.value))
  }

  return {
    searchQuery,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    filteredItems,
    paginatedItems,
    resetFilters,
    setPage
  }
}
