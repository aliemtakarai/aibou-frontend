<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { mockAgents } from '../../utils/mockData'
import SvgIcon from '../../components/ui/SvgIcon.vue'
import ToastNotification from '../../components/ui/ToastNotification.vue'
import ToggleSwitch from '../../components/ui/ToggleSwitch.vue'
import Card from '../../components/ui/Card.vue'
import Button from '../../components/ui/Button.vue'

const route = useRoute()
const agentId = computed(() => route.params.id as string)
const agent = computed(() => mockAgents.value.find(a => a.id === agentId.value))

// Input form state
const newInstruction = ref('')
const newFrequency = ref('Tiap Hari')
const newTime = ref('09:00')
const newDay = ref(1) // Monday

const showToast = ref(false)
const toastMessage = ref('')

// Days helper for weekly schedule
const daysOfWeek = [
  { value: 1, name: 'Senin' },
  { value: 2, name: 'Selasa' },
  { value: 3, name: 'Rabu' },
  { value: 4, name: 'Kamis' },
  { value: 5, name: 'Jumat' },
  { value: 6, name: 'Sabtu' },
  { value: 7, name: 'Minggu' }
]

// List of scheduled tasks already setup by the user
const customSchedules = ref([
  {
    id: 1,
    instruction: 'Kirim rekap prospek baru dari Google Sheets ke email manager@toko.com',
    frequency: 'Tiap Hari',
    time: '18:00',
    day: null,
    enabled: true,
    nextRun: 'Hari ini, 18:00'
  },
  {
    id: 2,
    instruction: 'Hubungi kembali (follow-up) calon pembeli di WhatsApp yang belum membalas chat selama 24 jam dan tawarkan voucher diskon 5%',
    frequency: 'Tiap Senin',
    time: '09:00',
    day: 1,
    enabled: true,
    nextRun: 'Senin Depan, 09:00'
  },
  {
    id: 3,
    instruction: 'Sinkronisasikan file SOP_Kemitraan_v2.pdf terbaru dari folder Drive untuk melatih ulang basis data pengetahuan asisten',
    frequency: 'Tiap Bulan',
    time: '00:00',
    day: null,
    enabled: false,
    nextRun: 'Tanggal 1 depan, 00:00'
  }
])

// Execution Logs
const logs = ref([
  { task: 'Kirim rekap prospek baru...', time: 'Kemarin, 18:00', status: 'SUCCESS', result: '14 prospek dikirim ke manager@toko.com' },
  { task: 'Hubungi kembali (follow-up)...', time: 'Senin lalu, 09:00', status: 'SUCCESS', result: '5 pesan follow-up berhasil dikirim' },
  { task: 'Sinkronisasikan file SOP...', time: '1 Aug, 00:00', status: 'SUCCESS', result: 'Latihan ulang berhasil (144 vektor)' }
])

// Add new scheduled task
const addNewSchedule = () => {
  if (!newInstruction.value.trim()) return
  
  let friendlyFrequency = newFrequency.value
  if (newFrequency.value === 'Tiap Minggu') {
    const dayName = daysOfWeek.find(d => d.value === newDay.value)?.name || 'Senin'
    friendlyFrequency = `Tiap ${dayName}`
  }
  
  let friendlyNextRun = ''
  if (newFrequency.value === 'Tiap Hari') {
    friendlyNextRun = `Hari ini, ${newTime.value}`
  } else if (newFrequency.value === 'Tiap Minggu') {
    const dayName = daysOfWeek.find(d => d.value === newDay.value)?.name || 'Senin'
    friendlyNextRun = `${dayName} Depan, ${newTime.value}`
  } else {
    friendlyNextRun = `Tanggal 1 depan, ${newTime.value}`
  }

  const newJob = {
    id: Date.now(),
    instruction: newInstruction.value.trim(),
    frequency: friendlyFrequency,
    time: newTime.value,
    day: newFrequency.value === 'Tiap Minggu' ? newDay.value : null,
    enabled: true,
    nextRun: friendlyNextRun
  }

  customSchedules.value.unshift(newJob)
  newInstruction.value = ''
  
  toastMessage.value = 'Jadwal tugas baru berhasil ditambahkan!'
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2500)
}

// Delete schedule item
const deleteSchedule = (id: number) => {
  const index = customSchedules.value.findIndex(s => s.id === id)
  if (index !== -1) {
    customSchedules.value.splice(index, 1)
  }
}

// Execute now simulator
const runTaskNow = (task: any) => {
  toastMessage.value = `Menjalankan tugas secara instan...`
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
    logs.value.unshift({
      task: task.instruction.length > 30 ? task.instruction.substring(0, 30) + '...' : task.instruction,
      time: 'Baru saja',
      status: 'SUCCESS',
      result: 'Tugas manual berhasil diselesaikan oleh asisten AI.'
    })
  }, 1200)
}
</script>

<template>
  <div class="w-full space-y-8 relative">
    <!-- Toast Notification -->
    <ToastNotification 
      v-model:show="showToast"
      title="Notifikasi Jadwal"
      :message="toastMessage"
      :duration="2500"
    />

    <!-- Header & Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-sm transform hover:scale-105 transition-transform">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="text-2xl font-black text-[#1c1917] tracking-tight">Jadwal Tugas Otomatis</h1>
            <span class="bg-amber-100 border border-amber-200 text-amber-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Task Scheduler</span>
          </div>
          <p class="text-stone-500 text-xs mt-1">Buat instruksi kerja khusus untuk asisten AI Anda dan jadwalkan waktu pemicu eksekusinya secara otomatis.</p>
        </div>
      </div>
    </div>

    <!-- MAIN CHROME-STORE STYLE DASHBOARD GRID -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- LEFT SECTION: Create Job Form & List (8 cols) -->
      <div class="lg:col-span-8 space-y-6">
        
        <!-- Input Form: Setup New Schedule -->
        <Card padding="p-6" class="space-y-6">
          <div class="border-b border-stone-100 pb-3 flex items-center justify-between">
            <div class="space-y-0.5">
              <h3 class="text-xs font-black text-stone-900 uppercase tracking-widest">Buat Tugas Terjadwal Baru</h3>
              <p class="text-[10.5px] text-stone-500">Tulis perintah kerja apa yang harus dilakukan asisten AI secara otomatis.</p>
            </div>
          </div>

          <div class="space-y-4">
            <!-- Instruction Textarea -->
            <div class="space-y-1.5">
              <label class="block text-[10px] font-bold text-stone-600 uppercase tracking-wider">Instruksi / Perintah Tugas</label>
              <textarea 
                v-model="newInstruction"
                rows="3"
                class="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 focus:bg-white rounded-xl p-3.5 text-xs text-[#1c1917] focus:outline-none font-semibold leading-relaxed focus:ring-2 focus:ring-amber-500/10 transition-colors"
                placeholder="Contoh: Kirim email rekap Excel berisi data leads baru ke supervisor@toko.com, atau tawarkan voucher diskon di WA..."
              ></textarea>
            </div>

            <!-- Time setup parameters row -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <!-- Frequency selector -->
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-stone-600 uppercase tracking-wider">Frekuensi Pemicu</label>
                <div class="relative">
                  <select
                    v-model="newFrequency"
                    class="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 focus:bg-white rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-[#1c1917] focus:outline-none font-semibold appearance-none cursor-pointer focus:ring-2 focus:ring-amber-500/10 transition-colors"
                  >
                    <option>Tiap Hari</option>
                    <option>Tiap Minggu</option>
                    <option>Tiap Bulan</option>
                  </select>
                  <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-stone-400">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>

              <!-- Day selector (Only if weekly) -->
              <div class="space-y-1.5" v-if="newFrequency === 'Tiap Minggu'">
                <label class="block text-[10px] font-bold text-stone-600 uppercase tracking-wider">Pilih Hari</label>
                <div class="relative">
                  <select
                    v-model="newDay"
                    class="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 focus:bg-white rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-[#1c1917] focus:outline-none font-semibold appearance-none cursor-pointer focus:ring-2 focus:ring-amber-500/10 transition-colors"
                  >
                    <option v-for="d in daysOfWeek" :key="d.value" :value="d.value">{{ d.name }}</option>
                  </select>
                  <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-stone-400">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>

              <!-- Time input picker -->
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-stone-600 uppercase tracking-wider">Jam Eksekusi</label>
                <input 
                  type="time"
                  v-model="newTime"
                  class="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-[#1c1917] focus:outline-none font-semibold focus:ring-2 focus:ring-amber-500/10 transition-colors"
                />
              </div>
            </div>

            <!-- Form Submit action -->
            <div class="pt-3 flex justify-end">
              <Button 
                @click="addNewSchedule"
                :disabled="!newInstruction.trim()"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Tambahkan ke Jadwal Tugas</span>
              </Button>
            </div>
          </div>
        </Card>

        <!-- Section: List Scheduled Tasks Already Setup -->
        <Card padding="p-6" class="space-y-6">
          <div class="border-b border-stone-100 pb-3 flex items-center justify-between">
            <div>
              <h3 class="text-xs font-black text-stone-900 uppercase tracking-widest">Jadwal Tugas yang Sudah Diaktifkan</h3>
              <p class="text-[11px] text-stone-500 mt-0.5">Daftar instruksi otomatis yang saat ini terpasang pada asisten AI Anda.</p>
            </div>
            <span class="text-xs font-mono font-bold bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full text-amber-800">
              {{ customSchedules.length }} Tugas
            </span>
          </div>

          <!-- Active Schedules List -->
          <div class="space-y-4">
            <Card 
              v-for="(sched, idx) in customSchedules" 
              :key="sched.id"
              hoverable
              padding="p-5"
              shadow="shadow-xs"
              class="flex flex-col justify-between group border-stone-200"
            >
              <div class="space-y-3.5">
                <!-- Top Details Header -->
                <div class="flex items-start justify-between gap-4">
                  <!-- Task Index tag -->
                  <span class="text-[9.5px] font-mono bg-stone-100 text-stone-600 font-extrabold px-2 py-0.5 rounded border border-stone-200">
                    Jadwal #{{ customSchedules.length - idx }}
                  </span>

                  <!-- Active/Inactive Status -->
                  <ToggleSwitch 
                    v-model="sched.enabled" 
                    :label="sched.enabled ? 'Aktif' : 'Mati'" 
                  />
                </div>

                <!-- Instruction text -->
                <div class="space-y-1 pr-6">
                  <p class="text-xs font-semibold text-stone-900 leading-normal font-sans">
                    "{{ sched.instruction }}"
                  </p>
                </div>
              </div>

              <!-- Bottom details & triggers -->
              <div class="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 text-[10px]">
                
                <!-- Timing info -->
                <div class="flex items-center space-x-3.5 text-stone-500 font-medium">
                  <div class="flex items-center space-x-1.5">
                    <svg class="w-3.5 h-3.5 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3" />
                    </svg>
                    <span>{{ sched.frequency }} pukul {{ sched.time }}</span>
                  </div>
                  <span>•</span>
                  <span class="text-stone-400">Jadwal berikutnya: <strong class="text-stone-700 font-semibold">{{ sched.nextRun }}</strong></span>
                </div>

                <!-- Action buttons -->
                <div class="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <Button 
                    variant="secondary"
                    size="sm"
                    @click="runTaskNow(sched)"
                    :disabled="!sched.enabled"
                  >
                    Uji Tugas
                  </Button>
                  <button 
                    @click="deleteSchedule(sched.id)"
                    class="text-stone-400 hover:text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                    title="Hapus Jadwal"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </Card>

            <!-- Empty List State -->
            <Card padding="p-12" class="border-dashed border-stone-300 text-center space-y-3 bg-stone-50/50">
              <div class="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 class="text-xs font-black text-stone-800">Belum ada tugas terjadwal</h3>
              <p class="text-[10.5px] text-stone-500 max-w-xs mx-auto">Tulis sebuah perintah kerja baru pada form di atas dan tentukan waktu eksekusinya agar asisten bekerja secara otomatis.</p>
            </Card>
          </div>
        </Card>

      </div>

      <!-- RIGHT SECTION: Execution Logs & Queue (4 cols) -->
      <div class="lg:col-span-4 space-y-6">
        
        <!-- Execution Logs History -->
        <Card padding="p-6" class="space-y-5">
          <div class="border-b border-stone-100 pb-3 flex items-center justify-between">
            <div>
              <h3 class="text-xs font-black text-stone-900 uppercase tracking-widest">Riwayat Eksekusi (Logs)</h3>
              <p class="text-[10px] text-stone-500 mt-0.5">Laporan aktivitas tugas terjadwal yang berhasil dijalankan.</p>
            </div>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <div class="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
            <Card 
              v-for="(log, idx) in logs" 
              :key="idx" 
              hoverable
              padding="p-3.5"
              shadow="shadow-none"
              class="border-stone-200/80 hover:bg-stone-50/80 space-y-2"
            >
              <div class="flex items-start justify-between gap-3">
                <span class="text-xs font-extrabold text-stone-900 leading-normal line-clamp-1">"{{ log.task }}"</span>
                <span class="text-[8.5px] font-mono font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 px-1.5 py-0.5 rounded flex-shrink-0 uppercase">
                  {{ log.status }}
                </span>
              </div>

              <!-- Time details -->
              <div class="flex items-center space-x-1.5 text-[9.5px] text-stone-400 font-mono">
                <svg class="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ log.time }}</span>
              </div>

              <!-- Log output summary -->
              <div class="bg-stone-50 p-2.5 rounded text-[10px] font-semibold text-stone-700 border-l-2 border-stone-300 leading-relaxed font-sans">
                {{ log.result }}
              </div>
            </Card>
          </div>
        </Card>

      </div>

    </div>
  </div>
</template>
