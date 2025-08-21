import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, getCurrentUser } = useAuthStore()

  useEffect(() => {
    // Vérifier l'authentification si pas déjà fait
    if (!isAuthenticated && !isLoading && localStorage.getItem('access_token')) {
      getCurrentUser()
    }
  }, [isAuthenticated, isLoading, getCurrentUser])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-zen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-zen-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
} 