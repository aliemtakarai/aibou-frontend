<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  className?: string
}>(), {
  className: 'w-4 h-4'
})

// Define all SVG paths inside a computed key-value mapping
const iconPaths = computed<Record<string, string>>(() => ({
  // 1. Bot (Persona Studio)
  'bot': 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
  
  // 2. Book / Database (Knowledge Base)
  'book': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  
  // 3. Lightning / Plug (Skills & Tools)
  'plug': 'M13 10V3L4 14h7v7l9-11h-7z',
  
  // 4. Calendar (Schedule Manager)
  'calendar': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  
  // 5. Chat / Message (Chat Console)
  'chat': 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  
  // 6. Folder (Google Drive)
  'folder': 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
  
  // 7. Refresh / Sync (Re-sync Data)
  'refresh': 'M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17',
  
  // 8. Table / Grid (Google Sheets)
  'sheets': 'M3 10h18M3 14h18m-9-4v8m-5-8v8m10-8v8M4 6h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z',
  
  // 9. Link / Attachment (Generic Webhook)
  'link': 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  
  // 10. Left Arrow (Back Navigations)
  'arrow-left': 'M10 19l-7-7m0 0l7-7m-7 7h18',
  
  // 11. Warning Alert (AI Pause Notice)
  'warning': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
}))
</script>

<template>
  <svg 
    :class="className" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    stroke-width="2"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      v-if="iconPaths[name]" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      :d="iconPaths[name]" 
    />
  </svg>
</template>
