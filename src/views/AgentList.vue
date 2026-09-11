<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  mockAgents, 
  mockMarketplaceTools, 
  mockAgentToolSettings,
  mockTokenQuota,
  topUpTokens,
  updateTokenLimits 
} from '../utils/mockData'
import { useRouter, useRoute } from 'vue-router'
import StatCard from '../components/ui/StatCard.vue'
import ToastNotification from '../components/ui/ToastNotification.vue'
import Card from '../components/ui/Card.vue'
import Button from '../components/ui/Button.vue'
import SvgIcon from '../components/ui/SvgIcon.vue'
import ToggleSwitch from '../components/ui/ToggleSwitch.vue'

const router = useRouter()
const route = useRoute()

const selectAgent = (id: string) => {
  router.push(`/agent/${id}/chat`) // direct to chat console by default
}

const searchQuery = ref('')

const filteredAgents = computed(() => {
  if (!searchQuery.value.trim()) return mockAgents.value
  const q = searchQuery.value.toLowerCase()
  return mockAgents.value.filter(a => 
    a.name.toLowerCase().includes(q) || 
    a.role.toLowerCase().includes(q)
  )
})

const getAgentToolCount = (agentId: string) => {
  const settings = mockAgentToolSettings.value[agentId]
  if (!settings) return 0
  return Object.values(settings).filter(s => s.applied).length
}

const getAgentAppliedTools = (agentId: string) => {
  const settings = mockAgentToolSettings.value[agentId]
  if (!settings) return []
  const appliedIds = Object.keys(settings).filter(id => settings[id]?.applied)
  return mockMarketplaceTools.value.filter(t => appliedIds.includes(t.id))
}

// ----------------------------------------------------
// Token Limit & Usage Computed & State
// ----------------------------------------------------
const tokenUsagePercent = computed(() => {
  if (!mockTokenQuota.value.monthlyLimit) return 0
  return Math.min(100, Math.round((mockTokenQuota.value.usedTokens / mockTokenQuota.value.monthlyLimit) * 1000) / 10)
})

const remainingTokens = computed(() => {
  return Math.max(0, mockTokenQuota.value.monthlyLimit - mockTokenQuota.value.usedTokens)
})

const isNearTokenLimit = computed(() => {
  return tokenUsagePercent.value >= mockTokenQuota.value.alertThresholdPercent
})

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(num)
}

const formatCompactTokens = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Token Modals State
const showTokenSettingsModal = ref(false)
const showTopUpModal = ref(false)

// Token Settings Form State
const tempThreshold = ref(mockTokenQuota.value.alertThresholdPercent)
const tempHardStop = ref(mockTokenQuota.value.hardStopEnabled)
const tempDailyRate = ref(mockTokenQuota.value.dailyRateLimitPerAgent)
const tempAgentLimits = ref<Record<string, number>>({})

const openTokenSettings = () => {
  tempThreshold.value = mockTokenQuota.value.alertThresholdPercent
  tempHardStop.value = mockTokenQuota.value.hardStopEnabled
  tempDailyRate.value = mockTokenQuota.value.dailyRateLimitPerAgent
  tempAgentLimits.value = {}
  for (const [key, val] of Object.entries(mockTokenQuota.value.agentUsage)) {
    tempAgentLimits.value[key] = val.tokenLimit
  }
  showTokenSettingsModal.value = true
}

const saveTokenSettings = () => {
  updateTokenLimits(tempThreshold.value, tempHardStop.value, tempDailyRate.value, tempAgentLimits.value)
  showTokenSettingsModal.value = false
  globalToastMessage.value = 'Pengaturan batas kuota token berhasil diperbarui!'
  showGlobalToast.value = true
  setTimeout(() => { showGlobalToast.value = false }, 3000)
}

// Top Up Package State
const topUpPackages = [
  { amount: 500000, price: 'Rp 150.000', label: '+500.000 Token', badge: 'Standar' },
  { amount: 1000000, price: 'Rp 280.000', label: '+1.000.000 Token', badge: 'Hemat 15%' },
  { amount: 2500000, price: 'Rp 650.000', label: '+2.500.000 Token', badge: 'Terpopuler', popular: true }
]
const selectedTopUpAmount = ref(1000000)

const applyTopUp = () => {
  topUpTokens(selectedTopUpAmount.value)
  showTopUpModal.value = false
  globalToastMessage.value = `Berhasil menambah ${formatNumber(selectedTopUpAmount.value)} Token ke kuota workspace!`
  showGlobalToast.value = true
  setTimeout(() => { showGlobalToast.value = false }, 3500)
}

// Modal State
const showCreateModal = ref(false)
const newAgentName = ref('')
const newAgentRole = ref('')
const newAgentAvatar = ref('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80')

const createAgent = () => {
  if (!newAgentName.value.trim() || !newAgentRole.value.trim()) return

  // Create new agent and push to mockAgents ref
  const newId = `agent-${Date.now()}`
  mockAgents.value.push({
    id: newId,
    name: newAgentName.value,
    role: newAgentRole.value,
    avatar: newAgentAvatar.value
  })

  // Reset fields & close modal
  newAgentName.value = ''
  newAgentRole.value = ''
  showCreateModal.value = false
}

// Dropdown & Settings states
const showUserDropdown = ref(false)
const showSettingsModal = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const activeSettingsTab = ref<'password' | 'subscription'>('password')
const showSettingsToast = ref(false)
const settingsToastMessage = ref('')

const selectedPlan = ref('Ultra')

const selectPlan = (planName: string) => {
  if (selectedPlan.value === planName) return
  selectedPlan.value = planName
  settingsToastMessage.value = `Paket langganan berhasil diubah ke ${planName}!`
  showSettingsToast.value = true
  setTimeout(() => {
    showSettingsToast.value = false
  }, 2500)
}

const currentPlanDetails = computed(() => {
  if (selectedPlan.value === 'Pro') {
    return {
      name: 'Aibou Pro SaaS',
      price: 'Rp 1.499.000',
      tokenQuota: '1.000.000 Token / bulan',
      features: [
        'Hingga 3 Agen AI Aktif secara bersamaan.',
        'Kuata Token: 1.000.000 Token LLM per bulan.',
        'Basis Pengetahuan RAG (Maksimal 100 Dokumen Vektor).',
        'Integrasi Google Sheets & Webhook API dasar.'
      ]
    }
  } else if (selectedPlan.value === 'Ultra') {
    return {
      name: 'Aibou Ultra Premium',
      price: 'Rp 2.999.000',
      tokenQuota: '2.500.000 Token / bulan',
      features: [
        'Hingga 10 Agen AI Aktif secara bersamaan.',
        'Kuata Token: 2.500.000 Token LLM per bulan.',
        'Basis Pengetahuan RAG (Maksimal 1.000 Dokumen Vektor).',
        'Semua Koneksi Keahlian (Midtrans, WhatsApp Alerts, n8n).',
        'Prioritas Server Menengah (Kecepatan respon ~1.2s).'
      ]
    }
  } else {
    return {
      name: 'Aibou Max Enterprise',
      price: 'Rp 5.999.000',
      tokenQuota: '7.500.000 Token / bulan',
      features: [
        'Jumlah Agen AI Aktif Tanpa Batas.',
        'Kuata Token: 7.500.000 Token LLM per bulan.',
        'Basis Pengetahuan RAG & File Dokumen Tanpa Batas.',
        'Akses API developer mentah & pemicu workflow tak terbatas.',
        'Server Dedicated Utama dengan latensi super cepat (<1.0s).'
      ]
    }
  }
})

const openSettings = () => {
  showUserDropdown.value = false
  showSettingsModal.value = true
}

const triggerLogout = () => {
  showUserDropdown.value = false
  // Redirect to login page
  router.push('/login')
}

const updatePassword = () => {
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) return
  if (newPassword.value !== confirmPassword.value) {
    alert('Konfirmasi kata sandi baru tidak cocok!')
    return
  }
  
  settingsToastMessage.value = 'Kata sandi berhasil diperbarui!'
  showSettingsToast.value = true
  
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  
  setTimeout(() => {
    showSettingsToast.value = false
  }, 3000)
}

const showGlobalToast = ref(false)
const globalToastMessage = ref('')

onMounted(() => {
  if (route.query.welcome === 'true') {
    const planName = (route.query.plan as string) || 'Ultra'
    selectedPlan.value = planName
    globalToastMessage.value = `Paket Aibou ${planName} Anda telah aktif. Asisten Anda siap dikonfigurasi!`
    showGlobalToast.value = true
    
    // Clear URL query parameters silently
    router.replace({ query: {} })
    
    setTimeout(() => {
      showGlobalToast.value = false
    }, 5000)
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#f5f5f4] text-[#1c1917] font-sans relative overflow-x-hidden">
    <!-- Global Toast Notification -->
    <ToastNotification 
      v-model:show="showGlobalToast"
      title="Selamat Datang"
      :message="globalToastMessage"
      :duration="5000"
    />

    <!-- Ambient background glow (identical to Marketplace) -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(245,158,11,0.08),rgba(245,245,244,0))] pointer-events-none"></div>

    <!-- Top Navigation Header (Exact same full-width sticky bar as Marketplace) -->
    <header class="bg-white border-b border-stone-200/90 px-6 py-3.5 sticky top-0 z-30 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <!-- Logo & Navigation Links -->
        <div class="flex items-center space-x-8">
          <router-link to="/agents" class="flex items-center">
            <img src="/logo.png" alt="Aibou Logo" class="h-10 object-contain" />
          </router-link>

          <nav class="hidden md:flex items-center space-x-1">
            <router-link 
              to="/agents" 
              class="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#f59e0b] text-[#1c1917] shadow-xs flex items-center space-x-2"
            >
              <SvgIcon name="bot" className="w-4 h-4 text-[#1c1917]" />
              <span>Daftar Agen AI</span>
            </router-link>

            <router-link 
              to="/tools" 
              class="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-[#1c1917] hover:bg-stone-100 transition-all flex items-center space-x-2"
            >
              <SvgIcon name="store" className="w-4 h-4 text-stone-400" />
              <span>Marketplace Alat</span>
              <span class="bg-[#1c1917] text-[#f59e0b] text-[9px] px-1.5 py-0.2 rounded-full font-black ml-1">{{ mockMarketplaceTools.length }}</span>
            </router-link>

            <router-link 
              to="/tokens" 
              class="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-[#1c1917] hover:bg-stone-100 transition-all flex items-center space-x-2"
            >
              <SvgIcon name="gauge" className="w-4 h-4 text-stone-400" />
              <span>Penggunaan Token</span>
              <span class="bg-stone-200 text-stone-700 text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-1">{{ tokenUsagePercent }}%</span>
            </router-link>
          </nav>
        </div>

        <!-- Right Side: User Menu -->
        <div class="flex items-center space-x-4">
          <div class="hidden sm:flex items-center space-x-2 text-xs text-stone-500 font-semibold bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Workspace: <strong>Aibou Pro Team</strong></span>
          </div>

          <!-- User dropdown -->
          <div class="relative">
            <button 
              @click="showUserDropdown = !showUserDropdown"
              class="flex items-center space-x-2.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-700 shadow-2xs cursor-pointer select-none"
            >
              <div class="w-6 h-6 rounded-full bg-[#f59e0b] flex items-center justify-center text-[#1c1917] text-[10px] font-black">
                AD
              </div>
              <span class="hidden sm:inline">Admin Aibou</span>
              <svg class="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <div 
              v-if="showUserDropdown" 
              class="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-2xl shadow-xl py-2 z-40"
            >
              <router-link 
                to="/tools" 
                class="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 font-bold flex items-center space-x-2"
                @click="showUserDropdown = false"
              >
                <SvgIcon name="store" className="w-3.5 h-3.5 text-stone-400" />
                <span>Marketplace Alat</span>
              </router-link>
              <router-link 
                to="/tokens" 
                class="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 font-bold flex items-center space-x-2"
                @click="showUserDropdown = false"
              >
                <SvgIcon name="gauge" className="w-3.5 h-3.5 text-stone-400" />
                <span>Penggunaan Token</span>
              </router-link>
              <button 
                @click="openSettings"
                class="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 font-bold flex items-center space-x-2 cursor-pointer"
              >
                <SvgIcon name="cog" className="w-3.5 h-3.5 text-stone-400" />
                <span>Pengaturan Akun</span>
              </button>
              <button 
                @click="triggerLogout"
                class="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-bold flex items-center space-x-2 border-t border-stone-100 cursor-pointer"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Workspace Container (max-w-7xl identical to Marketplace) -->
    <main class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 relative z-10">
      
      <!-- Top Title & Action Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div class="flex items-center space-x-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Konsol Aibou v1.2</span>
          </div>
          <h1 class="text-3xl font-black text-[#1c1917] tracking-tight">Daftar Agen Percakapan AI</h1>
          <p class="text-stone-500 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
            Kelola agen AI, pantau interaksi kotak masuk, dan terapkan integrasi alat serta basis pengetahuan RAG secara terpusat.
          </p>
        </div>

        <div class="flex items-center space-x-3">
          <Button 
            @click="showCreateModal = true"
            variant="primary"
            size="md"
          >
            <span class="text-sm font-bold leading-none mr-1">+</span>
            <span>Pasang Agen Baru</span>
          </Button>
        </div>
      </div>

      <!-- Quick Stats Metrics Strip -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="p-4 sm:p-5" class="space-y-1">
          <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Total Agen Terdaftar</span>
          <div class="flex items-baseline space-x-2">
            <span class="text-2xl font-black text-[#1c1917]">{{ mockAgents.length }}</span>
            <span class="text-xs text-stone-500 font-semibold">Agen Aktif</span>
          </div>
        </Card>

        <Card padding="p-4 sm:p-5" class="space-y-1 border-l-4 border-l-amber-500">
          <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Obrolan Kotak Masuk</span>
          <div class="flex items-baseline space-x-2">
            <span class="text-2xl font-black text-amber-600">3</span>
            <span class="text-xs text-stone-500 font-semibold">Chat Live</span>
          </div>
        </Card>

        <Card padding="p-4 sm:p-5" class="space-y-1">
          <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Katalog Marketplace</span>
          <div class="flex items-baseline space-x-2">
            <span class="text-2xl font-black text-[#1c1917]">{{ mockMarketplaceTools.length }}</span>
            <span class="text-xs text-stone-500 font-semibold">Alat Tersedia</span>
          </div>
        </Card>

        <Card padding="p-4 sm:p-5" class="space-y-1">
          <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Status MCP Gateway</span>
          <div class="flex items-center space-x-2 mt-1">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span class="text-xs font-black text-[#1c1917]">Operasional</span>
          </div>
          <span class="text-[10px] text-stone-400 block mt-0.5">Semua node online</span>
        </Card>
      </div>

      <!-- SECTION: Token Limit and Usage Executive Summary -->
      <section class="space-y-3 pt-1">
        <Card padding="p-5 sm:p-6" class="border-stone-200 shadow-xs relative overflow-hidden bg-gradient-to-r from-white via-white to-amber-50/40">
          <div class="space-y-4">
            <!-- Header Row: Title, Plan Pill, Actions -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center space-x-3">
                <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-xs flex-shrink-0">
                  <SvgIcon name="gauge" className="w-5 h-5" />
                </div>
                <div>
                  <div class="flex items-center space-x-2">
                    <h2 class="text-sm sm:text-base font-black text-[#1c1917] tracking-tight">
                      Ringkasan Kuota Token AI
                    </h2>
                    <span class="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
                      {{ mockTokenQuota.planName }}
                    </span>
                    <span 
                      :class="isNearTokenLimit ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'"
                      class="text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase"
                    >
                      {{ isNearTokenLimit ? 'Mendekati Batas' : 'Normal' }}
                    </span>
                  </div>
                  <p class="text-[11px] text-stone-500 mt-0.5">
                    Kapasitas token LLM bulanan terpakai lintas seluruh asisten AI aktif di workspace.
                  </p>
                </div>
              </div>

              <!-- Top CTA Buttons -->
              <div class="flex items-center space-x-2 self-start sm:self-auto flex-shrink-0">
                <router-link 
                  to="/tokens"
                  class="inline-flex items-center justify-center font-bold transition-all select-none rounded-xl text-xs px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-[#1c1917] border border-stone-200 cursor-pointer shadow-xs"
                >
                  <SvgIcon name="chart-bar" className="w-3.5 h-3.5 text-stone-600 mr-1.5" />
                  <span>Lihat Detail & Analisis</span>
                  <span class="ml-1 text-stone-400">&rarr;</span>
                </router-link>

                <Button 
                  variant="primary" 
                  size="sm" 
                  @click="showTopUpModal = true"
                >
                  <SvgIcon name="plus" className="w-3.5 h-3.5 text-[#1c1917] mr-1" />
                  <span>Top Up</span>
                </Button>
              </div>
            </div>

            <!-- Numbers Strip & Compact Progress Bar -->
            <div class="bg-stone-50/90 border border-stone-200/80 rounded-2xl p-4 space-y-3">
              <!-- Big numbers row -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div class="flex items-baseline space-x-2.5">
                  <span class="text-2xl sm:text-3xl font-black text-[#1c1917] tracking-tight">
                    {{ formatNumber(mockTokenQuota.usedTokens) }}
                  </span>
                  <span class="text-xs sm:text-sm font-bold text-stone-400">
                    / {{ formatNumber(mockTokenQuota.monthlyLimit) }} Token
                  </span>
                  <span 
                    :class="isNearTokenLimit ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-amber-800 bg-amber-100 border-amber-300'"
                    class="text-xs font-black px-2 py-0.5 rounded-lg border font-mono ml-1"
                  >
                    {{ tokenUsagePercent }}% Terpakai
                  </span>
                </div>

                <!-- Quick KPI Badges -->
                <div class="flex flex-wrap items-center gap-2 text-xs">
                  <div class="bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-stone-600 shadow-2xs">
                    <span class="text-[10px] text-stone-400 mr-1">Sisa:</span>
                    <strong class="text-stone-900 font-mono">{{ formatCompactTokens(remainingTokens) }}</strong>
                  </div>
                  <div class="bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-stone-600 shadow-2xs">
                    <span class="text-[10px] text-stone-400 mr-1">Est:</span>
                    <strong class="text-stone-900 font-mono">~{{ Math.round(remainingTokens / mockTokenQuota.dailyAverage) }} Hari</strong>
                  </div>
                  <div class="bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-stone-600 shadow-2xs">
                    <span class="text-[10px] text-stone-400 mr-1">Hard Stop:</span>
                    <span :class="mockTokenQuota.hardStopEnabled ? 'text-emerald-700' : 'text-stone-400'" class="font-bold">
                      {{ mockTokenQuota.hardStopEnabled ? '100% Aktif' : 'Nonaktif' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Multi-Segment Progress Gauge -->
              <div class="space-y-1.5">
                <div class="h-3 w-full bg-stone-200/80 rounded-full overflow-hidden p-0.5 flex border border-stone-200 relative">
                  <!-- Prompt segment -->
                  <div 
                    :style="{ width: `${(mockTokenQuota.promptTokens / mockTokenQuota.monthlyLimit) * 100}%` }"
                    class="h-full bg-amber-500 rounded-l-full transition-all duration-500"
                    title="Prompt / Konteks RAG"
                  ></div>
                  <!-- Completion segment -->
                  <div 
                    :style="{ width: `${(mockTokenQuota.completionTokens / mockTokenQuota.monthlyLimit) * 100}%` }"
                    class="h-full bg-stone-800 transition-all duration-500"
                    title="Respon Generasi AI"
                  ></div>
                  <!-- RAG segment -->
                  <div 
                    :style="{ width: `${(mockTokenQuota.ragEmbeddingTokens / mockTokenQuota.monthlyLimit) * 100}%` }"
                    class="h-full bg-amber-300 rounded-r-full transition-all duration-500"
                    title="Vektor Embeddings RAG"
                  ></div>
                  <!-- 80% Threshold marker -->
                  <div 
                    :style="{ left: `${mockTokenQuota.alertThresholdPercent}%` }"
                    class="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
                    :title="`Batas Peringatan (${mockTokenQuota.alertThresholdPercent}%)`"
                  ></div>
                </div>

                <!-- Legend & Deep link text -->
                <div class="flex flex-wrap items-center justify-between text-[10px] text-stone-500 gap-2">
                  <div class="flex items-center gap-3">
                    <div class="flex items-center space-x-1">
                      <span class="w-2 h-2 rounded-xs bg-amber-500"></span>
                      <span>Prompt ({{ formatCompactTokens(mockTokenQuota.promptTokens) }})</span>
                    </div>
                    <div class="flex items-center space-x-1">
                      <span class="w-2 h-2 rounded-xs bg-stone-800"></span>
                      <span>Respon ({{ formatCompactTokens(mockTokenQuota.completionTokens) }})</span>
                    </div>
                    <div class="flex items-center space-x-1">
                      <span class="w-2 h-2 rounded-xs bg-amber-300"></span>
                      <span>RAG ({{ formatCompactTokens(mockTokenQuota.ragEmbeddingTokens) }})</span>
                    </div>
                  </div>

                  <div class="text-[10px] text-stone-400">
                    Siklus: <span class="font-mono text-stone-600 font-semibold">{{ mockTokenQuota.billingPeriodStart }} - {{ mockTokenQuota.billingPeriodEnd }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer summary row with highest user & link to detail page -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-500 pt-1 gap-2 border-t border-stone-100">
              <div class="flex items-center space-x-2 text-[11px]">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>
                  Konsumsi tertinggi: <strong class="text-stone-900 font-semibold">Budi Santoso (Customer Care)</strong> 
                  menggunakan <strong class="text-stone-900 font-mono">980.4K token (53.3%)</strong>
                </span>
              </div>

              <router-link 
                to="/tokens" 
                class="text-[11px] font-black text-amber-800 hover:text-amber-950 flex items-center space-x-1 group"
              >
                <span>Kelola alokasi per-agen, grafik harian & batas di halaman detail</span>
                <span class="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </router-link>
            </div>
          </div>
        </Card>
      </section>

      <!-- Search & Filter Bar for Agents -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div class="flex items-center space-x-2">
          <span class="text-xs font-black text-stone-700 uppercase tracking-wider">Semua Agen</span>
          <span class="text-[11px] bg-stone-200 text-stone-600 font-bold px-2 py-0.5 rounded-full">{{ filteredAgents.length }}</span>
        </div>

        <div class="relative w-full sm:w-72">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
            <SvgIcon name="search" className="w-3.5 h-3.5" />
          </span>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Cari agen berdasarkan nama / peran..." 
            class="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-[#1c1917] focus:outline-none focus:border-stone-400 font-semibold shadow-2xs"
          />
        </div>
      </div>

      <!-- Agents Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          v-for="agent in filteredAgents" 
          :key="agent.id"
          @click="selectAgent(agent.id)"
          hoverable
          clickable
          padding="p-6"
          class="group min-h-[220px] flex flex-col justify-between border-stone-200 transition-all duration-200"
        >
          <!-- Soft warm hover accent glow -->
          <div class="absolute -right-16 -top-16 w-32 h-32 bg-[#f59e0b]/5 rounded-full blur-2xl group-hover:bg-[#f59e0b]/10 transition-all duration-300"></div>

          <div class="space-y-4">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-3.5">
                <div class="relative">
                  <img 
                    :src="agent.avatar" 
                    :alt="agent.name" 
                    class="w-13 h-13 rounded-2xl object-cover border border-stone-200 group-hover:border-stone-300 transition-all shadow-sm"
                  />
                  <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h2 class="text-base font-extrabold text-[#1c1917] group-hover:text-amber-700 transition-colors leading-tight">
                    {{ agent.name }}
                  </h2>
                  <p class="text-stone-400 text-xs font-semibold mt-0.5 leading-snug line-clamp-1">{{ agent.role }}</p>
                </div>
              </div>

              <span class="bg-amber-100 text-amber-900 border border-amber-300 text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Aktif
              </span>
            </div>

            <!-- Applied Tools Pills -->
            <div class="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2 text-[10.5px]">
              <div class="flex items-center justify-between text-stone-500 font-medium">
                <span>Alat Marketplace:</span>
                <span class="font-bold text-[#1c1917]">{{ getAgentToolCount(agent.id) }} alat terpasang</span>
              </div>
              
              <div v-if="getAgentAppliedTools(agent.id).length > 0" class="flex flex-wrap gap-1.5 pt-0.5">
                <span 
                  v-for="t in getAgentAppliedTools(agent.id)"
                  :key="t.id"
                  class="bg-white border border-stone-200 text-stone-700 px-2 py-0.5 rounded-md font-semibold text-[10px] flex items-center space-x-1 shadow-2xs"
                >
                  <SvgIcon :name="t.icon" className="w-2.5 h-2.5 text-amber-700" />
                  <span>{{ t.name }}</span>
                </span>
              </div>
              <span v-else class="text-stone-400 italic block text-[10px]">Belum ada alat yang diterapkan</span>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
            <div class="flex items-center space-x-3 text-[11px]">
              <div class="flex items-center space-x-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span class="text-stone-500 font-medium">Kotak Masuk: <strong class="text-stone-800">2 aktif</strong></span>
              </div>
              <span class="text-stone-300">•</span>
              <div class="flex items-center space-x-1 text-stone-500 font-medium">
                <SvgIcon name="zap" className="w-3 h-3 text-amber-500" />
                <span class="font-mono">{{ formatCompactTokens(mockTokenQuota.agentUsage[agent.id]?.tokensUsed || 0) }}</span>
              </div>
            </div>
            <span class="text-stone-700 font-bold flex items-center space-x-1 group-hover:text-amber-700 group-hover:translate-x-1 transition-all">
              <span>Buka Dasbor</span>
              <span>&rarr;</span>
            </span>
          </div>
        </Card>

        <!-- Add Agent Placeholder Card -->
        <Card 
          @click="showCreateModal = true"
          clickable
          padding="p-6"
          class="border-2 border-dashed border-stone-200 hover:border-stone-300 min-h-[220px] flex flex-col items-center justify-center text-center group transition-all"
        >
          <div class="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 group-hover:text-stone-800 group-hover:scale-105 transition-all shadow-sm mb-3 text-xl font-bold">
            +
          </div>
          <h3 class="text-sm font-extrabold text-stone-800 group-hover:text-stone-900 transition-colors">Pasang Agen AI Baru</h3>
          <p class="text-stone-400 text-xs mt-1 max-w-[220px] leading-relaxed">Buat persona kustom baru, pilih gaya bicara, dan terapkan alat.</p>
        </Card>
      </div>
    </main>

    <!-- Create Agent Modal -->
    <div 
      v-if="showCreateModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
    >
      <Card shadow="shadow-2xl" class="w-full max-w-md space-y-6 relative">
        <button 
          @click="showCreateModal = false"
          class="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors text-xl font-bold cursor-pointer"
        >
          &times;
        </button>

        <div>
          <h3 class="text-base font-bold text-[#1c1917]">Pasang Agen AI</h3>
          <p class="text-stone-400 text-xs mt-1">Konfigurasikan nama dan peran khusus untuk asisten Anda.</p>
        </div>

        <div class="space-y-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-stone-500 uppercase tracking-wider">Nama Agen</label>
            <input 
              type="text" 
              v-model="newAgentName" 
              placeholder="contoh: Rian"
              class="w-full bg-[#f5f5f4] border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:border-stone-400 focus:outline-none placeholder-stone-400 transition-colors" 
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-stone-500 uppercase tracking-wider">Deskripsi Spesialisasi / Peran</label>
            <input 
              type="text" 
              v-model="newAgentRole" 
              placeholder="contoh: Spesialis Penjualan & Kualifikasi Prospek"
              class="w-full bg-[#f5f5f4] border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:border-stone-400 focus:outline-none placeholder-stone-400 transition-colors" 
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-stone-500 uppercase tracking-wider">URL Avatar (Opsional)</label>
            <input 
              type="text" 
              v-model="newAgentAvatar" 
              class="w-full bg-[#f5f5f4] border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-600 focus:border-stone-400 focus:outline-none font-mono transition-colors" 
            />
          </div>
        </div>

        <div class="flex items-center justify-end space-x-3 pt-2">
          <Button 
            variant="ghost" 
            @click="showCreateModal = false"
          >
            Batal
          </Button>
          <Button 
            variant="primary" 
            @click="createAgent"
            :disabled="!newAgentName.trim() || !newAgentRole.trim()"
          >
            Pasang Agen
          </Button>
        </div>
      </Card>
    </div>

    <!-- Settings Modal -->
    <div 
      v-if="showSettingsModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
    >
      <Card shadow="shadow-2xl" class="w-full max-w-2xl space-y-6 relative">
        <!-- Close Button -->
        <button 
          @click="showSettingsModal = false"
          class="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors text-xl font-bold cursor-pointer"
        >
          &times;
        </button>

        <!-- Toast Notification inside settings modal -->
        <ToastNotification 
          v-model:show="showSettingsToast"
          title="Notifikasi Pengaturan"
          :message="settingsToastMessage"
          :duration="2500"
        />

        <div>
          <h3 class="text-base font-bold text-[#1c1917]">Pengaturan Akun</h3>
          <p class="text-stone-400 text-xs mt-1">Ubah kata sandi akun Anda atau kelola paket langganan aktif.</p>
        </div>

        <!-- Body with Sidebar Menu on the Left Side -->
        <div class="flex flex-col sm:flex-row gap-6 min-h-[280px]">
          <!-- Left side: Vertical Tabs Navigation Menu -->
          <div class="w-full sm:w-44 flex flex-row sm:flex-col gap-2 sm:border-r sm:border-stone-200 sm:pr-4">
            <button 
              @click="activeSettingsTab = 'password'"
              :class="activeSettingsTab === 'password' ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold shadow-sm' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50 border-transparent'"
              class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none"
            >
              Ubah Kata Sandi
            </button>
            <button 
              @click="activeSettingsTab = 'subscription'"
              :class="activeSettingsTab === 'subscription' ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold shadow-sm' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50 border-transparent'"
              class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none"
            >
              Kelola Langganan
            </button>
          </div>

          <!-- Right side: Tab Panel Content -->
          <div class="flex-1 min-w-0">
            <!-- 1. Change Password Tab -->
            <div v-if="activeSettingsTab === 'password'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-stone-500 uppercase tracking-wider">Kata Sandi Saat Ini</label>
                <input 
                  type="password" 
                  v-model="currentPassword"
                  placeholder="••••••••"
                  class="w-full bg-[#f5f5f4] border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:border-stone-400 focus:outline-none placeholder-stone-400 transition-colors" 
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-stone-500 uppercase tracking-wider">Kata Sandi Baru</label>
                <input 
                  type="password" 
                  v-model="newPassword"
                  placeholder="Minimal 8 karakter"
                  class="w-full bg-[#f5f5f4] border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:border-stone-400 focus:outline-none placeholder-stone-400 transition-colors" 
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-stone-500 uppercase tracking-wider">Konfirmasi Kata Sandi Baru</label>
                <input 
                  type="password" 
                  v-model="confirmPassword"
                  placeholder="Ulangi kata sandi baru"
                  class="w-full bg-[#f5f5f4] border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:border-stone-400 focus:outline-none placeholder-stone-400 transition-colors" 
                />
              </div>

              <div class="flex justify-end pt-2">
                <Button 
                  @click="updatePassword"
                  :disabled="!currentPassword || !newPassword || !confirmPassword"
                >
                  Perbarui Kata Sandi
                </Button>
              </div>
            </div>

            <!-- 2. Subscription Tab -->
            <div v-if="activeSettingsTab === 'subscription'" class="space-y-5">
              <!-- Active Plan Details -->
              <Card padding="p-4" class="bg-[#f5f5f4]/70 border-stone-200 space-y-3">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-[9px] text-amber-900 font-bold uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">Paket Aktif</span>
                    <h4 class="text-xs font-black text-[#1c1917] mt-1.5">{{ currentPlanDetails.name }}</h4>
                  </div>
                  <div class="text-right">
                    <span class="text-xs font-extrabold text-[#1c1917]">{{ currentPlanDetails.price }}</span>
                    <span class="text-[9px] text-stone-400 block mt-0.5">/ bulan</span>
                  </div>
                </div>

                <div class="h-[1px] bg-stone-200"></div>

                <div class="grid grid-cols-2 gap-4 text-[10px] text-stone-500 font-bold">
                  <div>
                    Siklus Penagihan: <span class="text-stone-800 font-bold">Bulanan</span>
                  </div>
                  <div>
                    Pembaruan Berikutnya: <span class="text-stone-800 font-bold">05 Sept 2026</span>
                  </div>
                </div>
              </Card>

              <!-- Token Quota Summary inside Subscription Settings -->
              <Card padding="p-4" class="border-stone-200 bg-stone-50/50 space-y-2.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-stone-700 flex items-center space-x-1.5">
                    <SvgIcon name="gauge" className="w-3.5 h-3.5 text-amber-600" />
                    <span>Kuota Token Bulanan</span>
                  </span>
                  <span class="font-black text-[#1c1917] font-mono">{{ formatNumber(mockTokenQuota.usedTokens) }} / {{ formatNumber(mockTokenQuota.monthlyLimit) }}</span>
                </div>
                <div class="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    :style="{ width: `${tokenUsagePercent}%` }"
                    class="h-full bg-amber-500 rounded-full"
                  ></div>
                </div>
                <div class="flex justify-between text-[10px] text-stone-500">
                  <span>{{ tokenUsagePercent }}% Terpakai</span>
                  <span>Sisa: <strong class="text-stone-700">{{ formatCompactTokens(remainingTokens) }} Token</strong></span>
                </div>
              </Card>

              <!-- Package Tier Selector (Pro, Ultra, Max) -->
              <div class="space-y-2">
                <label class="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Pilih Paket Langganan</label>
                <div class="grid grid-cols-3 gap-3">
                  <!-- Pro Package -->
                  <Card 
                    @click="selectPlan('Pro')"
                    clickable
                    :class="selectedPlan === 'Pro' ? 'border-amber-500 bg-amber-500/10 shadow-2xs ring-1 ring-amber-500/30' : 'border-stone-200'"
                    padding="p-3"
                    class="text-center select-none flex flex-col justify-between"
                  >
                    <span class="text-xs font-black text-[#1c1917] block">Pro</span>
                    <span class="text-[10px] font-bold text-stone-500 mt-1 block">Rp 1.49M</span>
                    <span class="text-[8px] bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded mt-2 block font-extrabold" v-if="selectedPlan === 'Pro'">Aktif</span>
                    <span class="text-[8px] text-stone-400 mt-2 block font-bold hover:text-[#1c1917]" v-else>Pilih Pro</span>
                  </Card>

                  <!-- Ultra Package -->
                  <Card 
                    @click="selectPlan('Ultra')"
                    clickable
                    :class="selectedPlan === 'Ultra' ? 'border-amber-500 bg-amber-500/10 shadow-2xs ring-1 ring-amber-500/30' : 'border-stone-200'"
                    padding="p-3"
                    class="text-center select-none flex flex-col justify-between"
                  >
                    <span class="text-xs font-black text-[#1c1917] block">Ultra</span>
                    <span class="text-[10px] font-bold text-stone-500 mt-1 block">Rp 2.99M</span>
                    <span class="text-[8px] bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded mt-2 block font-extrabold" v-if="selectedPlan === 'Ultra'">Aktif</span>
                    <span class="text-[8px] text-stone-400 mt-2 block font-bold hover:text-[#1c1917]" v-else>Pilih Ultra</span>
                  </Card>

                  <!-- Max Package -->
                  <Card 
                    @click="selectPlan('Max')"
                    clickable
                    :class="selectedPlan === 'Max' ? 'border-amber-500 bg-amber-500/10 shadow-2xs ring-1 ring-amber-500/30' : 'border-stone-200'"
                    padding="p-3"
                    class="text-center select-none flex flex-col justify-between"
                  >
                    <span class="text-xs font-black text-[#1c1917] block">Max</span>
                    <span class="text-[10px] font-bold text-stone-500 mt-1 block">Rp 5.99M</span>
                    <span class="text-[8px] bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded mt-2 block font-extrabold" v-if="selectedPlan === 'Max'">Aktif</span>
                    <span class="text-[8px] text-stone-400 mt-2 block font-bold hover:text-[#1c1917]" v-else>Pilih Max</span>
                  </Card>
                </div>
              </div>

              <!-- Subscription Features List -->
              <div class="space-y-2">
                <label class="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Cakupan & Fitur Terpilih</label>
                <ul class="text-[10px] text-stone-600 space-y-1.5 pl-1 font-semibold">
                  <li 
                    v-for="(feature, fidx) in currentPlanDetails.features" 
                    :key="fidx" 
                    class="flex items-start space-x-2"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                    <span class="leading-normal">{{ feature }}</span>
                  </li>
                </ul>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center justify-between border-t border-stone-100 pt-4 gap-2">
                <Button 
                  variant="danger" 
                  size="sm"
                  @click="alert('Fitur pembatalan langganan sedang diproses.')"
                >
                  Batalkan Langganan
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  @click="alert('Membuka portal pembayaran...')"
                >
                  Kelola Metode Pembayaran
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- 1. Token Limits Configuration Modal -->
    <div 
      v-if="showTokenSettingsModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
    >
      <Card shadow="shadow-2xl" class="w-full max-w-lg space-y-6 relative max-h-[90vh] overflow-y-auto border-stone-200">
        <button 
          @click="showTokenSettingsModal = false"
          class="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors text-xl font-bold cursor-pointer"
        >
          &times;
        </button>

        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-xs">
            <SvgIcon name="sliders" className="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-black text-[#1c1917]">Konfigurasi Batas Kuota Token</h3>
            <p class="text-stone-400 text-xs mt-0.5">Atur ambang batas peringatan, proteksi over-budget, dan limit per agen.</p>
          </div>
        </div>

        <div class="space-y-5">
          <!-- Alert Threshold -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <label class="block text-xs font-bold text-stone-700">Ambang Batas Peringatan (Soft Alert)</label>
              <span class="text-xs font-black text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-mono">{{ tempThreshold }}% Kuota</span>
            </div>
            <p class="text-[10.5px] text-stone-400 leading-relaxed">Sistem akan memunculkan banner peringatan saat konsumsi token mencapai persentase ini.</p>
            <div class="grid grid-cols-3 gap-2.5 pt-1">
              <button
                v-for="thresh in [70, 80, 90]"
                :key="thresh"
                type="button"
                @click="tempThreshold = thresh"
                :class="tempThreshold === thresh ? 'bg-amber-100 border-amber-400 text-amber-900 font-extrabold shadow-xs' : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 font-semibold'"
                class="py-2.5 text-xs rounded-xl border transition-all cursor-pointer text-center"
              >
                {{ thresh }}%
              </button>
            </div>
          </div>

          <!-- Hard Stop Toggle -->
          <div class="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div class="space-y-0.5 pr-2">
              <span class="text-xs font-bold text-stone-800 block">Proteksi Hard Stop (100% Kuota)</span>
              <p class="text-[10.5px] text-stone-400 leading-relaxed">
                Otomatis menghentikan respon AI jika kuota bulanan habis total untuk mencegah tagihan di luar kendali.
              </p>
            </div>
            <ToggleSwitch v-model="tempHardStop" />
          </div>

          <!-- Daily Rate Limit per Agent -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-stone-700">Batas Kecepatan Harian (Daily Rate Limit)</label>
            <p class="text-[10.5px] text-stone-400">Maksimum token yang dapat dikonsumsi oleh satu agen dalam kurun 24 jam.</p>
            <div class="relative">
              <input 
                type="number" 
                v-model.number="tempDailyRate"
                step="5000"
                class="w-full bg-stone-50 border border-stone-200 rounded-xl pl-4 pr-32 py-2.5 text-xs text-[#1c1917] focus:outline-none focus:border-amber-500 font-mono font-bold"
              />
              <span class="absolute inset-y-0 right-0 pr-4 flex items-center text-[10px] text-stone-400 pointer-events-none font-bold">
                Token / Hari / Agen
              </span>
            </div>
          </div>

          <!-- Per-Agent Soft Caps -->
          <div class="space-y-2.5 pt-2 border-t border-stone-100">
            <label class="block text-xs font-bold text-stone-700">Alokasi Batas Maksimal Per Agen (Bulanan)</label>
            <div class="space-y-2">
              <div 
                v-for="agentItem in mockAgents" 
                :key="agentItem.id"
                class="flex items-center justify-between gap-3 bg-stone-50/70 border border-stone-200 p-2.5 rounded-xl text-xs"
              >
                <div class="flex items-center space-x-2.5 min-w-0">
                  <img :src="agentItem.avatar" class="w-6 h-6 rounded-full object-cover border border-stone-200" />
                  <span class="font-bold text-stone-800 truncate">{{ agentItem.name }}</span>
                </div>
                <div class="flex items-center space-x-1.5">
                  <input 
                    type="number" 
                    v-model.number="tempAgentLimits[agentItem.id]" 
                    step="50000"
                    class="w-32 bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-right font-mono font-bold text-stone-800 focus:outline-none focus:border-amber-500"
                  />
                  <span class="text-[10px] text-stone-400 font-medium">Token</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Action Buttons -->
          <div class="flex items-center justify-end space-x-2.5 pt-4 border-t border-stone-100">
            <Button variant="secondary" size="md" @click="showTokenSettingsModal = false">
              Batal
            </Button>
            <Button variant="primary" size="md" @click="saveTokenSettings">
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </Card>
    </div>

    <!-- 2. Top-Up Token Modal -->
    <div 
      v-if="showTopUpModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
    >
      <Card shadow="shadow-2xl" class="w-full max-w-md space-y-6 relative border-stone-200">
        <button 
          @click="showTopUpModal = false"
          class="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors text-xl font-bold cursor-pointer"
        >
          &times;
        </button>

        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-xs">
            <SvgIcon name="zap" className="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-black text-[#1c1917]">Beli Kuota Token Tambahan</h3>
            <p class="text-stone-400 text-xs mt-0.5">Tambah kuota token instan tanpa perlu menaikkan tier langganan utama.</p>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Top Up Packages Cards -->
          <div class="space-y-2.5">
            <div 
              v-for="pkg in topUpPackages" 
              :key="pkg.amount"
              @click="selectedTopUpAmount = pkg.amount"
              :class="selectedTopUpAmount === pkg.amount ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-xs' : 'border-stone-200 bg-white hover:bg-stone-50/60'"
              class="border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all relative"
            >
              <div class="space-y-0.5">
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-black text-[#1c1917]">{{ pkg.label }}</span>
                  <span 
                    v-if="pkg.badge"
                    :class="pkg.popular ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-stone-100 text-stone-600 border-stone-200'"
                    class="text-[9px] font-extrabold px-2 py-0.2 rounded-full border uppercase"
                  >
                    {{ pkg.badge }}
                  </span>
                </div>
                <p class="text-[10.5px] text-stone-400">Aktif instan & berlaku sepanjang siklus berjalan.</p>
              </div>

              <div class="text-right">
                <span class="text-sm font-black text-[#1c1917]">{{ pkg.price }}</span>
                <span class="text-[9px] text-stone-400 block">Sekali bayar</span>
              </div>
            </div>
          </div>

          <!-- Payment Summary -->
          <div class="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2 text-xs">
            <div class="flex justify-between text-stone-500">
              <span>Kuota saat ini:</span>
              <strong class="text-stone-800 font-mono">{{ formatNumber(mockTokenQuota.monthlyLimit) }} Token</strong>
            </div>
            <div class="flex justify-between text-stone-500">
              <span>Tambahan kuota baru:</span>
              <strong class="text-amber-800 font-mono">+{{ formatNumber(selectedTopUpAmount) }} Token</strong>
            </div>
            <div class="flex justify-between text-stone-800 pt-1.5 border-t border-stone-200 font-bold">
              <span>Total kuota setelah top-up:</span>
              <span class="text-[#1c1917] font-black font-mono">{{ formatNumber(mockTokenQuota.monthlyLimit + selectedTopUpAmount) }} Token</span>
            </div>
          </div>

          <!-- CTAs -->
          <div class="flex items-center justify-end space-x-2.5 pt-2">
            <Button variant="secondary" size="md" @click="showTopUpModal = false">
              Batal
            </Button>
            <Button variant="primary" size="md" @click="applyTopUp">
              <SvgIcon name="zap" className="w-4 h-4 mr-1 text-[#1c1917]" />
              <span>Konfirmasi & Tambah Kuota</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-slide-enter-from {
  transform: translateY(-20px) scale(0.95);
  opacity: 0;
}
.toast-slide-leave-to {
  transform: translateY(20px) scale(0.95);
  opacity: 0;
}
</style>

