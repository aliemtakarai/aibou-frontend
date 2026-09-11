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

// 5. Global Marketplace Tools Interfaces & State
export interface MarketplaceTool {
  id: string
  name: string
  publisher: string
  category: string
  icon: string
  badge?: string
  desc: string
  version: string
  installs: string
  rating: number
  reviews: number
  requiresConnection: boolean
  connectionStatus: 'connected' | 'disconnected' | 'configuring' | 'error' | 'not_required'
  connectionDetails: {
    account?: string
    service?: string
    endpoint?: string
    secretMasked?: string
    phoneId?: string
    wabaId?: string
    merchantId?: string
    environment?: string
    hostUrl?: string
    apiKeyMasked?: string
    statusMessage?: string
    lastSynced?: string
    latency?: string
    scope?: string
    [key: string]: any
  }
  assignedAgentIds: string[]
}

export interface AgentToolSetting {
  toolId: string
  applied: boolean
  settings: Record<string, any>
}

export const mockMarketplaceTools = ref<MarketplaceTool[]>([
  {
    id: 'sheets',
    name: 'Google Sheets Sync',
    publisher: 'Google Cloud Platform',
    category: 'Spreadsheet',
    icon: 'sheets',
    badge: 'Official',
    desc: 'Sinkronisasi dua arah dan logging prospek otomatis ke Google Spreadsheet secara real-time.',
    version: 'v2.6.0',
    installs: '14.2k',
    rating: 4.9,
    reviews: 230,
    requiresConnection: true,
    connectionStatus: 'connected',
    connectionDetails: {
      account: 'admin@aibou-enterprise.id',
      service: 'Google Workspace OAuth 2.0',
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      statusMessage: 'Terautentikasi & Siap Digunakan',
      lastSynced: '1 menit yang lalu',
      latency: '34ms'
    },
    assignedAgentIds: ['budi-sales', 'siti-support']
  },
  {
    id: 'whatsapp_alerts',
    name: 'WhatsApp Business API Gateway',
    publisher: 'Meta Platform Cloud API',
    category: 'Notifikasi',
    icon: 'chat',
    badge: 'Verified',
    desc: 'Kirim notifikasi otomatis, peringatan darurat, atau eskalasi ke nomor WhatsApp tim CS manusia.',
    version: 'v19.0',
    installs: '18.9k',
    rating: 4.9,
    reviews: 412,
    requiresConnection: true,
    connectionStatus: 'connected',
    connectionDetails: {
      phoneId: 'WA-PHONE-6281234567890',
      wabaId: 'WABA-9988127391',
      service: 'Meta Cloud API v19.0',
      statusMessage: 'Koneksi Terverifikasi (Kualitas Nomor: High)',
      lastSynced: 'Live Stream',
      latency: '22ms'
    },
    assignedAgentIds: ['budi-sales']
  },
  {
    id: 'webhook',
    name: 'HTTP Webhook Gateway',
    publisher: 'Aibou Platform Core',
    category: 'Developer & Otomasi',
    icon: 'link',
    badge: 'Popular',
    desc: 'Dispatcer payload JSON real-time ke Make, Zapier, n8n, atau REST API endpoint backend kustom Anda.',
    version: 'v3.1.2',
    installs: '8.4k',
    rating: 4.7,
    reviews: 95,
    requiresConnection: true,
    connectionStatus: 'connected',
    connectionDetails: {
      endpoint: 'https://api.n8n.cloud/webhook/aibou-lead',
      secretMasked: 'whsec_••••••••8821',
      service: 'REST Webhook Gateway',
      statusMessage: 'Endpoint Aktif (Respon HTTP 200 OK)',
      lastSynced: '10 menit yang lalu',
      latency: '48ms'
    },
    assignedAgentIds: []
  },
  {
    id: 'midtrans',
    name: 'Midtrans Payment Engine',
    publisher: 'Fintech Connect Indonesia',
    category: 'Finance & Keuangan',
    icon: 'plug',
    badge: 'Fintech',
    desc: 'Generate tautan invoice tagihan pembayaran otomatis dan kirimkan ke pembeli di dalam chat WhatsApp.',
    version: 'v1.4.0',
    installs: '6.1k',
    rating: 4.8,
    reviews: 118,
    requiresConnection: true,
    connectionStatus: 'disconnected',
    connectionDetails: {
      environment: 'Sandbox',
      merchantId: 'M109281',
      serverKey: '',
      statusMessage: 'Belum terhubung. Masukkan Server Key Midtrans.',
      lastSynced: '-',
      latency: '-'
    },
    assignedAgentIds: []
  },
  {
    id: 'n8n_node',
    name: 'n8n Workflow Activator',
    publisher: 'n8n Community',
    category: 'Developer & Otomasi',
    icon: 'refresh',
    badge: 'Workflow',
    desc: 'Memicu automasi multi-langkah n8n secara instan saat prospek menyelesaikan checkout atau chat.',
    version: 'v2.1.0',
    installs: '4.7k',
    rating: 4.6,
    reviews: 64,
    requiresConnection: true,
    connectionStatus: 'connected',
    connectionDetails: {
      hostUrl: 'https://n8n.my-business.internal',
      apiKeyMasked: 'n8n_api_••••••••44a2',
      service: 'n8n REST Webhook Node',
      statusMessage: 'Instance Online (Cluster 1)',
      lastSynced: '15 menit yang lalu',
      latency: '62ms'
    },
    assignedAgentIds: []
  },
  {
    id: 'slack',
    name: 'Slack Team Notification',
    publisher: 'Slack Technologies',
    category: 'Notifikasi',
    icon: 'chat',
    desc: 'Kirim ringkasan lead dan peringatan handover langsung ke channel Slack internal perusahaan.',
    version: 'v1.2.4',
    installs: '5.3k',
    rating: 4.5,
    reviews: 42,
    requiresConnection: true,
    connectionStatus: 'disconnected',
    connectionDetails: {
      service: 'Slack Incoming Webhooks',
      endpoint: '',
      statusMessage: 'Belum Dikonfigurasi',
      lastSynced: '-',
      latency: '-'
    },
    assignedAgentIds: []
  },
  {
    id: 'lead_qualifier',
    name: 'Kualifikasi Prospek Otomatis',
    publisher: 'Sales Intelligence Core AI',
    category: 'Sales & Marketing',
    icon: 'bot',
    badge: 'Core AI',
    desc: 'Keahlian bawaan AI untuk mendeteksi intent pembeli, budget, dan scoring kualitas prospek secara mandiri.',
    version: 'v4.0.0',
    installs: '22k',
    rating: 5.0,
    reviews: 580,
    requiresConnection: false,
    connectionStatus: 'not_required',
    connectionDetails: {
      service: 'Internal LLM Engine',
      statusMessage: 'Aktif bawaan platform (Tidak butuh API eksternal)',
      latency: '15ms'
    },
    assignedAgentIds: ['budi-sales']
  },
  {
    id: 'faq_answerer',
    name: 'FAQ Knowledge Reader',
    publisher: 'RAG Engine Core AI',
    category: 'Customer Support',
    icon: 'book',
    badge: 'Core AI',
    desc: 'Pencocokan dokumen bisnis dan SOP otomatis dari Google Drive untuk menjawab pertanyaan pembeli.',
    version: 'v3.5.0',
    installs: '26k',
    rating: 5.0,
    reviews: 620,
    requiresConnection: false,
    connectionStatus: 'not_required',
    connectionDetails: {
      service: 'Internal Vector DB & RAG',
      statusMessage: 'Aktif bawaan platform (Terhubung otomatis ke folder RAG)',
      latency: '25ms'
    },
    assignedAgentIds: ['budi-sales', 'siti-support']
  }
])

// 6. Agent Tool Configurations (Per Agent: Applied status & Agent-specific parameters)
export const mockAgentToolSettings = ref<Record<string, Record<string, AgentToolSetting>>>({
  'budi-sales': {
    'sheets': {
      toolId: 'sheets',
      applied: true,
      settings: {
        spreadsheetName: 'Data Leads & Penjualan 2026',
        sheetTab: 'Sheet1 (Prospek Baru)',
        columnName: 'Kolom A (Nama Calon Pelanggan)',
        columnPhone: 'Kolom B (Nomor WhatsApp)',
        columnInterest: 'Kolom C (Tingkat Keminatan)',
        autoAppend: true,
        triggerCondition: 'Saat prospek baru selesai dikualifikasi'
      }
    },
    'whatsapp_alerts': {
      toolId: 'whatsapp_alerts',
      applied: true,
      settings: {
        recipientPhone: '6281234567890',
        alertOnHighInterest: true,
        alertOnHumanRequest: true,
        customMessageTemplate: 'Halo Admin! Prospek baru dari Agen Budi: {{lead_name}} ({{lead_whatsapp}}). Minat: {{interest_level}}. Segera follow-up!'
      }
    },
    'lead_qualifier': {
      toolId: 'lead_qualifier',
      applied: true,
      settings: {
        qualificationThreshold: 'Tinggi (Siap Beli)',
        autoExtractBudget: true,
        strictRules: true
      }
    },
    'faq_answerer': {
      toolId: 'faq_answerer',
      applied: true,
      settings: {
        confidenceThreshold: 0.85,
        maxCitations: 3,
        strictDriveOnly: true
      }
    },
    'webhook': {
      toolId: 'webhook',
      applied: false,
      settings: {
        eventTrigger: 'lead_conversion',
        agentTag: 'budi_sales_pro',
        includeHistory: false
      }
    },
    'midtrans': {
      toolId: 'midtrans',
      applied: false,
      settings: {
        expiryHours: 24,
        memoPrefix: 'Order Produk via Budi Sales',
        sendInvoiceInChat: true
      }
    },
    'n8n_node': {
      toolId: 'n8n_node',
      applied: false,
      settings: {
        workflowName: 'Lead Nurture Flow',
        customTag: 'priority_high'
      }
    },
    'slack': {
      toolId: 'slack',
      applied: false,
      settings: {
        channelTarget: '#leads-sales-budi',
        notifyOnHandoffOnly: true
      }
    }
  },
  'siti-support': {
    'sheets': {
      toolId: 'sheets',
      applied: true,
      settings: {
        spreadsheetName: 'Customer Support Tickets 2026',
        sheetTab: 'Tiket Masuk',
        columnName: 'Kolom A (Nama User)',
        columnPhone: 'Kolom B (Kontak)',
        columnInterest: 'Kolom C (Keluhan/Kendala)',
        autoAppend: true,
        triggerCondition: 'Saat keluhan tercatat'
      }
    },
    'whatsapp_alerts': {
      toolId: 'whatsapp_alerts',
      applied: false,
      settings: {
        recipientPhone: '6289876543210',
        alertOnHighInterest: false,
        alertOnHumanRequest: true,
        customMessageTemplate: 'Peringatan CS: User {{lead_name}} butuh bantuan manusia di chat!'
      }
    },
    'faq_answerer': {
      toolId: 'faq_answerer',
      applied: true,
      settings: {
        confidenceThreshold: 0.80,
        maxCitations: 5,
        strictDriveOnly: false
      }
    },
    'lead_qualifier': {
      toolId: 'lead_qualifier',
      applied: false,
      settings: {
        qualificationThreshold: 'Semua Kategori',
        autoExtractBudget: false,
        strictRules: false
      }
    },
    'webhook': {
      toolId: 'webhook',
      applied: false,
      settings: {
        eventTrigger: 'chat_closed',
        agentTag: 'siti_support_cs',
        includeHistory: true
      }
    },
    'midtrans': {
      toolId: 'midtrans',
      applied: false,
      settings: {
        expiryHours: 12,
        memoPrefix: 'Tiket CS Siti',
        sendInvoiceInChat: false
      }
    },
    'n8n_node': {
      toolId: 'n8n_node',
      applied: false,
      settings: {
        workflowName: 'CS Escalation Flow',
        customTag: 'cs_ticket'
      }
    },
    'slack': {
      toolId: 'slack',
      applied: false,
      settings: {
        channelTarget: '#cs-escalations',
        notifyOnHandoffOnly: true
      }
    }
  },
  'andi-tech': {
    'webhook': {
      toolId: 'webhook',
      applied: false,
      settings: {
        eventTrigger: 'server_alert',
        agentTag: 'andi_tech',
        includeHistory: false
      }
    }
  }
})

// Helper functions for tool connection management at the workspace level
export const connectMarketplaceTool = (toolId: string, details: Partial<MarketplaceTool['connectionDetails']>) => {
  const tool = mockMarketplaceTools.value.find(t => t.id === toolId)
  if (tool) {
    tool.connectionStatus = 'connected'
    tool.connectionDetails = {
      ...tool.connectionDetails,
      ...details,
      statusMessage: details.statusMessage || 'Terhubung & Siap Digunakan',
      lastSynced: 'Baru saja',
      latency: details.latency || '45ms'
    }
  }
}

export const disconnectMarketplaceTool = (toolId: string) => {
  const tool = mockMarketplaceTools.value.find(t => t.id === toolId)
  if (tool && tool.requiresConnection) {
    tool.connectionStatus = 'disconnected'
    tool.connectionDetails = {
      ...tool.connectionDetails,
      statusMessage: 'Koneksi terputus',
      lastSynced: '-',
      latency: '-'
    }
    // Note: When disconnected globally, agents that had this tool applied will see warning
  }
}

export const toggleAgentTool = (agentId: string, toolId: string) => {
  if (!mockAgentToolSettings.value[agentId]) {
    mockAgentToolSettings.value[agentId] = {}
  }
  
  const current = mockAgentToolSettings.value[agentId][toolId]
  if (current) {
    current.applied = !current.applied
  } else {
    mockAgentToolSettings.value[agentId][toolId] = {
      toolId,
      applied: true,
      settings: {}
    }
  }

  // Also sync assignedAgentIds on marketplace tool
  const tool = mockMarketplaceTools.value.find(t => t.id === toolId)
  if (tool) {
    const isNowApplied = mockAgentToolSettings.value[agentId][toolId]?.applied
    if (isNowApplied) {
      if (!tool.assignedAgentIds.includes(agentId)) {
        tool.assignedAgentIds.push(agentId)
      }
    } else {
      tool.assignedAgentIds = tool.assignedAgentIds.filter(id => id !== agentId)
    }
  }
}

export const updateAgentToolSettings = (agentId: string, toolId: string, newSettings: Record<string, any>) => {
  if (!mockAgentToolSettings.value[agentId]) {
    mockAgentToolSettings.value[agentId] = {}
  }
  if (!mockAgentToolSettings.value[agentId][toolId]) {
    mockAgentToolSettings.value[agentId][toolId] = {
      toolId,
      applied: true,
      settings: {}
    }
  }
  mockAgentToolSettings.value[agentId][toolId].settings = {
    ...mockAgentToolSettings.value[agentId][toolId].settings,
    ...newSettings
  }
}
