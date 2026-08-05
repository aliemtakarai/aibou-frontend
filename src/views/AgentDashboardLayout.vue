<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mockAgents } from '../utils/mockData'
import SvgIcon from '../components/ui/SvgIcon.vue'

const route = useRoute()
const router = useRouter()

const agentId = computed(() => route.params.id as string)

const agent = computed(() => {
  return mockAgents.value.find(a => a.id === agentId.value)
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
  <div class="min-h-screen bg-[#f4f7f6] text-[#0f172a] flex flex-col font-sans relative overflow-hidden">
    <!-- Soft light green gradient glow -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_-20%,rgba(190,242,100,0.08),rgba(255,255,255,0))] pointer-events-none"></div>

    <!-- Top Header -->
    <header class="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-[0_2px_15px_rgba(0,0,0,0.015)] relative z-20">
      <div class="flex items-center space-x-4">
        <button 
          @click="goBack"
          class="bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-[#0f172a] px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-slate-200 hover:border-slate-300 flex items-center space-x-2 cursor-pointer"
        >
          <SvgIcon name="arrow-left" className="w-3.5 h-3.5" />
          <span>Konsol</span>
        </button>
        <div class="h-6 w-[1px] bg-slate-200"></div>
        <div v-if="agent" class="flex items-center space-x-3">
          <img :src="agent.avatar" :alt="agent.name" class="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm" />
          <div>
            <div class="flex items-center space-x-2">
              <h2 class="text-sm font-bold text-[#0f172a] leading-none">{{ agent.name }}</h2>
              <span class="bg-[#bef264]/20 text-[#3f6212] text-[9px] px-2 py-0.5 rounded-full font-bold border border-[#bef264]/30 flex items-center space-x-1">
                <span class="w-1 h-1 rounded-full bg-[#a3e635]"></span>
                <span>Aktif</span>
              </span>
            </div>
            <p class="text-[11px] text-slate-400 font-medium mt-1 leading-none">{{ agent.role }}</p>
          </div>
        </div>
      </div>
      
      <div class="text-slate-450 text-xs hidden sm:flex items-center space-x-2 font-medium">
        <span class="w-1.5 h-1.5 rounded-full bg-[#a3e635]"></span>
        <span class="font-mono text-[10px] text-slate-500">Ruang Kerja: /aibou/{{ agentId }}</span>
      </div>
    </header>

    <!-- Main Workspace -->
    <div class="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
      <!-- Tabs Sidebar Navigation (Hidden on Mobile & Tablet, Flex on Desktop) -->
      <aside class="hidden md:flex md:w-64 bg-white border-r border-slate-200/80 p-4 flex-col justify-between">
        <div class="space-y-1">
          <div class="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">Pengaturan Agen</div>
          
          <router-link
            v-for="tab in tabs"
            :key="tab.path"
            :to="`/agent/${agentId}/${tab.path}`"
            class="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-655 hover:text-[#0f172a] hover:bg-slate-50 transition-all group border border-transparent"
            active-class="active-tab-style"
          >
            <SvgIcon :name="tab.icon" className="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span>{{ tab.name }}</span>
          </router-link>
        </div>

      </aside>

      <!-- Active Tab View Outlet -->
      <main class="flex-1 overflow-auto bg-[#f4f7f6] p-6 pb-24 md:pb-6 flex flex-col">
        <router-view />
      </main>

      <!-- Bottom Tab Bar Navigation for Mobile & Tablet (Hidden on Desktop) -->
      <nav class="flex md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 px-2 py-2 justify-around items-center z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] h-16">
        <router-link
          v-for="tab in tabs"
          :key="tab.path"
          :to="`/agent/${agentId}/${tab.path}`"
          class="flex flex-col items-center justify-center flex-1 py-1 text-slate-500 hover:text-slate-800 transition-all select-none"
          active-class="mobile-active-tab-style"
        >
          <SvgIcon :name="tab.icon" className="w-5 h-5 flex-shrink-0 text-slate-400" />
          <span class="text-[9px] font-bold mt-1 tracking-tight">{{ tab.shortName }}</span>
        </router-link>
      </nav>
    </div>
  </div>
</template>

<style>
.active-tab-style {
  background-color: #bef264 !important;
  color: #0f172a !important;
  font-weight: 700 !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(190, 242, 100, 0.15) !important;
}
.active-tab-style svg {
  color: #0f172a !important;
}
.mobile-active-tab-style {
  color: #0f172a !important;
}
.mobile-active-tab-style svg {
  color: #0f172a !important;
  transform: scale(1.1);
  transition: transform 0.2s ease;
}
</style>

