<script setup lang="ts">
import { ref } from 'vue'
import SvgIcon from '../../components/ui/SvgIcon.vue'

const isConnected = ref(true)
const selectedFolder = ref('/Katalog & SOP Bisnis')
const indexingStatus = ref('Siap')
const filesIndexedCount = ref(18)
const isSyncing = ref(false)

const triggerSync = () => {
  isSyncing.value = true
  indexingStatus.value = 'Menyinkronkan...'
  setTimeout(() => {
    isSyncing.value = false
    indexingStatus.value = 'Siap'
    filesIndexedCount.value += 2
  }, 2000)
}

const toggleConnection = () => {
  isConnected.value = !isConnected.value
  if (!isConnected.value) {
    selectedFolder.value = ''
    filesIndexedCount.value = 0
  } else {
    selectedFolder.value = '/Katalog & SOP Bisnis'
    filesIndexedCount.value = 18
  }
}

// Custom mock files list
const mockDocs = ref([
  { name: 'SOP_Kemitraan_v2.pdf', size: '2.4 MB', chunks: 144, type: 'pdf' },
  { name: 'PriceList_2026.pdf', size: '840 KB', chunks: 42, type: 'pdf' },
  { name: 'FAQ_Customer_Care.txt', size: '150 KB', chunks: 98, type: 'text' }
])
</script>

<template>
  <div class="max-w-4xl space-y-6">
    <!-- Header -->
    <div class="flex items-center space-x-3">
      <div class="w-10 h-10 rounded-xl bg-[#bef264]/20 border border-[#bef264]/30 flex items-center justify-center text-[#3f6212] shadow-sm">
        <SvgIcon name="book" className="w-5 h-5" />
      </div>
      <div>
        <h1 class="text-xl font-bold text-[#0f172a] tracking-tight">Mesin Pengetahuan (RAG)</h1>
        <p class="text-slate-455 text-xs mt-1">Berikan kecerdasan kontekstual mendalam kepada agen Anda dengan menyinkronkan folder dokumen dari Google Drive.</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Drive Integration Card -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-6 md:col-span-2 space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Integrasi Ruang Kerja</h3>
          <span v-if="isConnected" class="text-[10px] bg-[#bef264]/20 text-[#3f6212] border border-[#bef264]/30 px-2 py-0.5 rounded-full font-bold">Terhubung</span>
          <span v-else class="text-[10px] bg-slate-100 text-slate-505 border border-slate-200 px-2 py-0.5 rounded-full font-bold">Terputus</span>
        </div>

        <!-- Connection State -->
        <div class="flex items-center justify-between bg-[#f4f7f6]/60 p-4 rounded-xl border border-slate-200/60 hover:border-slate-300 transition-colors">
          <div class="flex items-center space-x-3.5">
            <div class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-655 shadow-sm">
              <!-- Custom Drive visual icon -->
              <svg class="w-5 h-5 text-slate-550" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <h4 class="text-xs font-bold text-[#0f172a]">Ruang Kerja Google Drive</h4>
              <p class="text-[10px] text-slate-500 mt-1" v-if="isConnected">Aktif sebagai: <span class="font-mono text-slate-700 font-semibold">admin@aibou.co</span></p>
              <p class="text-[10px] text-slate-500 mt-1" v-else>Hubungkan folder yang berisi PDF, Google Docs, atau berkas teks.</p>
            </div>
          </div>
          <button 
            @click="toggleConnection" 
            :class="isConnected ? 'bg-slate-100 hover:bg-slate-200 text-red-655 border-slate-200' : 'bg-[#0f172a] hover:bg-slate-800 text-white'"
            class="px-4 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer"
          >
            {{ isConnected ? 'Putuskan' : 'Hubungkan Drive' }}
          </button>
        </div>

        <!-- Folder Selection -->
        <div class="space-y-2" v-if="isConnected">
          <label class="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Folder RAG yang Disinkronkan</label>
          <div class="flex items-center justify-between bg-[#f4f7f6]/60 p-3 rounded-lg border border-slate-200/60 hover:border-slate-300 transition-colors">
            <span class="text-xs text-[#4d7c0f] font-mono flex items-center space-x-1.5 font-bold">
              <span class="w-1.5 h-1.5 rounded-full bg-[#a3e635]"></span>
              <span>{{ selectedFolder }}</span>
            </span>
            <button class="bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-slate-255 cursor-pointer">
              Ubah Folder
            </button>
          </div>
        </div>

        <!-- Document Parser List -->
        <div class="space-y-3" v-if="isConnected">
          <div class="flex justify-between items-center">
            <label class="block text-[10px] font-semibold text-slate-505 uppercase tracking-wider">Dokumen Terindeks</label>
            <span class="text-[9px] text-[#4d7c0f] font-bold font-mono">Interval Sinkronisasi: 24 jam</span>
          </div>

          <div class="bg-white rounded-xl border border-slate-200/60 divide-y divide-slate-150 text-xs overflow-hidden">
            <div 
              v-for="doc in mockDocs" 
              :key="doc.name" 
              class="p-3.5 flex justify-between items-center hover:bg-slate-50/50 transition-colors group"
            >
              <div class="flex items-center space-x-3 min-w-0">
                <div class="w-7 h-7 rounded bg-[#f4f7f6] border border-slate-200 text-slate-655 flex items-center justify-center group-hover:text-slate-800 transition-colors">
                  <span v-if="doc.type === 'pdf'" class="text-[9px] font-black font-sans uppercase">PDF</span>
                  <span v-else class="text-[9px] font-black font-sans uppercase">TXT</span>
                </div>
                <div class="min-w-0">
                  <span class="text-xs font-semibold text-slate-700 block truncate">{{ doc.name }}</span>
                  <span class="text-[10px] text-slate-450">{{ doc.size }}</span>
                </div>
              </div>
              <div class="text-right text-[10px] text-slate-500 flex items-center space-x-3 flex-shrink-0">
                <span>{{ doc.chunks }} chunk</span>
                <span class="bg-[#bef264]/20 text-[#3f6212] border border-[#bef264]/30 px-1.5 py-0.5 rounded-full font-mono font-bold">Terindeks</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Upload Simulator Placeholder -->
        <div 
          v-if="isConnected"
          class="border border-dashed border-slate-200 hover:border-slate-350 bg-slate-50/20 hover:bg-slate-50/50 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 group"
        >
          <svg class="w-6 h-6 text-slate-400 group-hover:text-slate-650 transition-colors mx-auto mb-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span class="text-xs font-bold text-slate-600 group-hover:text-slate-800 transition-colors block">Unggah Berkas PDF / TXT Lokal</span>
          <span class="text-[10px] text-slate-400 mt-1 block">Ukuran maksimal 10MB per berkas. Secara otomatis diurai menjadi vektor RAG.</span>
        </div>
      </div>

      <!-- Indexing & Sync Panel -->
      <div class="bg-white border border-slate-200/80 rounded-xl p-6 space-y-6 shadow-sm h-fit">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Statistik Engine RAG</h3>

        <div class="space-y-4">
          <div class="bg-[#f4f7f6]/60 p-4 rounded-xl border border-slate-200/60 space-y-1">
            <span class="text-[10px] text-slate-450 block uppercase font-bold">Status Sinkronisasi</span>
            <div class="flex items-center space-x-2 mt-1">
              <span 
                class="w-2.5 h-2.5 rounded-full"
                :class="isSyncing ? 'bg-[#a3e635] animate-pulse' : 'bg-emerald-500'"
              ></span>
              <span class="text-xs font-bold text-[#0f172a]">{{ indexingStatus }}</span>
            </div>
          </div>

          <div class="bg-[#f4f7f6]/60 p-4 rounded-xl border border-slate-200/60 space-y-1">
            <span class="text-[10px] text-slate-455 block uppercase font-bold">Total Katalog Vektor</span>
            <span class="text-xl font-black text-[#0f172a] mt-1 block">{{ filesIndexedCount }} Berkas</span>
          </div>

          <button 
            @click="triggerSync"
            :disabled="!isConnected || isSyncing"
            :class="(!isConnected || isSyncing) ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-transparent' : 'bg-[#0f172a] hover:bg-slate-800 text-white shadow-sm cursor-pointer'"
            class="w-full py-2.5 rounded-xl text-xs font-bold transition-all border border-transparent shadow flex items-center justify-center space-x-2"
          >
            <SvgIcon name="refresh" :className="isSyncing ? 'w-3.5 h-3.5 animate-spin' : 'w-3.5 h-3.5'" />
            <span>{{ isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Ulang Data' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
