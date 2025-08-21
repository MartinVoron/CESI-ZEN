import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wind, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import type { LoginCredentials } from '../../types/auth'

export default function Login() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const { login, loading, error, isAuthenticated, user, clearError } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && user) {
      // Rediriger vers l'interface appropriée selon le rôle
      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    }
    
    return () => {
      clearError()
    }
  }, [isAuthenticated, user, navigate, clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(credentials)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-zen-900 mb-2">
              Connexion
            </h2>
            <p className="text-zen-600">
              Accédez à vos exercices de respiration personnalisés
            </p>
          </div>

          {/* Compte de démonstration */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">
              📧 Comptes de démonstration
            </h3>
            <p className="text-xs text-blue-700 mb-2">
              <strong>👑 Admin:</strong> admin@cesizen.fr / admin123<br />
              <strong>👤 Utilisateur:</strong> alice.dupont@example.com / password123
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zen-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="h-5 w-5 text-zen-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input pl-10"
                  placeholder="votre.email@exemple.com"
                  value={credentials.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zen-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="h-5 w-5 text-zen-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="input pl-10 pr-10"
                  placeholder="Votre mot de passe"
                  value={credentials.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zen-400 hover:text-zen-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-zen-300 rounded focus:ring-blue-500"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-zen-700">
                  Se souvenir de moi
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-500"
                onClick={() => navigate('/forgot-password')}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              className="w-full btn-primary py-3 text-lg font-semibold"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Connexion en cours...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Lien d'inscription */}
          <div className="text-center mt-6">
            <p className="text-sm text-zen-600">
              Pas encore de compte ?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-blue-600 hover:text-blue-500 font-semibold"
              >
                S'inscrire
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 