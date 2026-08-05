<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const fullName = ref('')
const businessName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreeTerms = ref(false)

const isLoading = ref(false)
const errorMessage = ref('')

const handleRegister = () => {
  // Validations
  if (!fullName.value.trim() || !businessName.value.trim() || !email.value.trim() || !password.value || !confirmPassword.value) {
    errorMessage.value = 'Silakan lengkapi semua kolom pendaftaran.'
    return
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errorMessage.value = 'Format email tidak valid.'
    return
  }

  if (password.value.length < 8) {
    errorMessage.value = 'Kata sandi minimal harus 8 karakter.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Konfirmasi kata sandi tidak cocok.'
    return
  }

  if (!agreeTerms.value) {
    errorMessage.value = 'Anda harus menyetujui Ketentuan Layanan & Kebijakan Privasi.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  // Simulate network request
  setTimeout(() => {
    isLoading.value = false
    // Redirect to onboarding wizard
    router.push('/onboarding')
  }, 1500)
}
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] text-[#0f172a] flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden relative">
    <!-- Floating ambient glow spots behind form (Mesh Gradient style) -->
    <div class="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-[#bef264]/12 rounded-full blur-[130px] pointer-events-none z-0"></div>
    <div class="absolute bottom-[-10%] right-[10%] w-[450px] h-[450px] bg-[#60a5fa]/8 rounded-full blur-[130px] pointer-events-none z-0"></div>

    <!-- Center Card Container -->
    <div class="w-full max-w-md bg-white/80 border border-slate-200/80 rounded-3xl p-8 shadow-[0_20px_50px_rgba(15,23,42,0.035)] backdrop-blur-md space-y-6 my-8 relative z-10">
      
      <!-- Logo and App Name -->
      <div class="flex flex-col items-center text-center space-y-4">
        <img src="/logo.png" alt="Aibou Logo" class="w-28 h-28 object-contain transform hover:scale-105 transition-transform duration-300 select-none" />
        <div>
          <h1 class="text-2xl font-black text-[#0f172a] tracking-tight">Daftar Akun Baru</h1>
          <p class="text-slate-455 text-xs font-semibold mt-1">Ciptakan asisten AI komersial Anda dalam 2 menit.</p>
        </div>
      </div>

      <!-- Error Panel banner -->
      <transition name="fade">
        <div 
          v-if="errorMessage"
          class="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl flex items-center space-x-3 animate-fade-in"
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="font-bold leading-relaxed">{{ errorMessage }}</span>
        </div>
      </transition>

      <!-- Main Form fields -->
      <form @submit.prevent="handleRegister" class="space-y-4">
        <!-- Full Name -->
        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <input 
              type="text" 
              v-model="fullName"
              placeholder="Budi Setiawan"
              class="w-full bg-white border border-slate-200 focus:border-[#bef264] focus:ring-4 focus:ring-[#bef264]/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0f172a] focus:outline-none transition-all font-semibold shadow-2xs"
            />
          </div>
        </div>

        <!-- Business Name -->
        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Bisnis / Toko</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <input 
              type="text" 
              v-model="businessName"
              placeholder="KCI Store"
              class="w-full bg-white border border-slate-200 focus:border-[#bef264] focus:ring-4 focus:ring-[#bef264]/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0f172a] focus:outline-none transition-all font-semibold shadow-2xs"
            />
          </div>
        </div>

        <!-- Email -->
        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alamat Email</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
              </svg>
            </span>
            <input 
              type="email" 
              v-model="email"
              placeholder="budi@toko.com"
              class="w-full bg-white border border-slate-200 focus:border-[#bef264] focus:ring-4 focus:ring-[#bef264]/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0f172a] focus:outline-none transition-all font-semibold shadow-2xs"
            />
          </div>
        </div>

        <!-- Password -->
        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kata Sandi Baru</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input 
              type="password" 
              v-model="password"
              placeholder="Minimal 8 karakter"
              class="w-full bg-white border border-slate-200 focus:border-[#bef264] focus:ring-4 focus:ring-[#bef264]/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0f172a] focus:outline-none transition-all font-semibold shadow-2xs"
            />
          </div>
        </div>

        <!-- Confirm Password -->
        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Konfirmasi Kata Sandi</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input 
              type="password" 
              v-model="confirmPassword"
              placeholder="Ulangi kata sandi Anda"
              class="w-full bg-white border border-slate-200 focus:border-[#bef264] focus:ring-4 focus:ring-[#bef264]/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0f172a] focus:outline-none transition-all font-semibold shadow-2xs"
            />
          </div>
        </div>

        <!-- Agree Terms -->
        <div class="pt-1">
          <label class="flex items-start space-x-2.5 cursor-pointer select-none">
            <input 
              type="checkbox" 
              v-model="agreeTerms" 
              class="rounded border-slate-300 accent-[#bef264] text-[#0f172a] focus:ring-[#bef264]/30 w-4 h-4 cursor-pointer mt-0.5" 
            />
            <span class="text-[10px] text-slate-500 font-semibold leading-relaxed">
              Saya menyetujui <a href="#" @click.prevent class="text-[#0f172a] underline font-bold">Syarat & Ketentuan Layanan</a> serta <a href="#" @click.prevent class="text-[#0f172a] underline font-bold">Kebijakan Privasi</a> Aibou.
            </span>
          </label>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit"
          :disabled="isLoading"
          :class="isLoading ? 'bg-slate-800/80 cursor-wait' : 'bg-gradient-to-r from-[#0f172a] to-slate-800 hover:from-slate-900 hover:to-black hover:shadow-[0_8px_25px_rgba(15,23,42,0.12)] cursor-pointer active:scale-98'"
          class="w-full text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 pt-2"
        >
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isLoading ? 'Mendaftarkan Akun...' : 'Daftar Akun Baru' }}</span>
        </button>
      </form>

      <!-- Redirect back to login -->
      <p class="text-center text-xs text-slate-550 font-semibold pt-1">
        Sudah memiliki akun? 
        <router-link to="/login" class="text-[#0f172a] hover:text-[#3f6212] font-black underline decoration-2 underline-offset-4">
          Masuk Sekarang &rarr;
        </router-link>
      </p>

    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
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
