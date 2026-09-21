export type UserRole = 'admin' | 'user'

export interface User {
  id: number
  email: string
  full_name?: string | null
  role: UserRole
  workspace: string
  avatar_url?: string | null
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthResponse {
  session_id?: string
  access_token: string
  token_type: string
  expires_in: number
  user: User
}
