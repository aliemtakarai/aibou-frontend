<script setup lang="ts">
import { ref, computed } from 'vue'
import SvgIcon from '../../components/ui/SvgIcon.vue'

// Category and filter state
const searchQuery = ref('')
const selectedCategory = ref('Semua Kategori')
const selectedStatusFilter = ref('Semua')

// Modal Config panel state
const showConfigModal = ref(false)
const selectedTool = ref<any>(null)

// Configurable inputs state
const sheetUrl = ref('https://docs.google.com/spreadsheets/d/1XyZ_mock_id_987236/edit')
const webhookUrl = ref('https://api.n8n.cloud/webhook/aibou-lead')
const whatsappNumber = ref('6281234567890')
const whatsappTemplate = ref('Halo Admin! Prospek baru terdeteksi: {{lead_name}} ({{lead_whatsapp}}). Segera lakukan follow-up.')
const midtransKey = ref('SB-Mid-server-xYxZm0cK12')
const midtransEnv = ref('Sandbox')
const n8nUrl = ref('https://n8n.my-business.com/webhook/98f12c8a')

// Connection test state for webhooks
const testingWebhook = ref(false)
const testResult = ref<'idle' | 'success' | 'failed'>('idle')

// Marketplace Categories
const categories = [
  'Semua Kategori',
  'Spreadsheet',
  'Sales & Marketing',
  'Customer Support',
  'Developer & Otomasi',
  'Finance & Keuangan',
  'Notifikasi'
]

// Single source of truth for marketplace tools
const toolsList = ref([
  {
    id: 'sheets',
    name: 'Google Sheets Sync',
    publisher: 'Google Workspace Integration',
    desc: 'Sinkronisasikan data prospek yang dikumpulkan asisten secara real-time ke Google Sheets Anda secara otomatis.',
    icon: 'sheets',
    category: 'Spreadsheet',
    installs: '8.4k',
    rating: 4.9,
    reviews: 142,
    enabled: true,
    configurable: true
  },
  {
    id: 'webhook',
    name: 'HTTP Webhook Gateway',
    publisher: 'Aibou Platform Core',
    desc: 'Kirim data otomatis ke Make, Zapier, n8n, atau API eksternal Anda saat pembeli menyelesaikan chat.',
    icon: 'link',
    category: 'Developer & Otomasi',
    installs: '3.2k',
    rating: 4.6,
    reviews: 58,
    enabled: false,
    configurable: true
  },
  {
    id: 'lead_qualifier',
    name: 'Kualifikasi Prospek Otomatis',
    publisher: 'Sales Intelligence AI',
    desc: 'Deteksi otomatis tingkat keminatan pembeli dan kualifikasi prospek secara cerdas berdasarkan interaksi.',
    icon: 'bot',
    category: 'Sales & Marketing',
    installs: '12k',
    rating: 4.9,
    reviews: 289,
    enabled: true,
    configurable: false
  },
  {
    id: 'faq_answerer',
    name: 'FAQ Reader & Answerer',
    publisher: 'RAG Engine Core',
    desc: 'Bantu asisten Anda mencocokkan dokumen bisnis secara otomatis untuk membalas tanya jawab pembeli.',
    icon: 'book',
    category: 'Customer Support',
    installs: '15k',
    rating: 5.0,
    reviews: 310,
    enabled: true,
    configurable: false
  },
  {
    id: 'payment',
    name: 'Invoice & Payment Midtrans',
    publisher: 'Fintech Connect Indonesia',
    desc: 'Buat tautan invoice tagihan pembayaran otomatis dan kirimkan ke pembeli di dalam obrolan WhatsApp.',
    icon: 'plug',
    category: 'Finance & Keuangan',
    installs: '5.1k',
    rating: 4.7,
    reviews: 94,
    enabled: false,
    configurable: true
  },
  {
    id: 'whatsapp_alerts',
    name: 'WhatsApp Admin Alerts',
    publisher: 'Messaging Gateway',
    desc: 'Kirim notifikasi pesan otomatis ke WhatsApp HP admin toko ketika ada pembeli butuh bantuan manusia.',
    icon: 'chat',
    category: 'Notifikasi',
    installs: '9.8k',
    rating: 4.8,
    reviews: 186,
    enabled: false,
    configurable: true
  },
  {
    id: 'n8n_node',
    name: 'n8n Workflow Activator',
    publisher: 'n8n Integration',
    desc: 'Trigger workflow otomatis n8n secara instan ketika pembeli selesai bertransaksi atau mendaftar.',
    icon: 'refresh',
    category: 'Developer & Otomasi',
    installs: '1.9k',
    rating: 4.5,
    reviews: 24,
    enabled: false,
    configurable: true
  }
])

// Filter logic matching Chrome Web Store filter styling
const filteredTools = computed(() => {
  return toolsList.value.filter(tool => {
    // 1. Search Query Match
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          tool.desc.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    // 2. Category Match
    const matchesCategory = selectedCategory.value === 'Semua Kategori' || tool.category === selectedCategory.value
    
    // 3. Status Match (Installed / Active vs All)
    const matchesStatus = selectedStatusFilter.value === 'Semua' || 
                          (selectedStatusFilter.value === 'Terpasang' && tool.enabled) ||
                          (selectedStatusFilter.value === 'Belum Terpasang' && !tool.enabled)
    
    return matchesSearch && matchesCategory && matchesStatus
  })
})

const totalInstalled = computed(() => {
  return toolsList.value.filter(t => t.enabled).length
})

// Open configure details modal
const openConfig = (tool: any) => {
  selectedTool.value = tool
  testResult.value = 'idle'
  showConfigModal.value = true
}

const toggleToolStatus = (tool: any) => {
  tool.enabled = !tool.enabled
}

// Simulated action logic
const testWebhook = () => {
  testingWebhook.value = true
  testResult.value = 'idle'
  setTimeout(() => {
    testingWebhook.value = false
    testResult.value = 'success'
  }, 1500)
}
</script>

<template>
  <div class="w-full space-y-8 relative">
    <!-- Header & Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 rounded-2xl bg-[#bef264]/20 border border-[#bef264]/30 flex items-center justify-center text-[#3f6212] shadow-sm transform hover:scale-105 transition-transform">
          <SvgIcon name="plug" className="w-6 h-6" />
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="text-2xl font-black text-[#0f172a] tracking-tight">Keahlian & Alat Marketplace</h1>
            <span class="bg-[#bef264]/35 text-[#3f6212] text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Aibou Store</span>
          </div>
          <p class="text-slate-500 text-xs mt-1">Tambahkan berbagai kemampuan khusus, webhook, dan integrasi mumpuni untuk meningkatkan kinerja asisten Anda.</p>
        </div>
      </div>
      
      <!-- Top actions -->
      <div class="flex items-center space-x-3 w-full md:w-auto">
        <div class="relative w-full md:w-72">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Cari keahlian, alat, integrasi..."
            class="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0f172a] focus:outline-none transition-all font-semibold shadow-2xs"
          />
        </div>
      </div>
    </div>

    <!-- Quick Store Info Metrics Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <!-- Total Available -->
      <div class="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center space-x-4">
        <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-655 flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div class="space-y-0.5">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Koleksi Marketplace</span>
          <span class="text-sm font-extrabold text-[#0f172a]">{{ toolsList.length }} Alat & Keahlian</span>
        </div>
      </div>

      <!-- Total Installed -->
      <div class="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center space-x-4">
        <div class="w-10 h-10 rounded-xl bg-[#bef264]/10 border border-[#bef264]/20 flex items-center justify-center text-[#3f6212] flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="space-y-0.5">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Keahlian Aktif</span>
          <span class="text-sm font-extrabold text-[#0f172a]">{{ totalInstalled }} Alat Terpasang</span>
        </div>
      </div>

      <!-- Developer mcp status -->
      <div class="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center space-x-4">
        <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-655 flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
          </svg>
        </div>
        <div class="space-y-0.5">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Protokol Integrasi</span>
          <span class="text-sm font-extrabold text-[#0f172a]">MCP Gateway v2.4</span>
        </div>
      </div>
    </div>

    <!-- MAIN CHROME STORE MARKETPLACE WORKSPACE -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- LEFT SIDEBAR: Chrome-store categories & status filters (3 cols) -->
      <aside class="lg:col-span-3 space-y-6">
        <!-- Status Filter Box -->
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4.5 shadow-sm space-y-4">
          <div class="text-[9.5px] font-black text-slate-400 uppercase tracking-widest px-1">Filter Status</div>
          <div class="space-y-1">
            <button 
              @click="selectedStatusFilter = 'Semua'"
              :class="selectedStatusFilter === 'Semua' ? 'bg-[#bef264] text-[#0f172a] font-extrabold shadow-2xs' : 'text-slate-600 hover:bg-slate-50 font-semibold'"
              class="w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between"
            >
              <span>Semua Kategori</span>
              <span class="text-[10px] font-mono opacity-60">({{ toolsList.length }})</span>
            </button>
            <button 
              @click="selectedStatusFilter = 'Terpasang'"
              :class="selectedStatusFilter === 'Terpasang' ? 'bg-[#bef264] text-[#0f172a] font-extrabold shadow-2xs' : 'text-slate-600 hover:bg-slate-50 font-semibold'"
              class="w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between"
            >
              <span>Terpasang</span>
              <span class="text-[10px] font-mono opacity-60">({{ totalInstalled }})</span>
            </button>
            <button 
              @click="selectedStatusFilter = 'Belum Terpasang'"
              :class="selectedStatusFilter === 'Belum Terpasang' ? 'bg-[#bef264] text-[#0f172a] font-extrabold shadow-2xs' : 'text-slate-600 hover:bg-slate-50 font-semibold'"
              class="w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between"
            >
              <span>Belum Terpasang</span>
              <span class="text-[10px] font-mono opacity-60">({{ toolsList.length - totalInstalled }})</span>
            </button>
          </div>
        </div>

        <!-- Categories Sidebar Selection -->
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4.5 shadow-sm space-y-4">
          <div class="text-[9.5px] font-black text-slate-400 uppercase tracking-widest px-1">Kategori Pilihan</div>
          <div class="space-y-1">
            <button 
              v-for="cat in categories"
              :key="cat"
              @click="selectedCategory = cat"
              :class="selectedCategory === cat ? 'bg-[#bef264]/10 text-[#3f6212] border-l-4 border-[#bef264] pl-2 font-extrabold' : 'text-slate-600 hover:bg-slate-50 pl-3 font-semibold'"
              class="w-full text-left py-2 rounded-lg text-xs transition-all cursor-pointer block truncate"
            >
              {{ cat }}
            </button>
          </div>
        </div>
      </aside>

      <!-- RIGHT PANEL: Store Products Grid (9 cols) -->
      <main class="lg:col-span-9 space-y-6">
        
        <!-- Hero Promo Card -->
        <div class="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-slate-800 rounded-3xl p-7 shadow-md relative overflow-hidden text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(190,242,100,0.1),transparent_70%)] pointer-events-none"></div>
          
          <div class="space-y-2 relative z-10 max-w-lg">
            <span class="text-[9px] bg-[#bef264]/20 border border-[#bef264]/30 px-2 py-0.5 rounded text-[#bef264] font-bold tracking-widest uppercase">Rekomendasi Minggu Ini</span>
            <h2 class="text-xl font-black tracking-tight">Koneksikan Toko Dengan Otomasi & Pembayaran</h2>
            <p class="text-slate-300 text-xs leading-normal">Tingkatkan efisiensi kerja. Kirim struk tagihan otomatis dan sinkronkan data penjualan Anda ke berbagai sistem cloud eksternal dalam sekali pasang.</p>
          </div>
          
          <!-- Cute mock badge or mini illustration -->
          <div class="relative z-10 flex-shrink-0 w-24 h-24 rounded-full bg-[#bef264]/10 border border-[#bef264]/25 flex items-center justify-center text-[#bef264] animate-pulse">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.904-4.43c.277-.138.568-.22.868-.246L21 16l-4.43-8.904a.87.87 0 00-.246-.868L12 3 9.813 15.904z" />
            </svg>
          </div>
        </div>

        <!-- Store Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div 
            v-for="tool in filteredTools"
            :key="tool.id"
            class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group relative"
          >
            <!-- Card Details -->
            <div class="space-y-4">
              <div class="flex items-start justify-between">
                <!-- Icon Box -->
                <div 
                  :class="tool.enabled ? 'bg-[#bef264]/15 border-[#bef264]/30 text-[#3f6212]' : 'bg-slate-50 border-slate-200 text-slate-450 group-hover:bg-white group-hover:text-slate-700'"
                  class="w-11 h-11 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-colors shadow-2xs"
                >
                  <SvgIcon :name="tool.icon" className="w-5.5 h-5.5" />
                </div>

                <!-- Installs only -->
                <div class="flex flex-col items-end text-[10px] text-slate-400 font-bold justify-center h-11">
                  <span class="opacity-70">{{ tool.installs }} download</span>
                </div>
              </div>

              <!-- Text Info -->
              <div class="space-y-1">
                <h3 class="text-sm font-extrabold text-[#0f172a] group-hover:text-[#3f6212] transition-colors leading-snug">{{ tool.name }}</h3>
                <span class="text-[9.5px] font-bold text-slate-400 block tracking-wide">{{ tool.publisher }}</span>
                <p class="text-[11px] text-slate-500 leading-relaxed font-medium pt-1 line-clamp-2">{{ tool.desc }}</p>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="pt-5 border-t border-slate-100 flex items-center justify-between gap-4 mt-5">
              <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider font-sans">
                {{ tool.category }}
              </span>

              <div class="flex items-center space-x-2">
                <!-- Config Button (visible only if configured and enabled) -->
                <button 
                  v-if="tool.enabled && tool.configurable"
                  @click="openConfig(tool)"
                  class="bg-slate-150 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Atur</span>
                </button>

                <!-- Enable/Disable Main CTA -->
                <button 
                  @click="toggleToolStatus(tool)"
                  :class="tool.enabled ? 'bg-[#bef264]/20 border border-[#bef264]/40 hover:bg-[#bef264]/30 text-[#3f6212] font-black' : 'bg-[#0f172a] hover:bg-slate-800 text-white font-bold'"
                  class="text-[10px] px-3.5 py-2.5 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center space-x-1"
                >
                  <span v-if="tool.enabled" class="flex items-center space-x-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-0.5"></span>
                    <span>Aktif</span>
                  </span>
                  <span v-else>Pasang ke Agen</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state grid -->
        <div v-if="filteredTools.length === 0" class="bg-white border border-slate-200 border-dashed rounded-3xl p-16 text-center space-y-3">
          <div class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 class="text-xs font-black text-slate-700">Tidak ada alat yang ditemukan</h3>
          <p class="text-[10.5px] text-slate-400 max-w-xs mx-auto">Coba cari kata kunci lain atau pilih kategori yang berbeda dari panel samping.</p>
        </div>

      </main>

    </div>

    <!-- CHROME STORE POP-UP DRAWER/MODAL FOR CONFIGURATION -->
    <transition name="modal-fade">
      <div 
        v-if="showConfigModal && selectedTool" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      >
        <div class="bg-white border border-slate-200 rounded-3xl shadow-xl w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col justify-between transform transition-all duration-300">
          
          <!-- Modal Header -->
          <div class="p-5.5 border-b border-slate-100 flex items-start justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-11 h-11 bg-[#bef264]/10 border border-[#bef264]/20 rounded-2xl flex items-center justify-center text-[#3f6212]">
                <SvgIcon :name="selectedTool.icon" className="w-5.5 h-5.5" />
              </div>
              <div class="space-y-0.5">
                <div class="flex items-center space-x-2">
                  <h3 class="text-sm font-black text-[#0f172a] leading-none">{{ selectedTool.name }}</h3>
                  <span class="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded uppercase">Config</span>
                </div>
                <span class="text-[9.5px] font-bold text-slate-400 block tracking-wide">{{ selectedTool.publisher }}</span>
              </div>
            </div>
            
            <button 
              @click="showConfigModal = false"
              class="text-slate-400 hover:text-[#0f172a] hover:bg-slate-50 p-2 rounded-xl transition-all cursor-pointer"
            >
              <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Scrollable Content (Inputs fields) -->
          <div class="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            
            <!-- Tool Description -->
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-100/60 leading-relaxed text-slate-550">
              {{ selectedTool.desc }}
            </div>

            <!-- Status Switcher inside details page -->
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <span class="font-bold text-slate-700">Status Keaktifan Alat</span>
              <button 
                @click="toggleToolStatus(selectedTool)"
                :class="selectedTool.enabled ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-655'"
                class="px-4 py-2 rounded-xl font-bold cursor-pointer transition-all active:scale-95"
              >
                {{ selectedTool.enabled ? 'Aktif' : 'Nonaktif' }}
              </button>
            </div>

            <!-- DYNAMIC INPUT FIELDS BASED ON TOOL ID -->
            
            <!-- 1. Google Sheets configuration -->
            <div v-if="selectedTool.id === 'sheets'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Spreadsheet Link (Google Sheets URL)</label>
                <input 
                  type="text" 
                  v-model="sheetUrl" 
                  class="w-full bg-[#f8fafc] border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl px-4 py-3 text-xs text-[#0f172a] focus:outline-none font-semibold font-mono"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                />
              </div>

              <!-- Header fields mapping showcase -->
              <div class="space-y-2">
                <span class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Skema Kolom yang Dicatat</span>
                <div class="bg-[#f8fafc] border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs font-mono text-[10.5px]">
                  <table class="w-full text-left">
                    <thead>
                      <tr class="bg-slate-100 text-slate-600 border-b border-slate-200/80">
                        <th class="p-2.5 font-bold">Kolom Google Sheet</th>
                        <th class="p-2.5 font-bold">Variabel Asisten</th>
                      </tr>
                    </thead>
                    <tbody class="text-slate-700">
                      <tr class="border-b border-slate-100">
                        <td class="p-2.5 font-semibold">Kolom A</td>
                        <td class="p-2.5 text-[#3f6212] font-bold">lead_name (Nama Pelanggan)</td>
                      </tr>
                      <tr class="border-b border-slate-100">
                        <td class="p-2.5 font-semibold">Kolom B</td>
                        <td class="p-2.5 text-[#3f6212] font-bold">lead_whatsapp (Nomor Telepon)</td>
                      </tr>
                      <tr>
                        <td class="p-2.5 font-semibold">Kolom C</td>
                        <td class="p-2.5 text-[#3f6212] font-bold">interest_level (Minat Membeli)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- 2. Webhook Gateway configuration -->
            <div v-if="selectedTool.id === 'webhook'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Endpoint Webhook API Target</label>
                <div class="flex gap-2">
                  <input 
                    type="text" 
                    v-model="webhookUrl" 
                    class="flex-1 bg-[#f8fafc] border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl px-4 py-3 text-xs text-[#0f172a] focus:outline-none font-semibold font-mono"
                    placeholder="https://api.n8n.cloud/webhook/..."
                  />
                  <button 
                    @click="testWebhook"
                    :disabled="testingWebhook"
                    class="bg-[#0f172a] hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold text-[11px] px-5 rounded-xl transition-colors cursor-pointer"
                  >
                    {{ testingWebhook ? 'Menguji...' : 'Kirim Tes' }}
                  </button>
                </div>
              </div>

              <!-- Connection test details -->
              <div v-if="testResult === 'success'" class="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center space-x-2">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Koneksi Webhook Aktif! Sistem merespons dengan kode <strong class="font-mono">HTTP 200 OK</strong>.</span>
              </div>

              <!-- Visual payload -->
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contoh Payload Data (POST)</label>
                <pre class="bg-[#1e293b] text-slate-200 p-4 rounded-xl font-mono leading-relaxed overflow-x-auto border border-slate-800 shadow-sm text-[10px]">
{
  "event": "lead_conversion",
  "agent_id": "budi-sales",
  "data": {
    "lead_name": "Alice Widjaja",
    "lead_whatsapp": "081234567890",
    "interest_level": "High"
  }
}</pre>
              </div>
            </div>

            <!-- 3. Payment Midtrans configuration -->
            <div v-if="selectedTool.id === 'payment'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Midtrans Server Key</label>
                <input 
                  type="text" 
                  v-model="midtransKey" 
                  class="w-full bg-[#f8fafc] border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl px-4 py-3 text-xs text-[#0f172a] focus:outline-none font-semibold font-mono"
                  placeholder="SB-Mid-server-..."
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lingkungan Sistem (Environment)</label>
                <select 
                  v-model="midtransEnv" 
                  class="w-full bg-[#f8fafc] border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl px-3.5 py-3 text-xs text-[#0f172a] focus:outline-none font-semibold cursor-pointer"
                >
                  <option>Sandbox (Uji Coba)</option>
                  <option>Production (Live Asli)</option>
                </select>
              </div>
            </div>

            <!-- 4. WhatsApp Admin Alerts configuration -->
            <div v-if="selectedTool.id === 'whatsapp_alerts'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nomor Handphone Admin (WhatsApp)</label>
                <input 
                  type="text" 
                  v-model="whatsappNumber" 
                  class="w-full bg-[#f8fafc] border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl px-4 py-3 text-xs text-[#0f172a] focus:outline-none font-semibold font-mono"
                  placeholder="Format: 62812345..."
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Format Pesan Notifikasi</label>
                <textarea 
                  rows="3" 
                  v-model="whatsappTemplate" 
                  class="w-full bg-[#f8fafc] border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl px-4 py-3 text-xs text-[#0f172a] focus:outline-none font-semibold leading-relaxed"
                  placeholder="Tulis format notifikasi..."
                ></textarea>
                <span class="text-[9.5px] text-slate-400">Gunakan tag <code v-pre class="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-700">{{lead_name}}</code> atau <code v-pre class="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-700">{{lead_whatsapp}}</code> untuk menyematkan data pelanggan secara dinamis.</span>
              </div>
            </div>

            <!-- 5. n8n Node configuration -->
            <div v-if="selectedTool.id === 'n8n_node'" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">n8n Webhook URL Target</label>
                <input 
                  type="text" 
                  v-model="n8nUrl" 
                  class="w-full bg-[#f8fafc] border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl px-4 py-3 text-xs text-[#0f172a] focus:outline-none font-semibold font-mono"
                  placeholder="https://n8n.example.com/webhook/..."
                />
              </div>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end space-x-3.5">
            <button 
              @click="showConfigModal = false"
              class="bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-xs px-5 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
            >
              Tutup
            </button>
            <button 
              @click="showConfigModal = false"
              class="bg-[#0f172a] hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Simpan Setelan Alat
            </button>
          </div>

        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Modal animation transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
