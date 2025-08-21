import { useState, FormEvent, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Eye, EyeOff } from 'lucide-react'
import type { RegisterData } from '../types'

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterData>({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    username: '',
    niveau_experience: 'debutant'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  
  const { register, error, isAuthenticated, isLoading, clearError } = useAuthStore()
  const navigate = useNavigate()
  
  // Rediriger si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
    
    // Nettoyer les erreurs lors du démontage du composant
    return () => {
      clearError()
    }
  }, [isAuthenticated, navigate, clearError])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!acceptTerms) {
      alert("Vous devez accepter les conditions d'utilisation pour créer un compte.")
      return
    }
    
    try {
      await register(formData)
    } catch (err) {
      console.error('Register error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-zen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-zen-900 mb-4">
            Rejoignez CesiZen
          </h1>
          <p className="text-xl text-zen-600">
            Commencez votre parcours de méditation et de bien-être
          </p>
        </div>

        <div className="card">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-zen-900 mb-2">
              Création de votre compte
            </h2>
            <p className="text-zen-600 text-sm">
              Tous les champs sont obligatoires pour créer votre compte personnel.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prénom */}
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-zen-700 mb-2">
                  Prénom
                </label>
                <input
                  id="prenom"
                  name="prenom"
                  type="text"
                  required
                  className="input"
                  placeholder="Votre prénom"
                  value={formData.prenom}
                  onChange={handleChange}
                />
              </div>

              {/* Nom */}
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-zen-700 mb-2">
                  Nom
                </label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required
                  className="input"
                  placeholder="Votre nom"
                  value={formData.nom}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Nom d'utilisateur */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-zen-700 mb-2">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input"
                placeholder="Choisissez un nom d'utilisateur unique"
                value={formData.username}
                onChange={handleChange}
              />
              <p className="mt-1 text-sm text-zen-500">
                Ce nom sera visible par les autres utilisateurs
              </p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zen-700 mb-2">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zen-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="input pr-10"
                  placeholder="Choisissez un mot de passe sécurisé"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-zen-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-zen-400" />
                  )}
                </button>
              </div>
              <div className="mt-2 text-sm text-zen-500">
                <p>Votre mot de passe doit contenir au moins :</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>6 caractères</li>
                  <li>Une majuscule et une minuscule</li>
                  <li>Un chiffre</li>
                </ul>
              </div>
            </div>

            {/* Niveau d'expérience */}
            <div>
              <label htmlFor="niveau_experience" className="block text-sm font-medium text-zen-700 mb-2">
                Votre niveau en méditation
              </label>
              <select
                id="niveau_experience"
                name="niveau_experience"
                required
                className="input"
                value={formData.niveau_experience}
                onChange={handleChange}
              >
                <option value="debutant">Débutant - Je découvre la méditation</option>
                <option value="intermediaire">Intermédiaire - J'ai quelques notions</option>
                <option value="avance">Avancé - Je pratique régulièrement</option>
              </select>
              <p className="mt-1 text-sm text-zen-500">
                Cela nous aide à personnaliser vos recommandations
              </p>
            </div>

            {/* Conditions d'utilisation */}
            <div className="flex items-start">
              <input
                id="accept-terms"
                name="accept-terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-zen-300 rounded mt-1"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <label htmlFor="accept-terms" className="ml-3 block text-sm text-zen-700">
                J'accepte les{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                  politique de confidentialité
                </Link>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !acceptTerms}
              className="w-full btn-primary text-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Création du compte...
                </div>
              ) : (
                'Créer mon compte'
              )}
            </button>

            <div className="text-center">
              <span className="text-zen-600">Vous avez déjà un compte ? </span>
              <Link 
                to="/login" 
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                Se connecter
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 