<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  mockMarketplaceTools, 
  mockAgents, 
  connectMarketplaceTool, 
  disconnectMarketplaceTool, 
  toggleAgentTool,
  mockAgentToolSettings,
  type MarketplaceTool 
} from '../utils/mockData'
import SvgIcon from '../components/ui/SvgIcon.vue'
import Card from '../components/ui/Card.vue'
import Button from '../components/ui/Button.vue'
import ToastNotification from '../components/ui/ToastNotification.vue'

const router = useRouter()

// Filter states
const searchQuery = ref('')
const selectedCategory = ref('Semua Kategori')
const selectedStatusFilter = ref('Semua')

// Categories list
const categories = [
  'Semua Kategori',
  'Spreadsheet',
  'Developer & Otomasi',
  'Sales & Marketing',
  'Customer Support',
  'Finance & Keuangan',
  'Notifikasi'
]

// Modal state for Global Connection Setup
const showConnectionModal = ref(false)
const selectedTool = ref<MarketplaceTool | null>(null)

// Form inputs inside modal
const modalAccount = ref('')
const modalEndpoint = ref('')
const modalSecretKey = ref('')
const modalPhoneId = ref('')
const modalWabaId = ref('')
const modalMerchantId = ref('')
const modalServerKey = ref('')
const modalEnvironment = ref('Sandbox')
const modalHostUrl = ref('')
const modalApiKey = ref('')
const modalSlackWebhook = ref('')
const modalSlackChannel = ref('#ai-leads')

// Ping testing state
const isPinging = ref(false)
const pingResult = ref<{ success: boolean; latency: string; message: string } | null>(null)

// Toast notification state
const showToast = ref(false)
const toastTitle = ref('Berhasil')
const toastMessage = ref('')

// User profile dropdown state
const showUserDropdown = ref(false)

// Filtered tools computed
const filteredTools = computed(() => {
  return mockMarketplaceTools.value.filter(tool => {
    // 1. Search filter
    const matchesSearch = 
      tool.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      tool.desc.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      tool.publisher.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    // 2. Category filter
    const matchesCategory = selectedCategory.value === 'Semua Kategori' || tool.category === selectedCategory.value

    // 3. Status filter
    let matchesStatus = true
    if (selectedStatusFilter.value === 'Terhubung') {
      matchesStatus = tool.connectionStatus === 'connected' || tool.connectionStatus === 'not_required'
    } else if (selectedStatusFilter.value === 'Belum Terhubung') {
      matchesStatus = tool.connectionStatus === 'disconnected' || tool.connectionStatus === 'error'
    } else if (selectedStatusFilter.value === 'Bawaan AI') {
      matchesStatus = !tool.requiresConnection
    }

    return matchesSearch && matchesCategory && matchesStatus
  })
})

const totalConnected = computed(() => {
  return mockMarketplaceTools.value.filter(t => t.connectionStatus === 'connected' || t.connectionStatus === 'not_required').length
})

const totalPending = computed(() => {
  return mockMarketplaceTools.value.filter(t => t.connectionStatus === 'disconnected' || t.connectionStatus === 'error').length
})

// Open connection setup modal
const openConnectionSetup = (tool: MarketplaceTool) => {
  selectedTool.value = tool
  pingResult.value = null
  
  // Pre-fill modal states based on tool details
  if (tool.id === 'sheets') {
    modalAccount.value = tool.connectionDetails.account || 'admin@aibou-enterprise.id'
  } else if (tool.id === 'webhook') {
    modalEndpoint.value = tool.connectionDetails.endpoint || 'https://api.n8n.cloud/webhook/aibou-lead'
    modalSecretKey.value = tool.connectionDetails.secretMasked || 'whsec_secret_key_8821'
  } else if (tool.id === 'whatsapp_alerts') {
    modalPhoneId.value = tool.connectionDetails.phoneId || 'WA-PHONE-6281234567890'
    modalWabaId.value = tool.connectionDetails.wabaId || 'WABA-9988127391'
  } else if (tool.id === 'midtrans') {
    modalMerchantId.value = tool.connectionDetails.merchantId || 'M109281'
    modalServerKey.value = tool.connectionDetails.serverKey || 'SB-Mid-server-xYxZm0cK12'
    modalEnvironment.value = tool.connectionDetails.environment || 'Sandbox'
  } else if (tool.id === 'n8n_node') {
    modalHostUrl.value = tool.connectionDetails.hostUrl || 'https://n8n.my-business.internal'
    modalApiKey.value = tool.connectionDetails.apiKeyMasked || 'n8n_api_key_44a2'
  } else if (tool.id === 'slack') {
    modalSlackWebhook.value = tool.connectionDetails.endpoint || 'https://hooks.slack.com/services/T00/B00/XXXXX'
    modalSlackChannel.value = tool.connectionDetails.channel || '#ai-leads'
  }

  showConnectionModal.value = true
}

// Test Connection (Ping)
const testConnection = (tool?: MarketplaceTool) => {
  const target = tool || selectedTool.value
  if (!target) return

  isPinging.value = true
  pingResult.value = null

  setTimeout(() => {
    isPinging.value = false
    const latencyVal = `${Math.floor(Math.random() * 35) + 25}ms`
    pingResult.value = {
      success: true,
      latency: latencyVal,
      message: `Koneksi ke ${target.name} sukses! Layanan merespons HTTP 200 OK (${latencyVal}).`
    }

    toastTitle.value = 'Koneksi Berhasil'
    toastMessage.value = `Uji ping ke ${target.name} sukses (${latencyVal}). Layanan siap digunakan!`
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 3500)
  }, 1000)
}

// Save connection config
const saveConnection = () => {
  if (!selectedTool.value) return

  const toolId = selectedTool.value.id
  let details: any = {}

  if (toolId === 'sheets') {
    details = {
      account: modalAccount.value,
      service: 'Google Workspace OAuth 2.0',
      statusMessage: 'Terautentikasi & Siap Digunakan'
    }
  } else if (toolId === 'webhook') {
    details = {
      endpoint: modalEndpoint.value,
      secretMasked: 'whsec_••••••••' + modalSecretKey.value.slice(-4),
      statusMessage: 'Endpoint Aktif (Respon HTTP 200 OK)'
    }
  } else if (toolId === 'whatsapp_alerts') {
    details = {
      phoneId: modalPhoneId.value,
      wabaId: modalWabaId.value,
      statusMessage: 'Koneksi Terverifikasi (Kualitas Nomor: High)'
    }
  } else if (toolId === 'midtrans') {
    details = {
      merchantId: modalMerchantId.value,
      environment: modalEnvironment.value,
      serverKey: modalServerKey.value,
      statusMessage: `Terhubung ke Midtrans (${modalEnvironment.value})`
    }
  } else if (toolId === 'n8n_node') {
    details = {
      hostUrl: modalHostUrl.value,
      apiKeyMasked: 'n8n_api_••••••••' + modalApiKey.value.slice(-4),
      statusMessage: 'Instance Online'
    }
  } else if (toolId === 'slack') {
    details = {
      endpoint: modalSlackWebhook.value,
      channel: modalSlackChannel.value,
      statusMessage: `Terhubung ke ${modalSlackChannel.value}`
    }
  }

  connectMarketplaceTool(toolId, details)
  
  toastTitle.value = 'Koneksi Tersimpan'
  toastMessage.value = `Koneksi global untuk ${selectedTool.value.name} berhasil disimpan dan aktif!`
  showToast.value = true
  showConnectionModal.value = false

  setTimeout(() => {
    showToast.value = false
  }, 3500)
}

// Disconnect connection
const handleDisconnect = () => {
  if (!selectedTool.value) return
  const toolName = selectedTool.value.name
  disconnectMarketplaceTool(selectedTool.value.id)

  toastTitle.value = 'Koneksi Diputuskan'
  toastMessage.value = `Koneksi ke ${toolName} telah diputuskan dari workspace.`
  showToast.value = true
  showConnectionModal.value = false

  setTimeout(() => {
    showToast.value = false
  }, 3500)
}

// Check if agent is assigned
const isAgentAssigned = (agentId: string, toolId: string) => {
  return mockAgentToolSettings.value[agentId]?.[toolId]?.applied || false
}

// Toggle assignment directly from marketplace
const handleToggleAgentAssignment = (agentId: string, toolId: string) => {
  toggleAgentTool(agentId, toolId)
}

// Helper to get agent name
const getAgent = (agentId: string) => {
  return mockAgents.value.find(a => a.id === agentId)
}
</script>

<template>
  <div class="min-h-screen bg-[#f4f7f6] text-[#0f172a] font-sans relative overflow-x-hidden">
    <!-- Toast Notification -->
    <ToastNotification 
      v-model:show="showToast"
      :title="toastTitle"
      :message="toastMessage"
      :duration="3500"
    />

    <!-- Ambient background glow -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(190,242,100,0.12),rgba(255,255,255,0))] pointer-events-none"></div>

    <!-- Top Navigation Header -->
    <header class="bg-white border-b border-slate-200/80 px-6 py-3.5 sticky top-0 z-30 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <!-- Logo & Navigation Links -->
        <div class="flex items-center space-x-8">
          <router-link to="/agents" class="flex items-center">
            <img src="/logo.png" alt="Aibou Logo" class="h-10 object-contain" />
          </router-link>

          <nav class="hidden md:flex items-center space-x-1">
            <router-link 
              to="/agents" 
              class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-[#0f172a] hover:bg-slate-100/70 transition-all flex items-center space-x-2"
            >
              <SvgIcon name="bot" className="w-4 h-4 text-slate-400" />
              <span>Daftar Agen AI</span>
            </router-link>

            <router-link 
              to="/tools" 
              class="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#bef264] text-[#0f172a] shadow-xs flex items-center space-x-2"
            >
              <SvgIcon name="store" className="w-4 h-4 text-[#0f172a]" />
              <span>Marketplace Alat</span>
              <span class="bg-[#0f172a] text-[#bef264] text-[9px] px-1.5 py-0.2 rounded-full font-black ml-1">{{ mockMarketplaceTools.length }}</span>
            </router-link>
          </nav>
        </div>

        <!-- Right Side: User Menu -->
        <div class="flex items-center space-x-4">
          <div class="hidden sm:flex items-center space-x-2 text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Workspace: <strong>Aibou Pro Team</strong></span>
          </div>

          <!-- User dropdown -->
          <div class="relative">
            <button 
              @click="showUserDropdown = !showUserDropdown"
              class="flex items-center space-x-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs cursor-pointer select-none"
            >
              <div class="w-6 h-6 rounded-full bg-[#bef264] flex items-center justify-center text-[#0f172a] text-[10px] font-black">
                AD
              </div>
              <span class="hidden sm:inline">Admin Aibou</span>
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <div 
              v-if="showUserDropdown" 
              class="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-40"
            >
              <router-link 
                to="/agents" 
                class="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-bold flex items-center space-x-2"
                @click="showUserDropdown = false"
              >
                <SvgIcon name="bot" className="w-3.5 h-3.5 text-slate-400" />
                <span>Konsol Agen</span>
              </router-link>
              <button 
                @click="router.push('/login')"
                class="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-bold flex items-center space-x-2 border-t border-slate-100 cursor-pointer"
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
      
      <!-- Top Title & Architecture Banner -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div class="flex items-center space-x-2 text-[#4d7c0f] text-xs font-bold uppercase tracking-wider mb-1">
            <span class="w-2 h-2 rounded-full bg-[#bef264]"></span>
            <span>Pengaturan Integrasi Terpusat</span>
          </div>
          <h1 class="text-3xl font-black text-[#0f172a] tracking-tight">Marketplace Alat & Koneksi Global</h1>
          <p class="text-slate-500 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
            Hubungkan akun Google OAuth, kredensial API, dan gateway eksternal di sini. Di sisi agen, Anda cukup <strong>menerapkan alat</strong> dan mengatur parameter perilaku tanpa perlu setup kredensial ulang.
          </p>
        </div>

        <div class="flex items-center space-x-3">
          <router-link to="/agents">
            <Button variant="secondary" size="md">
              <SvgIcon name="arrow-left" className="w-3.5 h-3.5 mr-1" />
              <span>Kembali ke Agen</span>
            </Button>
          </router-link>
        </div>
      </div>

      <!-- Quick Stats Metrics Strip -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="p-4 sm:p-5" class="space-y-1">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Katalog Integrasi</span>
          <div class="flex items-baseline space-x-2">
            <span class="text-2xl font-black text-[#0f172a]">{{ mockMarketplaceTools.length }}</span>
            <span class="text-xs text-slate-500 font-semibold">Alat Tersedia</span>
          </div>
        </Card>

        <Card padding="p-4 sm:p-5" class="space-y-1 border-l-4 border-l-emerald-500">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Koneksi Workspace</span>
          <div class="flex items-baseline space-x-2">
            <span class="text-2xl font-black text-emerald-600">{{ totalConnected }}</span>
            <span class="text-xs text-slate-500 font-semibold">Siap Digunakan</span>
          </div>
        </Card>

        <Card padding="p-4 sm:p-5" class="space-y-1">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Perlu Setup Koneksi</span>
          <div class="flex items-baseline space-x-2">
            <span class="text-2xl font-black text-amber-600">{{ totalPending }}</span>
            <span class="text-xs text-slate-500 font-semibold">Belum Dihubungkan</span>
          </div>
        </Card>

        <Card padding="p-4 sm:p-5" class="space-y-1">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Protokol Gateway</span>
          <div class="flex items-center space-x-2 mt-1">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span class="text-xs font-black text-[#0f172a]">MCP Gateway v2.6</span>
          </div>
          <span class="text-[10px] text-slate-400 block mt-0.5">Latensi rerata ~34ms</span>
        </Card>
      </div>

      <!-- Marketplace Explorer Layout (Sidebar 3 cols + Main 9 cols) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left Filter Sidebar (3 cols) -->
        <aside class="lg:col-span-3 space-y-6">
          <!-- Search input card -->
          <Card padding="p-4" class="space-y-3">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Cari Alat</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <SvgIcon name="search" className="w-4 h-4" />
              </span>
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Cari Google, Webhook..."
                class="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl pl-9 pr-3 py-2 text-xs text-[#0f172a] focus:outline-none transition-all font-semibold"
              />
            </div>
          </Card>

          <!-- Status Filter -->
          <Card padding="p-4" class="space-y-3">
            <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Koneksi</div>
            <div class="space-y-1">
              <button 
                @click="selectedStatusFilter = 'Semua'"
                :class="selectedStatusFilter === 'Semua' ? 'bg-[#bef264] text-[#0f172a] font-extrabold shadow-2xs' : 'text-slate-600 hover:bg-slate-50 font-semibold'"
                class="w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between"
              >
                <span>Semua Alat</span>
                <span class="text-[10px] font-mono opacity-70">({{ mockMarketplaceTools.length }})</span>
              </button>

              <button 
                @click="selectedStatusFilter = 'Terhubung'"
                :class="selectedStatusFilter === 'Terhubung' ? 'bg-[#bef264] text-[#0f172a] font-extrabold shadow-2xs' : 'text-slate-600 hover:bg-slate-50 font-semibold'"
                class="w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between"
              >
                <span class="flex items-center space-x-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Terhubung / Siap</span>
                </span>
                <span class="text-[10px] font-mono opacity-70">({{ totalConnected }})</span>
              </button>

              <button 
                @click="selectedStatusFilter = 'Belum Terhubung'"
                :class="selectedStatusFilter === 'Belum Terhubung' ? 'bg-[#bef264] text-[#0f172a] font-extrabold shadow-2xs' : 'text-slate-600 hover:bg-slate-50 font-semibold'"
                class="w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between"
              >
                <span class="flex items-center space-x-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>Belum Terhubung</span>
                </span>
                <span class="text-[10px] font-mono opacity-70">({{ totalPending }})</span>
              </button>

              <button 
                @click="selectedStatusFilter = 'Bawaan AI'"
                :class="selectedStatusFilter === 'Bawaan AI' ? 'bg-[#bef264] text-[#0f172a] font-extrabold shadow-2xs' : 'text-slate-600 hover:bg-slate-50 font-semibold'"
                class="w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between"
              >
                <span>Bawaan AI Platform</span>
                <span class="text-[10px] font-mono opacity-70">(2)</span>
              </button>
            </div>
          </Card>

          <!-- Categories Filter -->
          <Card padding="p-4" class="space-y-3">
            <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori Integrasi</div>
            <div class="space-y-1">
              <button 
                v-for="cat in categories"
                :key="cat"
                @click="selectedCategory = cat"
                :class="selectedCategory === cat ? 'bg-[#bef264]/20 text-[#3f6212] border-l-4 border-[#3f6212] pl-2 font-extrabold' : 'text-slate-600 hover:bg-slate-50 pl-3 font-semibold'"
                class="w-full text-left py-2 rounded-lg text-xs transition-all cursor-pointer block truncate"
              >
                {{ cat }}
              </button>
            </div>
          </Card>
        </aside>

        <!-- Main Marketplace Tools Cards (9 cols) -->
        <section class="lg:col-span-9 space-y-6">
          
          <!-- Promo Featured Banner -->
          <Card rounded="rounded-3xl" padding="p-6 sm:p-7" class="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(190,242,100,0.15),transparent_70%)] pointer-events-none"></div>
            
            <div class="space-y-2 relative z-10 max-w-xl">
              <div class="flex items-center space-x-2">
                <span class="text-[9px] bg-[#bef264]/25 border border-[#bef264]/40 px-2 py-0.5 rounded text-[#bef264] font-extrabold tracking-widest uppercase">Pusat Integrasi</span>
                <span class="text-[10px] text-slate-400 font-medium">Model Context Protocol (MCP)</span>
              </div>
              <h2 class="text-xl font-black tracking-tight text-white">Hubungkan Sekali, Gunakan di Semua Agen AI</h2>
              <p class="text-slate-300 text-xs leading-relaxed">
                Kelola kredensial, token OAuth Google, dan webhook gateway secara aman di level organisasi. Setelah terhubung, setiap agen Anda bisa langsung menggunakannya dengan satu klik.
              </p>
            </div>

            <div class="relative z-10 flex-shrink-0 w-20 h-20 rounded-2xl bg-[#bef264]/10 border border-[#bef264]/20 flex items-center justify-center text-[#bef264] shadow-inner">
              <SvgIcon name="plug" className="w-10 h-10" />
            </div>
          </Card>

          <!-- Tools Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card 
              v-for="tool in filteredTools" 
              :key="tool.id"
              hoverable
              padding="p-5"
              class="flex flex-col justify-between group border-slate-200/90 transition-all duration-200"
            >
              <!-- Card Top Body -->
              <div class="space-y-4">
                <div class="flex items-start justify-between">
                  <!-- Icon with Glow -->
                  <div 
                    :class="tool.connectionStatus === 'connected' || tool.connectionStatus === 'not_required' ? 'bg-[#bef264]/20 border-[#bef264]/40 text-[#3f6212]' : 'bg-slate-100 border-slate-200 text-slate-500'"
                    class="w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 shadow-2xs"
                  >
                    <SvgIcon :name="tool.icon" className="w-6 h-6" />
                  </div>

                  <!-- Badge Status -->
                  <div class="flex flex-col items-end space-y-1">
                    <span 
                      v-if="tool.connectionStatus === 'connected'"
                      class="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Terhubung Global</span>
                    </span>
                    <span 
                      v-else-if="tool.connectionStatus === 'not_required'"
                      class="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>Bawaan Core AI</span>
                    </span>
                    <span 
                      v-else
                      class="inline-flex items-center space-x-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>Belum Terhubung</span>
                    </span>

                    <span class="text-[9.5px] font-mono text-slate-400">{{ tool.version }}</span>
                  </div>
                </div>

                <!-- Info -->
                <div class="space-y-1.5">
                  <div class="flex items-center space-x-2">
                    <h3 class="text-sm font-extrabold text-[#0f172a] group-hover:text-[#3f6212] transition-colors">{{ tool.name }}</h3>
                    <span v-if="tool.badge" class="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{{ tool.badge }}</span>
                  </div>
                  <span class="text-[10px] font-semibold text-slate-400 block">{{ tool.publisher }} &bull; {{ tool.category }}</span>
                  <p class="text-[11.5px] text-slate-600 leading-relaxed line-clamp-2">{{ tool.desc }}</p>
                </div>

                <!-- Global Connection Status Details Pill -->
                <div 
                  v-if="tool.connectionStatus === 'connected'"
                  class="bg-slate-50 border border-slate-150 rounded-xl p-2.5 text-[10.5px] space-y-1 text-slate-600"
                >
                  <div class="flex items-center justify-between font-mono">
                    <span class="text-slate-400">Akun/Target:</span>
                    <span class="font-bold text-[#0f172a] truncate max-w-[170px]">{{ tool.connectionDetails.account || tool.connectionDetails.endpoint || tool.connectionDetails.phoneId || tool.connectionDetails.hostUrl }}</span>
                  </div>
                  <div class="flex items-center justify-between text-[10px]">
                    <span class="text-slate-400">Status Gateway:</span>
                    <span class="text-emerald-700 font-bold flex items-center space-x-1">
                      <span class="w-1 h-1 rounded-full bg-emerald-500"></span>
                      <span>{{ tool.connectionDetails.latency || 'Online' }}</span>
                    </span>
                  </div>
                </div>

                <!-- Assigned Agents Indicator -->
                <div class="pt-1 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span class="text-slate-400">Diterapkan ke Agen:</span>
                  <div class="flex items-center space-x-1.5">
                    <template v-if="tool.assignedAgentIds.length > 0">
                      <div class="flex -space-x-1.5">
                        <img 
                          v-for="agentId in tool.assignedAgentIds"
                          :key="agentId"
                          :src="getAgent(agentId)?.avatar" 
                          :alt="getAgent(agentId)?.name"
                          :title="getAgent(agentId)?.name"
                          class="w-5 h-5 rounded-full border-2 border-white object-cover"
                        />
                      </div>
                      <span class="font-bold text-slate-700">{{ tool.assignedAgentIds.length }} Agen Aktif</span>
                    </template>
                    <span v-else class="text-slate-400 italic">Belum diterapkan ke agen</span>
                  </div>
                </div>
              </div>

              <!-- Card Bottom Actions -->
              <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-4">
                <span class="text-[10px] text-slate-400 font-bold">
                  {{ tool.installs }} pemasangan
                </span>

                <div class="flex items-center space-x-2">
                  <!-- Test ping button if connected -->
                  <Button 
                    v-if="tool.connectionStatus === 'connected'"
                    @click="testConnection(tool)"
                    :loading="isPinging"
                    variant="secondary"
                    size="sm"
                    title="Uji koneksi ke endpoint"
                  >
                    <SvgIcon name="refresh" className="w-3 h-3 text-slate-500" />
                    <span>Uji</span>
                  </Button>

                  <!-- Connect / Manage Button -->
                  <Button 
                    v-if="tool.requiresConnection"
                    @click="openConnectionSetup(tool)"
                    :variant="tool.connectionStatus === 'connected' ? 'secondary' : 'primary'"
                    size="sm"
                  >
                    <SvgIcon :name="tool.connectionStatus === 'connected' ? 'cog' : 'plug'" className="w-3.5 h-3.5 mr-1" />
                    <span v-if="tool.connectionStatus === 'connected'">Kelola Koneksi</span>
                    <span v-else>Atur Koneksi</span>
                  </Button>

                  <span v-else class="text-[11px] font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
                    Siap Dipakai
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <!-- Empty State -->
          <Card v-if="filteredTools.length === 0" padding="p-16" class="text-center space-y-3">
            <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <SvgIcon name="search" className="w-6 h-6" />
            </div>
            <h3 class="text-sm font-bold text-slate-700">Tidak ada alat yang cocok dengan pencarian</h3>
            <p class="text-xs text-slate-400 max-w-sm mx-auto">Silakan coba kata kunci lain atau reset filter kategori di panel samping.</p>
          </Card>
        </section>

      </div>
    </main>

    <!-- GLOBAL CONNECTION SETUP MODAL -->
    <transition name="fade">
      <div 
        v-if="showConnectionModal && selectedTool" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      >
        <Card rounded="rounded-3xl" padding="p-0" shadow="shadow-2xl" class="w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col justify-between transform transition-all duration-200">
          
          <!-- Modal Header -->
          <div class="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-[#bef264]/20 border border-[#bef264]/30 rounded-2xl flex items-center justify-center text-[#3f6212]">
                <SvgIcon :name="selectedTool.icon" className="w-6 h-6" />
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="text-base font-black text-[#0f172a]">{{ selectedTool.name }}</h3>
                  <span class="text-[9px] bg-slate-200/70 text-slate-700 font-bold px-2 py-0.5 rounded uppercase">Setup Koneksi Global</span>
                </div>
                <p class="text-[10.5px] text-slate-400 mt-0.5">{{ selectedTool.publisher }} &bull; MCP Integrasi</p>
              </div>
            </div>

            <button 
              @click="showConnectionModal = false"
              class="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition-all cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Scrollable Body -->
          <div class="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            
            <!-- Explanatory note -->
            <div class="bg-blue-50/70 border border-blue-200/80 p-3.5 rounded-2xl flex items-start space-x-3 text-blue-900">
              <SvgIcon name="shield" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p class="text-[11px] leading-relaxed">
                <strong>Koneksi Workspace Terpusat:</strong> Anda sedang mengatur kredensial dan otentikasi level organisasi. Setelah terhubung, kredensial ini aman dan digunakan bersama oleh agen-agen yang diizinkan.
              </p>
            </div>

            <!-- Current Connection Status Pill -->
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span class="font-bold text-slate-700 block text-xs">Status Koneksi Saat Ini</span>
                <span class="text-[10px] text-slate-400">{{ selectedTool.connectionDetails.statusMessage || 'Siap dikonfigurasi' }}</span>
              </div>
              <div>
                <span 
                  v-if="selectedTool.connectionStatus === 'connected'"
                  class="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold"
                >
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Terhubung & Aktif</span>
                </span>
                <span 
                  v-else
                  class="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold"
                >
                  <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Belum Terhubung</span>
                </span>
              </div>
            </div>

            <!-- DYNAMIC CONNECTION SETUP FORM FIELDS -->

            <!-- 1. Google Sheets OAuth -->
            <div v-if="selectedTool.id === 'sheets'" class="space-y-4">
              <div class="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <img src="https://www.gstatic.com/images/branding/product/1x/sheets_2020q4_48dp.png" alt="Sheets" class="w-8 h-8" />
                    <div>
                      <span class="text-xs font-extrabold text-[#0f172a] block">Google Workspace OAuth 2.0</span>
                      <span class="text-[10px] text-slate-400">Izin Akses: spreadsheets & spreadsheets.readonly</span>
                    </div>
                  </div>
                  <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    OAuth Terverifikasi
                  </span>
                </div>

                <div class="space-y-1.5 pt-2 border-t border-slate-200/80">
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Akun Google Terhubung</label>
                  <input 
                    type="email" 
                    v-model="modalAccount" 
                    class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f172a] font-semibold"
                    placeholder="admin@aibou-enterprise.id"
                  />
                  <p class="text-[9.5px] text-slate-400">Akun ini memiliki hak akses untuk membuat dan mengedit spreadsheet tim.</p>
                </div>
              </div>
            </div>

            <!-- 2. Webhook Gateway -->
            <div v-if="selectedTool.id === 'webhook'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Endpoint URL Webhook Target</label>
                <input 
                  type="text" 
                  v-model="modalEndpoint" 
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-[#0f172a]"
                  placeholder="https://api.n8n.cloud/webhook/..."
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Secret Signing Key (Header Authorization)</label>
                <input 
                  type="password" 
                  v-model="modalSecretKey" 
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#0f172a]"
                  placeholder="whsec_••••••••"
                />
              </div>

              <!-- Test webhook ping -->
              <div class="pt-2 flex items-center space-x-3">
                <Button 
                  @click="testConnection()"
                  :loading="isPinging"
                  variant="secondary"
                  size="sm"
                >
                  <SvgIcon name="refresh" className="w-3.5 h-3.5 mr-1" />
                  <span>Kirim Tes Payload (Ping)</span>
                </Button>
                <span v-if="pingResult" class="text-[10px] text-emerald-700 font-bold">
                  {{ pingResult.message }}
                </span>
              </div>
            </div>

            <!-- 3. WhatsApp Business API Gateway -->
            <div v-if="selectedTool.id === 'whatsapp_alerts'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Meta Phone Number ID</label>
                <input 
                  type="text" 
                  v-model="modalPhoneId" 
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-[#0f172a]"
                  placeholder="WA-PHONE-6281234567890"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">WhatsApp Business Account ID (WABA ID)</label>
                <input 
                  type="text" 
                  v-model="modalWabaId" 
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#0f172a]"
                  placeholder="WABA-9988127391"
                />
              </div>
            </div>

            <!-- 4. Midtrans Payment Engine -->
            <div v-if="selectedTool.id === 'midtrans'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Environment Midtrans</label>
                <select 
                  v-model="modalEnvironment" 
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0f172a]"
                >
                  <option value="Sandbox">Sandbox (Uji Coba)</option>
                  <option value="Production">Production (Live)</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Merchant ID</label>
                <input 
                  type="text" 
                  v-model="modalMerchantId" 
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-[#0f172a]"
                  placeholder="M109281"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Server Key Midtrans</label>
                <input 
                  type="password" 
                  v-model="modalServerKey" 
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#0f172a]"
                  placeholder="SB-Mid-server-••••••••"
                />
              </div>
            </div>

            <!-- 5. n8n Node -->
            <div v-if="selectedTool.id === 'n8n_node'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Host URL n8n</label>
                <input 
                  type="text" 
                  v-model="modalHostUrl" 
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#0f172a]"
                  placeholder="https://n8n.my-business.internal"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">n8n API Key</label>
                <input 
                  type="password" 
                  v-model="modalApiKey" 
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#0f172a]"
                  placeholder="n8n_api_••••••••"
                />
              </div>
            </div>

            <!-- 6. Slack -->
            <div v-if="selectedTool.id === 'slack'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Incoming Webhook URL</label>
                <input 
                  type="text" 
                  v-model="modalSlackWebhook" 
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#0f172a]"
                  placeholder="https://hooks.slack.com/services/..."
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Channel Notifikasi Default</label>
                <input 
                  type="text" 
                  v-model="modalSlackChannel" 
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0f172a]"
                  placeholder="#ai-leads"
                />
              </div>
            </div>

            <!-- AGENT ASSIGNMENT SECTION (APPLY TOOLS TO AGENTS DIRECTLY) -->
            <div class="border-t border-slate-100 pt-5 space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-xs font-black text-[#0f172a]">Terapkan ke Agen AI</h4>
                  <p class="text-[10px] text-slate-400">Pilih agen mana saja yang diizinkan menggunakan integrasi ini.</p>
                </div>
                <span class="text-[10px] font-mono text-slate-500 font-bold">{{ selectedTool.assignedAgentIds.length }} Agen Terpilih</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div 
                  v-for="ag in mockAgents"
                  :key="ag.id"
                  @click="handleToggleAgentAssignment(ag.id, selectedTool.id)"
                  :class="isAgentAssigned(ag.id, selectedTool.id) ? 'bg-[#bef264]/15 border-[#bef264]/50' : 'bg-slate-50 border-slate-200 hover:bg-white'"
                  class="border rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all select-none"
                >
                  <div class="flex items-center space-x-2.5">
                    <img :src="ag.avatar" :alt="ag.name" class="w-7 h-7 rounded-full object-cover border border-slate-200" />
                    <div>
                      <span class="text-xs font-bold text-[#0f172a] block leading-tight">{{ ag.name }}</span>
                      <span class="text-[9px] text-slate-400">{{ ag.role }}</span>
                    </div>
                  </div>

                  <div 
                    :class="isAgentAssigned(ag.id, selectedTool.id) ? 'bg-[#bef264] border-[#3f6212] text-[#0f172a]' : 'bg-white border-slate-300 text-transparent'"
                    class="w-5 h-5 rounded-lg border flex items-center justify-center transition-colors"
                  >
                    <SvgIcon name="check" className="w-3 h-3 text-[#0f172a]" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div>
              <Button 
                v-if="selectedTool.connectionStatus === 'connected'"
                @click="handleDisconnect"
                variant="danger"
                size="sm"
              >
                Putuskan Koneksi
              </Button>
            </div>

            <div class="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                @click="showConnectionModal = false"
              >
                Batal
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                @click="saveConnection"
              >
                Simpan & Aktifkan Koneksi
              </Button>
            </div>
          </div>

        </Card>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
