import type { MaybeRefOrGetter } from 'vue'
import type { Agent } from '@/utils/mockData'
import { useFilterableList } from './useFilterableList'

export interface AgentFilterOptions {
  initialSearch?: string
  selectedRole?: string
}

/**
 * Concrete domain example built on top of the universal `useFilterableList` composable.
 */
export function useAgentFilter(
  agentsSource: MaybeRefOrGetter<Agent[]>,
  options: AgentFilterOptions = {}
) {
  const {
    searchQuery,
    filteredItems: filteredAgents,
    resetFilters
  } = useFilterableList<Agent>(agentsSource, {
    searchFields: ['name', 'role'],
    initialSearch: options.initialSearch,
    predicate: (agent) => {
      if (!options.selectedRole || options.selectedRole === 'all') return true
      return agent.role.toLowerCase().includes(options.selectedRole.toLowerCase())
    }
  })

  return {
    searchQuery,
    filteredAgents,
    resetFilters
  }
}
