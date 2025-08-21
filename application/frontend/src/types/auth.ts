export interface User {
  id: string
  email: string
  nom: string
  prenom: string
  role?: string
  dateInscription: string
  derniereConnexion?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  nom: string
  prenom: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export interface LoginResponse {
  user: User
  token: string
  message: string
}

export interface RegisterResponse {
  user: User
  token: string
  message: string
} 