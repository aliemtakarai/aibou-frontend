import type { MarketplaceTool } from '../utils/mockData'

const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
const API_BASE_URL = rawBase.replace(/\/+$/, '')

function buildToolUrl(path: string = '', params?: Record<string, string | undefined>): string {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : ''
  const base = `${API_BASE_URL}/tools${cleanPath}`
  
  if (!params) return base

  const searchParams = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.append(key, val)
    }
  }

  const queryStr = searchParams.toString()
  return queryStr ? `${base}?${queryStr}` : base
}

/**
 * Transform backend tool schema (snake_case) to frontend MarketplaceTool model (camelCase).
 */
export function transformBackendToolToFrontend(item: any): MarketplaceTool {
  return {
    id: item.id,
    name: item.name,
    publisher: item.publisher,
    category: item.category,
    icon: item.icon || 'plug',
    badge: item.badge || undefined,
    desc: item.desc,
    version: item.version || 'v1.0.0',
    installs: item.installs || '1.0k',
    rating: item.rating !== undefined ? Number(item.rating) : 5.0,
    reviews: item.reviews !== undefined ? Number(item.reviews) : 0,
    requiresConnection: item.requires_connection !== undefined ? Boolean(item.requires_connection) : Boolean(item.requiresConnection),
    connectionStatus: item.connection_status || item.connectionStatus || 'disconnected',
    connectionDetails: item.connection_details || item.connectionDetails || {},
  }
}

/**
 * Transform frontend MarketplaceTool model to backend payload schema (snake_case).
 */
export function transformFrontendToolToBackend(tool: Partial<MarketplaceTool>): Record<string, any> {
  const payload: Record<string, any> = {}
  if (tool.id !== undefined) payload.id = tool.id
  if (tool.name !== undefined) payload.name = tool.name
  if (tool.publisher !== undefined) payload.publisher = tool.publisher
  if (tool.category !== undefined) payload.category = tool.category
  if (tool.icon !== undefined) payload.icon = tool.icon
  if (tool.badge !== undefined) payload.badge = tool.badge
  if (tool.desc !== undefined) payload.desc = tool.desc
  if (tool.version !== undefined) payload.version = tool.version
  if (tool.installs !== undefined) payload.installs = tool.installs
  if (tool.rating !== undefined) payload.rating = tool.rating
  if (tool.reviews !== undefined) payload.reviews = tool.reviews
  if (tool.requiresConnection !== undefined) payload.requires_connection = tool.requiresConnection
  if (tool.connectionStatus !== undefined) payload.connection_status = tool.connectionStatus
  if (tool.connectionDetails !== undefined) payload.connection_details = tool.connectionDetails
  return payload
}

function getAuthHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  }
  const resolvedToken = token || localStorage.getItem('aibou_token') || sessionStorage.getItem('aibou_token')
  if (resolvedToken) {
    headers['Authorization'] = `Bearer ${resolvedToken}`
  }
  return headers
}

export const toolsService = {
  /**
   * Fetch all marketplace tools from backend (Admin only).
   */
  async fetchTools(params?: { search?: string; category?: string }, token?: string | null): Promise<MarketplaceTool[]> {
    const targetUrl = buildToolUrl('', {
      search: params?.search,
      category: params?.category && params.category !== 'Semua Kategori' ? params.category : undefined
    })

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    if (response.status === 403) {
      throw new Error('Akses ditolak: Operasi ini memerlukan hak akses Administrator (Admin).')
    }
    if (response.status === 401) {
      throw new Error('Sesi telah berakhir atau token admin diperlukan.')
    }

    if (!response.ok) {
      throw new Error(`Gagal memuat alat dari backend (HTTP ${response.status})`)
    }

    const data = await response.json()
    const items = data.items || []
    return items.map(transformBackendToolToFrontend)
  },

  /**
   * Get detail for a specific tool (Admin only).
   */
  async getTool(id: string, token?: string | null): Promise<MarketplaceTool> {
    const targetUrl = buildToolUrl(`/${encodeURIComponent(id)}`)
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    if (response.status === 403) {
      throw new Error('Akses ditolak: Operasi ini memerlukan hak akses Administrator (Admin).')
    }
    if (response.status === 401) {
      throw new Error('Sesi telah berakhir atau token admin diperlukan.')
    }

    if (!response.ok) {
      throw new Error(`Alat ${id} tidak ditemukan.`)
    }

    const data = await response.json()
    return transformBackendToolToFrontend(data)
  },

  /**
   * Create a new tool (Admin only - requires Bearer session token).
   */
  async createTool(tool: Partial<MarketplaceTool>, token?: string | null): Promise<MarketplaceTool> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const body = transformFrontendToolToBackend(tool)
    const targetUrl = buildToolUrl('')
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (response.status === 403) {
      throw new Error('Akses ditolak: Hanya admin yang memiliki izin untuk menambah alat.')
    }
    if (response.status === 401) {
      throw new Error('Sesi telah berakhir atau Anda belum login.')
    }

    if (!response.ok) {
      let detail = 'Gagal menambahkan alat baru.'
      try {
        const err = await response.json()
        if (err?.detail) detail = err.detail
      } catch {}
      throw new Error(detail)
    }

    const data = await response.json()
    return transformBackendToolToFrontend(data)
  },

  /**
   * Update an existing tool (Admin only - requires Bearer session token).
   */
  async updateTool(id: string, updates: Partial<MarketplaceTool>, token?: string | null): Promise<MarketplaceTool> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const body = transformFrontendToolToBackend(updates)
    const targetUrl = buildToolUrl(`/${encodeURIComponent(id)}`)
    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    })

    if (response.status === 403) {
      throw new Error('Akses ditolak: Hanya admin yang memiliki izin untuk mengubah alat.')
    }
    if (response.status === 401) {
      throw new Error('Sesi telah berakhir atau Anda belum login.')
    }

    if (!response.ok) {
      let detail = 'Gagal memperbarui data alat.'
      try {
        const err = await response.json()
        if (err?.detail) detail = err.detail
      } catch {}
      throw new Error(detail)
    }

    const data = await response.json()
    return transformBackendToolToFrontend(data)
  },

  /**
   * Delete a tool (Admin only - requires Bearer session token).
   */
  async deleteTool(id: string, token?: string | null): Promise<void> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const targetUrl = buildToolUrl(`/${encodeURIComponent(id)}`)
    const response = await fetch(targetUrl, {
      method: 'DELETE',
      headers,
    })

    if (response.status === 403) {
      throw new Error('Akses ditolak: Hanya admin yang memiliki izin untuk menghapus alat.')
    }
    if (response.status === 401) {
      throw new Error('Sesi telah berakhir atau Anda belum login.')
    }

    if (!response.ok) {
      let detail = 'Gagal menghapus alat.'
      try {
        const err = await response.json()
        if (err?.detail) detail = err.detail
      } catch {}
      throw new Error(detail)
    }
  }
}
