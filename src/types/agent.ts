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

export interface AgentCreatePayload {
  name: string
  role: string
  avatar?: string
  tone?: string
  secondary_language?: string
  guardrails?: string[]
  is_active?: boolean
}

export interface AgentUpdatePayload {
  name?: string
  role?: string
  avatar?: string
  tone?: string
  secondary_language?: string
  guardrails?: string[]
  is_active?: boolean
}

export interface AgentListResponse {
  items: Agent[]
  total: number
}

export interface AgentDeleteResponse {
  success: boolean
  message: string
  id: string
}
