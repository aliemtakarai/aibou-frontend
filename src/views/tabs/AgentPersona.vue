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
  { name: 'Formal / Profesional', desc: 'Sopan, ramah bisnis, dan terstruktur.', icon: 'M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11c0-1.28-.061-2.536-.179-3.773M7 11V5a5 5 0 0110 0v6M7 11h10' },
  { name: 'Santai / Ramah', desc: 'Hangat, mudah didekati, menggunakan emotikon, dan komunikatif.', icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { name: 'Singkat & Padat', desc: 'Respon sangat cepat, detail tepat, minimal basa-basi.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { name: 'Tegas / Fokus Penjualan', desc: 'Berorientasi tindakan, fokus pada konversi prospek.', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
]
</script>

<template>
  <div class="max-w-4xl space-y-6 relative" v-if="agent">
    <!-- Toast Notification -->
    <div 
      v-if="showToast" 
      class="fixed top-6 right-6 bg-white border border-[#bef264]/40 text-[#3f6212] text-xs px-4 py-3 rounded-xl shadow-lg backdrop-blur-md z-50 flex items-center space-x-2 transition-all duration-305 animate-bounce"
    >
      <span class="w-2 h-2 rounded-full bg-[#a3e635] animate-pulse"></span>
      <span class="font-bold">Konfigurasi Berhasil Disimpan!</span>
    </div>

    <!-- Header -->
    <div class="flex items-center space-x-3">
      <div class="w-10 h-10 rounded-xl bg-[#bef264]/20 border border-[#bef264]/30 flex items-center justify-center text-[#3f6212] shadow-sm">
        <SvgIcon name="bot" className="w-5 h-5" />
      </div>
      <div>
        <h1 class="text-xl font-bold text-[#0f172a] tracking-tight">Studio Persona</h1>
        <p class="text-slate-455 text-xs mt-1">Sesuaikan perilaku agen AI, nada kosakata, dan batas kepatuhan Anda.</p>
      </div>
    </div>

    <!-- Setup Card -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-8 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
      <!-- Identity Details -->
      <div class="space-y-4">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Konfigurasi Identitas</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="block text-[10px] font-semibold text-slate-550 uppercase tracking-wider">Nama Publik Agen</label>
            <input 
              type="text" 
              v-model="agent.name" 
              class="w-full bg-[#f4f7f6] border border-slate-200 focus:border-slate-350 rounded-xl px-3.5 py-2 text-xs text-[#0f172a] focus:outline-none transition-colors" 
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-[10px] font-semibold text-slate-550 uppercase tracking-wider">Spesialisasi / Peran Agen</label>
            <input 
              type="text" 
              v-model="agent.role" 
              class="w-full bg-[#f4f7f6] border border-slate-200 focus:border-slate-350 rounded-xl px-3.5 py-2 text-xs text-[#0f172a] focus:outline-none transition-colors" 
            />
          </div>
        </div>
      </div>

      <!-- Tone Selector Visual Grid -->
      <div class="border-t border-slate-100 pt-6 space-y-4">
        <div>
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Nada Suara & Gaya</h3>
          <p class="text-[11px] text-slate-500 mt-1">Pilih arsitektur gaya bahasa utama untuk interaksi pengguna.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            v-for="t in tones"
            :key="t.name"
            @click="tone = t.name"
            :class="tone === t.name ? 'border-[#bef264] bg-[#bef264]/10 shadow-[0_4px_12px_rgba(190,242,100,0.1)]' : 'border-slate-200 bg-[#f4f7f6]/40 hover:bg-slate-50 hover:border-slate-300'"
            class="border rounded-2xl p-4 cursor-pointer transition-all duration-200 group flex items-start space-x-3.5 select-none"
          >
            <div 
              :class="tone === t.name ? 'bg-[#bef264] text-[#0f172a] shadow-sm' : 'bg-white border border-slate-200 text-slate-400'"
              class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" :d="t.icon" />
              </svg>
            </div>
            <div class="space-y-1">
              <div class="text-xs font-bold text-[#0f172a] transition-colors">{{ t.name }}</div>
              <p class="text-[10px] text-slate-500 leading-normal">{{ t.desc }}</p>
            </div>
          </div>
        </div>

        <!-- Secondary Language -->
        <div class="space-y-1.5 w-full max-w-sm pt-2">
          <label class="block text-[10px] font-semibold text-slate-550 uppercase tracking-wider">Kemampuan Bahasa Sekunder</label>
          <select 
            v-model="secondaryLanguage"
            class="w-full bg-[#f4f7f6] border border-slate-200 focus:border-slate-355 rounded-xl px-3 py-2 text-xs text-[#0f172a] focus:outline-none transition-colors"
          >
            <option>English</option>
            <option>Indonesian</option>
            <option>Mandarin</option>
            <option>None (Monolingual)</option>
          </select>
        </div>
      </div>

      <!-- Guardrails -->
      <div class="border-t border-slate-100 pt-6 space-y-4">
        <div>
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Batas Kepatuhan (Guardrails)</h3>
          <p class="text-[11px] text-slate-555 mt-1">Tentukan batasan mutlak yang tidak boleh dilanggar oleh AI dalam kondisi apa pun.</p>
        </div>
        
        <div class="space-y-2">
          <div 
            v-for="(rule, idx) in guardrails" 
            :key="idx" 
            class="flex items-center justify-between bg-[#f4f7f6]/60 px-3.5 py-2.5 rounded-xl border border-slate-200/60 text-xs text-slate-700 hover:bg-[#f4f7f6] transition-colors"
          >
            <div class="flex items-center space-x-2.5 min-w-0">
              <span class="w-1.5 h-1.5 rounded-full bg-red-500/60 flex-shrink-0"></span>
              <span class="truncate">{{ rule }}</span>
            </div>
            <button 
              @click="removeGuardrail(idx)" 
              class="text-slate-400 hover:text-red-655 hover:bg-red-50/50 px-2 py-1 rounded transition-all text-[10px] cursor-pointer flex-shrink-0"
            >
              Hapus
            </button>
          </div>
        </div>

        <div class="flex gap-2">
          <input 
            type="text" 
            v-model="newGuardrail"
            placeholder="Tambahkan aturan batas mutlak (contoh: Jangan kurangi harga di bawah 10%)"
            class="flex-1 bg-[#f4f7f6] border border-slate-200 focus:border-slate-350 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none transition-colors" 
            @keydown.enter="addGuardrail"
          />
          <button 
            @click="addGuardrail" 
            class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-colors border border-slate-200 cursor-pointer"
          >
            Tambah Aturan
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="border-t border-slate-100 pt-4 flex justify-end">
        <button 
          @click="saveSettings" 
          class="bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          Simpan Konfigurasi Persona
        </button>
      </div>
    </div>
  </div>
</template>

