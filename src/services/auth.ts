import type { AuthResponse, LoginCredentials, User } from '../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

export const authService = {
  /**
   * Performs user login directly against the backend Redis session API.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email.trim(),
        password: credentials.password,
      }),
    })

    if (response.ok) {
      const data: AuthResponse = await response.json()
      return data
    }

    let errorMessage = 'Gagal masuk. Silakan periksa kembali email dan kata sandi Anda.'
    try {
      const errorData = await response.json()
      if (errorData?.detail) {
        errorMessage = errorData.detail
      }
    } catch {
      // Non-JSON response
    }

    throw new Error(errorMessage)
  },

  /**
   * Fetches the currently authenticated user profile from backend /auth/me.
   */
  async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      return await response.json()
    }

    let errorDetail = 'Sesi telah berakhir atau tidak valid.'
    try {
      const err = await response.json()
      if (err?.detail) errorDetail = err.detail
    } catch {}

    throw new Error(errorDetail)
  },

  /**
   * Destroys the server-side session in Redis via backend /auth/logout.
   */
  async logout(token: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
    } catch (e) {
      console.warn('Logout network request failed:', e)
    }
  },
}
