<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  mockAgents, 
  mockMarketplaceTools, 
  mockAgentToolSettings, 
  toggleAgentTool, 
  updateAgentToolSettings,
  type MarketplaceTool 
} from '../../utils/mockData'
import SvgIcon from '../../components/ui/SvgIcon.vue'
import Card from '../../components/ui/Card.vue'
import Button from '../../components/ui/Button.vue'
import ToggleSwitch from '../../components/ui/ToggleSwitch.vue'
import ToastNotification from '../../components/ui/ToastNotification.vue'

const route = useRoute()
const router = useRouter()

const agentId = computed(() => route.params.id as string)
const agent = computed(() => mockAgents.value.find(a => a.id === agentId.value))

// Filters state
const searchQuery = ref('')
const selectedCategory = ref('Semua Kategori')
const activeStatusTab = ref<'all' | 'applied' | 'unapplied'>('all')

// Toast notification state
const showToast = ref(false)
const toastTitle = ref('Berhasil')
const toastMessage = ref('')

// Agent Config Modal state (Configuring operational parameters for this agent)
const showConfigModal = ref(false)
const selectedTool = ref<MarketplaceTool | null>(null)
const tempSettings = ref<Record<string, any>>({})

// Categories
const categories = [
  'Semua Kategori',
  'Spreadsheet',
  'Developer & Otomasi',
  'Sales & Marketing',
  'Customer Support',
  'Finance & Keuangan',
  'Notifikasi'
]

// Ensure agent tool record exists
const getAgentToolConfig = (toolId: string) => {
  if (!mockAgentToolSettings.value[agentId.value]) {
    mockAgentToolSettings.value[agentId.value] = {}
  }
  return mockAgentToolSettings.value[agentId.value][toolId] || {
    toolId,
    applied: false,
    settings: {}
  }
}

// Is tool applied to this agent
const isApplied = (toolId: string) => {
  return getAgentToolConfig(toolId).applied
}

// Filtered tools list for this agent
const agentTools = computed(() => {
  return mockMarketplaceTools.value.filter(tool => {
    // 1. Search Query
    const matchesSearch = 
      tool.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      tool.desc.toLowerCase().includes(searchQuery.value.toLowerCase())

    // 2. Category
    const matchesCategory = selectedCategory.value === 'Semua Kategori' || tool.category === selectedCategory.value

    // 3. Applied Status Tab
    const toolApplied = isApplied(tool.id)
    let matchesTab = true
    if (activeStatusTab.value === 'applied') {
      matchesTab = toolApplied
    } else if (activeStatusTab.value === 'unapplied') {
      matchesTab = !toolApplied
    }

    return matchesSearch && matchesCategory && matchesTab
  })
})

const totalAppliedCount = computed(() => {
  return mockMarketplaceTools.value.filter(t => isApplied(t.id)).length
})

// Toggle tool application for this agent
const handleToggleTool = (tool: MarketplaceTool) => {
  // Guard: if tool requires connection and is not connected globally, warn the user!
  if (tool.requiresConnection && tool.connectionStatus !== 'connected') {
    toastTitle.value = 'Perlu Setup di Marketplace'
    toastMessage.value = `${tool.name} belum dihubungkan ke akun/API di level workspace. Silakan buka Marketplace Alat untuk menghubungkan terlebih dahulu.`
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 4000)
    return
  }

  toggleAgentTool(agentId.value, tool.id)
  const newState = isApplied(tool.id)

  toastTitle.value = newState ? 'Alat Diterapkan' : 'Alat Dinonaktifkan'
  toastMessage.value = newState 
    ? `${tool.name} berhasil diterapkan ke Agen ${agent.value?.name || 'ini'}.`
    : `${tool.name} dinonaktifkan dari Agen ${agent.value?.name || 'ini'}.`
  showToast.value = true

  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Open agent-specific operational configuration modal
const openAgentConfig = (tool: MarketplaceTool) => {
  selectedTool.value = tool
  const currentConfig = getAgentToolConfig(tool.id)
  
  // Clone current settings or setup defaults
  tempSettings.value = JSON.parse(JSON.stringify(currentConfig.settings || {}))

  // Seed standard defaults if empty
  if (tool.id === 'sheets') {
    tempSettings.value.spreadsheetName = tempSettings.value.spreadsheetName || 'Data Leads & Penjualan 2026'
    tempSettings.value.sheetTab = tempSettings.value.sheetTab || 'Sheet1 (Prospek Baru)'
    tempSettings.value.columnName = tempSettings.value.columnName || 'Kolom A (Nama Calon Pelanggan)'
    tempSettings.value.columnPhone = tempSettings.value.columnPhone || 'Kolom B (Nomor WhatsApp)'
    tempSettings.value.columnInterest = tempSettings.value.columnInterest || 'Kolom C (Minat Produk)'
    tempSettings.value.autoAppend = tempSettings.value.autoAppend ?? true
    tempSettings.value.triggerCondition = tempSettings.value.triggerCondition || 'Saat prospek baru selesai dikualifikasi'
  } else if (tool.id === 'whatsapp_alerts') {
    tempSettings.value.recipientPhone = tempSettings.value.recipientPhone || '6281234567890'
    tempSettings.value.alertOnHighInterest = tempSettings.value.alertOnHighInterest ?? true
    tempSettings.value.alertOnHumanRequest = tempSettings.value.alertOnHumanRequest ?? true
    tempSettings.value.customMessageTemplate = tempSettings.value.customMessageTemplate || 
      `Halo Admin! Agen ${agent.value?.name || 'Budi'} mendeteksi prospek baru: {{lead_name}} ({{lead_whatsapp}}). Minat: {{interest_level}}. Segera follow-up!`
  } else if (tool.id === 'webhook') {
    tempSettings.value.eventTrigger = tempSettings.value.eventTrigger || 'lead_conversion'
    tempSettings.value.agentTag = tempSettings.value.agentTag || `${agent.value?.id || 'agent'}_lead`
    tempSettings.value.includeHistory = tempSettings.value.includeHistory ?? false
  } else if (tool.id === 'midtrans') {
    tempSettings.value.expiryHours = tempSettings.value.expiryHours || 24
    tempSettings.value.memoPrefix = tempSettings.value.memoPrefix || `Pesanan via Agen ${agent.value?.name || ''}`
    tempSettings.value.sendInvoiceInChat = tempSettings.value.sendInvoiceInChat ?? true
  } else if (tool.id === 'n8n_node') {
    tempSettings.value.workflowName = tempSettings.value.workflowName || 'Lead Nurture Flow'
    tempSettings.value.customTag = tempSettings.value.customTag || `${agent.value?.id}_action`
  } else if (tool.id === 'slack') {
    tempSettings.value.channelTarget = tempSettings.value.channelTarget || '#leads-monitoring'
    tempSettings.value.notifyOnHandoffOnly = tempSettings.value.notifyOnHandoffOnly ?? true
  } else if (tool.id === 'lead_qualifier') {
    tempSettings.value.qualificationThreshold = tempSettings.value.qualificationThreshold || 'Tinggi (Siap Beli)'
    tempSettings.value.autoExtractBudget = tempSettings.value.autoExtractBudget ?? true
    tempSettings.value.strictRules = tempSettings.value.strictRules ?? true
  } else if (tool.id === 'faq_answerer') {
    tempSettings.value.confidenceThreshold = tempSettings.value.confidenceThreshold || 0.85
    tempSettings.value.maxCitations = tempSettings.value.maxCitations || 3
    tempSettings.value.strictDriveOnly = tempSettings.value.strictDriveOnly ?? true
  }

  showConfigModal.value = true
}

// Save agent-specific settings
const saveAgentConfig = () => {
  if (!selectedTool.value) return

  updateAgentToolSettings(agentId.value, selectedTool.value.id, tempSettings.value)

  toastTitle.value = 'Pengaturan Disimpan'
  toastMessage.value = `Parameter ${selectedTool.value.name} untuk Agen ${agent.value?.name || ''} berhasil diperbarui!`
  showToast.value = true
  showConfigModal.value = false

  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Navigate to Global Marketplace Tools setup
const goToMarketplace = () => {
  router.push('/tools')
}
</script>

<template>
  <div class="w-full space-y-7 relative">
    <!-- Toast Notification -->
    <ToastNotification 
      v-model:show="showToast"
      :title="toastTitle"
      :message="toastMessage"
      :duration="3500"
    />

    <!-- Header Section with Distinct Distinction -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 rounded-2xl bg-[#bef264]/20 border border-[#bef264]/40 flex items-center justify-center text-[#3f6212] shadow-2xs">
          <SvgIcon name="plug" className="w-6 h-6" />
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="text-xl sm:text-2xl font-black text-[#0f172a] tracking-tight">Keahlian & Alat Agen</h1>
            <span class="bg-[#bef264]/30 text-[#3f6212] text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
              {{ agent?.name || 'Agen' }}
            </span>
          </div>
          <p class="text-slate-500 text-xs mt-1">
            Terapkan integrasi dari katalog workspace dan atur parameter perilakunya untuk agen ini.
          </p>
        </div>
      </div>

      <!-- Quick Action: Go to Marketplace Setup -->
      <div class="flex items-center space-x-3">
        <Button 
          @click="goToMarketplace"
          variant="secondary"
          size="sm"
          class="border-slate-200 hover:border-slate-300"
        >
          <SvgIcon name="store" className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
          <span>Buka Marketplace Alat</span>
          <SvgIcon name="external-link" className="w-3 h-3 ml-1 text-slate-400" />
        </Button>
      </div>
    </div>

    <!-- Clear Architectural Guidance Callout -->
    <div class="bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/40 border border-emerald-200/70 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
          <SvgIcon name="shield" className="w-4 h-4" />
        </div>
        <div class="text-xs">
          <span class="font-extrabold text-[#0f172a]">Koneksi & Otentikasi Dikelola Terpusat</span>
          <p class="text-slate-500 text-[11px] mt-0.5">
            Akun Google OAuth, kunci API Midtrans, dan Webhook telah disetup di Marketplace Workspace. Di sini Anda cukup <strong>mengaktifkan alat</strong> dan mengatur parameter agen.
          </p>
        </div>
      </div>

      <button 
        @click="goToMarketplace"
        class="text-xs text-[#3f6212] hover:text-[#1e293b] font-bold flex items-center space-x-1 flex-shrink-0 cursor-pointer"
      >
        <span>Kelola Koneksi Global &rarr;</span>
      </button>
    </div>

    <!-- Filter Tabs & Search Bar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <!-- Status Tabs -->
      <div class="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
        <button 
          @click="activeStatusTab = 'all'"
          :class="activeStatusTab === 'all' ? 'bg-white text-[#0f172a] shadow-xs font-black' : 'text-slate-500 hover:text-slate-800 font-semibold'"
          class="px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer flex items-center space-x-1.5"
        >
          <span>Semua Alat</span>
          <span class="text-[10px] font-mono opacity-70">({{ mockMarketplaceTools.length }})</span>
        </button>

        <button 
          @click="activeStatusTab = 'applied'"
          :class="activeStatusTab === 'applied' ? 'bg-white text-[#0f172a] shadow-xs font-black' : 'text-slate-500 hover:text-slate-800 font-semibold'"
          class="px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer flex items-center space-x-1.5"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Diterapkan (Aktif)</span>
          <span class="text-[10px] font-mono opacity-70">({{ totalAppliedCount }})</span>
        </button>

        <button 
          @click="activeStatusTab = 'unapplied'"
          :class="activeStatusTab === 'unapplied' ? 'bg-white text-[#0f172a] shadow-xs font-black' : 'text-slate-500 hover:text-slate-800 font-semibold'"
          class="px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer flex items-center space-x-1.5"
        >
          <span>Belum Diterapkan</span>
          <span class="text-[10px] font-mono opacity-70">({{ mockMarketplaceTools.length - totalAppliedCount }})</span>
        </button>
      </div>

      <!-- Search & Category Dropdown -->
      <div class="flex items-center space-x-2">
        <div class="relative w-full sm:w-56">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <SvgIcon name="search" className="w-3.5 h-3.5" />
          </span>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Cari alat..." 
            class="w-full bg-white border border-slate-200 rounded-xl pl-8.5 pr-3 py-1.5 text-xs text-[#0f172a] focus:outline-none focus:border-slate-400 font-semibold"
          />
        </div>

        <select 
          v-model="selectedCategory"
          class="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
    </div>

    <!-- Agent Tools Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <Card 
        v-for="tool in agentTools" 
        :key="tool.id"
        hoverable
        padding="p-5"
        :class="isApplied(tool.id) ? 'border-[#bef264]/70 ring-1 ring-[#bef264]/25 bg-white' : 'border-slate-200/90 bg-white'"
        class="flex flex-col justify-between group transition-all"
      >
        <!-- Card Top Body -->
        <div class="space-y-3.5">
          <div class="flex items-start justify-between">
            <!-- Icon -->
            <div 
              :class="isApplied(tool.id) ? 'bg-[#bef264]/20 border-[#bef264]/40 text-[#3f6212]' : 'bg-slate-100 border-slate-200 text-slate-500'"
              class="w-11 h-11 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-all shadow-2xs"
            >
              <SvgIcon :name="tool.icon" className="w-5.5 h-5.5" />
            </div>

            <!-- Workspace Connection Badge -->
            <div class="flex flex-col items-end">
              <span 
                v-if="tool.connectionStatus === 'connected'"
                class="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9.5px] font-bold px-2 py-0.5 rounded-full"
                title="Koneksi terhubung di workspace"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Koneksi Siap</span>
              </span>

              <span 
                v-else-if="tool.connectionStatus === 'not_required'"
                class="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 border border-blue-200 text-[9.5px] font-bold px-2 py-0.5 rounded-full"
              >
                <span>Bawaan AI</span>
              </span>

              <span 
                v-else
                class="inline-flex items-center space-x-1 bg-amber-50 text-amber-700 border border-amber-200 text-[9.5px] font-bold px-2 py-0.5 rounded-full"
                title="Perlu dihubungkan di Marketplace"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Belum Terhubung</span>
              </span>
            </div>
          </div>

          <!-- Info -->
          <div class="space-y-1">
            <div class="flex items-center space-x-1.5">
              <h3 class="text-sm font-black text-[#0f172a] group-hover:text-[#3f6212] transition-colors leading-tight">
                {{ tool.name }}
              </h3>
            </div>
            <span class="text-[9.5px] font-bold text-slate-400 block">{{ tool.category }} &bull; {{ tool.publisher }}</span>
            <p class="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{{ tool.desc }}</p>
          </div>

          <!-- Inherited Connection Info (Read-only on Agent Side) -->
          <div class="bg-slate-50 border border-slate-150 rounded-xl p-2.5 text-[10px] space-y-0.5 text-slate-600">
            <div class="flex items-center justify-between font-mono">
              <span class="text-slate-400">Koneksi Workspace:</span>
              <span class="font-bold text-[#0f172a] truncate max-w-[140px]">
                {{ tool.connectionDetails.account || tool.connectionDetails.service || tool.connectionDetails.endpoint || 'Internal AI' }}
              </span>
            </div>
            <div v-if="tool.requiresConnection && tool.connectionStatus !== 'connected'" class="text-amber-700 font-bold pt-0.5 flex items-center justify-between">
              <span>Perlu setup di marketplace</span>
              <button @click="goToMarketplace" class="underline cursor-pointer">Setup &rarr;</button>
            </div>
          </div>
        </div>

        <!-- Card Bottom Controls -->
        <div class="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
          <!-- Parameter Config Button (Only when applied) -->
          <div>
            <Button 
              v-if="isApplied(tool.id)"
              @click="openAgentConfig(tool)"
              variant="secondary"
              size="sm"
            >
              <SvgIcon name="sliders" className="w-3.5 h-3.5 mr-1 text-slate-600" />
              <span>Atur Parameter</span>
            </Button>
          </div>

          <!-- Apply / Active Toggle Button -->
          <div class="flex items-center">
            <Button 
              @click="handleToggleTool(tool)"
              :variant="isApplied(tool.id) ? 'secondary' : 'primary'"
              :class="isApplied(tool.id) ? 'bg-[#bef264]/25 border-[#bef264]/50 text-[#3f6212] font-black' : ''"
              size="sm"
            >
              <span v-if="isApplied(tool.id)" class="flex items-center space-x-1">
                <SvgIcon name="check" className="w-3 h-3 text-[#3f6212]" />
                <span>Diterapkan</span>
              </span>
              <span v-else-if="tool.requiresConnection && tool.connectionStatus !== 'connected'" class="text-slate-400">
                Setup di Marketplace
              </span>
              <span v-else>
                Terapkan ke Agen
              </span>
            </Button>
          </div>
        </div>
      </Card>
    </div>

    <!-- Empty State -->
    <Card v-if="agentTools.length === 0" padding="p-12" class="text-center space-y-3">
      <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
        <SvgIcon name="search" className="w-5 h-5" />
      </div>
      <h3 class="text-xs font-bold text-slate-700">Tidak ada alat yang ditemukan</h3>
      <p class="text-[11px] text-slate-400">Silakan ganti kata kunci pencarian atau reset filter status.</p>
    </Card>

    <!-- AGENT PARAMETERS CONFIGURATION MODAL (NO CREDENTIALS SETUP HERE) -->
    <transition name="fade">
      <div 
        v-if="showConfigModal && selectedTool" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      >
        <Card rounded="rounded-3xl" padding="p-0" shadow="shadow-2xl" class="w-full max-w-xl max-h-[88vh] overflow-hidden flex flex-col justify-between transform transition-all duration-200">
          
          <!-- Modal Header -->
          <div class="p-5.5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
            <div class="flex items-center space-x-4">
              <div class="w-11 h-11 bg-[#bef264]/20 border border-[#bef264]/30 rounded-2xl flex items-center justify-center text-[#3f6212]">
                <SvgIcon :name="selectedTool.icon" className="w-5.5 h-5.5" />
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="text-sm font-black text-[#0f172a]">{{ selectedTool.name }}</h3>
                  <span class="text-[9px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded uppercase">Parameter Agen</span>
                </div>
                <p class="text-[10px] text-slate-400 mt-0.5">Khusus untuk Agen: <strong>{{ agent?.name }}</strong></p>
              </div>
            </div>

            <button 
              @click="showConfigModal = false"
              class="text-slate-400 hover:text-slate-700 p-2 rounded-xl transition-all cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Scrollable Content -->
          <div class="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
            
            <!-- Read-only Connection Info Box -->
            <div class="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl flex items-center justify-between text-slate-600">
              <div class="flex items-center space-x-2.5">
                <SvgIcon name="shield" className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <span class="text-[10.5px] font-bold text-slate-800 block">Koneksi Kredensial Global</span>
                  <span class="text-[9.5px] text-slate-400 font-mono">
                    {{ selectedTool.connectionDetails.account || selectedTool.connectionDetails.endpoint || selectedTool.connectionDetails.service }}
                  </span>
                </div>
              </div>
              <button 
                @click="goToMarketplace" 
                class="text-[10px] text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer"
              >
                Ubah di Marketplace
              </button>
            </div>

            <!-- DYNAMIC AGENT OPERATIONAL PARAMETERS -->

            <!-- 1. Google Sheets Agent Parameters -->
            <div v-if="selectedTool.id === 'sheets'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">File Spreadsheet Tujuan</label>
                <select 
                  v-model="tempSettings.spreadsheetName"
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0f172a] focus:outline-none cursor-pointer"
                >
                  <option>Data Leads & Penjualan 2026</option>
                  <option>Customer Support Tickets 2026</option>
                  <option>Buku Kas & Transaksi Toko</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Lembar / Tab Worksheet</label>
                <input 
                  type="text" 
                  v-model="tempSettings.sheetTab"
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#0f172a]"
                  placeholder="Sheet1 (Prospek Baru)"
                />
              </div>

              <!-- Column Mapping Table -->
              <div class="space-y-2">
                <span class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pemetaan Kolom Variabel Agen</span>
                <div class="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden font-mono text-[10.5px]">
                  <table class="w-full text-left">
                    <thead>
                      <tr class="bg-slate-100 text-slate-600 border-b border-slate-200">
                        <th class="p-2.5 font-bold">Kolom di Spreadsheet</th>
                        <th class="p-2.5 font-bold">Data Agen Yang Dicatat</th>
                      </tr>
                    </thead>
                    <tbody class="text-slate-700">
                      <tr class="border-b border-slate-100">
                        <td class="p-2.5 font-semibold text-slate-500">Kolom A</td>
                        <td class="p-2.5 text-[#3f6212] font-bold">lead_name (Nama Calon Pelanggan)</td>
                      </tr>
                      <tr class="border-b border-slate-100">
                        <td class="p-2.5 font-semibold text-slate-500">Kolom B</td>
                        <td class="p-2.5 text-[#3f6212] font-bold">lead_whatsapp (Nomor Telepon)</td>
                      </tr>
                      <tr>
                        <td class="p-2.5 font-semibold text-slate-500">Kolom C</td>
                        <td class="p-2.5 text-[#3f6212] font-bold">interest_level (Minat Produk)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="flex items-center justify-between border-t border-slate-100 pt-3">
                <span class="font-bold text-slate-700 text-xs">Catat Baris Otomatis Saat Selesai Chat</span>
                <ToggleSwitch v-model="tempSettings.autoAppend" />
              </div>
            </div>

            <!-- 2. WhatsApp Admin Alerts Agent Parameters -->
            <div v-if="selectedTool.id === 'whatsapp_alerts'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nomor HP Admin Penerima Peringatan</label>
                <input 
                  type="text" 
                  v-model="tempSettings.recipientPhone"
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-[#0f172a]"
                  placeholder="Contoh: 6281234567890"
                />
                <p class="text-[9.5px] text-slate-400">Peringatan dari percakapan Agen ini akan dikirimkan langsung ke nomor WhatsApp di atas.</p>
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Format Template Notifikasi Pesan</label>
                <textarea 
                  rows="3" 
                  v-model="tempSettings.customMessageTemplate"
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0f172a] leading-relaxed"
                  placeholder="Tulis format notifikasi..."
                ></textarea>
                <span class="text-[9.5px] text-slate-400 block">
                  Tag dinamis: <code v-pre class="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-700">{{lead_name}}</code>, <code v-pre class="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-700">{{lead_whatsapp}}</code>, <code v-pre class="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-700">{{interest_level}}</code>
                </span>
              </div>

              <div class="space-y-2 border-t border-slate-100 pt-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-700 text-xs">Peringatan saat minat tinggi (High Interest)</span>
                  <ToggleSwitch v-model="tempSettings.alertOnHighInterest" />
                </div>
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-700 text-xs">Peringatan saat pelanggan minta bicara dengan manusia</span>
                  <ToggleSwitch v-model="tempSettings.alertOnHumanRequest" />
                </div>
              </div>
            </div>

            <!-- 3. Webhook Agent Parameters -->
            <div v-if="selectedTool.id === 'webhook'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pemicu Event (Trigger)</label>
                <select 
                  v-model="tempSettings.eventTrigger"
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0f172a] cursor-pointer"
                >
                  <option value="lead_conversion">Saat Prospek Berkualifikasi (lead_conversion)</option>
                  <option value="chat_ended">Saat Sesi Chat Selesai (chat_ended)</option>
                  <option value="handoff_requested">Saat Pengalihan ke CS Manusia (handoff)</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tag / Pengenal Agen Khusus</label>
                <input 
                  type="text" 
                  v-model="tempSettings.agentTag"
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-[#0f172a]"
                  placeholder="budi_sales_pro"
                />
              </div>

              <div class="flex items-center justify-between border-t border-slate-100 pt-3">
                <span class="font-bold text-slate-700 text-xs">Sertakan seluruh transkrip percakapan dalam payload</span>
                <ToggleSwitch v-model="tempSettings.includeHistory" />
              </div>
            </div>

            <!-- 4. Midtrans Payment Agent Parameters -->
            <div v-if="selectedTool.id === 'midtrans'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Masa Berlaku Invoice Link (Jam)</label>
                <input 
                  type="number" 
                  v-model="tempSettings.expiryHours"
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#0f172a]"
                  placeholder="24"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Memo / Awalan Deskripsi Tagihan</label>
                <input 
                  type="text" 
                  v-model="tempSettings.memoPrefix"
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#0f172a]"
                  placeholder="Order Produk via Agen Budi"
                />
              </div>

              <div class="flex items-center justify-between border-t border-slate-100 pt-3">
                <span class="font-bold text-slate-700 text-xs">Kirim tautan tagihan otomatis ke ruang chat pembeli</span>
                <ToggleSwitch v-model="tempSettings.sendInvoiceInChat" />
              </div>
            </div>

            <!-- 5. n8n Node Agent Parameters -->
            <div v-if="selectedTool.id === 'n8n_node'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Workflow Target n8n</label>
                <input 
                  type="text" 
                  v-model="tempSettings.workflowName"
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#0f172a]"
                  placeholder="Lead Nurture Flow"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tag Kustom</label>
                <input 
                  type="text" 
                  v-model="tempSettings.customTag"
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-[#0f172a]"
                  placeholder="priority_high"
                />
              </div>
            </div>

            <!-- 6. Slack Agent Parameters -->
            <div v-if="selectedTool.id === 'slack'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Channel Tujuan Spesifik Agen</label>
                <input 
                  type="text" 
                  v-model="tempSettings.channelTarget"
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#0f172a]"
                  placeholder="#leads-sales-budi"
                />
              </div>

              <div class="flex items-center justify-between border-t border-slate-100 pt-3">
                <span class="font-bold text-slate-700 text-xs">Hanya kirim saat butuh bantuan CS (Handoff)</span>
                <ToggleSwitch v-model="tempSettings.notifyOnHandoffOnly" />
              </div>
            </div>

            <!-- 7. Lead Qualifier (Core AI) -->
            <div v-if="selectedTool.id === 'lead_qualifier'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Standar Ambang Batas Kualifikasi</label>
                <select 
                  v-model="tempSettings.qualificationThreshold"
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0f172a] cursor-pointer"
                >
                  <option>Tinggi (Siap Beli)</option>
                  <option>Sedang (Berminat & Bertanya)</option>
                  <option>Semua Kategori (Koleksi Semua)</option>
                </select>
              </div>

              <div class="flex items-center justify-between border-t border-slate-100 pt-3">
                <span class="font-bold text-slate-700 text-xs">Ekstrak perkiraan anggaran (budget) calon pembeli</span>
                <ToggleSwitch v-model="tempSettings.autoExtractBudget" />
              </div>

              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-700 text-xs">Terapkan aturan ketat sesuai SOP bisnis</span>
                <ToggleSwitch v-model="tempSettings.strictRules" />
              </div>
            </div>

            <!-- 8. FAQ Knowledge Reader (Core AI) -->
            <div v-if="selectedTool.id === 'faq_answerer'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Tingkat Keyakinan Dokumen (Confidence): {{ Math.round((tempSettings.confidenceThreshold || 0.8) * 100) }}%
                </label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="0.95" 
                  step="0.05"
                  v-model.number="tempSettings.confidenceThreshold"
                  class="w-full cursor-pointer accent-[#3f6212]"
                />
                <span class="text-[9.5px] text-slate-400 block">Semakin tinggi, semakin ketat kecocokan jawaban dengan berkas SOP.</span>
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Maksimal Kutipan Referensi RAG</label>
                <input 
                  type="number" 
                  min="1" 
                  max="8" 
                  v-model.number="tempSettings.maxCitations"
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#0f172a]"
                />
              </div>

              <div class="flex items-center justify-between border-t border-slate-100 pt-3">
                <span class="font-bold text-slate-700 text-xs">Jangan berhalusinasi jika dokumen tidak memiliki jawaban</span>
                <ToggleSwitch v-model="tempSettings.strictDriveOnly" />
              </div>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end space-x-3">
            <Button 
              variant="secondary" 
              size="sm"
              @click="showConfigModal = false"
            >
              Batal
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              @click="saveAgentConfig"
            >
              Simpan Parameter Agen
            </Button>
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
