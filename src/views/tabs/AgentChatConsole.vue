<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { mockPlaygroundResponses, mockAgents } from '../../utils/mockData'
import type { Message } from '../../utils/mockData'

const route = useRoute()
const agentId = computed(() => route.params.id as string)
const agent = computed(() => mockAgents.value.find(a => a.id === agentId.value))

// Messages feed starting with initial bot greeting
const messages = ref<Message[]>([
  {
    id: 'init-msg',
    sender_type: 'ai',
    content: 'Halo! Saya asisten AI Anda. Silakan kirim pesan untuk mulai berinteraksi.',
    created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
])

const userInput = ref('')
const isTyping = ref(false)
const responseCount = ref(0)

const sendMessage = () => {
  if (!userInput.value.trim() || isTyping.value) return
  
  const text = userInput.value.trim()
  userInput.value = ''
  
  // 1. Add User message
  messages.value.push({
    id: `u-${Date.now()}`,
    sender_type: 'customer',
    content: text,
    created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
  
  // 2. Trigger Typing animation
  isTyping.value = true
  
  setTimeout(() => {
    // 3. Get response from mock responses list
    const responseIndex = responseCount.value % mockPlaygroundResponses.length
    const mockData = mockPlaygroundResponses[responseIndex]
    
    messages.value.push({
      id: `a-${Date.now()}`,
      sender_type: 'ai',
      content: mockData.response,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    
    responseCount.value++
    isTyping.value = false
  }, 1000)
}

// Suggested Prompts
const suggestions = [
  { title: 'Tanya SOP Bisnis', desc: 'Bagaimana SOP penanganan keluhan refund barang?' },
  { title: 'Kualifikasi Prospek', desc: 'Hubungi saya sebagai prospek baru yang berminat membeli.' },
  { title: 'Cari Informasi', desc: 'Cari tahu info harga katalog dari PriceList_2026.pdf.' },
  { title: 'Hubungkan Spreadsheet', desc: 'Simulasikan pendaftaran pelanggan baru ke Google Sheets.' }
]

const selectSuggestion = (desc: string) => {
  userInput.value = desc
  sendMessage()
}

// Reset on agent change
watch(agentId, () => {
  messages.value = [
    {
      id: 'init-msg',
      sender_type: 'ai',
      content: 'Halo! Saya asisten AI Anda. Silakan kirim pesan untuk mulai berinteraksi.',
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]
})
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.015)] relative">
    <!-- Chat Messages Area -->
    <div class="flex-1 overflow-y-auto px-6 py-8 space-y-6">
      
      <!-- Gemini Empty State Greeting -->
      <div 
        v-if="messages.length <= 1 && !isTyping" 
        class="max-w-2xl mx-auto py-12 space-y-8 select-none"
      >
        <div class="space-y-2">
          <h2 class="text-3xl font-black bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-500 bg-clip-text text-transparent tracking-tight leading-tight">
            Halo, Admin Aibou 
          </h2>
          <p class="text-slate-500 text-sm font-medium">
            Ada yang bisa saya bantu untuk menguji Studio Persona, berkas RAG Google Drive, dan Keahlian saya hari ini?
          </p>
        </div>

        <!-- Suggested Query Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            v-for="s in suggestions"
            :key="s.title"
            @click="selectSuggestion(s.desc)"
            class="bg-[#f4f7f6]/40 hover:bg-[#f4f7f6]/90 border border-slate-200/80 hover:border-slate-355 rounded-2xl p-4 transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[110px]"
          >
            <p class="text-xs font-semibold text-slate-700 group-hover:text-slate-900 leading-normal">
              {{ s.desc }}
            </p>
            <div class="flex justify-between items-center mt-3 text-slate-400 group-hover:text-slate-700">
              <span class="text-[10px] uppercase font-bold tracking-wider font-sans text-slate-450">{{ s.title }}</span>
              <span class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold shadow-sm transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages Stream (Bubble-less style) -->
      <div v-else class="max-w-2xl mx-auto w-full space-y-8">
        <div 
          v-for="msg in messages" 
          :key="msg.id"
          class="w-full"
        >
          <!-- Customer Message: Clean right-aligned capsule -->
          <div v-if="msg.sender_type === 'customer'" class="flex justify-end">
            <div class="bg-slate-100 text-slate-800 rounded-3xl rounded-tr-none px-5 py-3 text-xs leading-relaxed max-w-[80%] shadow-[0_1px_2px_rgba(0,0,0,0.01)] border border-slate-200/40">
              {{ msg.content }}
            </div>
          </div>

          <!-- AI Response: Left aligned with agent avatar (No speech bubbles) -->
          <div v-else class="flex gap-4 items-start animate-fade-in">
            <div class="w-8 h-8 rounded-full bg-[#bef264] border border-[#bef264]/40 flex items-center justify-center text-[#3f6212] font-black text-xs shadow-sm flex-shrink-0 mt-0.5 select-none">
              AI
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none">{{ agent ? agent.name : 'Aibou' }}</div>
              <div class="text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap font-medium">{{ msg.content }}</div>
            </div>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="isTyping" class="flex gap-4 items-start">
          <div class="w-8 h-8 rounded-full bg-[#bef264] border border-[#bef264]/40 flex items-center justify-center text-[#3f6212] font-black text-xs shadow-sm flex-shrink-0 mt-0.5 select-none animate-pulse">
            AI
          </div>
          <div class="flex items-center space-x-1.5 mt-2 bg-slate-50 border border-slate-200/50 px-3 py-1.5 rounded-full">
            <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style="animation-delay: 0ms"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style="animation-delay: 150ms"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style="animation-delay: 300ms"></span>
          </div>
        </div>
      </div>

    </div>

    <!-- Chat Input Area (Gemini Style Bottom Pill) -->
    <div class="p-4 border-t border-slate-100 bg-white">
      <div class="max-w-2xl mx-auto w-full space-y-2">
        <div class="bg-slate-50 border border-slate-200/80 hover:border-slate-300 rounded-3xl px-5 py-2.5 flex items-center shadow-sm focus-within:border-slate-350 focus-within:bg-white focus-within:shadow-md transition-all duration-300">
          <input
            type="text"
            v-model="userInput"
            placeholder="Tanyakan sesuatu pada asisten AI..."
            class="flex-1 bg-transparent border-none outline-none text-xs text-[#0f172a] placeholder-slate-400 focus:ring-0 mr-3"
            @keydown.enter="sendMessage"
          />
          <button
            @click="sendMessage"
            :disabled="!userInput.trim() || isTyping"
            class="w-8 h-8 rounded-full bg-[#0f172a] hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-[#0f172a] text-white flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
        <p class="text-[9px] text-slate-400 text-center select-none tracking-normal font-sans">
          Aibou dapat menampilkan informasi yang tidak akurat. Harap periksa kembali respon penting.
        </p>
      </div>
    </div>
  </div>
</template>
