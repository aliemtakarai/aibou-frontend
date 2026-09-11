<script setup lang="ts">
import { ref, computed } from 'vue'
import SvgIcon from '../../components/ui/SvgIcon.vue'
import Card from '../../components/ui/Card.vue'
import Button from '../../components/ui/Button.vue'

const isConnected = ref(true)
const selectedFolder = ref('/Katalog & SOP Bisnis')
const indexingStatus = ref('Siap')
const filesIndexedCount = ref(18)
const isSyncing = ref(false)
const searchQuery = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

// RAG Testing state
const testQuery = ref('')
const isTestingQuery = ref(false)
const retrievedChunks = ref<Array<{ doc: string; chunk: string; score: number }>>([])

// Custom mock files list
const mockDocs = ref([
  { name: 'SOP_Kemitraan_v2.pdf', size: '2.4 MB', chunks: 144, type: 'pdf', date: '2026-08-01' },
  { name: 'PriceList_2026.pdf', size: '840 KB', chunks: 42, type: 'pdf', date: '2026-08-03' },
  { name: 'FAQ_Customer_Care.txt', size: '150 KB', chunks: 98, type: 'text', date: '2026-08-04' }
])

const filteredDocs = computed(() => {
  if (!searchQuery.value.trim()) return mockDocs.value
  return mockDocs.value.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const totalChunks = computed(() => {
  return mockDocs.value.reduce((acc, doc) => acc + doc.chunks, 0)
})

const triggerSync = () => {
  isSyncing.value = true
  indexingStatus.value = 'Mempelajari Dokumen...'
  setTimeout(() => {
    isSyncing.value = false
    indexingStatus.value = 'Siap'
    filesIndexedCount.value = mockDocs.value.length
  }, 2000)
}

const toggleConnection = () => {
  isConnected.value = !isConnected.value
  if (!isConnected.value) {
    selectedFolder.value = ''
    filesIndexedCount.value = 0
  } else {
    selectedFolder.value = '/Katalog & SOP Bisnis'
    filesIndexedCount.value = mockDocs.value.length
  }
}

// Upload file simulator
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
    const newDoc = {
      name: file.name,
      size: `${sizeMB} MB`,
      chunks: Math.floor(Math.random() * 80) + 15,
      type: file.name.split('.').pop()?.toLowerCase() === 'pdf' ? 'pdf' : 'text',
      date: new Date().toISOString().split('T')[0]
    }
    
    // Add to mock docs
    mockDocs.value.unshift(newDoc)
    filesIndexedCount.value = mockDocs.value.length
    
    // Simulate auto-indexing toast
    indexingStatus.value = 'Mempelajari berkas baru...'
    setTimeout(() => {
      indexingStatus.value = 'Siap'
    }, 1500)
  }
}

const deleteDoc = (index: number) => {
  mockDocs.value.splice(index, 1)
  filesIndexedCount.value = mockDocs.value.length
}

// RAG retrieval search simulation
const runRetrievalTest = () => {
  if (!testQuery.value.trim()) return
  isTestingQuery.value = true
  retrievedChunks.value = []
  
  setTimeout(() => {
    isTestingQuery.value = false
    const q = testQuery.value.toLowerCase()
    
    if (q.includes('harga') || q.includes('reseller') || q.includes('jual')) {
      retrievedChunks.value = [
        {
          doc: 'SOP_Kemitraan_v2.pdf',
          chunk: '...Paket Reseller Starter minimal order awal senilai Rp 500.000,- mendapat 10 box produk, brosur cetak, dan hak akses video pemasaran digital...',
          score: 0.94
        },
        {
          doc: 'PriceList_2026.pdf',
          chunk: '...Daftar Harga Reseller Resmi 2026: Paket Starter Rp 500.000. Paket Agen Utama Rp 2.000.000 (diskon tambahan 15% untuk repeat order)...',
          score: 0.87
        }
      ]
    } else if (q.includes('faq') || q.includes('tanya') || q.includes('sapa')) {
      retrievedChunks.value = [
        {
          doc: 'FAQ_Customer_Care.txt',
          chunk: '...Q: Bagaimana menyapa pelanggan di WhatsApp? A: Selalu gunakan sapaan ramah di awal kalimat seperti "Halo Kak! Ada yang bisa kami bantu?"...',
          score: 0.91
        }
      ]
    } else {
      retrievedChunks.value = [
        {
          doc: 'SOP_Kemitraan_v2.pdf',
          chunk: '...Semua mitra wajib mematuhi standar operasional prosedur penjualan yang telah disepakati bersama dalam kontrak kemitraan digital...',
          score: 0.74
        },
        {
          doc: 'FAQ_Customer_Care.txt',
          chunk: '...Sistem dukungan pelanggan beroperasi 24 jam dengan AI sebagai responder utama sebelum diekskalasi ke agen manusia...',
          score: 0.68
        }
      ]
    }
  }, 1000)
}
</script>

<<template>
  <div class="w-full space-y-8 relative">
    <!-- Header & Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 shadow-sm transform hover:scale-105 transition-transform">
          <SvgIcon name="book" className="w-6 h-6" />
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="text-2xl font-black text-[#1c1917] tracking-tight">Sumber Informasi Asisten</h1>
            <span class="bg-stone-200/70 text-stone-600 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Langkah 2 dari 2</span>
          </div>
          <p class="text-stone-500 text-xs mt-1">Unggah dokumen produk, brosur, atau SOP agar asisten AI dapat menjawab pertanyaan pelanggan sesuai data toko Anda.</p>
        </div>
      </div>
      
      <!-- Top actions -->
      <div class="flex items-center space-x-3">
        <Button 
          @click="triggerSync"
          :disabled="!isConnected || isSyncing"
          :loading="isSyncing"
          variant="primary"
          class="w-full md:w-auto"
        >
          <SvgIcon name="refresh" className="w-4 h-4" />
          <span>Sinkronkan Data Dokumen</span>
        </Button>
      </div>
    </div>

    <!-- Quick Insights Metrics Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <!-- Status Engine -->
      <Card padding="p-5" class="flex items-center space-x-4">
        <div class="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div class="space-y-0.5">
          <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Status Pengetahuan</span>
          <div class="flex items-center space-x-2">
            <span class="text-sm font-extrabold text-[#1c1917]">{{ indexingStatus }}</span>
            <span :class="isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'" class="w-2.5 h-2.5 rounded-full inline-block"></span>
          </div>
        </div>
      </Card>

      <!-- Total Files -->
      <Card padding="p-5" class="flex items-center space-x-4">
        <div class="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div class="space-y-0.5">
          <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Dokumen Dipelajari</span>
          <span class="text-sm font-extrabold text-[#1c1917]">{{ isConnected ? mockDocs.length : 0 }} Berkas Dokumen</span>
        </div>
      </Card>

      <!-- Total Chunks -->
      <Card padding="p-5" class="flex items-center space-x-4">
        <div class="w-10 h-10 rounded-xl bg-amber-100/70 border border-amber-300/70 flex items-center justify-center text-amber-900 flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        </div>
        <div class="space-y-0.5">
          <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Total Materi Informasi</span>
          <span class="text-sm font-extrabold text-[#1c1917]">{{ isConnected ? totalChunks : 0 }} Poin Informasi</span>
        </div>
      </Card>
    </div>

    <!-- Main Workspace Layout Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- LEFT SECTION: Cloud Integration & Document Explorer (8 cols) -->
      <div class="lg:col-span-8 space-y-6">
        
        <!-- Workspace Integration Card -->
        <Card padding="p-6" class="space-y-6">
          <div class="border-b border-stone-100 pb-3 flex items-center justify-between">
            <h3 class="text-xs font-black text-stone-800 uppercase tracking-widest">Hubungkan Folder Penyimpanan</h3>
            <div class="flex items-center space-x-1.5">
              <span class="w-2.5 h-2.5 rounded-full" :class="isConnected ? 'bg-emerald-500' : 'bg-stone-400'"></span>
              <span class="text-[10px] font-bold uppercase tracking-wider" :class="isConnected ? 'text-emerald-700' : 'text-stone-500'">
                {{ isConnected ? 'Aktif' : 'Nonaktif' }}
              </span>
            </div>
          </div>

          <!-- Connection Panel -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-stone-50 p-4.5 rounded-xl border border-stone-200/80 gap-4">
            <div class="flex items-start space-x-4">
              <div class="w-11 h-11 rounded-xl bg-white border border-stone-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                <!-- Google Drive Colorful Icon -->
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M7.85 2L13.72 12.16L9.67 19.16L3.8 9L7.85 2Z" fill="#0066DA"/>
                  <path d="M16.14 2H8.3L12.35 9L20.2 9L16.14 2Z" fill="#00AA47"/>
                  <path d="M20.2 9L16.14 16H8.3L12.35 9L20.2 9Z" fill="#FFBA00"/>
                  <path d="M13.72 12.16L17.77 19.16H16.14L12.35 12.5L13.72 12.16Z" fill="#8E24AA"/>
                  <path d="M9.67 19.16H17.77L13.72 12.16L9.67 19.16Z" fill="#EA4335"/>
                </svg>
              </div>
              <div class="space-y-0.5">
                <h4 class="text-xs font-extrabold text-[#1c1917] flex items-center space-x-1.5">
                  <span>Google Drive Anda</span>
                  <span v-if="isConnected" class="w-3.5 h-3.5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </h4>
                <p class="text-[10.5px] text-stone-500" v-if="isConnected">Terhubung dengan Google Drive: <strong class="text-stone-700 font-semibold">admin-toko@gmail.com</strong></p>
                <p class="text-[10.5px] text-stone-500" v-else>Sambungkan Google Drive Anda untuk mengambil dokumen katalog atau panduan penjualan secara otomatis.</p>
              </div>
            </div>
            <Button 
              @click="toggleConnection" 
              :variant="isConnected ? 'secondary' : 'primary'"
              :class="isConnected ? 'hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200' : ''"
              class="w-full sm:w-auto"
            >
              <span v-if="isConnected">Putuskan Hubungan</span>
              <span v-else>Hubungkan Akun</span>
            </Button>
          </div>

          <!-- Connected Folder breadcrumbs -->
          <div class="space-y-2" v-if="isConnected">
            <label class="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">Folder Dokumen Terpilih</label>
            <div class="flex items-center justify-between bg-stone-50 px-4 py-3 rounded-xl border border-stone-200/80">
              <div class="flex items-center space-x-2 text-xs font-semibold text-stone-700">
                <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <div class="flex items-center space-x-1 text-[11.5px]">
                  <span class="text-stone-400">Google Drive</span>
                  <span class="text-stone-300">/</span>
                  <span class="text-amber-800 font-extrabold">{{ selectedFolder }}</span>
                </div>
              </div>
              <button class="bg-white hover:bg-stone-50 text-stone-700 px-3.5 py-1.5 rounded-lg text-[10px] font-bold border border-stone-200 cursor-pointer shadow-xs">
                Ganti Folder
              </button>
            </div>
          </div>
        </Card>

        <!-- Document Explorer Board -->
        <Card padding="p-6" class="space-y-6" v-if="isConnected">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-3">
            <div>
              <h3 class="text-xs font-black text-stone-800 uppercase tracking-widest">Daftar Dokumen yang Dipelajari</h3>
              <p class="text-[11px] text-stone-400 mt-0.5">Asisten AI Anda akan menggunakan informasi dari berkas di bawah ini untuk menjawab pesan pelanggan.</p>
            </div>
            
            <!-- Mini Search Bar -->
            <div class="relative w-full sm:w-64">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Cari nama berkas..." 
                class="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 focus:bg-white rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#1c1917] focus:outline-none transition-all font-semibold"
              />
            </div>
          </div>

          <!-- Document List Table-like Component -->
          <div class="space-y-2.5">
            <div 
              v-for="(doc, idx) in filteredDocs" 
              :key="doc.name" 
              class="flex items-center justify-between bg-white hover:bg-stone-50/70 p-3.5 rounded-xl border border-stone-200/80 hover:border-stone-300 transition-all group shadow-2xs"
            >
              <div class="flex items-center space-x-3.5 min-w-0 pr-4">
                <div 
                  :class="doc.type === 'pdf' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-blue-50 border-blue-200 text-blue-600'"
                  class="w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 font-sans text-[10px] font-black tracking-wider shadow-2xs"
                >
                  {{ doc.type.toUpperCase() }}
                </div>
                <div class="min-w-0 space-y-0.5">
                  <span class="text-xs font-extrabold text-[#1c1917] block truncate group-hover:text-amber-700 transition-colors">{{ doc.name }}</span>
                  <div class="flex items-center space-x-2 text-[10px] text-stone-400">
                    <span>{{ doc.size }}</span>
                    <span>•</span>
                    <span>Diunggah {{ doc.date }}</span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center space-x-4 flex-shrink-0">
                <div class="text-right hidden sm:block">
                  <span class="text-[9px] text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold inline-block">
                    Siap Digunakan
                  </span>
                </div>
                <button 
                  @click="deleteDoc(idx)"
                  class="text-stone-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-all cursor-pointer border border-transparent hover:border-rose-100"
                  title="Hapus berkas"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Empty Search State -->
            <div v-if="filteredDocs.length === 0" class="border border-dashed border-stone-200 rounded-xl p-8 text-center text-stone-400">
              <span class="text-xs">Tidak ada berkas bernama "{{ searchQuery }}"</span>
            </div>
          </div>

          <!-- Upload local files -->
          <Card 
            @click="triggerFileInput"
            clickable
            class="border-2 border-dashed border-stone-200 hover:border-stone-400 bg-stone-50/40 hover:bg-stone-50/80 p-7 text-center group"
          >
            <input 
              type="file" 
              ref="fileInput" 
              class="hidden" 
              accept=".pdf,.txt" 
              @change="handleFileUpload" 
            />
            <svg class="w-7 h-7 text-stone-400 group-hover:text-[#1c1917] group-hover:scale-110 transition-all mx-auto mb-2" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span class="text-xs font-bold text-stone-700 group-hover:text-[#1c1917] transition-colors block">Unggah Berkas Baru dari Komputer</span>
            <span class="text-[10px] text-stone-400 mt-1 block">Mendukung format PDF & TXT. Dokumen akan dipelajari secara otomatis oleh asisten AI.</span>
          </Card>
        </Card>

        <!-- Disconnected state info -->
        <Card padding="p-12" class="text-center space-y-4">
          <div class="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center mx-auto text-stone-400">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 class="text-sm font-black text-stone-700">Hubungkan Sumber Dokumen</h3>
          <p class="text-xs text-stone-400 max-w-sm mx-auto">Silakan hubungkan akun Google Drive Anda di atas agar asisten virtual memiliki pengetahuan dasar untuk melayani pembeli.</p>
        </Card>

      </div>

      <!-- RIGHT SECTION: Live Query Tester (4 cols) -->
      <div class="lg:col-span-4 space-y-6">
        
        <!-- Live RAG Retrieval Tester -->
        <Card padding="p-6" class="bg-[#1c1917] text-white border-stone-800 group">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none"></div>
          
          <div class="relative z-10 space-y-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span class="text-[9px] font-black text-stone-400 uppercase tracking-widest">Uji Coba Pengetahuan</span>
              </div>
              <span class="text-[9px] text-amber-400 border border-amber-400/20 px-2.5 py-0.5 rounded bg-amber-400/10 font-bold uppercase tracking-wider">Tes AI</span>
            </div>

            <div class="space-y-3">
              <p class="text-[10.5px] text-stone-300 leading-normal">Coba ketik pertanyaan pembeli di bawah ini untuk menguji apakah asisten AI sudah bisa menemukan informasinya di dalam dokumen.</p>
              
              <div class="relative">
                <input 
                  type="text" 
                  v-model="testQuery"
                  @keydown.enter="runRetrievalTest"
                  placeholder="Ketik contoh: Berapa harga reseller?"
                  class="w-full bg-stone-800 border border-stone-700/60 focus:border-amber-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 font-semibold"
                />
                <button 
                  @click="runRetrievalTest"
                  :disabled="isTestingQuery"
                  class="absolute right-1.5 top-1.5 bottom-1.5 bg-[#f59e0b] hover:bg-amber-400 text-[#1c1917] font-extrabold text-[10px] px-3.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                >
                  <span v-if="isTestingQuery">Mencari...</span>
                  <span v-else>Cari</span>
                </button>
              </div>
            </div>

            <!-- Testing results console -->
            <div class="space-y-3" v-if="retrievedChunks.length > 0 || isTestingQuery">
              <span class="text-[9px] font-bold text-stone-400 uppercase tracking-widest block font-sans">Dokumen Referensi Terdeteksi</span>
              
              <!-- Loading shimmer -->
              <div v-if="isTestingQuery" class="space-y-2 animate-pulse">
                <div class="h-10 bg-stone-800 rounded-lg"></div>
                <div class="h-10 bg-stone-800 rounded-lg"></div>
              </div>

              <!-- Retreived Chunks list -->
              <div v-else class="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                <div 
                  v-for="(chunk, idx) in retrievedChunks" 
                  :key="idx" 
                  class="bg-stone-800/60 border border-stone-700/70 p-3 rounded-xl space-y-1.5"
                >
                  <div class="flex items-center justify-between text-[9px]">
                    <span class="text-[#f59e0b] font-bold truncate max-w-[70%] font-mono">{{ chunk.doc }}</span>
                    <span class="text-stone-400 font-semibold bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700">Akurasi: {{ Math.round(chunk.score * 100) }}%</span>
                  </div>
                  <p class="text-[10px] text-stone-300 leading-relaxed italic">
                    {{ chunk.chunk }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

      </div>

    </div>
  </div>
</template>

<style scoped>
/* Scoped styles */
</style>
