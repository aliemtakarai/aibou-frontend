import { ref } from 'vue'

export interface Agent {
  id: string
  user_id?: number
  name: string
  role: string
  avatar: string
  tone?: string
  secondary_language?: string
  guardrails?: string[]
  is_active?: boolean
  created_at?: string
  updated_at?: string
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

export const BUDI_UUID = '11111111-1111-4111-8111-111111111111'
export const SITI_UUID = '22222222-2222-4222-8222-222222222222'
export const ANDI_UUID = '33333333-3333-4333-8333-333333333333'

// 1. Central Agents In-Memory Cache (populated dynamically from real backend API /api/v1/agents)
export const mockAgents = ref<Agent[]>([])

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

// Alias schedules to UUIDs
if (mockSchedules.value['budi-sales']) {
  mockSchedules.value[BUDI_UUID] = { ...mockSchedules.value['budi-sales'], agent_id: BUDI_UUID }
}
if (mockSchedules.value['siti-support']) {
  mockSchedules.value[SITI_UUID] = { ...mockSchedules.value['siti-support'], agent_id: SITI_UUID }
}
if (mockSchedules.value['andi-tech']) {
  mockSchedules.value[ANDI_UUID] = { ...mockSchedules.value['andi-tech'], agent_id: ANDI_UUID }
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

// Alias conversations to UUIDs
mockConversations.value[BUDI_UUID] = mockConversations.value['budi-sales']
mockConversations.value[SITI_UUID] = mockConversations.value['siti-support']
mockConversations.value[ANDI_UUID] = mockConversations.value['andi-tech']

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
}

export interface AgentToolSetting {
  toolId: string
  applied: boolean
  settings: Record<string, any>
}

export const mockMarketplaceTools = ref<MarketplaceTool[]>([])


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

// Alias agent tool settings to UUIDs
mockAgentToolSettings.value[BUDI_UUID] = mockAgentToolSettings.value['budi-sales']
mockAgentToolSettings.value[SITI_UUID] = mockAgentToolSettings.value['siti-support']
mockAgentToolSettings.value[ANDI_UUID] = mockAgentToolSettings.value['andi-tech']

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

export const addMarketplaceTool = (newTool: MarketplaceTool) => {
  mockMarketplaceTools.value.unshift(newTool)
}

export const editMarketplaceTool = (toolId: string, updates: Partial<MarketplaceTool>) => {
  const idx = mockMarketplaceTools.value.findIndex(t => t.id === toolId)
  if (idx !== -1) {
    mockMarketplaceTools.value[idx] = {
      ...mockMarketplaceTools.value[idx],
      ...updates
    }
  }
}

export const deleteMarketplaceTool = (toolId: string) => {
  mockMarketplaceTools.value = mockMarketplaceTools.value.filter(t => t.id !== toolId)
}

// ----------------------------------------------------
// 9. Token Limit & Usage Specifications
// ----------------------------------------------------
export interface AgentTokenUsage {
  agentId: string
  agentName: string
  tokensUsed: number
  tokenLimit: number // per-agent cap
  promptTokens: number
  completionTokens: number
  conversationsCount: number
}

export interface WorkspaceTokenQuota {
  planName: string
  monthlyLimit: number
  usedTokens: number
  promptTokens: number
  completionTokens: number
  ragEmbeddingTokens: number
  billingPeriodStart: string
  billingPeriodEnd: string
  alertThresholdPercent: number // e.g. 80
  hardStopEnabled: boolean
  dailyAverage: number
  dailyRateLimitPerAgent: number
  agentUsage: Record<string, AgentTokenUsage>
}

export const mockTokenQuota = ref<WorkspaceTokenQuota>({
  planName: 'Aibou Ultra Premium',
  monthlyLimit: 2500000,
  usedTokens: 1842500,
  promptTokens: 1140000,
  completionTokens: 522500,
  ragEmbeddingTokens: 180000,
  billingPeriodStart: '01 Sep 2026',
  billingPeriodEnd: '30 Sep 2026',
  alertThresholdPercent: 80,
  hardStopEnabled: true,
  dailyAverage: 61400,
  dailyRateLimitPerAgent: 75000,
  agentUsage: {
    'budi-sales': {
      agentId: 'budi-sales',
      agentName: 'Budi (Admin Sales)',
      tokensUsed: 980400,
      tokenLimit: 1200000,
      promptTokens: 610000,
      completionTokens: 290400,
      conversationsCount: 3240
    },
    'siti-support': {
      agentId: 'siti-support',
      agentName: 'Siti (Customer Support)',
      tokensUsed: 542100,
      tokenLimit: 800000,
      promptTokens: 340000,
      completionTokens: 152100,
      conversationsCount: 1890
    },
    'andi-tech': {
      agentId: 'andi-tech',
      agentName: 'Andi (IT Troubleshooter)',
      tokensUsed: 320000,
      tokenLimit: 500000,
      promptTokens: 190000,
      completionTokens: 80000,
      conversationsCount: 980
    }
  }
})

// Alias agent token usage to UUIDs
if (mockTokenQuota.value.agentUsage['budi-sales']) {
  mockTokenQuota.value.agentUsage[BUDI_UUID] = {
    ...mockTokenQuota.value.agentUsage['budi-sales'],
    agentId: BUDI_UUID
  }
}
if (mockTokenQuota.value.agentUsage['siti-support']) {
  mockTokenQuota.value.agentUsage[SITI_UUID] = {
    ...mockTokenQuota.value.agentUsage['siti-support'],
    agentId: SITI_UUID
  }
}
if (mockTokenQuota.value.agentUsage['andi-tech']) {
  mockTokenQuota.value.agentUsage[ANDI_UUID] = {
    ...mockTokenQuota.value.agentUsage['andi-tech'],
    agentId: ANDI_UUID
  }
}

export const topUpTokens = (amount: number) => {
  mockTokenQuota.value.monthlyLimit += amount
}

export const updateTokenLimits = (threshold: number, hardStop: boolean, dailyRateLimit?: number, agentLimits?: Record<string, number>) => {
  mockTokenQuota.value.alertThresholdPercent = threshold
  mockTokenQuota.value.hardStopEnabled = hardStop
  if (dailyRateLimit !== undefined) {
    mockTokenQuota.value.dailyRateLimitPerAgent = dailyRateLimit
  }
  if (agentLimits) {
    for (const [id, lim] of Object.entries(agentLimits)) {
      if (mockTokenQuota.value.agentUsage[id]) {
        mockTokenQuota.value.agentUsage[id].tokenLimit = lim
      }
    }
  }
}
