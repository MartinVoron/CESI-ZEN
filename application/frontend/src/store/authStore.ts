import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginCredentials, RegisterData, AuthState } from '../types/auth'

const API_BASE_URL = '/api'

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  clearError: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ loading: true, error: null })
        
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Pour inclure les cookies
            body: JSON.stringify({
              email: credentials.email,
              mot_de_passe: credentials.password
            })
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Erreur de connexion')
          }

          // Mapper les données de l'API vers notre format
          const user: User = {
            id: data.user.id,
            email: data.user.email,
            nom: data.user.nom,
            prenom: data.user.prenom,
            role: data.user.role || 'utilisateur',
            dateInscription: new Date().toISOString(),
            derniereConnexion: new Date().toISOString()
          }
          
          set({
            user,
            isAuthenticated: true,
            loading: false,
            error: null
          })
          
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Erreur de connexion'
          })
        }
      },

      register: async (data: RegisterData) => {
        set({ loading: true, error: null })
        
        try {
          // Vérifications côté client
          if (data.password !== data.confirmPassword) {
            throw new Error('Les mots de passe ne correspondent pas')
          }
          
          if (data.password.length < 6) {
            throw new Error('Le mot de passe doit contenir au moins 6 caractères')
          }

          const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Pour inclure les cookies
            body: JSON.stringify({
              nom: data.nom,
              prenom: data.prenom,
              email: data.email,
              mot_de_passe: data.password
            })
          })

          const responseData = await response.json()

          if (!response.ok) {
            throw new Error(responseData.error || 'Erreur lors de l\'inscription')
          }

          // Mapper les données de l'API vers notre format
          const user: User = {
            id: responseData.user.id,
            email: responseData.user.email,
            nom: responseData.user.nom,
            prenom: responseData.user.prenom,
            role: responseData.user.role || 'utilisateur',
            dateInscription: new Date().toISOString(),
            derniereConnexion: new Date().toISOString()
          }
          
          set({
            user,
            isAuthenticated: true,
            loading: false,
            error: null
          })
          
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Erreur lors de l\'inscription'
          })
        }
      },

      logout: async () => {
        try {
          // Appeler l'API de déconnexion si elle existe
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
          })
        } catch (error) {
          // Ignorer les erreurs de déconnexion API
          console.warn('Erreur lors de la déconnexion API:', error)
        }
        
        set({
          user: null,
          isAuthenticated: false,
          error: null
        })
      },

      clearError: () => {
        set({ error: null })
      },

      checkAuth: () => {
        // En réalité, on devrait vérifier avec l'API si le cookie est toujours valide
        // Pour l'instant, on restaure simplement l'état si il y a un utilisateur persisté
        const lastUser = get().user
        if (lastUser) {
          set({ isAuthenticated: true })
        }
      }
    }),
    {
      name: 'cesizen-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
) 