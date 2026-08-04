import { ref } from 'vue'

export interface Agent {
  id: string
  name: string
  role: string
  avatar: string
}

export interface AgentSchedule {
  agent_id: string
  timezone: string
  active_days: number[] // 1=Mon, 2=Tue, ..., 7=Sun
  start_time: string
  end_time: string
  offline_reply_enabled: boolean
  offline_reply_message: string
  sync_frequency: string
  sync_cron: string
}

export interface Message {
  id: string
  sender_type: 'customer' | 'ai' | 'human'
  content: string
  created_at: string
}

export interface Conversation {
  id: string
  external_user_name: string
  external_channel: 'whatsapp' | 'telegram' | 'web'
  status: 'ai_active' | 'human_handled' | 'resolved'
  last_message: string
  last_message_at: string
  messages: Message[]
}

export interface RagCitation {
  source_document: string
  chunk_content: string
  score: number
}

export interface ToolLog {
  tool_name: string
  status: 'SUCCESS' | 'FAILED'
  payload_sent: Record<string, any>
  response_received: Record<string, any>
}

export interface SandboxDebug {
  response: string
  rag_citations: RagCitation[]
  tool_logs: ToolLog[]
  variables: Record<string, string>
}

// 1. Mock Agents
export const mockAgents = ref<Agent[]>([
  {
    id: 'budi-sales',
    name: 'Budi',
    role: 'Admin Sales & Lead Qualifier',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'siti-support',
    name: 'Siti',
    role: 'Customer Support FAQ Officer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'andi-tech',
    name: 'Andi',
    role: 'IT Troubleshooter',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80'
  }
])

// 2. Mock Schedules per Agent
export const mockSchedules = ref<Record<string, AgentSchedule>>({
  'budi-sales': {
    agent_id: 'budi-sales',
    timezone: 'Asia/Jakarta',
    active_days: [1, 2, 3, 4, 5],
    start_time: '09:00',
    end_time: '18:00',
    offline_reply_enabled: true,
    offline_reply_message: 'Halo! Kami sedang offline saat ini. Pesan Anda telah kami terima dan akan dibalas pada jam operasional (Senin-Jumat, 09:00 - 18:00 WIB). Terima kasih!'
  } as any,
  'siti-support': {
    agent_id: 'siti-support',
    timezone: 'Asia/Jakarta',
    active_days: [1, 2, 3, 4, 5, 6],
    start_time: '08:00',
    end_time: '20:00',
    offline_reply_enabled: true,
    offline_reply_message: 'Halo, CS kami sedang beristirahat. Kami akan merespons pertanyaan Anda sesegera mungkin besok pagi. Terima kasih atas pengertian Anda.'
  } as any,
  'andi-tech': {
    agent_id: 'andi-tech',
    timezone: 'UTC',
    active_days: [1, 2, 3, 4, 5, 6, 7],
    start_time: '00:00',
    end_time: '23:59',
    offline_reply_enabled: false,
    offline_reply_message: 'Technical Support is offline.'
  } as any
})

// Add sync schedules details
for (const key in mockSchedules.value) {
  mockSchedules.value[key].sync_frequency = 'daily'
  mockSchedules.value[key].sync_cron = '0 2 * * *'
}

// 3. Mock Conversations for Live Inbox
export const mockConversations = ref<Record<string, Conversation[]>>({
  'budi-sales': [
    {
      id: 'conv-budi-1',
      external_user_name: 'Alice Widjaja',
      external_channel: 'whatsapp',
      status: 'ai_active',
      last_message: 'Berapa harga paket reseller?',
      last_message_at: '2026-08-03T23:15:00Z',
      messages: [
        {
          id: 'msg-b1-1',
          sender_type: 'customer',
          content: 'Halo, saya tertarik dengan program kemitraan.',
          created_at: '23:10'
        },
        {
          id: 'msg-b1-2',
          sender_type: 'ai',
          content: 'Halo! Selamat datang di Aibou. Saya Budi, asisten sales Anda. Ada yang bisa saya bantu mengenai kemitraan?',
          created_at: '23:11'
        },
        {
          id: 'msg-b1-3',
          sender_type: 'customer',
          content: 'Berapa harga paket reseller?',
          created_at: '23:15'
        }
      ]
    },
    {
      id: 'conv-budi-2',
      external_user_name: 'Charlie Setiawan',
      external_channel: 'whatsapp',
      status: 'human_handled',
      last_message: 'Terima kasih, saya tunggu nomor resinya.',
      last_message_at: '2026-08-03T22:30:00Z',
      messages: [
        {
          id: 'msg-b2-1',
          sender_type: 'customer',
          content: 'Saya sudah transfer ke rekening BCA ya.',
          created_at: '22:20'
        },
        {
          id: 'msg-b2-2',
          sender_type: 'human',
          content: 'Baik Pak Charlie, pembayaran sudah kami terima. Paket akan dikirim sore ini.',
          created_at: '22:25'
        },
        {
          id: 'msg-b2-3',
          sender_type: 'customer',
          content: 'Terima kasih, saya tunggu nomor resinya.',
          created_at: '22:30'
        }
      ]
    }
  ],
  'siti-support': [
    {
      id: 'conv-siti-1',
      external_user_name: 'Dewi Lestari',
      external_channel: 'web',
      status: 'ai_active',
      last_message: 'Apakah ada cabang di Surabaya?',
      last_message_at: '2026-08-03T23:05:00Z',
      messages: [
        {
          id: 'msg-s1-1',
          sender_type: 'customer',
          content: 'Halo, mau tanya dong.',
          created_at: '23:00'
        },
        {
          id: 'msg-s1-2',
          sender_type: 'ai',
          content: 'Halo! Ada yang bisa Siti bantu hari ini?',
          created_at: '23:01'
        },
        {
          id: 'msg-s1-3',
          sender_type: 'customer',
          content: 'Apakah ada cabang di Surabaya?',
          created_at: '23:05'
        }
      ]
    }
  ],
  'andi-tech': []
})

// 4. Mock Playground Sandbox Responses
export const mockPlaygroundResponses = [
  {
    response: "Untuk harga paket reseller terkecil dimulai dari Rp500.000 (Paket Starter) seperti tercantum dalam SOP Kemitraan.",
    rag_citations: [
      {
        source_document: "SOP_Kemitraan_v2.pdf",
        chunk_content: "...Paket Reseller Starter minimal order awal senilai Rp 500.000,- mendapat 10 box produk...",
        score: 0.92
      },
      {
        source_document: "PriceList_2026.pdf",
        chunk_content: "...Paket Agen: Rp 2.000.000. Paket Reseller: Rp 500.000...",
        score: 0.78
      }
    ],
    tool_logs: [
      {
        tool_name: "Google Sheets / LogLead",
        status: "SUCCESS",
        payload_sent: { "Nama": "Tester", "Minat": "Reseller Starter" },
        response_received: { "row_added": 14 }
      }
    ],
    variables: {
      "lead_name": "Tester",
      "lead_whatsapp": "08123456789",
      "interest_level": "High",
      "budget_range": "Rp500.000"
    }
  },
  {
    response: "Ya, kami dapat mengirimkan file katalog lengkap ke nomor Anda. Silakan isi form pendaftaran terlebih dahulu.",
    rag_citations: [
      {
        source_document: "SOP_Kemitraan_v2.pdf",
        chunk_content: "...Brosur dan katalog digital dikirimkan otomatis setelah lead terdaftar di spreadsheet...",
        score: 0.85
      }
    ],
    tool_logs: [
      {
        tool_name: "Generic Webhook / SendKatalog",
        status: "SUCCESS",
        payload_sent: { "email": "test@gmail.com", "action": "send_catalog" },
        response_received: { "status": "sent" }
      }
    ],
    variables: {
      "lead_email": "test@gmail.com",
      "katalog_requested": "true"
    }
  },
  {
    response: "Saya adalah AI Assistant yang ditugaskan untuk membantu Anda. Data Anda aman bersama kami.",
    rag_citations: [],
    tool_logs: [],
    variables: {}
  }
] as SandboxDebug[]
