import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            CesiZen
          </Link>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn-ghost">
                  Tableau de bord
                </Link>
                <Link to="/meditations" className="btn-ghost">
                  Méditations
                </Link>
                <Link to="/profile" className="btn-ghost">
                  Profil
                </Link>
                <button 
                  onClick={logout} 
                  className="btn-secondary"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">
                  Connexion
                </Link>
                <Link to="/register" className="btn-primary">
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 