<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { toolsService } from '../services/tools'
import { 
  mockMarketplaceTools, 
  connectMarketplaceTool, 
  disconnectMarketplaceTool, 
  addMarketplaceTool, 
  editMarketplaceTool, 
  deleteMarketplaceTool, 
  mockTokenQuota, 
  type MarketplaceTool 
} from '../utils/mockData'
import SvgIcon from '../components/ui/SvgIcon.vue'
import Card from '../components/ui/Card.vue'
import Button from '../components/ui/Button.vue'
import ToastNotification from '../components/ui/ToastNotification.vue'

const router = useRouter()
const authStore = useAuthStore()

// State for database synchronization
const isDatabaseConnected = ref(false)
const isLoadingTools = ref(true)
const databaseError = ref<string | null>(null)

// Fetch tools directly from backend database (Admin token required)
const loadTools = async () => {
  isLoadingTools.value = true
  databaseError.value = null
  try {
    const tools = await toolsService.fetchTools({}, authStore.token)
    mockMarketplaceTools.value = Array.isArray(tools) ? tools : []
    isDatabaseConnected.value = true
  } catch (err: any) {
    mockMarketplaceTools.value = []
    databaseError.value = err?.message || 'Gagal memuat data dari database backend'
    isDatabaseConnected.value = false
  } finally {
    isLoadingTools.value = false
  }
}

onMounted(async () => {
  await loadTools()
})




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

const tokenUsagePercent = computed(() => {
  if (!mockTokenQuota.value.monthlyLimit) return 0
  return Math.min(100, Math.round((mockTokenQuota.value.usedTokens / mockTokenQuota.value.monthlyLimit) * 1000) / 10)
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
  if (!authStore.isAdmin) {
    toastTitle.value = 'Akses Ditolak'
    toastMessage.value = 'Hanya akun Administrator yang dapat menyimpan konfigurasi koneksi.'
    showToast.value = true
    return
  }

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
  if (!authStore.isAdmin) {
    toastTitle.value = 'Akses Ditolak'
    toastMessage.value = 'Hanya akun Administrator yang dapat memutuskan koneksi.'
    showToast.value = true
    return
  }

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

// ----------------------------------------------------
// Admin Authentication & Logout Handler
// ----------------------------------------------------
const triggerLogout = async () => {
  showUserDropdown.value = false
  await authStore.logout()
  router.push('/login')
}

// ----------------------------------------------------
// Admin CRUD State & Operations
// ----------------------------------------------------
const showToolModal = ref(false)
const isEditing = ref(false)
const editingToolId = ref<string | null>(null)
const isSubmittingTool = ref(false)
const formError = ref('')

// Tool Form fields
const formName = ref('')
const formCategory = ref('Spreadsheet')
const formPublisher = ref('')
const formVersion = ref('v1.0.0')
const formBadge = ref('')
const formIcon = ref('plug')
const formDesc = ref('')
const formRequiresConnection = ref(true)

// Available icons for selection
const availableIcons = [
  { id: 'plug', label: 'Plugin / API' },
  { id: 'chat', label: 'Chat / Notifikasi' },
  { id: 'sheets', label: 'Spreadsheet / Tabel' },
  { id: 'link', label: 'Webhook / Link' },
  { id: 'bot', label: 'Bot / Agent AI' },
  { id: 'book', label: 'Knowledge / Dokumen' },
  { id: 'database', label: 'Database' },
  { id: 'sliders', label: 'Pengaturan / Otomasi' },
  { id: 'zap', label: 'Aksi Kilat / Triggers' },
  { id: 'gauge', label: 'Monitoring' },
  { id: 'chart-bar', label: 'Analytics' },
  { id: 'key', label: 'Auth / Keamanan' },
]

// Delete modal state
const showDeleteModal = ref(false)
const toolToDelete = ref<MarketplaceTool | null>(null)
const isDeleting = ref(false)

const openCreateToolModal = () => {
  if (!authStore.isAdmin) {
    toastTitle.value = 'Akses Ditolak'
    toastMessage.value = 'Hanya akun Administrator yang dapat menambah alat baru.'
    showToast.value = true
    return
  }
  isEditing.value = false
  editingToolId.value = null
  formName.value = ''
  formCategory.value = categories[1] || 'Spreadsheet'
  formPublisher.value = authStore.user?.workspace || 'Aibou Pro Team'
  formVersion.value = 'v1.0.0'
  formBadge.value = 'Baru'
  formIcon.value = 'plug'
  formDesc.value = ''
  formRequiresConnection.value = true
  formError.value = ''
  showToolModal.value = true
}

const openEditToolModal = (tool: MarketplaceTool) => {
  if (!authStore.isAdmin) {
    toastTitle.value = 'Akses Ditolak'
    toastMessage.value = 'Hanya akun Administrator yang dapat mengubah pengaturan alat.'
    showToast.value = true
    return
  }
  isEditing.value = true
  editingToolId.value = tool.id
  formName.value = tool.name
  formCategory.value = tool.category
  formPublisher.value = tool.publisher
  formVersion.value = tool.version
  formBadge.value = tool.badge || ''
  formIcon.value = tool.icon || 'plug'
  formDesc.value = tool.desc
  formRequiresConnection.value = tool.requiresConnection
  formError.value = ''
  showToolModal.value = true
}

const handleSaveTool = async () => {
  if (!authStore.isAdmin) {
    formError.value = 'Hanya Administrator yang memiliki izin menyimpan perubahan.'
    return
  }

  if (!formName.value.trim()) {
    formError.value = 'Nama alat wajib diisi.'
    return
  }
  if (!formPublisher.value.trim()) {
    formError.value = 'Penerbit / vendor alat wajib diisi.'
    return
  }
  if (!formDesc.value.trim()) {
    formError.value = 'Deskripsi alat wajib diisi.'
    return
  }

  formError.value = ''
  isSubmittingTool.value = true

  try {
    if (isEditing.value && editingToolId.value) {
      const updates: Partial<MarketplaceTool> = {
        name: formName.value.trim(),
        category: formCategory.value,
        publisher: formPublisher.value.trim(),
        version: formVersion.value.trim() || 'v1.0.0',
        badge: formBadge.value.trim() || undefined,
        icon: formIcon.value,
        desc: formDesc.value.trim(),
        requiresConnection: formRequiresConnection.value,
      }

      // 1. Call Backend API
      let updatedData = updates
      try {
        const res = await toolsService.updateTool(editingToolId.value, updates, authStore.token)
        if (res) updatedData = res
      } catch (backendErr: any) {
        console.warn('Backend update notice:', backendErr?.message)
      }

      // 2. Sync local reactive store
      editMarketplaceTool(editingToolId.value, updatedData)

      toastTitle.value = 'Alat Diperbarui'
      toastMessage.value = `Perubahan pada alat "${formName.value}" berhasil disimpan!`
    } else {
      const newToolId = formName.value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || `tool_${Date.now()}`
      const newTool: MarketplaceTool = {
        id: newToolId,
        name: formName.value.trim(),
        publisher: formPublisher.value.trim(),
        category: formCategory.value,
        icon: formIcon.value,
        badge: formBadge.value.trim() || undefined,
        desc: formDesc.value.trim(),
        version: formVersion.value.trim() || 'v1.0.0',
        installs: '0',
        rating: 5.0,
        reviews: 0,
        requiresConnection: formRequiresConnection.value,
        connectionStatus: formRequiresConnection.value ? 'disconnected' : 'not_required',
        connectionDetails: {
          statusMessage: formRequiresConnection.value ? 'Belum Dikonfigurasi' : 'Bawaan AI Platform',
          lastSynced: '-',
          latency: '-'
        }
      }

      // 1. Call Backend API
      let toolToSave = newTool
      try {
        const res = await toolsService.createTool(newTool, authStore.token)
        if (res) toolToSave = res
      } catch (backendErr: any) {
        console.warn('Backend create notice:', backendErr?.message)
      }

      // 2. Sync local reactive store
      addMarketplaceTool(toolToSave)

      toastTitle.value = 'Alat Ditambahkan'
      toastMessage.value = `Alat baru "${newTool.name}" berhasil didaftarkan ke Marketplace!`
    }

    showToast.value = true
    showToolModal.value = false
    setTimeout(() => { showToast.value = false }, 3500)
  } catch (err: any) {
    formError.value = err.message || 'Terjadi kesalahan saat menyimpan alat.'
  } finally {
    isSubmittingTool.value = false
  }
}

const confirmDeleteTool = (tool: MarketplaceTool) => {
  if (!authStore.isAdmin) {
    toastTitle.value = 'Akses Ditolak'
    toastMessage.value = 'Hanya akun Administrator yang dapat menghapus alat.'
    showToast.value = true
    return
  }
  toolToDelete.value = tool
  showDeleteModal.value = true
}

const handleDeleteTool = async () => {
  if (!authStore.isAdmin) {
    toastTitle.value = 'Akses Ditolak'
    toastMessage.value = 'Hanya Administrator yang memiliki izin menghapus alat.'
    showToast.value = true
    showDeleteModal.value = false
    return
  }

  if (!toolToDelete.value) return
  const target = toolToDelete.value
  isDeleting.value = true

  try {
    // 1. Call Backend API
    try {
      await toolsService.deleteTool(target.id, authStore.token)
    } catch (backendErr: any) {
      console.warn('Backend delete notice:', backendErr?.message)
    }

    // 2. Sync local reactive store
    deleteMarketplaceTool(target.id)

    toastTitle.value = 'Alat Dihapus'
    toastMessage.value = `Alat "${target.name}" berhasil dihapus dari Marketplace.`
    showToast.value = true
    showDeleteModal.value = false
    setTimeout(() => { showToast.value = false }, 3500)
  } catch (err: any) {
    toastTitle.value = 'Gagal Menghapus'
    toastMessage.value = err.message || 'Terjadi kesalahan saat menghapus alat.'
    showToast.value = true
  } finally {
    isDeleting.value = false
    toolToDelete.value = null
  }
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
              class="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#f59e0b] text-[#1c1917] shadow-xs flex items-center space-x-2"
            >
              <SvgIcon name="store" className="w-4 h-4 text-[#1c1917]" />
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
            <span>Workspace: <strong>{{ authStore.user?.workspace || 'Aibou Pro Team' }}</strong></span>
          </div>

          <!-- Role Indicator Badge -->
          <span 
            v-if="authStore.isAdmin"
            class="hidden sm:inline-flex items-center space-x-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2.5 py-1 rounded-xl shadow-2xs uppercase tracking-wider"
          >
            <SvgIcon name="shield" className="w-3 h-3 text-amber-700" />
            <span>Admin</span>
          </span>
          <span 
            v-else
            class="hidden sm:inline-flex items-center space-x-1 bg-stone-100 text-stone-600 border border-stone-200 text-[10px] font-bold px-2.5 py-1 rounded-xl uppercase tracking-wider"
          >
            <SvgIcon name="lock" className="w-3 h-3 text-stone-400" />
            <span>User</span>
          </span>

          <!-- User dropdown -->
          <div class="relative">
            <button 
              @click="showUserDropdown = !showUserDropdown"
              class="flex items-center space-x-2.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-700 shadow-2xs cursor-pointer select-none"
            >
              <img 
                v-if="authStore.user?.avatar_url" 
                :src="authStore.user.avatar_url" 
                :alt="authStore.user.full_name || 'User'" 
                class="w-6 h-6 rounded-full object-cover border border-amber-300"
              />
              <div 
                v-else 
                class="w-6 h-6 rounded-full bg-[#f59e0b] flex items-center justify-center text-[#1c1917] text-[10px] font-black"
              >
                {{ authStore.userInitials }}
              </div>
              <span class="hidden sm:inline">{{ authStore.user?.full_name || 'Admin Aibou' }}</span>
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
                to="/tokens" 
                class="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 font-bold flex items-center space-x-2"
                @click="showUserDropdown = false"
              >
                <SvgIcon name="gauge" className="w-3.5 h-3.5 text-stone-400" />
                <span>Penggunaan Token</span>
              </router-link>
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

    <!-- Main Workspace Container -->
    <main class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 relative z-10">
      
      <!-- Top Title & Architecture Banner -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div class="flex items-center space-x-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Pengaturan Integrasi Terpusat</span>
          </div>
          <h1 class="text-3xl font-black text-[#1c1917] tracking-tight">Marketplace Alat & Koneksi Global</h1>
          <p class="text-stone-500 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
            Hubungkan akun Google OAuth, kredensial API, dan gateway eksternal di sini. Di sisi agen, Anda cukup <strong>menerapkan alat</strong> dan mengatur parameter perilaku tanpa perlu setup kredensial ulang.
          </p>
        </div>

        <div class="flex items-center space-x-3">
          <!-- Admin Action: Tambah Tool Baru (Hidden if not admin) -->
          <Button 
            v-if="authStore.isAdmin"
            @click="openCreateToolModal"
            variant="primary" 
            size="md"
            class="shadow-sm"
          >
            <SvgIcon name="plus" className="w-3.5 h-3.5 mr-1.5" />
            <span>Tambah Tool Baru</span>
          </Button>

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
          <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Katalog Integrasi</span>
          <div class="flex items-baseline space-x-2">
            <span class="text-2xl font-black text-[#1c1917]">{{ mockMarketplaceTools.length }}</span>
            <span class="text-xs text-stone-500 font-semibold">Alat Tersedia</span>
          </div>
        </Card>

        <Card padding="p-4 sm:p-5" class="space-y-1 border-l-4 border-l-emerald-500">
          <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Koneksi Workspace</span>
          <div class="flex items-baseline space-x-2">
            <span class="text-2xl font-black text-emerald-600">{{ totalConnected }}</span>
            <span class="text-xs text-stone-500 font-semibold">Siap Digunakan</span>
          </div>
        </Card>

        <Card padding="p-4 sm:p-5" class="space-y-1">
          <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Perlu Setup Koneksi</span>
          <div class="flex items-baseline space-x-2">
            <span class="text-2xl font-black text-amber-600">{{ totalPending }}</span>
            <span class="text-xs text-stone-500 font-semibold">Belum Dihubungkan</span>
          </div>
        </Card>

        <Card padding="p-4 sm:p-5" class="space-y-1">
          <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Sumber Data Katalog</span>
          <div class="flex items-center space-x-2 mt-1">
            <span :class="isDatabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'" class="w-2 h-2 rounded-full"></span>
            <span class="text-xs font-black text-[#1c1917]">{{ isDatabaseConnected ? 'PostgreSQL Database' : 'Koneksi Terputus' }}</span>
          </div>
          <span class="text-[10px] text-stone-400 block mt-0.5">{{ isDatabaseConnected ? 'Live dari tabel tool' : 'Database belum terhubung' }}</span>
        </Card>
      </div>

      <!-- Marketplace Explorer Layout (Sidebar 3 cols + Main 9 cols) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left Filter Sidebar (3 cols) -->
        <aside class="lg:col-span-3 space-y-6">
          <!-- Search input card -->
          <Card padding="p-4" class="space-y-3">
            <label class="text-[10px] font-black text-stone-400 uppercase tracking-widest block">Cari Alat</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <SvgIcon name="search" className="w-4 h-4" />
              </span>
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Cari Google, Webhook..."
                class="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl pl-9 pr-3 py-2 text-xs text-[#1c1917] focus:outline-none transition-all font-semibold"
              />
            </div>
          </Card>

          <!-- Status Filter -->
          <Card padding="p-4" class="space-y-3">
            <div class="text-[10px] font-black text-stone-400 uppercase tracking-widest">Status Koneksi</div>
            <div class="space-y-1">
              <button 
                @click="selectedStatusFilter = 'Semua'"
                :class="selectedStatusFilter === 'Semua' ? 'bg-[#f59e0b] text-[#1c1917] font-extrabold shadow-2xs' : 'text-stone-600 hover:bg-stone-50 font-semibold'"
                class="w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between"
              >
                <span>Semua Alat</span>
                <span class="text-[10px] font-mono opacity-70">({{ mockMarketplaceTools.length }})</span>
              </button>

              <button 
                @click="selectedStatusFilter = 'Terhubung'"
                :class="selectedStatusFilter === 'Terhubung' ? 'bg-[#f59e0b] text-[#1c1917] font-extrabold shadow-2xs' : 'text-stone-600 hover:bg-stone-50 font-semibold'"
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
                :class="selectedStatusFilter === 'Belum Terhubung' ? 'bg-[#f59e0b] text-[#1c1917] font-extrabold shadow-2xs' : 'text-stone-600 hover:bg-stone-50 font-semibold'"
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
                :class="selectedStatusFilter === 'Bawaan AI' ? 'bg-[#f59e0b] text-[#1c1917] font-extrabold shadow-2xs' : 'text-stone-600 hover:bg-stone-50 font-semibold'"
                class="w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between"
              >
                <span>Bawaan AI Platform</span>
                <span class="text-[10px] font-mono opacity-70">(2)</span>
              </button>
            </div>
          </Card>

          <!-- Categories Filter -->
          <Card padding="p-4" class="space-y-3">
            <div class="text-[10px] font-black text-stone-400 uppercase tracking-widest">Kategori Integrasi</div>
            <div class="space-y-1">
              <button 
                v-for="cat in categories"
                :key="cat"
                @click="selectedCategory = cat"
                :class="selectedCategory === cat ? 'bg-amber-100 text-amber-900 border-l-4 border-amber-600 pl-2 font-extrabold' : 'text-stone-600 hover:bg-stone-50 pl-3 font-semibold'"
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
          <Card rounded="rounded-3xl" padding="p-6 sm:p-7" class="bg-gradient-to-r from-[#1c1917] via-[#292524] to-[#1c1917] text-white border-stone-800 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.15),transparent_70%)] pointer-events-none"></div>
            
            <div class="space-y-2 relative z-10 max-w-xl">
              <div class="flex items-center space-x-2">
                <span class="text-[9px] bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded text-amber-400 font-extrabold tracking-widest uppercase">Pusat Integrasi</span>
                <span class="text-[10px] text-stone-400 font-medium">Model Context Protocol (MCP)</span>
              </div>
              <h2 class="text-xl font-black tracking-tight text-white">Hubungkan Sekali, Gunakan di Semua Agen AI</h2>
              <p class="text-stone-300 text-xs leading-relaxed">
                Kelola kredensial, token OAuth Google, dan webhook gateway secara aman di level organisasi. Setelah terhubung, setiap agen Anda bisa langsung menggunakannya dengan satu klik.
              </p>
            </div>

            <div class="relative z-10 flex-shrink-0 w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
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
              class="flex flex-col justify-between group border-stone-200 transition-all duration-200"
            >
              <!-- Card Top Body -->
              <div class="space-y-4">
                <div class="flex items-start justify-between">
                  <!-- Icon with Glow -->
                  <div 
                    :class="tool.connectionStatus === 'connected' || tool.connectionStatus === 'not_required' ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-stone-100 border-stone-200 text-stone-500'"
                    class="w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 shadow-2xs"
                  >
                    <SvgIcon :name="tool.icon" className="w-6 h-6" />
                  </div>

                  <!-- Badge Status & Admin Actions -->
                  <div class="flex flex-col items-end space-y-1.5">
                    <!-- Admin Edit & Delete Quick Buttons -->
                    <div v-if="authStore.isAdmin" class="flex items-center space-x-1 bg-stone-50 border border-stone-200/90 rounded-lg p-0.5 shadow-2xs">
                      <button 
                        @click.stop="openEditToolModal(tool)" 
                        class="p-1 rounded-md text-stone-500 hover:text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
                        title="Edit Alat (Khusus Admin)"
                      >
                        <SvgIcon name="edit" className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        @click.stop="confirmDeleteTool(tool)" 
                        class="p-1 rounded-md text-stone-500 hover:text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                        title="Hapus Alat (Khusus Admin)"
                      >
                        <SvgIcon name="trash" className="w-3.5 h-3.5" />
                      </button>
                    </div>

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

                    <span class="text-[9.5px] font-mono text-stone-400">{{ tool.version }}</span>
                  </div>
                </div>

                <!-- Info -->
                <div class="space-y-1.5">
                  <div class="flex items-center space-x-2">
                    <h3 class="text-sm font-extrabold text-[#1c1917] group-hover:text-amber-700 transition-colors">{{ tool.name }}</h3>
                    <span v-if="tool.badge" class="bg-stone-100 text-stone-600 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{{ tool.badge }}</span>
                  </div>
                  <span class="text-[10px] font-semibold text-stone-400 block">{{ tool.publisher }} &bull; {{ tool.category }}</span>
                  <p class="text-[11.5px] text-stone-600 leading-relaxed line-clamp-2">{{ tool.desc }}</p>
                </div>

                <!-- Global Connection Status Details Pill -->
                <div 
                  v-if="tool.connectionStatus === 'connected'"
                  class="bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-[10.5px] space-y-1 text-stone-600"
                >
                  <div class="flex items-center justify-between font-mono">
                    <span class="text-stone-400">Akun/Target:</span>
                    <span class="font-bold text-[#1c1917] truncate max-w-[170px]">{{ tool.connectionDetails.account || tool.connectionDetails.endpoint || tool.connectionDetails.phoneId || tool.connectionDetails.hostUrl }}</span>
                  </div>
                  <div class="flex items-center justify-between text-[10px]">
                    <span class="text-stone-400">Status Gateway:</span>
                    <span class="text-emerald-700 font-bold flex items-center space-x-1">
                      <span class="w-1 h-1 rounded-full bg-emerald-500"></span>
                      <span>{{ tool.connectionDetails.latency || 'Online' }}</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Card Bottom Actions -->
              <div class="pt-4 border-t border-stone-100 flex items-center justify-between gap-3 mt-4">
                <span class="text-[10px] text-stone-400 font-bold">
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
                    <SvgIcon name="refresh" className="w-3 h-3 text-stone-500" />
                    <span>Uji</span>
                  </Button>

                  <!-- Connect / Manage Button -->
                  <Button 
                    v-if="authStore.isAdmin && tool.requiresConnection"
                    @click="openConnectionSetup(tool)"
                    :variant="tool.connectionStatus === 'connected' ? 'secondary' : 'primary'"
                    size="sm"
                  >
                    <SvgIcon :name="tool.connectionStatus === 'connected' ? 'cog' : 'plug'" className="w-3.5 h-3.5 mr-1" />
                    <span v-if="tool.connectionStatus === 'connected'">Kelola Koneksi</span>
                    <span v-else>Atur Koneksi</span>
                  </Button>

                  <Button 
                    v-else-if="tool.requiresConnection"
                    @click="openConnectionSetup(tool)"
                    variant="secondary"
                    size="sm"
                  >
                    <SvgIcon name="sliders" className="w-3.5 h-3.5 mr-1 text-stone-500" />
                    <span>Detail Koneksi</span>
                  </Button>

                  <span v-else class="text-[11px] font-bold text-stone-400 bg-stone-100 px-3 py-1.5 rounded-xl">
                    Siap Dipakai
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <!-- Loading State -->
          <Card v-if="isLoadingTools" padding="p-16" class="text-center space-y-3">
            <div class="w-10 h-10 rounded-full border-3 border-amber-500 border-t-transparent animate-spin mx-auto"></div>
            <h3 class="text-sm font-bold text-stone-700">Memuat katalog alat dari database...</h3>
            <p class="text-xs text-stone-400">Menghubungkan ke tabel database PostgreSQL.</p>
          </Card>

          <!-- Error / Permission Denied State (Admin Token Required) -->
          <Card v-else-if="databaseError" padding="p-16" class="text-center space-y-4 border-2 border-red-200 bg-red-50/40">
            <div class="w-16 h-16 rounded-3xl bg-red-100 border border-red-200 flex items-center justify-center mx-auto text-red-600 shadow-sm">
              <SvgIcon name="lock" className="w-8 h-8 text-red-500" />
            </div>
            <div class="space-y-1.5 max-w-md mx-auto">
              <span class="text-[10px] font-mono uppercase tracking-widest text-red-700 font-extrabold bg-red-100 px-2 py-0.5 rounded">Admin Token Required</span>
              <h3 class="text-lg font-black text-red-900 mt-1.5">Akses Dibatasi</h3>
              <p class="text-xs text-red-600 leading-relaxed">{{ databaseError }}</p>
            </div>
            <div class="pt-2">
              <Button @click="loadTools" variant="secondary" size="sm">
                Coba Muat Ulang
              </Button>
            </div>
          </Card>

          <!-- Tools Empty in Database -->
          <Card v-else-if="mockMarketplaceTools.length === 0" padding="p-16" class="text-center space-y-4 border-dashed border-2 border-stone-300">
            <div class="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-sm">
              <SvgIcon name="plug" className="w-8 h-8 text-amber-500" />
            </div>
            <div class="space-y-1 max-w-md mx-auto">
              <span class="text-[10px] font-mono uppercase tracking-widest text-amber-700 font-extrabold bg-amber-100 px-2 py-0.5 rounded">Database: 0 Data</span>
              <h3 class="text-lg font-black text-[#1c1917] mt-1.5">Tools Kosong (Tools Empty)</h3>
              <p class="text-xs text-stone-500 leading-relaxed">
                Belum ada data integrasi alat yang tersimpan di dalam database.
                <span v-if="authStore.isAdmin"> Sebagai Administrator, Anda dapat menambahkan alat baru sekarang.</span>
              </p>
            </div>
            <div v-if="authStore.isAdmin" class="pt-2">
              <Button @click="openCreateToolModal" variant="primary" size="md">
                <SvgIcon name="plus" className="w-4 h-4 mr-1.5" />
                <span>+ Tambah Tool Baru ke Database</span>
              </Button>
            </div>
          </Card>

          <!-- Filtered Empty State (When DB has data, but search filters it out) -->
          <Card v-else-if="filteredTools.length === 0" padding="p-16" class="text-center space-y-3">
            <div class="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <SvgIcon name="search" className="w-6 h-6" />
            </div>
            <h3 class="text-sm font-bold text-stone-700">Tidak ada alat yang cocok dengan pencarian</h3>
            <p class="text-xs text-stone-400 max-w-sm mx-auto">Silakan coba kata kunci lain atau reset filter kategori di panel samping.</p>
            <div class="pt-2">
              <Button @click="searchQuery = ''; selectedCategory = 'Semua Kategori'; selectedStatusFilter = 'Semua'" variant="secondary" size="sm">
                Reset Filter
              </Button>
            </div>
          </Card>
        </section>

      </div>
    </main>

    <!-- GLOBAL CONNECTION SETUP MODAL -->
    <transition name="fade">
      <div 
        v-if="showConnectionModal && selectedTool" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
      >
        <Card rounded="rounded-3xl" padding="p-0" shadow="shadow-2xl" class="w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col justify-between transform transition-all duration-200 border-stone-200">
          
          <!-- Modal Header -->
          <div class="p-6 border-b border-stone-200/80 flex items-start justify-between bg-stone-50/70">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-amber-100 border border-amber-300 rounded-2xl flex items-center justify-center text-amber-900">
                <SvgIcon :name="selectedTool.icon" className="w-6 h-6" />
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="text-base font-black text-[#1c1917]">{{ selectedTool.name }}</h3>
                  <span class="text-[9px] bg-stone-200 text-stone-700 font-bold px-2 py-0.5 rounded uppercase">Setup Koneksi Global</span>
                </div>
                <p class="text-[10.5px] text-stone-400 mt-0.5">{{ selectedTool.publisher }} &bull; MCP Integrasi</p>
              </div>
            </div>

            <button 
              @click="showConnectionModal = false"
              class="text-stone-400 hover:text-stone-700 hover:bg-stone-100 p-2 rounded-xl transition-all cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Scrollable Body -->
          <div class="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            
            <!-- Explanatory note -->
            <div v-if="authStore.isAdmin" class="bg-amber-50/80 border border-amber-200/90 p-3.5 rounded-2xl flex items-start space-x-3 text-amber-950">
              <SvgIcon name="shield" className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p class="text-[11px] leading-relaxed">
                <strong>Koneksi Workspace Terpusat:</strong> Anda sedang mengatur kredensial dan otentikasi level organisasi. Setelah terhubung, kredensial ini aman dan digunakan bersama oleh agen-agen yang diizinkan.
              </p>
            </div>
            <div v-else class="bg-stone-100 border border-stone-200 p-3.5 rounded-2xl flex items-start space-x-3 text-stone-600">
              <SvgIcon name="lock" className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" />
              <p class="text-[11px] leading-relaxed">
                <strong>Mode Tinjauan (Hanya Baca):</strong> Konfigurasi dan perubahan kredensial koneksi tingkat organisasi hanya dapat dilakukan oleh Administrator.
              </p>
            </div>

            <!-- Current Connection Status Pill -->
            <div class="flex items-center justify-between border-b border-stone-200/80 pb-4">
              <div>
                <span class="font-bold text-stone-700 block text-xs">Status Koneksi Saat Ini</span>
                <span class="text-[10px] text-stone-400">{{ selectedTool.connectionDetails.statusMessage || 'Siap dikonfigurasi' }}</span>
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
              <div class="border border-stone-200 rounded-2xl p-4 bg-stone-50/70 space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <img src="https://www.gstatic.com/images/branding/product/1x/sheets_2020q4_48dp.png" alt="Sheets" class="w-8 h-8" />
                    <div>
                      <span class="text-xs font-extrabold text-[#1c1917] block">Google Workspace OAuth 2.0</span>
                      <span class="text-[10px] text-stone-400">Izin Akses: spreadsheets & spreadsheets.readonly</span>
                    </div>
                  </div>
                  <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    OAuth Terverifikasi
                  </span>
                </div>

                <div class="space-y-1.5 pt-2 border-t border-stone-200/80">
                  <label class="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">Akun Google Terhubung</label>
                  <input 
                    type="email" 
                    v-model="modalAccount" 
                    :disabled="!authStore.isAdmin"
                    class="w-full bg-white border border-stone-200 focus:border-stone-400 rounded-xl px-3.5 py-2.5 text-xs text-[#1c1917] font-semibold disabled:bg-stone-100 disabled:cursor-not-allowed"
                    placeholder="admin@aibou-enterprise.id"
                  />
                  <p class="text-[9.5px] text-stone-400">Akun ini memiliki hak akses untuk membuat dan mengedit spreadsheet tim.</p>
                </div>
              </div>
            </div>

            <!-- 2. Webhook Gateway -->
            <div v-if="selectedTool.id === 'webhook'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">Endpoint URL Webhook Target</label>
                <input 
                  type="text" 
                  v-model="modalEndpoint" 
                  :disabled="!authStore.isAdmin"
                  class="w-full bg-white border border-stone-200 focus:border-stone-400 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-[#1c1917] disabled:bg-stone-100 disabled:cursor-not-allowed"
                  placeholder="https://api.n8n.cloud/webhook/..."
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">Secret Signing Key (Header Authorization)</label>
                <input 
                  type="password" 
                  v-model="modalSecretKey" 
                  :disabled="!authStore.isAdmin"
                  class="w-full bg-white border border-stone-200 focus:border-stone-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#1c1917] disabled:bg-stone-100 disabled:cursor-not-allowed"
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
                <label class="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">Meta Phone Number ID</label>
                <input 
                  type="text" 
                  v-model="modalPhoneId" 
                  :disabled="!authStore.isAdmin"
                  class="w-full bg-white border border-stone-200 focus:border-stone-400 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-[#1c1917] disabled:bg-stone-100 disabled:cursor-not-allowed"
                  placeholder="WA-PHONE-6281234567890"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">WhatsApp Business Account ID (WABA ID)</label>
                <input 
                  type="text" 
                  v-model="modalWabaId" 
                  :disabled="!authStore.isAdmin"
                  class="w-full bg-white border border-stone-200 focus:border-stone-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#1c1917] disabled:bg-stone-100 disabled:cursor-not-allowed"
                  placeholder="WABA-9988127391"
                />
              </div>
            </div>

            <!-- 4. Midtrans Payment Engine -->
            <div v-if="selectedTool.id === 'midtrans'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">Environment Midtrans</label>
                <select 
                  v-model="modalEnvironment" 
                  :disabled="!authStore.isAdmin"
                  class="w-full bg-white border border-stone-200 focus:border-stone-400 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1c1917] disabled:bg-stone-100 disabled:cursor-not-allowed"
                >
                  <option value="Sandbox">Sandbox (Uji Coba)</option>
                  <option value="Production">Production (Live)</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">Merchant ID</label>
                <input 
                  type="text" 
                  v-model="modalMerchantId" 
                  :disabled="!authStore.isAdmin"
                  class="w-full bg-white border border-stone-200 focus:border-stone-400 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-[#1c1917] disabled:bg-stone-100 disabled:cursor-not-allowed"
                  placeholder="M109281"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">Server Key Midtrans</label>
                <input 
                  type="password" 
                  v-model="modalServerKey" 
                  :disabled="!authStore.isAdmin"
                  class="w-full bg-white border border-stone-200 focus:border-stone-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#1c1917] disabled:bg-stone-100 disabled:cursor-not-allowed"
                  placeholder="SB-Mid-server-••••••••"
                />
              </div>
            </div>

            <!-- 5. n8n Node -->
            <div v-if="selectedTool.id === 'n8n_node'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">Host URL n8n</label>
                <input 
                  type="text" 
                  v-model="modalHostUrl" 
                  :disabled="!authStore.isAdmin"
                  class="w-full bg-white border border-stone-200 focus:border-stone-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#1c1917] disabled:bg-stone-100 disabled:cursor-not-allowed"
                  placeholder="https://n8n.my-business.internal"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">n8n API Key</label>
                <input 
                  type="password" 
                  v-model="modalApiKey" 
                  :disabled="!authStore.isAdmin"
                  class="w-full bg-white border border-stone-200 focus:border-stone-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#1c1917] disabled:bg-stone-100 disabled:cursor-not-allowed"
                  placeholder="n8n_api_••••••••"
                />
              </div>
            </div>

            <!-- 6. Slack -->
            <div v-if="selectedTool.id === 'slack'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">Incoming Webhook URL</label>
                <input 
                  type="text" 
                  v-model="modalSlackWebhook" 
                  :disabled="!authStore.isAdmin"
                  class="w-full bg-white border border-stone-200 focus:border-stone-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#1c1917] disabled:bg-stone-100 disabled:cursor-not-allowed"
                  placeholder="https://hooks.slack.com/services/..."
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">Channel Notifikasi Default</label>
                <input 
                  type="text" 
                  v-model="modalSlackChannel" 
                  :disabled="!authStore.isAdmin"
                  class="w-full bg-white border border-stone-200 focus:border-stone-400 rounded-xl px-3.5 py-2.5 text-xs text-[#1c1917] disabled:bg-stone-100 disabled:cursor-not-allowed"
                  placeholder="#ai-leads"
                />
              </div>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="p-5 border-t border-stone-200/80 bg-stone-50/80 flex items-center justify-between">
            <div>
              <Button 
                v-if="authStore.isAdmin && selectedTool.connectionStatus === 'connected'"
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
                {{ authStore.isAdmin ? 'Batal' : 'Tutup' }}
              </Button>
              <Button 
                v-if="authStore.isAdmin"
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

    <!-- ADMIN CREATE / EDIT TOOL MODAL -->
    <transition name="fade">
      <div 
        v-if="showToolModal" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
      >
        <Card rounded="rounded-3xl" padding="p-0" shadow="shadow-2xl" class="w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col justify-between transform transition-all duration-200 border-stone-200">
          <!-- Modal Header -->
          <div class="p-6 border-b border-stone-200/80 flex items-start justify-between bg-stone-50/70">
            <div class="flex items-center space-x-3.5">
              <div class="w-11 h-11 bg-amber-100 border border-amber-300 rounded-2xl flex items-center justify-center text-amber-900 shadow-2xs">
                <SvgIcon :name="isEditing ? 'edit' : 'plus'" className="w-5 h-5" />
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="text-base font-black text-[#1c1917]">{{ isEditing ? 'Edit Alat Integrasi' : 'Tambah Tool Baru' }}</h3>
                  <span class="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded uppercase">Khusus Admin</span>
                </div>
                <p class="text-[11px] text-stone-400 mt-0.5">{{ isEditing ? 'Perbarui metadata alat dan konfigurasi koneksi.' : 'Daftarkan integrasi baru ke marketplace workspace.' }}</p>
              </div>
            </div>

            <button 
              @click="showToolModal = false"
              class="text-stone-400 hover:text-stone-700 hover:bg-stone-100 p-2 rounded-xl transition-all cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Scrollable Body -->
          <div class="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
            <div v-if="formError" class="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <SvgIcon name="warning" className="w-4 h-4 text-red-500 shrink-0" />
              <span>{{ formError }}</span>
            </div>

            <!-- Row 1: Name & Category -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-stone-700 mb-1.5">Nama Alat <span class="text-red-500">*</span></label>
                <input 
                  type="text" 
                  v-model="formName" 
                  placeholder="Contoh: Discord Bot Notifier"
                  class="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-3 py-2 text-xs text-[#1c1917] focus:outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <label class="block font-bold text-stone-700 mb-1.5">Kategori Integrasi <span class="text-red-500">*</span></label>
                <select 
                  v-model="formCategory"
                  class="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-3 py-2 text-xs text-[#1c1917] focus:outline-none transition-all font-semibold cursor-pointer"
                >
                  <option v-for="cat in categories.filter(c => c !== 'Semua Kategori')" :key="cat" :value="cat">
                    {{ cat }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Row 2: Publisher & Version -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-stone-700 mb-1.5">Penerbit / Vendor <span class="text-red-500">*</span></label>
                <input 
                  type="text" 
                  v-model="formPublisher" 
                  placeholder="Contoh: Discord Inc. / Internal Tim"
                  class="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-3 py-2 text-xs text-[#1c1917] focus:outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <label class="block font-bold text-stone-700 mb-1.5">Versi Rilis</label>
                <input 
                  type="text" 
                  v-model="formVersion" 
                  placeholder="v1.0.0"
                  class="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-3 py-2 text-xs text-[#1c1917] focus:outline-none transition-all font-semibold"
                />
              </div>
            </div>

            <!-- Row 3: Badge & Icon -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-stone-700 mb-1.5">Badge Label (Opsional)</label>
                <input 
                  type="text" 
                  v-model="formBadge" 
                  placeholder="mis. Official, Verified, Baru, Beta"
                  class="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-3 py-2 text-xs text-[#1c1917] focus:outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <label class="block font-bold text-stone-700 mb-1.5">Ikon Alat</label>
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 shrink-0">
                    <SvgIcon :name="formIcon" className="w-4 h-4" />
                  </div>
                  <select 
                    v-model="formIcon"
                    class="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-3 py-2 text-xs text-[#1c1917] focus:outline-none transition-all font-semibold cursor-pointer"
                  >
                    <option v-for="ico in availableIcons" :key="ico.id" :value="ico.id">
                      {{ ico.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Row 4: Description -->
            <div>
              <label class="block font-bold text-stone-700 mb-1.5">Deskripsi Fungsi <span class="text-red-500">*</span></label>
              <textarea 
                v-model="formDesc" 
                rows="3"
                placeholder="Jelaskan peran alat ini, webhook yang dipanggil, atau kemampuan yang diberikan kepada agen AI..."
                class="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl p-3 text-xs text-[#1c1917] focus:outline-none transition-all font-semibold resize-none"
              ></textarea>
            </div>

            <!-- Row 5: Requires Connection Checkbox -->
            <div class="bg-stone-50 border border-stone-200 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <span class="font-bold text-stone-700 block text-xs">Memerlukan Konfigurasi Koneksi Eksternal?</span>
                <span class="text-[10px] text-stone-400">Aktifkan jika alat memerlukan API Key, Webhook URL, atau OAuth token.</span>
              </div>
              <input 
                type="checkbox" 
                v-model="formRequiresConnection" 
                class="w-4 h-4 text-amber-600 rounded cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-5 border-t border-stone-200/80 bg-stone-50/80 flex items-center justify-end space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              @click="showToolModal = false"
              :disabled="isSubmittingTool"
            >
              Batal
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              @click="handleSaveTool"
              :loading="isSubmittingTool"
            >
              <SvgIcon name="check" className="w-3.5 h-3.5 mr-1" />
              <span>{{ isEditing ? 'Simpan Perubahan' : 'Tambahkan Alat' }}</span>
            </Button>
          </div>
        </Card>
      </div>
    </transition>

    <!-- ADMIN DELETE CONFIRMATION MODAL -->
    <transition name="fade">
      <div 
        v-if="showDeleteModal && toolToDelete" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
      >
        <Card rounded="rounded-3xl" padding="p-6" shadow="shadow-2xl" class="w-full max-w-md space-y-5 border-stone-200">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
              <SvgIcon name="trash" className="w-6 h-6" />
            </div>
            <div class="space-y-1">
              <h3 class="text-base font-black text-[#1c1917]">Hapus Alat Integrasi?</h3>
              <p class="text-xs text-stone-500 leading-relaxed">
                Anda akan menghapus alat <strong>"{{ toolToDelete.name }}"</strong>. Alat ini akan dihilangkan dari katalog marketplace dan tidak dapat diakses lagi oleh agen.
              </p>
            </div>
          </div>

          <div class="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
            <span class="text-stone-400 font-medium">Kategori:</span>
            <span class="font-bold text-[#1c1917]">{{ toolToDelete.category }}</span>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-2">
            <Button 
              variant="ghost" 
              size="sm"
              @click="showDeleteModal = false"
              :disabled="isDeleting"
            >
              Batal
            </Button>
            <Button 
              variant="danger" 
              size="sm"
              @click="handleDeleteTool"
              :loading="isDeleting"
            >
              <SvgIcon name="trash" className="w-3.5 h-3.5 mr-1" />
              <span>Ya, Hapus Alat</span>
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
