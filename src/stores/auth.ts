import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User, LoginCredentials } from '../types/auth'
import { authService } from '../services/auth'

export const useAuthStore = defineStore('auth', () => {
  // Load initial state from localStorage or sessionStorage
  const savedToken = localStorage.getItem('aibou_token') || sessionStorage.getItem('aibou_token')
  let savedUser: User | null = null
  try {
    const rawUser = localStorage.getItem('aibou_user') || sessionStorage.getItem('aibou_user')
    if (rawUser) {
      savedUser = JSON.parse(rawUser)
    }
  } catch (e) {
    localStorage.removeItem('aibou_user')
    sessionStorage.removeItem('aibou_user')
  }

  const token = ref<string | null>(savedToken)
  const user = ref<User | null>(savedUser)
  const isLoading = ref<boolean>(false)
  const errorMessage = ref<string>('')

  const isAuthenticated = computed(() => Boolean(token.value && user.value))
  const isAdmin = computed(() => user.value?.role?.toLowerCase() === 'admin')

  const userInitials = computed(() => {
    if (!user.value?.full_name) return 'AI'
    return user.value.full_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  })

  async function login(credentials: LoginCredentials): Promise<User> {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const response = await authService.login(credentials)
      const sessionToken = response.session_id || response.access_token
      token.value = sessionToken
      user.value = response.user

      if (credentials.rememberMe !== false) {
        localStorage.setItem('aibou_token', sessionToken)
        localStorage.setItem('aibou_user', JSON.stringify(response.user))
      } else {
        sessionStorage.setItem('aibou_token', sessionToken)
        sessionStorage.setItem('aibou_user', JSON.stringify(response.user))
      }

      return response.user
    } catch (err: any) {
      errorMessage.value = err.message || 'Gagal masuk ke sistem.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    const currentToken = token.value
    token.value = null
    user.value = null
    localStorage.removeItem('aibou_token')
    localStorage.removeItem('aibou_user')
    sessionStorage.removeItem('aibou_token')
    sessionStorage.removeItem('aibou_user')

    if (currentToken) {
      // Notify backend to delete Redis session
      await authService.logout(currentToken)
    }
  }

  async function refreshProfile() {
    if (!token.value) return
    try {
      const updated = await authService.getCurrentUser(token.value)
      user.value = updated
      const storage = localStorage.getItem('aibou_token') ? localStorage : sessionStorage
      storage.setItem('aibou_user', JSON.stringify(updated))
    } catch {
      await logout()
    }
  }

  return {
    token,
    user,
    isLoading,
    errorMessage,
    isAuthenticated,
    isAdmin,
    userInitials,
    login,
    logout,
    refreshProfile,
  }
})
