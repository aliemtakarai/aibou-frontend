<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { mockSchedules } from '../../utils/mockData'

const route = useRoute()
const agentId = computed(() => route.params.id as string)

// Get reactive schedule for this agent
const schedule = computed(() => {
  return mockSchedules.value[agentId.value]
})

// Timezones list
const timezones = ['Asia/Jakarta', 'Asia/Kuala_Lumpur', 'Asia/Singapore', 'UTC', 'America/New_York']

// Days helper
const daysOfWeek = [
  { value: 1, name: 'Sen' },
  { value: 2, name: 'Sel' },
  { value: 3, name: 'Rab' },
  { value: 4, name: 'Kam' },
  { value: 5, name: 'Jum' },
  { value: 6, name: 'Sab' },
  { value: 7, name: 'Min' }
]

// Toggle day selection
const toggleDay = (dayValue: number) => {
  if (!schedule.value) return
  const index = schedule.value.active_days.indexOf(dayValue)
  if (index === -1) {
    schedule.value.active_days.push(dayValue)
    schedule.value.active_days.sort()
  } else {
    // Keep at least one active day
    if (schedule.value.active_days.length > 1) {
      schedule.value.active_days.splice(index, 1)
    }
  }
}

const showToast = ref(false)
const saveSchedule = () => {
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2550)
}
</script>

<template>
  <div class="max-w-4xl space-y-6" v-if="schedule">
    <!-- Toast Notification -->
    <div 
      v-if="showToast" 
      class="fixed top-6 right-6 bg-white border border-[#bef264]/40 text-[#3f6212] text-xs px-4 py-3 rounded-xl shadow-lg backdrop-blur-md z-50 flex items-center space-x-2 transition-all duration-300 animate-bounce"
    >
      <span class="w-2 h-2 rounded-full bg-[#a3e635] animate-pulse"></span>
      <span class="font-bold">Konfigurasi Jadwal Disimpan!</span>
    </div>

    <!-- Header -->
    <div class="flex items-center space-x-3">
      <div class="w-10 h-10 rounded-xl bg-[#bef264]/20 border border-[#bef264]/30 flex items-center justify-center text-[#3f6212] shadow-sm">
        <!-- Calendar SVG icon -->
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div>
        <h1 class="text-xl font-bold text-[#0f172a] tracking-tight">Manajer Jadwal</h1>
        <p class="text-slate-455 text-xs mt-1">Konfigurasikan jam operasional aktif, perilaku otomatis di luar kantor, dan sinkronisasi otomatis basis pengetahuan.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Scheduling Configurations -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-6 md:col-span-2 space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
        
        <!-- Part A: Active Hours -->
        <div class="space-y-4">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">A. Jam Operasional</h3>
          
          <!-- Days Picker -->
          <div class="space-y-2">
            <label class="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Hari Kerja Aktif</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="day in daysOfWeek"
                :key="day.value"
                @click="toggleDay(day.value)"
                :class="schedule.active_days.includes(day.value) ? 'bg-[#bef264] border-[#bef264]/30 text-[#0f172a] shadow-sm' : 'bg-[#f4f7f6]/60 border-slate-200 text-slate-505 hover:text-slate-700'"
                class="px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer"
              >
                {{ day.name }}
              </button>
            </div>
          </div>

          <!-- Hours Range -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-[10px] font-semibold text-slate-550 uppercase tracking-wider">Mulai Shift Siang</label>
              <input 
                type="time" 
                v-model="schedule.start_time"
                class="w-full bg-[#f4f7f6] border border-slate-200 focus:border-slate-350 rounded-xl px-3.5 py-2 text-xs text-[#0f172a] focus:outline-none transition-colors"
              />
            </div>
            <div class="space-y-1.5">
              <label class="block text-[10px] font-semibold text-slate-555 uppercase tracking-wider">Selesai Shift Siang</label>
              <input 
                type="time" 
                v-model="schedule.end_time"
                class="w-full bg-[#f4f7f6] border border-slate-200 focus:border-slate-350 rounded-xl px-3.5 py-2 text-xs text-[#0f172a] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <!-- Timezone -->
          <div class="space-y-1.5">
            <label class="block text-[10px] font-semibold text-slate-505 uppercase tracking-wider">Zona Waktu Standar</label>
            <select
              v-model="schedule.timezone"
              class="w-full bg-[#f4f7f6] border border-slate-200 focus:border-slate-350 rounded-xl px-3 py-2 text-xs text-[#0f172a] focus:outline-none transition-colors"
            >
              <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
            </select>
          </div>
        </div>

        <!-- Part B: Offline Auto-Reply -->
        <div class="border-t border-slate-100 pt-6 space-y-4">
          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <h3 class="text-xs font-bold text-[#0f172a] uppercase tracking-wider">B. Penjawab di Luar Kantor</h3>
              <p class="text-[10px] text-slate-505">Kirim templat pesan secara otomatis selama jam tidak aktif.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="schedule.offline_reply_enabled" class="sr-only peer" />
              <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0f172a]"></div>
            </label>
          </div>

          <div v-if="schedule.offline_reply_enabled" class="space-y-2.5 pt-2 animate-fade-in">
            <textarea
              v-model="schedule.offline_reply_message"
              rows="4"
              class="w-full bg-[#f4f7f6] border border-slate-200 focus:border-slate-350 rounded-xl p-3.5 text-xs text-[#0f172a] focus:outline-none resize-none font-sans leading-relaxed"
            ></textarea>
            <div class="bg-amber-55 border border-amber-200 text-amber-850 p-3.5 rounded-xl text-[10px] flex items-start space-x-2.5">
              <svg class="w-4 h-4 flex-shrink-0 text-amber-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Templat penjawab ini mengambil alih sepenuhnya ketika jam aktif berakhir, menggantikan aturan percakapan dasar dengan pesan cadangan statis ini.</span>
            </div>
          </div>
        </div>

        <!-- Action Bar -->
        <div class="border-t border-slate-100 pt-4 flex justify-end">
          <button 
            @click="saveSchedule"
            class="bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Simpan Pengaturan Jadwal
          </button>
        </div>
      </div>

      <!-- Part C: Automated Sync Schedule -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-sm h-fit">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">C. Jadwal Sinkronisasi Vektor</h3>

        <div class="space-y-4">
          <div class="space-y-1.5">
            <label class="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Frekuensi Sinkronisasi</label>
            <select
              v-model="schedule.sync_frequency"
              class="w-full bg-[#f4f7f6] border border-slate-200 focus:border-slate-350 rounded-xl px-3 py-2 text-xs text-[#0f172a] focus:outline-none transition-colors"
            >
              <option value="manual">Hanya Sinkronisasi Manual</option>
              <option value="hourly">Sinkronisasi Otomatis Tiap Jam</option>
              <option value="daily">Sinkronisasi Otomatis Harian</option>
              <option value="weekly">Sinkronisasi Otomatis Mingguan</option>
              <option value="custom">Pengaturan Cron Kustom</option>
            </select>
          </div>

          <div v-if="schedule.sync_frequency !== 'manual'" class="space-y-1.5 pt-2 animate-fade-in">
            <label class="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {{ schedule.sync_frequency === 'custom' ? 'Pola Ekspresi Cron' : 'Pemicu Sinkronisasi Otomatis' }}
            </label>
            <input 
              type="text" 
              v-model="schedule.sync_cron"
              :readonly="schedule.sync_frequency !== 'custom'"
              class="w-full bg-[#f4f7f6] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#4d7c0f] font-mono focus:outline-none transition-all font-bold"
              :class="schedule.sync_frequency !== 'custom' ? 'opacity-50 select-none cursor-not-allowed text-slate-500 bg-slate-50' : 'focus:border-slate-350 border-slate-200'"
            />
            <p class="text-[9px] text-slate-500 leading-normal" v-if="schedule.sync_frequency === 'custom'">Sistem cron 5-kolom standar. (contoh: <span class="font-mono text-[#4d7c0f] font-bold">0 2 * * *</span> dieksekusi setiap hari pukul 02:00)</p>
            <p class="text-[9px] text-slate-500 leading-normal" v-else>Kumpulan instruksi cron sistem yang disintesis.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
