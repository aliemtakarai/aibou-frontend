<script setup lang="ts">
import { ref } from 'vue'
import SvgIcon from '../../components/ui/SvgIcon.vue'

const activeSkill = ref('lead_qualifier')
const googleSheetsEnabled = ref(true)
const webhookEnabled = ref(false)

const sheetUrl = ref('https://docs.google.com/spreadsheets/d/1XyZ...')
const webhookUrl = ref('https://api.n8n.cloud/webhook/aibou-lead')

// Connection test state
const testingWebhook = ref(false)
const testResult = ref<'idle' | 'success' | 'failed'>('idle')

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
  <div class="max-w-4xl space-y-6">
    <!-- Header -->
    <div class="flex items-center space-x-3">
      <div class="w-10 h-10 rounded-xl bg-[#bef264]/20 border border-[#bef264]/30 flex items-center justify-center text-[#3f6212] shadow-sm">
        <SvgIcon name="plug" className="w-5 h-5" />
      </div>
      <div>
        <h1 class="text-xl font-bold text-[#0f172a] tracking-tight">Integrasi Keahlian & Alat</h1>
        <p class="text-slate-455 text-xs mt-1">Konfigurasikan preset keahlian tindakan dan hubungkan sistem keluaran seperti Google Sheets atau API untuk mencatat variabel yang dikumpulkan oleh agen.</p>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Skills Selector -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.015)] h-fit">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Preset Keahlian</h3>
        
        <div class="space-y-2.5">
          <button 
            @click="activeSkill = 'lead_qualifier'"
            :class="activeSkill === 'lead_qualifier' ? 'border-[#bef264] bg-[#bef264]/10 text-[#0f172a]' : 'bg-[#f4f7f6]/60 text-slate-655 hover:text-[#0f172a] border-slate-200/60'"
            class="w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-between cursor-pointer"
          >
            <div class="space-y-1">
              <span class="block">Keahlian Kualifikasi Prospek</span>
              <span class="text-[9px] font-normal text-slate-505 block leading-tight">Mengumpulkan informasi penjualan & mencatat statistik.</span>
            </div>
            <span class="text-[9px] bg-[#bef264]/20 text-[#3f6212] px-1.5 py-0.5 rounded border border-[#bef264]/30 flex-shrink-0 font-bold font-sans">Aktif</span>
          </button>
          
          <button 
            @click="activeSkill = 'faq_answerer'"
            :class="activeSkill === 'faq_answerer' ? 'border-[#bef264] bg-[#bef264]/10 text-[#0f172a]' : 'bg-[#f4f7f6]/60 text-slate-655 hover:text-[#0f172a] border-slate-200/60'"
            class="w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-between cursor-pointer"
          >
            <div class="space-y-1">
              <span class="block">Keahlian Penjawab FAQ</span>
              <span class="text-[9px] font-normal text-slate-505 block leading-tight">Mengekstrak jawaban dari berkas PDF.</span>
            </div>
            <span class="text-[9px] bg-slate-100 text-slate-450 border border-slate-200 px-1.5 py-0.5 rounded flex-shrink-0 font-bold font-sans">Siaga</span>
          </button>
          
          <button 
            @click="activeSkill = 'closing_cta'"
            :class="activeSkill === 'closing_cta' ? 'border-[#bef264] bg-[#bef264]/10 text-[#0f172a]' : 'bg-[#f4f7f6]/60 text-slate-655 hover:text-[#0f172a] border-slate-200/60'"
            class="w-full text-left px-4 py-3.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-between cursor-pointer"
          >
            <div class="space-y-1">
              <span class="block">Keahlian Penutupan / CTA</span>
              <span class="text-[9px] font-normal text-slate-505 block leading-tight">Mengirim tautan pembayaran & jadwal.</span>
            </div>
            <span class="text-[9px] bg-slate-100 text-slate-455 border border-slate-200 px-1.5 py-0.5 rounded flex-shrink-0 font-bold font-sans">Siaga</span>
          </button>
        </div>
      </div>

      <!-- Tools Connections -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-6 md:col-span-2 space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Konektor (Alat MCP)</h3>

        <!-- Google Sheets Connector -->
        <div class="bg-[#f4f7f6]/60 p-5 rounded-2xl border border-slate-200/60 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-sm">
                <SvgIcon name="sheets" className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 class="text-xs font-bold text-[#0f172a]">Saluran Google Sheets</h4>
                <p class="text-[10px] text-slate-500">Tambahkan entri prospek secara dinamis pada pembaruan variabel</p>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="googleSheetsEnabled" class="sr-only peer" />
              <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0f172a]"></div>
            </label>
          </div>

          <div class="space-y-3 pt-2 border-t border-slate-200/60" v-if="googleSheetsEnabled">
            <div class="space-y-1.5">
              <label class="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Target Spreadsheet Aktif</label>
              <input 
                type="text" 
                v-model="sheetUrl" 
                class="w-full bg-white border border-slate-200 focus:border-slate-350 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none font-mono"
              />
            </div>
            
            <!-- Beautiful Visual Spreadsheet mockup -->
            <div class="space-y-1.5">
              <label class="block text-[9px] font-semibold text-slate-450 uppercase tracking-wider">Pemetaan Header Sheet</label>
              <div class="bg-white border border-slate-200/80 rounded-xl overflow-hidden text-[10px] shadow-sm">
                <table class="w-full text-left font-mono">
                  <thead>
                    <tr class="bg-slate-50 text-slate-505 border-b border-slate-200/80">
                      <th class="p-2 border-r border-slate-200/80 font-bold">Kol A (lead_name)</th>
                      <th class="p-2 border-r border-slate-200/80 font-bold">Kol B (lead_whatsapp)</th>
                      <th class="p-2 font-bold">Kol C (interest_level)</th>
                    </tr>
                  </thead>
                  <tbody class="text-slate-450">
                    <tr class="border-b border-slate-105">
                      <td class="p-2 border-r border-slate-100 text-slate-800">Alice Widjaja</td>
                      <td class="p-2 border-r border-slate-100 text-slate-800">08123456789</td>
                      <td class="p-2 text-slate-800">Tinggi</td>
                    </tr>
                    <tr>
                      <td class="p-2 border-r border-slate-100">Charlie Setiawan</td>
                      <td class="p-2 border-r border-slate-100">08198765432</td>
                      <td class="p-2">Sedang</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Webhook Connector -->
        <div class="bg-[#f4f7f6]/60 p-5 rounded-2xl border border-slate-200/60 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
                <SvgIcon name="link" className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 class="text-xs font-bold text-[#0f172a]">Endpoint Webhook HTTP</h4>
                <p class="text-[10px] text-slate-505">Kirim peristiwa webhook JSON kustom ke Make, n8n, atau gateway API</p>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="webhookEnabled" class="sr-only peer" />
              <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0f172a]"></div>
            </label>
          </div>

          <div class="space-y-4 pt-2 border-t border-slate-200/60" v-if="webhookEnabled">
            <div class="space-y-1.5">
              <label class="block text-[9px] font-semibold text-slate-505 uppercase tracking-wider">Endpoint Target Penerima</label>
              <div class="flex gap-2">
                <input 
                  type="text" 
                  v-model="webhookUrl" 
                  class="flex-1 bg-white border border-slate-200 focus:border-slate-350 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none font-mono"
                />
                <button 
                  @click="testWebhook"
                  :disabled="testingWebhook"
                  class="bg-[#0f172a] hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs px-4 rounded-xl transition-colors cursor-pointer"
                >
                  {{ testingWebhook ? 'Menguji...' : 'Uji Koneksi' }}
                </button>
              </div>
            </div>

            <!-- Testing confirmation logs -->
            <div v-if="testResult === 'success'" class="bg-emerald-5 border border-emerald-200 text-emerald-800 text-[10px] px-3.5 py-2.5 rounded-xl flex items-center space-x-2">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-555 animate-ping"></span>
              <span>Uji coba berhasil dikirim! Menerima <strong class="font-mono">HTTP 200 OK</strong> dari endpoint.</span>
            </div>

            <!-- Visual JSON output showcase -->
            <div class="space-y-1.5">
              <label class="block text-[9px] font-semibold text-slate-550 uppercase tracking-wider">Contoh Output Payload (POST)</label>
              <pre class="bg-white text-slate-700 p-3.5 rounded-xl text-[10px] font-mono leading-relaxed overflow-x-auto border border-slate-200/80 shadow-sm">
{
  <span class="text-indigo-600 font-bold">"event"</span>: <span class="text-emerald-700">"lead_conversion"</span>,
  <span class="text-indigo-600 font-bold">"agent_id"</span>: <span class="text-emerald-700">"budi-sales"</span>,
  <span class="text-indigo-600 font-bold">"variables"</span>: {
    <span class="text-indigo-600 font-bold">"lead_name"</span>: <span class="text-amber-700">"Alice"</span>,
    <span class="text-indigo-600 font-bold">"lead_whatsapp"</span>: <span class="text-amber-700">"08123456"</span>,
    <span class="text-indigo-600 font-bold">"interest_level"</span>: <span class="text-amber-700">"High"</span>
  }
}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
