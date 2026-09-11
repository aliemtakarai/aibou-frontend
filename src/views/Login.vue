<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AlertBanner from '../components/ui/AlertBanner.vue'
import Card from '../components/ui/Card.vue'
import Button from '../components/ui/Button.vue'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const showSuccessMessage = ref(false)

onMounted(() => {
  if (route.query.registered === 'true') {
    showSuccessMessage.value = true
    // Clear the query parameter from the URL bar silently
    router.replace({ query: {} })
  }
})

const handleLogin = () => {
  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Silakan isi email dan kata sandi Anda.'
    return
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errorMessage.value = 'Format email tidak valid.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  
  // Simulate network request
  setTimeout(() => {
    isLoading.value = false
    router.push('/agents')
  }, 1500)
}
</script>

<template>
  <div class="min-h-screen bg-[#f5f5f4] text-[#1c1917] flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden relative">
    <!-- Floating ambient glow spots behind form (Mesh Gradient style) -->
    <div class="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none z-0"></div>
    <div class="absolute bottom-[-10%] right-[10%] w-[450px] h-[450px] bg-amber-600/5 rounded-full blur-[130px] pointer-events-none z-0"></div>

    <!-- Center Card Container -->
    <Card glass rounded="rounded-3xl" padding="p-8 md:p-10" shadow="shadow-xl" class="w-full max-w-md space-y-7 z-10 border-stone-200">
      
      <!-- Logo and App Name -->
      <div class="flex flex-col items-center text-center space-y-4">
        <img src="/logo.png" alt="Aibou Logo" class="w-28 h-28 object-contain transform hover:scale-105 transition-transform duration-300 select-none" />
        <div>
          <h1 class="text-2xl font-black text-[#1c1917] tracking-tight">Selamat Datang Kembali</h1>
          <p class="text-stone-500 text-xs font-semibold mt-1">Mulai kelola asisten AI bisnis Anda secara mandiri.</p>
        </div>
      </div>

      <!-- Success Toast banner -->
      <AlertBanner 
        v-if="showSuccessMessage"
        type="success"
        message="Registrasi berhasil! Silakan masuk dengan akun Anda."
      />

      <!-- Error Panel banner -->
      <AlertBanner 
        v-if="errorMessage"
        type="error"
        :message="errorMessage"
      />

      <!-- Main Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <!-- Email Input -->
        <div class="space-y-1.5">
          <label class="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">Alamat Email Bisnis</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
              </svg>
            </span>
            <input 
              type="email" 
              v-model="email"
              placeholder="budi@namatoko.com"
              class="w-full bg-white border border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-xl pl-10 pr-4 py-3 text-xs text-[#1c1917] focus:outline-none transition-all font-semibold shadow-xs"
            />
          </div>
        </div>

        <!-- Password Input -->
        <div class="space-y-1.5">
          <div class="flex justify-between items-center">
            <label class="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">Kata Sandi</label>
            <a 
              href="#" 
              @click.prevent="alert('Fitur pemulihan kata sandi dalam pengembangan.')"
              class="text-[10px] text-stone-500 hover:text-amber-600 font-bold transition-colors"
            >
              Lupa Sandi?
            </a>
          </div>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="password"
              placeholder="Masukkan kata sandi Anda"
              class="w-full bg-white border border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-xl pl-10 pr-10 py-3 text-xs text-[#1c1917] focus:outline-none transition-all font-semibold shadow-xs"
            />
            <button 
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 focus:outline-none cursor-pointer"
            >
              <svg v-if="showPassword" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Keep me signed in -->
        <div class="flex items-center justify-between pt-1">
          <label class="flex items-center space-x-2.5 cursor-pointer select-none">
            <input 
              type="checkbox" 
              v-model="rememberMe" 
              class="rounded border-stone-300 accent-amber-500 text-amber-500 focus:ring-amber-500/30 w-4 h-4 cursor-pointer" 
            />
            <span class="text-[11px] text-stone-600 font-bold">Ingat saya di komputer ini</span>
          </label>
        </div>

        <!-- Submit Button -->
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth 
          :loading="isLoading"
        >
          <span>Masuk Ke Konsol</span>
        </Button>
      </form>

      <!-- Divider -->
      <div class="relative flex py-2 items-center">
        <div class="flex-grow border-t border-stone-200"></div>
        <span class="flex-shrink mx-4 text-[10px] text-stone-400 font-mono uppercase tracking-wider font-extrabold">Atau</span>
        <div class="flex-grow border-t border-stone-200"></div>
      </div>

      <!-- Google Login -->
      <Button 
        variant="social" 
        size="lg" 
        fullWidth 
        @click="alert('Koneksi Google Auth sedang dikonfigurasi.')"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span>Masuk Lewat Google</span>
      </Button>

      <!-- Redirect Link -->
      <p class="text-center text-xs text-stone-600 font-semibold pt-1">
        Belum memiliki akun Aibou? 
        <router-link to="/register" class="text-[#1c1917] hover:text-amber-600 font-black underline decoration-2 underline-offset-4 transition-colors">
          Daftar Gratis &rarr;
        </router-link>
      </p>

    </Card>
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
