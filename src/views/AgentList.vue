<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { mockAgents } from '../utils/mockData'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const selectAgent = (id: string) => {
  router.push(`/agent/${id}/chat`) // direct to chat console by default
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

const selectedPlan = ref('Pro')

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
      features: [
        'Hingga 3 Agen AI Aktif secara bersamaan.',
        'Basis Pengetahuan RAG (Maksimal 100 Dokumen Vektor).',
        'Integrasi Google Sheets & Webhook API dasar.'
      ]
    }
  } else if (selectedPlan.value === 'Ultra') {
    return {
      name: 'Aibou Ultra Premium',
      price: 'Rp 2.999.000',
      features: [
        'Hingga 10 Agen AI Aktif secara bersamaan.',
        'Basis Pengetahuan RAG (Maksimal 1.000 Dokumen Vektor).',
        'Semua Koneksi Keahlian (Midtrans, WhatsApp Alerts, n8n).',
        'Prioritas Server Menengah (Kecepatan respon ~1.2s).'
      ]
    }
  } else {
    return {
      name: 'Aibou Max Enterprise',
      price: 'Rp 5.999.000',
      features: [
        'Jumlah Agen AI Aktif Tanpa Batas.',
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
  <div class="min-h-screen bg-[#f4f7f6] text-[#0f172a] p-6 md:p-10 font-sans relative overflow-hidden">
    <!-- Global Toast Notification -->
    <transition name="toast-slide">
      <div 
        v-if="showGlobalToast" 
        class="fixed top-6 right-6 bg-[#0f172a] text-white text-xs px-5 py-3.5 rounded-2xl shadow-xl border border-slate-800 z-50 flex items-center space-x-3 backdrop-blur-md animate-fade-in"
      >
        <span class="w-2.5 h-2.5 rounded-full bg-[#bef264] animate-pulse"></span>
        <div class="flex flex-col text-left">
          <span class="font-bold tracking-wide">Selamat Datang</span>
          <span class="text-[10px] text-slate-400 mt-0.5">{{ globalToastMessage }}</span>
        </div>
      </div>
    </transition>
    <!-- Soft light green gradient glow -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_-20%,rgba(190,242,100,0.12),rgba(255,255,255,0))] pointer-events-none"></div>

    <div class="max-w-6xl mx-auto relative z-10 space-y-8">
      <!-- Navbar Row -->
      <div class="flex items-center justify-between border-b border-slate-200/60 pb-4">
        <div class="flex items-center">
          <img src="/logo.png" alt="Aibou Logo" class="h-12 object-contain" />
        </div>

        <!-- User Profile Dropdown Container -->
        <div class="relative">
          <button 
            @click="showUserDropdown = !showUserDropdown"
            class="flex items-center space-x-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-750 shadow-sm cursor-pointer select-none"
          >
            <div class="w-5 h-5 rounded-full bg-[#bef264] flex items-center justify-center text-[#0f172a] text-[10px] font-black">
              AD
            </div>
            <span>Admin Aibou</span>
            <svg class="w-3.5 h-3.5 text-slate-450 transition-transform duration-200" :class="showUserDropdown ? 'rotate-180' : ''" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown Overlay to close click-outside -->
          <div v-if="showUserDropdown" @click="showUserDropdown = false" class="fixed inset-0 z-30"></div>

          <!-- Dropdown Menu -->
          <div 
            v-if="showUserDropdown" 
            class="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-40 animate-fade-in"
          >
            <button 
              @click="openSettings"
              class="w-full text-left px-4 py-2.5 text-xs text-slate-750 hover:bg-[#f4f7f6] hover:text-[#0f172a] font-bold flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <svg class="w-3.5 h-3.5 text-slate-455" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Pengaturan</span>
            </button>
            <button 
              @click="triggerLogout"
              class="w-full text-left px-4 py-2.5 text-xs text-red-655 hover:bg-red-50/50 font-bold flex items-center space-x-2 transition-colors border-t border-slate-100 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5 text-red-455" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2 text-[#4d7c0f] text-xs font-bold uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-[#bef264]"></span>
            <span>Konsol Aibou v1.2</span>
          </div>
          <h1 class="text-3xl font-black text-[#0f172a] tracking-tight mt-1">
            Selamat Datang, Admin 
          </h1>
          <p class="text-slate-505 mt-2 text-sm max-w-xl">
            Ikhtisar wawasan agen percakapan, kinerja penjualan, dan basis pengetahuan RAG.
          </p>
        </div>

        <button 
          @click="showCreateModal = true"
          class="bg-[#0f172a] hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm hover:shadow-md transition-all flex items-center space-x-2 cursor-pointer self-start md:self-auto"
        >
          <span class="text-sm font-bold leading-none">+</span>
          <span>Pasang Agen Baru</span>
        </button>
      </div>

      <!-- Quick Stats Panel -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div class="space-y-1">
          <span class="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Agen</span>
          <div class="text-2xl font-bold text-[#0f172a]">{{ mockAgents.length }}</div>
        </div>
        <div class="space-y-1 border-l border-slate-100 pl-4">
          <span class="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider">Obrolan Kotak Masuk Aktif</span>
          <div class="text-2xl font-bold text-[#4d7c0f] flex items-center space-x-1.5">
            <span>3</span>
            <span class="w-2 h-2 rounded-full bg-[#bef264]"></span>
          </div>
        </div>
        <div class="space-y-1 border-l border-slate-100 pl-4">
          <span class="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider">Dokumen Disinkronkan</span>
          <div class="text-2xl font-bold text-[#0f172a]">24 Berkas</div>
        </div>
        <div class="space-y-1 border-l border-slate-100 pl-4">
          <span class="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider">Status Engine</span>
          <div class="text-2xl font-bold text-[#4d7c0f] flex items-center space-x-1">
            <span class="text-sm font-bold">Operasional</span>
          </div>
        </div>
      </div>

      <!-- Agents Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          v-for="agent in mockAgents" 
          :key="agent.id"
          @click="selectAgent(agent.id)"
          class="bg-white border border-slate-200/80 rounded-2xl p-6 hover:border-slate-355 hover:bg-slate-50/20 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] group relative overflow-hidden flex flex-col justify-between min-h-[190px]"
        >
          <!-- Soft light green hover accent glow -->
          <div class="absolute -right-16 -top-16 w-32 h-32 bg-[#bef264]/5 rounded-full blur-2xl group-hover:bg-[#bef264]/10 transition-all duration-300"></div>

          <div>
            <div class="flex items-start space-x-4">
              <img 
                :src="agent.avatar" 
                :alt="agent.name" 
                class="w-14 h-14 rounded-full object-cover border border-slate-200 group-hover:border-slate-300 transition-all duration-300 shadow-sm"
              />
              <div class="space-y-1">
                <h2 class="text-base font-bold text-[#0f172a] group-hover:text-slate-800 transition-colors duration-200">{{ agent.name }}</h2>
                <p class="text-slate-400 text-xs font-medium leading-relaxed">{{ agent.role }}</p>
              </div>
            </div>

            <!-- Custom Agent Stats Snippet -->
            <div class="mt-5 grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-medium">
              <div class="bg-[#f4f7f6] px-2 py-1.5 rounded-lg border border-slate-100">
                Kotak Masuk: <span class="text-slate-700 font-bold">2 aktif</span>
              </div>
              <div class="bg-[#f4f7f6] px-2 py-1.5 rounded-lg border border-slate-100">
                Keahlian: <span class="text-slate-700 font-bold">Sheets</span>
              </div>
            </div>
          </div>

          <div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
            <div class="flex items-center space-x-1.5">
              <span class="w-2 h-2 rounded-full bg-[#bef264]"></span>
              <span class="text-slate-550 font-medium">Responder Aktif</span>
            </div>
            <span class="text-slate-700 font-bold flex items-center space-x-0.5 group-hover:translate-x-1 transition-transform">
              <span>Buka Dasbor</span>
              <span>&rarr;</span>
            </span>
          </div>
        </div>

        <!-- Add Agent Placeholder Card -->
        <div 
          @click="showCreateModal = true"
          class="border-2 border-dashed border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group min-h-[190px]"
        >
          <div class="w-12 h-12 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-455 group-hover:text-slate-700 transition-colors shadow-sm mb-3 text-lg font-bold">
            +
          </div>
          <h3 class="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Pasang Agen AI Baru</h3>
          <p class="text-slate-400 text-xs mt-1 max-w-[200px]">Buat persona kustom baru dan atur ruang kerja Google Drive.</p>
        </div>
      </div>
    </div>

    <!-- Create Agent Modal -->
    <div 
      v-if="showCreateModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <div 
        class="bg-white border border-slate-200/80 rounded-2xl p-6 w-full max-w-md shadow-2xl relative space-y-6"
      >
        <button 
          @click="showCreateModal = false"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-750 transition-colors text-xl font-bold cursor-pointer"
        >
          &times;
        </button>

        <div>
          <h3 class="text-base font-bold text-[#0f172a]">Pasang Agen AI</h3>
          <p class="text-slate-400 text-xs mt-1">Konfigurasikan nama dan peran khusus untuk asisten Anda.</p>
        </div>

        <div class="space-y-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-550 uppercase tracking-wider">Nama Agen</label>
            <input 
              type="text" 
              v-model="newAgentName" 
              placeholder="contoh: Rian"
              class="w-full bg-[#f4f7f6] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:border-slate-350 focus:outline-none placeholder-slate-400 transition-colors" 
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-555 uppercase tracking-wider">Deskripsi Spesialisasi / Peran</label>
            <input 
              type="text" 
              v-model="newAgentRole" 
              placeholder="contoh: Spesialis Penjualan & Kualifikasi Prospek"
              class="w-full bg-[#f4f7f6] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:border-slate-350 focus:outline-none placeholder-slate-400 transition-colors" 
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-555 uppercase tracking-wider">URL Avatar (Opsional)</label>
            <input 
              type="text" 
              v-model="newAgentAvatar" 
              class="w-full bg-[#f4f7f6] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-550 focus:border-slate-355 focus:outline-none font-mono transition-colors" 
            />
          </div>
        </div>

        <div class="flex items-center justify-end space-x-3 pt-2">
          <button 
            @click="showCreateModal = false"
            class="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button 
            @click="createAgent"
            :disabled="!newAgentName.trim() || !newAgentRole.trim()"
            class="bg-[#0f172a] hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-[#0f172a] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Pasang Agen
          </button>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <div 
      v-if="showSettingsModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <div 
        class="bg-white border border-slate-200/80 rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative space-y-6"
      >
        <!-- Close Button -->
        <button 
          @click="showSettingsModal = false"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-750 transition-colors text-xl font-bold cursor-pointer"
        >
          &times;
        </button>

        <!-- Toast Notification inside settings modal -->
        <div 
          v-if="showSettingsToast" 
          class="absolute top-2 left-6 right-6 bg-[#bef264]/20 border border-[#bef264]/40 text-[#3f6212] text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 z-50 animate-bounce"
        >
          <span class="w-2 h-2 rounded-full bg-[#a3e635] animate-pulse"></span>
          <span class="font-bold">{{ settingsToastMessage }}</span>
        </div>

        <div>
          <h3 class="text-base font-bold text-[#0f172a]">Pengaturan Akun</h3>
          <p class="text-slate-400 text-xs mt-1">Ubah kata sandi akun Anda atau kelola paket langganan aktif.</p>
        </div>

        <!-- Body with Sidebar Menu on the Left Side -->
        <div class="flex flex-col sm:flex-row gap-6 min-h-[280px]">
          <!-- Left side: Vertical Tabs Navigation Menu -->
          <div class="w-full sm:w-44 flex flex-row sm:flex-col gap-2 sm:border-r sm:border-slate-150 sm:pr-4">
            <button 
              @click="activeSettingsTab = 'password'"
              :class="activeSettingsTab === 'password' ? 'bg-[#bef264]/20 border-[#bef264]/40 text-[#3f6212] font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-transparent'"
              class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none"
            >
              Ubah Kata Sandi
            </button>
            <button 
              @click="activeSettingsTab = 'subscription'"
              :class="activeSettingsTab === 'subscription' ? 'bg-[#bef264]/20 border-[#bef264]/40 text-[#3f6212] font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-transparent'"
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
                <label class="block text-xs font-semibold text-slate-550 uppercase tracking-wider">Kata Sandi Saat Ini</label>
                <input 
                  type="password" 
                  v-model="currentPassword"
                  placeholder="••••••••"
                  class="w-full bg-[#f4f7f6] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-slate-350 focus:outline-none placeholder-slate-400 transition-colors" 
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-slate-550 uppercase tracking-wider">Kata Sandi Baru</label>
                <input 
                  type="password" 
                  v-model="newPassword"
                  placeholder="Minimal 8 karakter"
                  class="w-full bg-[#f4f7f6] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-slate-350 focus:outline-none placeholder-slate-400 transition-colors" 
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-slate-555 uppercase tracking-wider">Konfirmasi Kata Sandi Baru</label>
                <input 
                  type="password" 
                  v-model="confirmPassword"
                  placeholder="Ulangi kata sandi baru"
                  class="w-full bg-[#f4f7f6] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-slate-350 focus:outline-none placeholder-slate-400 transition-colors" 
                />
              </div>

              <div class="flex justify-end pt-2">
                <button 
                  @click="updatePassword"
                  :disabled="!currentPassword || !newPassword || !confirmPassword"
                  class="bg-[#0f172a] hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Perbarui Kata Sandi
                </button>
              </div>
            </div>

            <!-- 2. Subscription Tab -->
            <div v-if="activeSettingsTab === 'subscription'" class="space-y-5">
              <!-- Active Plan Details -->
              <div class="bg-[#f4f7f6]/60 p-4 rounded-2xl border border-slate-200/60 space-y-3">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-[9px] text-[#3f6212] font-bold uppercase tracking-wider bg-[#bef264]/25 px-2 py-0.5 rounded-full border border-[#bef264]/40">Paket Aktif</span>
                    <h4 class="text-xs font-black text-[#0f172a] mt-1.5">{{ currentPlanDetails.name }}</h4>
                  </div>
                  <div class="text-right">
                    <span class="text-xs font-extrabold text-[#0f172a]">{{ currentPlanDetails.price }}</span>
                    <span class="text-[9px] text-slate-400 block mt-0.5">/ bulan</span>
                  </div>
                </div>

                <div class="h-[1px] bg-slate-200"></div>

                <div class="grid grid-cols-2 gap-4 text-[10px] text-slate-500 font-bold">
                  <div>
                    Siklus Penagihan: <span class="text-slate-800 font-bold">Bulanan</span>
                  </div>
                  <div>
                    Pembaruan Berikutnya: <span class="text-slate-800 font-bold">05 Sept 2026</span>
                  </div>
                </div>
              </div>

              <!-- Package Tier Selector (Pro, Ultra, Max) -->
              <div class="space-y-2">
                <label class="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider">Pilih Paket Langganan</label>
                <div class="grid grid-cols-3 gap-3">
                  <!-- Pro Package -->
                  <div 
                    @click="selectPlan('Pro')"
                    :class="selectedPlan === 'Pro' ? 'border-[#bef264] bg-[#bef264]/8 shadow-2xs ring-1 ring-[#bef264]/20' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'"
                    class="border rounded-xl p-3 text-center cursor-pointer transition-all duration-200 select-none flex flex-col justify-between"
                  >
                    <span class="text-xs font-black text-[#0f172a] block">Pro</span>
                    <span class="text-[10px] font-bold text-slate-500 mt-1 block">Rp 1.49M</span>
                    <span class="text-[8px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded mt-2 block font-extrabold" v-if="selectedPlan === 'Pro'">Aktif</span>
                    <span class="text-[8px] text-slate-450 mt-2 block font-bold hover:text-[#0f172a]" v-else>Pilih Pro</span>
                  </div>

                  <!-- Ultra Package -->
                  <div 
                    @click="selectPlan('Ultra')"
                    :class="selectedPlan === 'Ultra' ? 'border-[#bef264] bg-[#bef264]/8 shadow-2xs ring-1 ring-[#bef264]/20' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'"
                    class="border rounded-xl p-3 text-center cursor-pointer transition-all duration-200 select-none flex flex-col justify-between"
                  >
                    <span class="text-xs font-black text-[#0f172a] block">Ultra</span>
                    <span class="text-[10px] font-bold text-slate-500 mt-1 block">Rp 2.99M</span>
                    <span class="text-[8px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded mt-2 block font-extrabold" v-if="selectedPlan === 'Ultra'">Aktif</span>
                    <span class="text-[8px] text-slate-450 mt-2 block font-bold hover:text-[#0f172a]" v-else>Pilih Ultra</span>
                  </div>

                  <!-- Max Package -->
                  <div 
                    @click="selectPlan('Max')"
                    :class="selectedPlan === 'Max' ? 'border-[#bef264] bg-[#bef264]/8 shadow-2xs ring-1 ring-[#bef264]/20' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'"
                    class="border rounded-xl p-3 text-center cursor-pointer transition-all duration-200 select-none flex flex-col justify-between"
                  >
                    <span class="text-xs font-black text-[#0f172a] block">Max</span>
                    <span class="text-[10px] font-bold text-slate-500 mt-1 block">Rp 5.99M</span>
                    <span class="text-[8px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded mt-2 block font-extrabold" v-if="selectedPlan === 'Max'">Aktif</span>
                    <span class="text-[8px] text-slate-455 mt-2 block font-bold hover:text-[#0f172a]" v-else>Pilih Max</span>
                  </div>
                </div>
              </div>

              <!-- Subscription Features List -->
              <div class="space-y-2">
                <label class="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider">Cakupan & Fitur Terpilih</label>
                <ul class="text-[10px] text-slate-655 space-y-1.5 pl-1 font-semibold">
                  <li 
                    v-for="(feature, fidx) in currentPlanDetails.features" 
                    :key="fidx" 
                    class="flex items-start space-x-2"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-[#bef264] mt-1.5 flex-shrink-0"></span>
                    <span class="leading-normal">{{ feature }}</span>
                  </li>
                </ul>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center justify-between border-t border-slate-100 pt-4 gap-2">
                <button 
                  @click="alert('Fitur pembatalan langganan sedang diproses.')"
                  class="text-[10px] text-red-655 hover:text-red-800 hover:bg-red-50/50 px-3 py-2 rounded-xl transition-all cursor-pointer font-bold"
                >
                  Batalkan Langganan
                </button>
                <button 
                  @click="alert('Membuka portal pembayaran...')"
                  class="bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-[10px] px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Kelola Metode Pembayaran
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
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

