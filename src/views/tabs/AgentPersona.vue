<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { mockAgents } from '../../utils/mockData'
import SvgIcon from '../../components/ui/SvgIcon.vue'

const route = useRoute()
const agentId = computed(() => route.params.id as string)
const agent = computed(() => mockAgents.value.find(a => a.id === agentId.value))

const tone = ref('Formal / Profesional')
const secondaryLanguage = ref('English')
const guardrails = ref([
  'Jangan memberikan harga di bawah standar SOP.',
  'Selalu gunakan sapaan ramah di awal kalimat.',
  'Jangan menjanjikan garansi produk melebihi 1 tahun.'
])
const newGuardrail = ref('')
const showToast = ref(false)

const addGuardrail = () => {
  if (newGuardrail.value.trim()) {
    guardrails.value.push(newGuardrail.value.trim())
    newGuardrail.value = ''
  }
}

const removeGuardrail = (index: number) => {
  guardrails.value.splice(index, 1)
}

const saveSettings = () => {
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const tones = [
  { 
    name: 'Formal / Profesional', 
    desc: 'Sopan, ramah bisnis, terstruktur, dan cocok untuk instansi resmi.', 
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' 
  },
  { 
    name: 'Santai / Ramah', 
    desc: 'Hangat, menggunakan emoji, komunikatif, dan seperti mengobrol dengan teman.', 
    icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' 
  },
  { 
    name: 'Singkat & Padat', 
    desc: 'Menjawab langsung ke inti pertanyaan, hemat waktu, tanpa basa-basi.', 
    icon: 'M13 10V3L4 14h7v7l9-11h-7z' 
  },
  { 
    name: 'Fokus Penjualan', 
    desc: 'Persuasif, aktif menawarkan produk, dan mengarahkan pelanggan untuk membeli.', 
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' 
  }
]

// Dynamic conversational preview based on persona configuration
const previewMessage = computed(() => {
  if (!agent.value) return ''
  const name = agent.value.name || 'Asisten'
  const role = agent.value.role || 'customer support'
  
  if (tone.value === 'Formal / Profesional') {
    return `Halo, selamat datang di layanan kami. Saya ${name}, asisten virtual Anda yang bertugas sebagai ${role}. Ada yang bisa saya bantu dengan baik hari ini?`
  } else if (tone.value === 'Santai / Ramah') {
    return `Halo! 😊 Aku ${name}, ${role} yang siap bantu kamu. Ada yang bisa kita diskusikan hari ini? Kabari aku ya! ✨`
  } else if (tone.value === 'Singkat & Padat') {
    return `Halo. Saya ${name} (${role}). Apa yang bisa saya bantu?`
  } else if (tone.value === 'Fokus Penjualan') {
    return `Halo! Saya ${name}, spesialis ${role}. Hari ini kami ada promo menarik khusus untuk Anda. Tertarik melihat daftarnya sekarang?`
  }
  return 'Halo! Ada yang bisa saya bantu?'
})

// Simple friendly security rating
const safetyStatus = computed(() => {
  const count = guardrails.value.length
  if (count >= 3) return { label: 'Sangat Terjaga', colorClass: 'bg-emerald-500', textClass: 'text-emerald-700' }
  if (count > 0) return { label: 'Cukup Terjaga', colorClass: 'bg-amber-500', textClass: 'text-amber-700' }
  return { label: 'Tanpa Aturan Pembatas', colorClass: 'bg-rose-500', textClass: 'text-rose-700' }
})
</script>

<template>
  <div class="w-full space-y-8 relative" v-if="agent">
    <!-- Toast Notification -->
    <transition name="toast-slide">
      <div 
        v-if="showToast" 
        class="fixed top-6 right-6 bg-[#0f172a] text-white text-xs px-5 py-3.5 rounded-2xl shadow-xl border border-slate-800 z-50 flex items-center space-x-3 backdrop-blur-md"
      >
        <span class="w-2.5 h-2.5 rounded-full bg-[#bef264] animate-pulse"></span>
        <div class="flex flex-col">
          <span class="font-bold tracking-wide">Pengaturan Disimpan</span>
          <span class="text-[10px] text-slate-400">Karakter asisten Anda berhasil diperbarui.</span>
        </div>
      </div>
    </transition>

    <!-- Header & Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 rounded-2xl bg-[#bef264]/20 border border-[#bef264]/30 flex items-center justify-center text-[#3f6212] shadow-sm transform hover:scale-105 transition-transform">
          <SvgIcon name="bot" className="w-6 h-6" />
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="text-2xl font-black text-[#0f172a] tracking-tight">Kepribadian & Gaya Bicara</h1>
            <span class="bg-slate-200/60 text-slate-600 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Langkah 1 dari 2</span>
          </div>
          <p class="text-slate-500 text-xs mt-1">Sesuaikan nama, cara menyapa, gaya bahasa, dan aturan main asisten AI Anda agar sesuai dengan karakter bisnis Anda.</p>
        </div>
      </div>
      
      <!-- Header Actions -->
      <div class="flex items-center space-x-3">
        <button 
          @click="saveSettings" 
          class="w-full md:w-auto bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-[0_4px_14px_rgba(15,23,42,0.15)] active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
        >
          <span>Simpan & Terapkan</span>
        </button>
      </div>
    </div>

    <!-- Quick Insights Metrics Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <!-- Status Keamanan -->
      <div class="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center space-x-4">
        <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div class="space-y-0.5">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kepatuhan Aturan</span>
          <div class="flex items-center space-x-2">
            <span class="text-sm font-extrabold text-[#0f172a]">{{ safetyStatus.label }}</span>
            <span :class="safetyStatus.colorClass" class="w-2.5 h-2.5 rounded-full inline-block"></span>
          </div>
        </div>
      </div>

      <!-- Bahasa Utama -->
      <div class="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center space-x-4">
        <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 11.37 7.31 16.5 3 19" />
          </svg>
        </div>
        <div class="space-y-0.5">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bahasa Asisten</span>
          <span class="text-sm font-extrabold text-[#0f172a]">Indonesia + {{ secondaryLanguage }}</span>
        </div>
      </div>

      <!-- Nada Terpilih -->
      <div class="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center space-x-4">
        <div class="w-10 h-10 rounded-xl bg-[#bef264]/10 border border-[#bef264]/20 flex items-center justify-center text-[#3f6212] flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <div class="space-y-0.5">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gaya Bicara</span>
          <span class="text-sm font-extrabold text-[#0f172a]">{{ tone }}</span>
        </div>
      </div>
    </div>

    <!-- Main Workspace Layout Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      
      <!-- LEFT SECTION: Identity Form & Live Simulator -->
      <div class="lg:col-span-1 space-y-6">
        
        <!-- Identity Config Card -->
        <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 class="text-xs font-black text-slate-800 uppercase tracking-widest">Profil Asisten</h3>
            <span class="w-2.5 h-2.5 rounded-full bg-[#bef264]"></span>
          </div>

          <div class="space-y-4">
            <!-- Public Name -->
            <div class="space-y-1.5">
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Asisten</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input 
                  type="text" 
                  v-model="agent.name" 
                  class="w-full bg-[#f8fafc] border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0f172a] focus:outline-none transition-all font-semibold" 
                  placeholder="Contoh: Budi, Siti, atau nama bisnis Anda"
                />
              </div>
            </div>

            <!-- Role & Spec -->
            <div class="space-y-1.5">
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tugas / Peran</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input 
                  type="text" 
                  v-model="agent.role" 
                  class="w-full bg-[#f8fafc] border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0f172a] focus:outline-none transition-all font-semibold" 
                  placeholder="Contoh: Menjawab FAQ atau Membantu Penjualan"
                />
              </div>
            </div>

            <!-- Secondary Language -->
            <div class="space-y-1.5">
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bahasa Tambahan</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2a2.5 2.5 0 002.5-2.5V10a2 2 0 00-2-2h-1.5a2 2 0 01-2-2V4.305M12 22a10 10 0 100-20 10 10 0 000 20z" />
                  </svg>
                </span>
                <select 
                  v-model="secondaryLanguage"
                  class="w-full bg-[#f8fafc] border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0f172a] focus:outline-none transition-all font-semibold appearance-none cursor-pointer"
                >
                  <option>English</option>
                  <option>Indonesian</option>
                  <option>Mandarin</option>
                  <option>None (Monolingual)</option>
                </select>
                <span class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Live Simulator Preview Card -->
        <div class="bg-[#0f172a] text-white border border-slate-800 rounded-2xl p-6 shadow-md relative overflow-hidden group">
          <!-- Subtle layout pattern background -->
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(190,242,100,0.1),transparent_70%)] pointer-events-none"></div>
          
          <div class="relative z-10 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full bg-[#bef264] animate-pulse"></span>
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contoh Cara Menyapa Pelanggan</span>
              </div>
              <span class="text-[9px] text-[#bef264] border border-[#bef264]/20 px-2.5 py-0.5 rounded bg-[#bef264]/10 font-bold uppercase tracking-wider">Preview</span>
            </div>

            <!-- Mock conversation bubble -->
            <div class="space-y-3.5 pt-2">
              <div class="flex items-start space-x-3">
                <img 
                  :src="agent.avatar" 
                  :alt="agent.name" 
                  class="w-8 h-8 rounded-full object-cover border border-slate-700 shadow-sm flex-shrink-0"
                />
                <div class="space-y-1 bg-slate-800/80 border border-slate-700/60 p-3 rounded-2xl rounded-tl-sm text-[11px] leading-relaxed max-w-[85%] text-slate-200">
                  <div class="flex items-center justify-between gap-4 mb-1">
                    <span class="font-extrabold text-white text-[10px]">{{ agent.name }}</span>
                    <span class="text-[8px] text-slate-500 font-mono">Simulasi</span>
                  </div>
                  <p class="font-medium">{{ previewMessage }}</p>
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Gaya Bicara: <strong class="text-white text-xs font-semibold">{{ tone }}</strong></span>
            </div>
          </div>
        </div>

      </div>

      <!-- RIGHT SECTION: Voice Tone & Compliance Guardrails -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- Tone & Voice Style Selector -->
        <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 class="text-xs font-black text-slate-800 uppercase tracking-widest">Gaya Bahasa & Nada Bicara</h3>
              <p class="text-[11px] text-slate-400 mt-0.5">Pilih bagaimana cara asisten Anda merespons pertanyaan pelanggan.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              v-for="t in tones"
              :key="t.name"
              @click="tone = t.name"
              :class="tone === t.name ? 'border-[#bef264] bg-[#bef264]/8 shadow-[0_4px_16px_rgba(190,242,100,0.12)] ring-1 ring-[#bef264]/20' : 'border-slate-200/80 bg-white hover:bg-slate-50/50 hover:border-slate-350'"
              class="border rounded-2xl p-4.5 cursor-pointer transition-all duration-200 group flex items-start space-x-4 select-none"
            >
              <div 
                :class="tone === t.name ? 'bg-[#bef264] text-[#0f172a] shadow-sm' : 'bg-slate-50 border border-slate-200 text-slate-400 group-hover:bg-white group-hover:text-slate-600'"
                class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="t.icon" />
                </svg>
              </div>
              
              <div class="space-y-1 min-w-0">
                <div class="text-xs font-extrabold text-[#0f172a] flex items-center space-x-1.5">
                  <span>{{ t.name }}</span>
                  <span v-if="tone === t.name" class="w-1.5 h-1.5 rounded-full bg-[#3f6212] inline-block animate-pulse"></span>
                </div>
                <p class="text-[10.5px] text-slate-500 leading-relaxed font-medium">{{ t.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Compliance Boundaries (Guardrails) -->
        <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 class="text-xs font-black text-slate-800 uppercase tracking-widest">Pantangan & Aturan Penting</h3>
              <p class="text-[11px] text-slate-400 mt-0.5">Tulis hal-hal penting yang tidak boleh diucapkan atau dijanjikan oleh asisten AI Anda.</p>
            </div>
            <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#bef264]/20 text-[#3f6212] border border-[#bef264]/30">
              {{ guardrails.length }} Aturan Aktif
            </span>
          </div>

          <!-- Existing Rules list -->
          <div class="space-y-3">
            <div 
              v-for="(rule, idx) in guardrails" 
              :key="idx" 
              class="flex items-center justify-between bg-[#f8fafc] px-4 py-3.5 rounded-xl border border-slate-200/60 text-xs text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all group"
            >
              <div class="flex items-start space-x-3 min-w-0 pr-4">
                <span class="w-2 h-2 rounded-full bg-rose-500/70 mt-1.5 flex-shrink-0"></span>
                <span class="font-semibold text-slate-750 leading-normal">{{ rule }}</span>
              </div>
              <button 
                @click="removeGuardrail(idx)" 
                class="text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-all text-[10px] font-bold cursor-pointer flex-shrink-0 border border-transparent hover:border-rose-100 flex items-center space-x-1"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Hapus</span>
              </button>
            </div>

            <!-- Empty State -->
            <div v-if="guardrails.length === 0" class="border border-dashed border-slate-200 rounded-xl p-8 text-center space-y-2">
              <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="text-xs font-bold text-slate-700">Belum ada aturan pantangan</div>
              <p class="text-[10.5px] text-slate-400 max-w-xs mx-auto">Kami menyarankan Anda membuat aturan penting agar asisten tidak salah menjawab, seperti larangan memberikan harga diskon tanpa persetujuan.</p>
            </div>
          </div>

          <!-- Add Guardrail Input form -->
          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <input 
              type="text" 
              v-model="newGuardrail"
              placeholder="Contoh: Jangan pernah memberikan diskon di atas 10%"
              class="flex-1 bg-[#f8fafc] border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl px-4 py-3 text-xs text-[#0f172a] focus:outline-none transition-all font-semibold" 
              @keydown.enter="addGuardrail"
            />
            <button 
              @click="addGuardrail" 
              class="bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-extrabold text-xs px-5 py-3 rounded-xl transition-all border border-slate-200/80 cursor-pointer flex items-center justify-center space-x-1.5 flex-shrink-0"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Tambah Aturan</span>
            </button>
          </div>
        </div>

      </div>

    </div>

    <!-- Bottom Save Trigger Banner -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      <div class="flex items-center space-x-3">
        <div class="w-2.5 h-2.5 rounded-full bg-[#bef264] animate-ping"></div>
        <p class="text-xs font-semibold text-slate-600">Simpan perubahan Anda agar langsung aktif pada chat asisten.</p>
      </div>
      <button 
        @click="saveSettings" 
        class="w-full sm:w-auto bg-[#0f172a] hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer text-center"
      >
        Simpan & Terapkan Perubahan
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations */
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
