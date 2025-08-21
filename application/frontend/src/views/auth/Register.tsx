import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wind, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import type { RegisterData } from '../../types/auth'

export default function Register() {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { register, loading, error, isAuthenticated, clearError } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
    
    return () => {
      clearError()
    }
  }, [isAuthenticated, navigate, clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await register(formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
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
            <div className="flex items-center justify-center mb-4">
              <Wind className="h-12 w-12 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-zen-900">CesiZen</h1>
            </div>
            <h2 className="text-xl font-semibold text-zen-900 mb-2">
              Inscription
            </h2>
            <p className="text-zen-600">
              Créez votre compte pour commencer votre voyage zen
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Prénom et Nom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-zen-700 mb-2">
                  Prénom
                </label>
                <div className="relative">
                  <User className="h-5 w-5 text-zen-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    id="prenom"
                    name="prenom"
                    type="text"
                    required
                    className="input pl-10"
                    placeholder="Votre prénom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-zen-700 mb-2">
                  Nom
                </label>
                <div className="relative">
                  <User className="h-5 w-5 text-zen-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    required
                    className="input pl-10"
                    placeholder="Votre nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

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
                  value={formData.email}
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
                  placeholder="Minimum 6 caractères"
                  value={formData.password}
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

            {/* Confirmation mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zen-700 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="h-5 w-5 text-zen-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="input pl-10 pr-10"
                  placeholder="Confirmez votre mot de passe"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zen-400 hover:text-zen-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Bouton d'inscription */}
            <button
              type="submit"
              className="w-full btn-primary py-3 text-lg font-semibold"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Inscription en cours...
                </div>
              ) : (
                'S\'inscrire'
              )}
            </button>
          </form>

          {/* Lien de connexion */}
          <div className="text-center mt-6">
            <p className="text-sm text-zen-600">
              Déjà un compte ?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-500 font-semibold"
              >
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 