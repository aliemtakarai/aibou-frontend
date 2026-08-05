<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Wizard current step: 1 (Intro) or 2 (Subscription Plan)
const currentStep = ref(1)
const selectedPlan = ref('Ultra') // default recommendation

// Plan details matching Settings Account Subscription view
const plans = [
  {
    id: 'Pro',
    name: 'Aibou Pro SaaS',
    price: 'Rp 1.499.000',
    priceDisplay: 'Rp 1.49M',
    tagline: 'Cocok untuk UMKM & Toko Online Ritel',
    features: [
      'Hingga 3 Agen AI Aktif bersamaan',
      'Basis Pengetahuan RAG (Maks 100 Dokumen)',
      'Integrasi Google Sheets & Webhook dasar'
    ]
  },
  {
    id: 'Ultra',
    name: 'Aibou Ultra Premium',
    price: 'Rp 2.999.000',
    priceDisplay: 'Rp 2.99M',
    tagline: 'Solusi lengkap untuk Bisnis Berkembang',
    recommended: true,
    features: [
      'Hingga 10 Agen AI Aktif bersamaan',
      'Basis Pengetahuan RAG (Maks 1.000 Dokumen)',
      'Semua Koneksi Keahlian (WhatsApp & Midtrans)',
      'Prioritas Server Menengah (Respon ~1.2s)'
    ]
  },
  {
    id: 'Max',
    name: 'Aibou Max Enterprise',
    price: 'Rp 5.999.000',
    priceDisplay: 'Rp 5.99M',
    tagline: 'Kapasitas maksimal skala Korporasi Besar',
    features: [
      'Jumlah Agen AI Aktif Tanpa Batas',
      'Dokumen RAG & Poin Informasi Tanpa Batas',
      'Akses API Developer Mentah & n8n Workflows',
      'Dedicated Server Utama (Respon cepat <1.0s)'
    ]
  }
]

const activePlanDetails = computed(() => {
  return plans.find(p => p.id === selectedPlan.value) || plans[1]
})

const nextStep = () => {
  currentStep.value = 2
}

const prevStep = () => {
  currentStep.value = 1
}

const completeOnboarding = () => {
  // Save chosen plan or simulate and redirect to Agents dashboard
  router.push({ path: '/agents', query: { welcome: 'true', plan: selectedPlan.value } })
}
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] text-[#0f172a] flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden relative">
    <!-- Glowing background blurs (Mesh Gradient style) -->
    <div class="absolute top-[-15%] left-[15%] w-[600px] h-[600px] bg-[#bef264]/10 rounded-full blur-[140px] pointer-events-none z-0"></div>
    <div class="absolute bottom-[-15%] right-[10%] w-[500px] h-[500px] bg-[#60a5fa]/8 rounded-full blur-[140px] pointer-events-none z-0"></div>

    <!-- Main Wizard Card wrapper -->
    <div class="w-full max-w-2xl bg-white/80 border border-slate-200/80 rounded-3xl p-8 md:p-10 shadow-[0_25px_60px_rgba(15,23,42,0.035)] backdrop-blur-md relative z-10 space-y-8 transition-all duration-500">
      
      <!-- Top Steps Indicator Header -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-5">
        <div class="flex items-center space-x-2.5">
          <img src="/logo.png" alt="Aibou Logo" class="h-6 w-auto object-contain select-none flex-shrink-0" />
          <span class="text-base font-black tracking-wider uppercase text-slate-800 leading-none translate-y-[3px]">Onboarding</span>
        </div>
        
        <!-- Step numbers/dots -->
        <div class="flex items-center space-x-3">
          <span 
            :class="currentStep === 1 ? 'bg-[#bef264] border-[#bef264]/40 text-[#3f6212]' : 'bg-[#bef264]/40 text-[#3f6212]'"
            class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all duration-300"
          >
            1
          </span>
          <div class="w-8 h-[2px] rounded-full bg-slate-200"></div>
          <span 
            :class="currentStep === 2 ? 'bg-[#bef264] border-[#bef264]/40 text-[#3f6212]' : 'bg-slate-100 border-slate-200 text-slate-400'"
            class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all duration-300"
          >
            2
          </span>
        </div>
      </div>

      <!-- WIZARD STEP 1: Introduction to Aibou -->
      <div v-if="currentStep === 1" class="space-y-6 animate-slide-in">
        <div class="space-y-2 text-center max-w-xl mx-auto">
          <h2 class="text-2xl font-black text-[#0f172a] tracking-tight">Selamat Datang di Asisten Pintar Aibou!</h2>
          <p class="text-slate-500 text-xs font-medium leading-relaxed">
            Mari persiapkan asisten AI virtual pintar Anda untuk menangani obrolan pembeli, mencatat prospek otomatis, dan meningkatkan konversi penjualan 24/7.
          </p>
        </div>

        <!-- Three Steps Illustration Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          <!-- Step 1 info -->
          <div class="bg-white border border-slate-200/60 p-5 rounded-2xl space-y-3 shadow-2xs">
            <div class="w-10 h-10 rounded-xl bg-[#bef264]/20 border border-[#bef264]/30 flex items-center justify-center text-[#3f6212] font-black">
              1
            </div>
            <h4 class="text-xs font-bold text-slate-800">Tentukan Kepribadian</h4>
            <p class="text-[10.5px] text-slate-450 leading-relaxed font-semibold">
              Atur nama asisten, peran spesifik, gaya bicara (formal/santai), serta batasan aturan/pantangan asisten.
            </p>
          </div>

          <!-- Step 2 info -->
          <div class="bg-white border border-slate-200/60 p-5 rounded-2xl space-y-3 shadow-2xs">
            <div class="w-10 h-10 rounded-xl bg-[#bef264]/20 border border-[#bef264]/30 flex items-center justify-center text-[#3f6212] font-black">
              2
            </div>
            <h4 class="text-xs font-bold text-slate-800">Unggah Pengetahuan (RAG)</h4>
            <p class="text-[10.5px] text-slate-450 leading-relaxed font-semibold">
              Masukkan file SOP, dokumen PDF, teks tanya-jawab produk, atau sinkronkan langsung dengan Google Drive bisnis Anda.
            </p>
          </div>

          <!-- Step 3 info -->
          <div class="bg-white border border-slate-200/60 p-5 rounded-2xl space-y-3 shadow-2xs">
            <div class="w-10 h-10 rounded-xl bg-[#bef264]/20 border border-[#bef264]/30 flex items-center justify-center text-[#3f6212] font-black">
              3
            </div>
            <h4 class="text-xs font-bold text-slate-800">Sambungkan Layanan</h4>
            <p class="text-[10.5px] text-slate-450 leading-relaxed font-semibold">
              Hubungkan asisten Anda ke WhatsApp untuk membalas obrolan pembeli, dan ekspor data prospek otomatis ke Google Sheets.
            </p>
          </div>
        </div>

        <!-- Step 1 Footer CTA -->
        <div class="pt-6 border-t border-slate-100 flex justify-end">
          <button 
            @click="nextStep"
            class="bg-[#0f172a] hover:bg-slate-800 hover:shadow-[0_8px_25px_rgba(15,23,42,0.12)] text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all active:scale-98 flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Pilih Paket Langganan &rarr;</span>
          </button>
        </div>
      </div>

      <!-- WIZARD STEP 2: Subscription Plan Selector -->
      <div v-if="currentStep === 2" class="space-y-6 animate-slide-in">
        <div class="space-y-2 text-center max-w-xl mx-auto">
          <h2 class="text-2xl font-black text-[#0f172a] tracking-tight">Pilih Paket Langganan Asisten</h2>
          <p class="text-slate-500 text-xs font-medium leading-relaxed">
            Pilih cakupan fitur dan batas performa server yang sesuai dengan skala bisnis toko online Anda.
          </p>
        </div>

        <!-- 3 Packages Cards Grid (Pro, Ultra, Max) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div 
            v-for="plan in plans" 
            :key="plan.id"
            @click="selectedPlan = plan.id"
            :class="selectedPlan === plan.id ? 'border-[#bef264] bg-[#bef264]/6 shadow-xs ring-1 ring-[#bef264]/20 scale-102' : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50/50'"
            class="border rounded-2xl p-4.5 cursor-pointer transition-all duration-300 flex flex-col justify-between relative group"
          >
            <!-- Recommended Badge overlay -->
            <span 
              v-if="plan.recommended"
              class="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#0c1220] text-[#bef264] border border-slate-800 text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-sm"
            >
              Rekomendasi
            </span>

            <div class="space-y-3">
              <div>
                <h3 class="text-xs font-black text-slate-800 uppercase tracking-wider">{{ plan.id }}</h3>
                <p class="text-[9px] text-slate-400 font-semibold mt-0.5 leading-relaxed">{{ plan.tagline }}</p>
              </div>

              <div class="flex items-baseline">
                <span class="text-sm font-extrabold text-[#0f172a]">{{ plan.priceDisplay }}</span>
                <span class="text-[9px] text-slate-400 font-medium ml-0.5">/bln</span>
              </div>
            </div>

            <!-- Active badge indicator -->
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center">
              <span 
                :class="selectedPlan === plan.id ? 'bg-[#bef264] text-[#3f6212] border-[#bef264]/40 font-extrabold' : 'bg-slate-100 text-slate-450 border-slate-200 font-bold'"
                class="text-[9px] px-3 py-1 rounded-lg border w-full text-center"
              >
                {{ selectedPlan === plan.id ? 'Terpilih' : 'Pilih Paket' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Selected Plan Limits & Feature lists -->
        <div class="bg-[#f8fafc]/80 border border-slate-200/60 p-5 rounded-2xl space-y-3">
          <div class="flex justify-between items-center pb-2 border-b border-slate-100">
            <h4 class="text-xs font-black text-slate-800">Cakupan Fitur Paket: Aibou {{ activePlanDetails.name }}</h4>
            <span class="text-xs font-extrabold text-[#0f172a]">{{ activePlanDetails.price }} <span class="text-[9px] text-slate-450 font-normal">/bulan</span></span>
          </div>

          <ul class="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-slate-600 font-semibold pl-1">
            <li 
              v-for="(feat, fidx) in activePlanDetails.features" 
              :key="fidx"
              class="flex items-center space-x-2"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-[#bef264] flex-shrink-0"></span>
              <span>{{ feat }}</span>
            </li>
          </ul>
        </div>

        <!-- Step 2 Footer CTAs -->
        <div class="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button 
            @click="prevStep"
            class="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors py-3 cursor-pointer"
          >
            &larr; Kembali
          </button>
          
          <button 
            @click="completeOnboarding"
            class="bg-[#0f172a] hover:bg-slate-800 hover:shadow-[0_8px_25px_rgba(15,23,42,0.12)] text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all active:scale-98 flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Aktifkan Paket & Mulai Sekarang</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Animation classes for wizard steps */
.animate-slide-in {
  animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
