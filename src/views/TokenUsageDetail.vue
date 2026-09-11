<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  mockAgents, 
  mockMarketplaceTools, 
  mockTokenQuota, 
  topUpTokens, 
  updateTokenLimits 
} from '../utils/mockData'
import SvgIcon from '../components/ui/SvgIcon.vue'
import Card from '../components/ui/Card.vue'
import Button from '../components/ui/Button.vue'
import ToastNotification from '../components/ui/ToastNotification.vue'
import ToggleSwitch from '../components/ui/ToggleSwitch.vue'

const router = useRouter()

// Number formatting helpers
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

// Token Quota Computeds
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

// Simulated 7-day timeline data
const last7Days = ref([
  { day: 'Senin', date: '08 Sep', tokens: 58400, percent: 78 },
  { day: 'Selasa', date: '09 Sep', tokens: 62100, percent: 83 },
  { day: 'Rabu', date: '10 Sep', tokens: 59800, percent: 80 },
  { day: 'Kamis', date: '11 Sep', tokens: 67200, percent: 90 },
  { day: 'Jumat', date: '12 Sep', tokens: 71500, percent: 95 },
  { day: 'Sabtu', date: '13 Sep', tokens: 52000, percent: 69 },
  { day: 'Minggu', date: 'Hari ini', tokens: 61400, percent: 82, isToday: true }
])

// Dropdown & Toast State
const showUserDropdown = ref(false)
const showToast = ref(false)
const toastTitle = ref('Berhasil')
const toastMessage = ref('')

// Modals State
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
  toastTitle.value = 'Pengaturan Disimpan'
  toastMessage.value = 'Batas kuota token dan proteksi anggaran berhasil diperbarui!'
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
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
  toastTitle.value = 'Top Up Berhasil'
  toastMessage.value = `Berhasil menambah ${formatNumber(selectedTopUpAmount.value)} Token ke kuota workspace!`
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3500)
}
</script>

<template>
  <div class="min-h-screen bg-[#f5f5f4] text-[#1c1917] font-sans relative overflow-x-hidden">
    <!-- Toast Notification -->
    <ToastNotification 
      v-model:show="showToast"
      :title="toastTitle"
      :message="toastMessage"
      :duration="3500"
    />

    <!-- Ambient background glow -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(245,158,11,0.08),rgba(245,245,244,0))] pointer-events-none"></div>

    <!-- Top Navigation Header -->
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
              class="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-[#1c1917] hover:bg-stone-100 transition-all flex items-center space-x-2"
            >
              <SvgIcon name="bot" className="w-4 h-4 text-stone-400" />
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
              class="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#f59e0b] text-[#1c1917] shadow-xs flex items-center space-x-2"
            >
              <SvgIcon name="gauge" className="w-4 h-4 text-[#1c1917]" />
              <span>Penggunaan Token</span>
              <span class="bg-[#1c1917] text-[#f59e0b] text-[9px] px-1.5 py-0.2 rounded-full font-black ml-1">{{ tokenUsagePercent }}%</span>
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
                to="/agents" 
                class="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 font-bold flex items-center space-x-2"
                @click="showUserDropdown = false"
              >
                <SvgIcon name="bot" className="w-3.5 h-3.5 text-stone-400" />
                <span>Konsol Agen</span>
              </router-link>
              <router-link 
                to="/tools" 
                class="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 font-bold flex items-center space-x-2"
                @click="showUserDropdown = false"
              >
                <SvgIcon name="store" className="w-3.5 h-3.5 text-stone-400" />
                <span>Marketplace Alat</span>
              </router-link>
              <button 
                @click="router.push('/login')"
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

    <!-- Main Workspace Container -->
    <main class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 relative z-10">
      
      <!-- Top Title & Action Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div class="flex items-center space-x-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Manajemen Anggaran & Token AI</span>
          </div>
          <h1 class="text-3xl font-black text-[#1c1917] tracking-tight">Analisis & Batas Penggunaan Token</h1>
          <p class="text-stone-500 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
            Pantau rincian konsumsi token LLM bulanan, batasan operasional per agen, analitik tipe token, dan riwayat burn rate obrolan.
          </p>
        </div>

        <div class="flex items-center space-x-2.5">
          <Button 
            variant="secondary" 
            size="md" 
            @click="openTokenSettings"
          >
            <SvgIcon name="sliders" className="w-4 h-4 mr-1.5 text-stone-500" />
            <span>Atur Batasan Kuota</span>
          </Button>

          <Button 
            variant="primary" 
            size="md" 
            @click="showTopUpModal = true"
          >
            <SvgIcon name="plus" className="w-4 h-4 mr-1 text-[#1c1917]" />
            <span>+ Beli Kuota / Top Up</span>
          </Button>
        </div>
      </div>

      <!-- Warning Alert Banner (if near threshold) -->
      <div 
        v-if="isNearTokenLimit" 
        class="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start sm:items-center justify-between gap-4 text-xs text-amber-900 shadow-xs"
      >
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-800 font-black">
            !
          </div>
          <div>
            <span class="font-bold text-sm">Peringatan Kuota Token Workspace:</span>
            <p class="text-xs text-amber-800 mt-0.5">
              Konsumsi telah mencapai <strong>{{ tokenUsagePercent }}%</strong> dari batas bulanan {{ formatNumber(mockTokenQuota.monthlyLimit) }} token. Lakukan penambahan kuota agar agen tidak terhenti otomatis saat melayani pembeli.
            </p>
          </div>
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          @click="showTopUpModal = true"
          class="flex-shrink-0"
        >
          Top Up Kuota &rarr;
        </Button>
      </div>

      <!-- Quick Metrics Strip -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Metric 1: Monthly Limit -->
        <Card padding="p-4 sm:p-5" class="space-y-1">
          <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Batas Kuota Bulanan</span>
          <div class="flex items-baseline space-x-2">
            <span class="text-2xl font-black text-[#1c1917]">{{ formatNumber(mockTokenQuota.monthlyLimit) }}</span>
            <span class="text-xs text-stone-500 font-semibold">Token</span>
          </div>
          <span class="text-[10px] text-amber-700 font-bold block pt-0.5">{{ mockTokenQuota.planName }}</span>
        </Card>

        <!-- Metric 2: Used Tokens -->
        <Card padding="p-4 sm:p-5" class="space-y-1 border-l-4 border-l-amber-500">
          <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Token Terpakai</span>
          <div class="flex items-baseline space-x-2">
            <span class="text-2xl font-black text-amber-600">{{ formatNumber(mockTokenQuota.usedTokens) }}</span>
            <span class="text-xs text-stone-500 font-semibold">({{ tokenUsagePercent }}%)</span>
          </div>
          <span class="text-[10px] text-stone-400 block pt-0.5">Total pesan & RAG</span>
        </Card>

        <!-- Metric 3: Remaining Tokens -->
        <Card padding="p-4 sm:p-5" class="space-y-1">
          <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Sisa Token Tersedia</span>
          <div class="flex items-baseline space-x-2">
            <span class="text-2xl font-black text-[#1c1917]">{{ formatNumber(remainingTokens) }}</span>
            <span class="text-xs text-stone-500 font-semibold">Token</span>
          </div>
          <span class="text-[10px] text-emerald-700 font-bold block pt-0.5">Cukup ~{{ Math.round(remainingTokens / mockTokenQuota.dailyAverage) }} hari ke depan</span>
        </Card>

        <!-- Metric 4: Burn Rate -->
        <Card padding="p-4 sm:p-5" class="space-y-1">
          <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Rata-rata Konsumsi Harian</span>
          <div class="flex items-baseline space-x-2">
            <span class="text-2xl font-black text-[#1c1917]">{{ formatCompactTokens(mockTokenQuota.dailyAverage) }}</span>
            <span class="text-xs text-stone-500 font-semibold">Token / hari</span>
          </div>
          <span class="text-[10px] text-stone-400 block pt-0.5">Reset tgl {{ mockTokenQuota.billingPeriodEnd }}</span>
        </Card>
      </div>

      <!-- MAIN SECTION: Quota Gauge & Token Type Distribution -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left 8 cols: Big Interactive Progress Gauge & Type Cards -->
        <div class="lg:col-span-8 space-y-6">
          <Card padding="p-6 sm:p-8" class="space-y-6 border-stone-200">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <h3 class="text-sm font-black text-stone-900 uppercase tracking-widest">Meter Alokasi Kuota Token Bulanan</h3>
                <p class="text-[11px] text-stone-500 mt-0.5">Visualisasi proporsi token input, output, dan pembatas keamanan.</p>
              </div>
              <span class="text-xs font-mono font-bold bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1 rounded-full">
                {{ tokenUsagePercent }}% Terpakai
              </span>
            </div>

            <!-- Big Multi-Segment Progress Bar -->
            <div class="space-y-3">
              <div class="h-6 w-full bg-stone-100 rounded-full overflow-hidden p-1 flex border border-stone-200/90 relative shadow-inner">
                <!-- Segment 1: Prompt Tokens (Amber-500) -->
                <div 
                  :style="{ width: `${(mockTokenQuota.promptTokens / mockTokenQuota.monthlyLimit) * 100}%` }"
                  class="h-full bg-amber-500 rounded-l-full transition-all duration-500 relative cursor-pointer"
                  title="Prompt & Context"
                ></div>
                
                <!-- Segment 2: Completion Tokens (Stone-800) -->
                <div 
                  :style="{ width: `${(mockTokenQuota.completionTokens / mockTokenQuota.monthlyLimit) * 100}%` }"
                  class="h-full bg-stone-800 transition-all duration-500 relative cursor-pointer"
                  title="AI Generation"
                ></div>

                <!-- Segment 3: Vector Embeddings (Amber-300) -->
                <div 
                  :style="{ width: `${(mockTokenQuota.ragEmbeddingTokens / mockTokenQuota.monthlyLimit) * 100}%` }"
                  class="h-full bg-amber-300 rounded-r-full transition-all duration-500 relative cursor-pointer"
                  title="RAG Vector Embeddings"
                ></div>

                <!-- Marker for Alert Threshold -->
                <div 
                  :style="{ left: `${mockTokenQuota.alertThresholdPercent}%` }"
                  class="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
                >
                  <span class="absolute -top-6 -translate-x-1/2 text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded shadow-2xs">
                    Alert {{ mockTokenQuota.alertThresholdPercent }}%
                  </span>
                </div>
              </div>

              <!-- Bar Legend Row -->
              <div class="flex flex-wrap items-center justify-between text-xs text-stone-600 gap-4 pt-1">
                <div class="flex flex-wrap items-center gap-4">
                  <div class="flex items-center space-x-2">
                    <span class="w-3 h-3 rounded-md bg-amber-500"></span>
                    <span class="font-semibold">Prompt & Konteks RAG</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="w-3 h-3 rounded-md bg-stone-800"></span>
                    <span class="font-semibold">Respon / Generasi AI</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="w-3 h-3 rounded-md bg-amber-300"></span>
                    <span class="font-semibold">Vektor Embeddings</span>
                  </div>
                </div>

                <div class="text-stone-500 font-semibold">
                  Sisa: <strong class="text-[#1c1917] font-black">{{ formatNumber(remainingTokens) }} Token</strong>
                </div>
              </div>
            </div>

            <!-- 3 Detailed Token Type Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div class="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-1.5">
                <span class="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Prompt & Konteks</span>
                <span class="text-lg font-black text-[#1c1917] block font-mono">{{ formatNumber(mockTokenQuota.promptTokens) }}</span>
                <p class="text-[10.5px] text-stone-500">
                  {{ ((mockTokenQuota.promptTokens / mockTokenQuota.usedTokens) * 100).toFixed(1) }}% dari token terpakai. Berisi riwayat obrolan & instruksi sistem.
                </p>
              </div>

              <div class="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-1.5">
                <span class="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Generasi Respon AI</span>
                <span class="text-lg font-black text-[#1c1917] block font-mono">{{ formatNumber(mockTokenQuota.completionTokens) }}</span>
                <p class="text-[10.5px] text-stone-500">
                  {{ ((mockTokenQuota.completionTokens / mockTokenQuota.usedTokens) * 100).toFixed(1) }}% dari token terpakai. Kata-kata jawaban yang dikirim asisten.
                </p>
              </div>

              <div class="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-1.5">
                <span class="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Vektor Dokumen RAG</span>
                <span class="text-lg font-black text-[#1c1917] block font-mono">{{ formatNumber(mockTokenQuota.ragEmbeddingTokens) }}</span>
                <p class="text-[10.5px] text-stone-500">
                  {{ ((mockTokenQuota.ragEmbeddingTokens / mockTokenQuota.usedTokens) * 100).toFixed(1) }}% dari token terpakai. Digunakan saat melatih file PDF/Drive.
                </p>
              </div>
            </div>
          </Card>

          <!-- 7-Day Usage Timeline Chart -->
          <Card padding="p-6" class="space-y-4 border-stone-200">
            <div class="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h4 class="text-xs font-black text-stone-900 uppercase tracking-widest">Tren Konsumsi 7 Hari Terakhir</h4>
                <p class="text-[11px] text-stone-400 mt-0.5">Pantau lonjakan obrolan harian untuk mendeteksi waktu tersibuk toko.</p>
              </div>
              <span class="text-[10.5px] font-bold text-stone-500 font-mono">
                Rata-rata: {{ formatCompactTokens(mockTokenQuota.dailyAverage) }} / hari
              </span>
            </div>

            <!-- Visual Bar Chart -->
            <div class="pt-4 grid grid-cols-7 gap-3 items-end h-48 border-b border-stone-200 pb-4">
              <div 
                v-for="bar in last7Days" 
                :key="bar.day"
                class="flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                <!-- Tooltip hover -->
                <div class="opacity-0 group-hover:opacity-100 transition-opacity text-[9.5px] bg-[#1c1917] text-white px-2 py-1 rounded mb-2 font-mono whitespace-nowrap shadow-md pointer-events-none">
                  {{ formatNumber(bar.tokens) }} token
                </div>

                <!-- Bar element -->
                <div class="w-full bg-stone-100 rounded-t-xl h-full flex items-end p-1">
                  <div 
                    :style="{ height: `${bar.percent}%` }"
                    :class="bar.isToday ? 'bg-[#f59e0b]' : 'bg-stone-800 group-hover:bg-amber-600'"
                    class="w-full rounded-t-lg transition-all duration-300"
                  ></div>
                </div>

                <!-- Day label -->
                <div class="text-center mt-2">
                  <span class="text-[10px] font-bold block text-stone-800">{{ bar.day }}</span>
                  <span class="text-[8.5px] text-stone-400 block">{{ bar.date }}</span>
                </div>
              </div>
            </div>
          </Card>

        </div>

        <!-- Right 4 cols: Safety Rules & Policy Details -->
        <div class="lg:col-span-4 space-y-6">
          <Card padding="p-6" class="space-y-5 border-stone-200">
            <div class="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 class="text-xs font-black text-stone-900 uppercase tracking-widest">Proteksi & Aturan Anggaran</h3>
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <div class="space-y-3.5 text-xs">
              <!-- Item 1: Billing Period -->
              <div class="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-1">
                <span class="text-[10px] uppercase font-bold text-stone-400 block">Siklus Kuota Aktif</span>
                <strong class="text-stone-900 block font-mono">{{ mockTokenQuota.billingPeriodStart }} – {{ mockTokenQuota.billingPeriodEnd }}</strong>
                <span class="text-[10px] text-stone-500 block">Reset otomatis di awal bulan berikutnya.</span>
              </div>

              <!-- Item 2: Soft Alert -->
              <div class="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-1">
                <div class="flex justify-between items-center">
                  <span class="text-[10px] uppercase font-bold text-stone-400">Peringatan Kuota (Soft Alert)</span>
                  <span class="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">{{ mockTokenQuota.alertThresholdPercent }}% Kuota</span>
                </div>
                <p class="text-[10.5px] text-stone-600 leading-relaxed">
                  Email peringatan dan banner dasbor dipicu saat penggunaan menyentuh {{ mockTokenQuota.alertThresholdPercent }}%.
                </p>
              </div>

              <!-- Item 3: Hard Stop -->
              <div class="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-1">
                <div class="flex justify-between items-center">
                  <span class="text-[10px] uppercase font-bold text-stone-400">Proteksi Hard Stop</span>
                  <span 
                    :class="mockTokenQuota.hardStopEnabled ? 'text-emerald-800 bg-emerald-100 border-emerald-200' : 'text-stone-500 bg-stone-200'"
                    class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border"
                  >
                    {{ mockTokenQuota.hardStopEnabled ? 'Diaktifkan' : 'Nonaktif' }}
                  </span>
                </div>
                <p class="text-[10.5px] text-stone-600 leading-relaxed">
                  Mencegah lonjakan tagihan tak terduga dengan menghentikan panggilan LLM jika token mencapai 100%.
                </p>
              </div>

              <!-- Item 4: Daily Rate Limit -->
              <div class="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-1">
                <span class="text-[10px] uppercase font-bold text-stone-400 block">Batas Kecepatan Harian</span>
                <strong class="text-stone-900 block font-mono">{{ formatNumber(mockTokenQuota.dailyRateLimitPerAgent) }} Token / Hari / Agen</strong>
                <span class="text-[10px] text-stone-500 block">Membatasi konsumsi bila terjadi loop pesan bot di WhatsApp.</span>
              </div>
            </div>

            <!-- Action Button -->
            <div class="pt-2">
              <Button 
                variant="secondary" 
                fullWidth 
                size="md"
                @click="openTokenSettings"
              >
                <SvgIcon name="sliders" className="w-3.5 h-3.5 mr-1.5 text-stone-500" />
                <span>Ubah Kebijakan Anggaran</span>
              </Button>
            </div>
          </Card>
        </div>

      </div>

      <!-- SECTION: Per-Agent Detailed Table & Breakdown -->
      <Card padding="p-6" class="space-y-5 border-stone-200">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <h3 class="text-sm font-black text-stone-900 uppercase tracking-widest">Rincian Konsumsi Token Per Agen AI</h3>
            <p class="text-[11px] text-stone-400 mt-0.5">Daftar alokasi dan efisiensi respon masing-masing agen percakapan.</p>
          </div>
          <span class="text-xs font-bold text-stone-500">
            Total {{ Object.keys(mockTokenQuota.agentUsage).length }} Agen Terdaftar
          </span>
        </div>

        <!-- Table View -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-stone-200 text-[10px] text-stone-400 uppercase tracking-wider font-extrabold">
                <th class="py-3 px-3">Nama Agen</th>
                <th class="py-3 px-3">Token Terpakai</th>
                <th class="py-3 px-3">Batas Maksimal</th>
                <th class="py-3 px-3">% Alokasi Limit</th>
                <th class="py-3 px-3">Interaksi Pesan</th>
                <th class="py-3 px-3">Status Agen</th>
                <th class="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100 text-xs font-medium text-stone-700">
              <tr 
                v-for="agentItem in mockAgents" 
                :key="agentItem.id"
                class="hover:bg-stone-50/70 transition-colors"
              >
                <!-- Agent -->
                <td class="py-4 px-3">
                  <div class="flex items-center space-x-3">
                    <img :src="agentItem.avatar" :alt="agentItem.name" class="w-9 h-9 rounded-full object-cover border border-stone-200" />
                    <div>
                      <strong class="text-stone-900 block font-bold leading-tight">{{ agentItem.name }}</strong>
                      <span class="text-[10px] text-stone-400 block mt-0.5">{{ agentItem.role }}</span>
                    </div>
                  </div>
                </td>

                <!-- Used Tokens -->
                <td class="py-4 px-3 font-mono font-bold text-stone-900">
                  {{ formatNumber(mockTokenQuota.agentUsage[agentItem.id]?.tokensUsed || 0) }}
                  <span class="text-[9.5px] text-stone-400 block font-sans font-normal">
                    ({{ (((mockTokenQuota.agentUsage[agentItem.id]?.tokensUsed || 0) / mockTokenQuota.usedTokens) * 100).toFixed(1) }}% total workspace)
                  </span>
                </td>

                <!-- Limit Cap -->
                <td class="py-4 px-3 font-mono text-stone-600">
                  {{ formatCompactTokens(mockTokenQuota.agentUsage[agentItem.id]?.tokenLimit || 0) }} Token
                </td>

                <!-- Progress & Percent -->
                <td class="py-4 px-3 min-w-[140px]">
                  <div class="space-y-1.5">
                    <div class="flex justify-between text-[10px]">
                      <span class="font-bold text-stone-800 font-mono">
                        {{ Math.round(((mockTokenQuota.agentUsage[agentItem.id]?.tokensUsed || 0) / (mockTokenQuota.agentUsage[agentItem.id]?.tokenLimit || 1)) * 100) }}%
                      </span>
                    </div>
                    <div class="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        :style="{ width: `${Math.min(100, ((mockTokenQuota.agentUsage[agentItem.id]?.tokensUsed || 0) / (mockTokenQuota.agentUsage[agentItem.id]?.tokenLimit || 1)) * 100)}%` }"
                        :class="(mockTokenQuota.agentUsage[agentItem.id]?.tokensUsed || 0) >= (mockTokenQuota.agentUsage[agentItem.id]?.tokenLimit || 1) * 0.8 ? 'bg-amber-500' : 'bg-stone-800'"
                        class="h-full rounded-full transition-all duration-300"
                      ></div>
                    </div>
                  </div>
                </td>

                <!-- Chats Count -->
                <td class="py-4 px-3 text-stone-600 font-mono">
                  {{ formatNumber(mockTokenQuota.agentUsage[agentItem.id]?.conversationsCount || 0) }} sesi
                </td>

                <!-- Status Badge -->
                <td class="py-4 px-3">
                  <span 
                    :class="(mockTokenQuota.agentUsage[agentItem.id]?.tokensUsed || 0) >= (mockTokenQuota.agentUsage[agentItem.id]?.tokenLimit || 1) * 0.8 ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-50 text-emerald-800 border-emerald-200'"
                    class="text-[9.5px] font-bold px-2 py-0.5 rounded-full border uppercase"
                  >
                    {{ (mockTokenQuota.agentUsage[agentItem.id]?.tokensUsed || 0) >= (mockTokenQuota.agentUsage[agentItem.id]?.tokenLimit || 1) * 0.8 ? 'Mendekati Limit' : 'Aman' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="py-4 px-3 text-right">
                  <div class="flex items-center justify-end space-x-2">
                    <router-link :to="`/agent/${agentItem.id}/chat`">
                      <Button variant="secondary" size="sm">
                        Uji Chat
                      </Button>
                    </router-link>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

    </main>

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
