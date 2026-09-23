import type { Agent, AgentCreatePayload, AgentUpdatePayload, AgentListResponse, AgentDeleteResponse } from '../types/agent'

const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
const API_BASE_URL = rawBase.replace(/\/+$/, '')

function buildAgentUrl(path: string = '', params?: Record<string, string | boolean | undefined>): string {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : ''
  const base = `${API_BASE_URL}/agents${cleanPath}`
  
  if (!params) return base

  const searchParams = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.append(key, String(val))
    }
  }

  const queryStr = searchParams.toString()
  return queryStr ? `${base}?${queryStr}` : base
}

function getAuthHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
  const resolvedToken = token || localStorage.getItem('aibou_token') || sessionStorage.getItem('aibou_token')
  if (resolvedToken) {
    headers['Authorization'] = `Bearer ${resolvedToken}`
  }
  return headers
}

export const agentsService = {
  /**
   * Fetch all agents owned by the currently authenticated user.
   */
  async fetchAgents(params?: { search?: string; is_active?: boolean }, token?: string | null): Promise<Agent[]> {
    const targetUrl = buildAgentUrl('', {
      search: params?.search,
      is_active: params?.is_active,
    })

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    if (response.status === 401) {
      throw new Error('Sesi telah berakhir atau Anda belum login.')
    }
    if (response.status === 403) {
      throw new Error('Akses ditolak: Anda tidak memiliki izin untuk melihat agen.')
    }

    if (!response.ok) {
      let detail = `Gagal memuat agen dari server (HTTP ${response.status})`
      try {
        const err = await response.json()
        if (err?.detail) detail = err.detail
      } catch {}
      throw new Error(detail)
    }

    const data: AgentListResponse = await response.json()
    return data.items || []
  },

  /**
   * Get detail of a specific agent owned by the logged-in user.
   */
  async getAgent(id: string, token?: string | null): Promise<Agent> {
    const targetUrl = buildAgentUrl(`/${encodeURIComponent(id)}`)
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    if (response.status === 401) {
      throw new Error('Sesi telah berakhir atau Anda belum login.')
    }
    if (response.status === 404) {
      throw new Error(`Agen '${id}' tidak ditemukan atau Anda tidak memiliki akses.`)
    }

    if (!response.ok) {
      let detail = 'Gagal memuat data agen.'
      try {
        const err = await response.json()
        if (err?.detail) detail = err.detail
      } catch {}
      throw new Error(detail)
    }

    return await response.json()
  },

  /**
   * Create a new agent under the logged-in user's account.
   */
  async createAgent(payload: AgentCreatePayload, token?: string | null): Promise<Agent> {
    const targetUrl = buildAgentUrl('')
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    })

    if (response.status === 401) {
      throw new Error('Sesi telah berakhir atau Anda belum login.')
    }

    if (!response.ok) {
      let detail = 'Gagal memasang agen baru.'
      try {
        const err = await response.json()
        if (err?.detail) detail = err.detail
      } catch {}
      throw new Error(detail)
    }

    return await response.json()
  },

  /**
   * Update an existing agent owned by the logged-in user.
   */
  async updateAgent(id: string, updates: AgentUpdatePayload, token?: string | null): Promise<Agent> {
    const targetUrl = buildAgentUrl(`/${encodeURIComponent(id)}`)
    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    })

    if (response.status === 401) {
      throw new Error('Sesi telah berakhir atau Anda belum login.')
    }
    if (response.status === 404) {
      throw new Error(`Agen '${id}' tidak ditemukan atau Anda tidak memiliki akses.`)
    }

    if (!response.ok) {
      let detail = 'Gagal memperbarui konfigurasi agen.'
      try {
        const err = await response.json()
        if (err?.detail) detail = err.detail
      } catch {}
      throw new Error(detail)
    }

    return await response.json()
  },

  /**
   * Delete an agent owned by the logged-in user.
   */
  async deleteAgent(id: string, token?: string | null): Promise<AgentDeleteResponse> {
    const targetUrl = buildAgentUrl(`/${encodeURIComponent(id)}`)
    const response = await fetch(targetUrl, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })

    if (response.status === 401) {
      throw new Error('Sesi telah berakhir atau Anda belum login.')
    }
    if (response.status === 404) {
      throw new Error(`Agen '${id}' tidak ditemukan atau Anda tidak memiliki akses.`)
    }

    if (!response.ok) {
      let detail = 'Gagal menghapus agen.'
      try {
        const err = await response.json()
        if (err?.detail) detail = err.detail
      } catch {}
      throw new Error(detail)
    }

    return await response.json()
  }
}
