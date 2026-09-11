<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mockAgents, mockTokenQuota } from '../utils/mockData'
import SvgIcon from '../components/ui/SvgIcon.vue'

const route = useRoute()
const router = useRouter()

const agentId = computed(() => route.params.id as string)

const agent = computed(() => {
  return mockAgents.value.find(a => a.id === agentId.value)
})

const agentTokenUsage = computed(() => {
  return mockTokenQuota.value.agentUsage[agentId.value]
})

const agentUsagePercent = computed(() => {
  if (!agentTokenUsage.value || !agentTokenUsage.value.tokenLimit) return 0
  return Math.min(100, Math.round((agentTokenUsage.value.tokensUsed / agentTokenUsage.value.tokenLimit) * 100))
})

const goBack = () => {
  router.push('/agents')
}

// Icon keys map 1-to-1 with SvgIcon.vue names
const tabs = [
  { name: 'Studio Persona', shortName: 'Persona', path: 'persona', icon: 'bot' },
  { name: 'Pengetahuan (RAG)', shortName: 'RAG', path: 'knowledge', icon: 'book' },
  { name: 'Keahlian & Alat', shortName: 'Alat', path: 'skills', icon: 'plug' },
  { name: 'Manajer Jadwal', shortName: 'Jadwal', path: 'schedule', icon: 'calendar' },
  { name: 'Konsol Obrolan', shortName: 'Obrolan', path: 'chat', icon: 'chat' }
]
</script>

<template>
  <div class="min-h-screen bg-[#f5f5f4] text-[#1c1917] flex flex-col font-sans relative overflow-hidden">
    <!-- Soft warm amber gradient glow -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_-20%,rgba(245,158,11,0.06),rgba(245,245,244,0))] pointer-events-none"></div>

    <!-- Top Header -->
    <header class="bg-white border-b border-stone-200/90 px-6 py-4 flex items-center justify-between shadow-[0_2px_15px_rgba(0,0,0,0.015)] relative z-20">
      <div class="flex items-center space-x-4">
        <button 
          @click="goBack"
          class="bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-[#1c1917] px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-stone-200 hover:border-stone-300 flex items-center space-x-2 cursor-pointer"
        >
          <SvgIcon name="arrow-left" className="w-3.5 h-3.5" />
          <span>Konsol</span>
        </button>
        <div class="h-6 w-[1px] bg-stone-200"></div>
        <div v-if="agent" class="flex items-center space-x-3">
          <img :src="agent.avatar" :alt="agent.name" class="w-10 h-10 rounded-full object-cover border border-stone-200 shadow-sm" />
          <div>
            <div class="flex items-center space-x-2">
              <h2 class="text-sm font-bold text-[#1c1917] leading-none">{{ agent.name }}</h2>
              <span class="bg-amber-100 text-amber-900 text-[9px] px-2 py-0.5 rounded-full font-bold border border-amber-200 flex items-center space-x-1">
                <span class="w-1 h-1 rounded-full bg-amber-500"></span>
                <span>Aktif</span>
              </span>
            </div>
            <p class="text-[11px] text-stone-400 font-medium mt-1 leading-none">{{ agent.role }}</p>
          </div>
        </div>
      </div>
      
      <div class="flex items-center space-x-3">
        <router-link 
          to="/tools" 
          class="hidden sm:flex items-center space-x-1.5 text-xs font-bold text-stone-600 hover:text-[#1c1917] bg-stone-50 hover:bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-xl transition-all"
        >
          <SvgIcon name="store" className="w-3.5 h-3.5 text-stone-500" />
          <span>Marketplace Alat</span>
        </router-link>

        <div class="text-stone-400 text-xs hidden md:flex items-center space-x-2 font-medium">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span class="font-mono text-[10px] text-stone-500">Ruang Kerja: /aibou/{{ agentId }}</span>
        </div>
      </div>
    </header>

    <!-- Main Workspace -->
    <div class="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
      <!-- Tabs Sidebar Navigation (Hidden on Mobile & Tablet, Flex on Desktop) -->
      <aside class="hidden md:flex md:w-64 bg-white border-r border-stone-200/90 p-4 flex-col justify-between">
        <div class="space-y-1">
          <div class="text-[9px] font-bold text-stone-400 uppercase tracking-widest px-3 mb-3">Pengaturan Agen</div>
          
          <router-link
            v-for="tab in tabs"
            :key="tab.path"
            :to="`/agent/${agentId}/${tab.path}`"
            class="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:text-[#1c1917] hover:bg-stone-100 transition-all group border border-transparent"
            active-class="active-tab-style"
          >
            <SvgIcon :name="tab.icon" className="w-4 h-4 flex-shrink-0 text-stone-400 group-hover:text-stone-600 transition-colors" />
            <span>{{ tab.name }}</span>
          </router-link>
        </div>

        <!-- Bottom Section: Pinned to bottom of Sidebar -->
        <div class="space-y-3 pt-4 border-t border-stone-200">
          <!-- Compact Agent Token Usage Card -->
          <div v-if="agentTokenUsage" class="bg-stone-50 border border-stone-200/90 rounded-2xl p-3.5 space-y-2 shadow-2xs">
            <div class="flex items-center justify-between text-[10.5px]">
              <span class="text-stone-500 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <SvgIcon name="zap" className="w-3.5 h-3.5 text-amber-600" />
                <span>Token Agen</span>
              </span>
              <span class="font-mono font-bold text-stone-800">
                {{ (agentTokenUsage.tokensUsed / 1000).toFixed(1) }}K / {{ (agentTokenUsage.tokenLimit / 1000).toFixed(0) }}K
              </span>
            </div>
            
            <div class="h-1.5 w-full bg-stone-200/80 rounded-full overflow-hidden">
              <div 
                :style="{ width: `${agentUsagePercent}%` }"
                :class="agentUsagePercent >= 80 ? 'bg-amber-500' : 'bg-stone-700'"
                class="h-full rounded-full transition-all duration-300"
              ></div>
            </div>

            <div class="flex items-center justify-between text-[9.5px] text-stone-400 pt-0.5">
              <span>{{ agentUsagePercent }}% Terpakai</span>
              <router-link to="/tokens" class="text-amber-700 font-bold hover:underline">
                Rincian &rarr;
              </router-link>
            </div>
          </div>

          <!-- Quick Navigation Links (Tokens & Marketplace) -->
          <div class="space-y-1.5">
            <router-link
              to="/tokens"
              class="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-[#1c1917] hover:bg-stone-100 transition-all border border-stone-200 group"
            >
              <SvgIcon name="gauge" className="w-4 h-4 text-stone-400 group-hover:text-amber-700 transition-colors" />
              <span>Analisis Token</span>
              <span class="bg-amber-100 text-amber-900 border border-amber-200 text-[9px] px-1.5 py-0.2 rounded font-bold ml-auto">Kuota</span>
            </router-link>

            <router-link
              to="/tools"
              class="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-[#1c1917] hover:bg-stone-100 transition-all border border-stone-200 group"
            >
              <SvgIcon name="store" className="w-4 h-4 text-stone-400 group-hover:text-amber-700 transition-colors" />
              <span>Marketplace Alat</span>
              <span class="bg-stone-100 text-stone-600 border border-stone-200 text-[9px] px-1.5 py-0.2 rounded font-bold ml-auto">Global</span>
            </router-link>
          </div>
        </div>
      </aside>

      <!-- Active Tab View Outlet -->
      <main class="flex-1 overflow-auto bg-[#f5f5f4] p-4 sm:p-6 pb-28 md:pb-6 flex flex-col">
        <router-view />
      </main>

      <!-- Floating Bottom Tab Bar Navigation for Mobile & Tablet (Hidden on Desktop) -->
      <div class="flex md:hidden fixed bottom-4 inset-x-4 max-w-md mx-auto z-50 pointer-events-none">
        <nav class="w-full bg-white/95 backdrop-blur-md border border-stone-200 rounded-2xl p-1.5 flex items-center justify-around shadow-[0_8px_30px_rgba(0,0,0,0.08)] pointer-events-auto">
          <router-link
            v-for="tab in tabs"
            :key="tab.path"
            :to="`/agent/${agentId}/${tab.path}`"
            class="flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl text-stone-500 hover:text-stone-900 transition-all select-none group"
            active-class="mobile-active-tab-style"
          >
            <SvgIcon :name="tab.icon" className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-stone-400 group-hover:text-stone-600 transition-colors" />
            <span class="text-[9px] sm:text-[10px] font-bold mt-1 tracking-tight truncate">{{ tab.shortName }}</span>
          </router-link>
        </nav>
      </div>
    </div>
  </div>
</template>

<style>
.active-tab-style {
  background-color: #f59e0b !important;
  color: #1c1917 !important;
  font-weight: 700 !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25) !important;
}
.active-tab-style svg {
  color: #1c1917 !important;
}
.mobile-active-tab-style {
  background-color: #f59e0b !important;
  color: #1c1917 !important;
  font-weight: 700 !important;
  border-radius: 10px !important;
  box-shadow: 0 2px 10px rgba(245, 158, 11, 0.3) !important;
}
.mobile-active-tab-style svg {
  color: #1c1917 !important;
  transform: scale(1.05);
  transition: transform 0.2s ease;
}
</style>

