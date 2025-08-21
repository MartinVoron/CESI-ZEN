import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { apiService } from '../services/api'
import { 
  Play, 
  Heart
} from 'lucide-react'
import type { Meditation } from '../types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [recommendedMeditations, setRecommendedMeditations] = useState<Meditation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      const recommendedResponse = await apiService.getRecommendedMeditations()
      setRecommendedMeditations(recommendedResponse.meditations)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors du chargement du dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMeditationClick = (meditation: Meditation) => {
    navigate(`/meditations/${meditation._id}`)
  }



  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-zen-600">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zen-900 mb-4">Erreur</h1>
          <p className="text-zen-600 mb-6">{error}</p>
          <button onClick={fetchDashboardData} className="btn-primary">
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-zen-600">Aucune donnée disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header personnalisé */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-zen-900 mb-2">
          Bonjour {user.prenom} ! 👋
        </h1>
        <p className="text-zen-600">
          Découvrez vos méditations personnalisées et continuez votre voyage vers le bien-être
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-8 space-y-8">

          {/* Méditations recommandées */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-zen-900">Recommandé pour vous</h2>
              <button 
                onClick={() => navigate('/meditations')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Voir tout →
              </button>
            </div>

            {recommendedMeditations.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-zen-300 mx-auto mb-4" />
                <p className="text-zen-600">Aucune recommandation disponible</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendedMeditations.slice(0, 4).map((meditation) => (
                  <div
                    key={meditation._id}
                    className="border border-zen-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleMeditationClick(meditation)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-zen-900 mb-1">{meditation.titre}</h3>
                        <p className="text-sm text-zen-600 line-clamp-2">{meditation.description}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMeditationClick(meditation)
                        }}
                        className="ml-3 w-8 h-8 bg-primary-100 hover:bg-primary-200 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Play className="h-4 w-4 text-primary-600 ml-0.5" />
                      </button>
                    </div>
                    <div className="flex items-center text-xs text-zen-500">
                      {meditation.duree_minutes} min
                      <span className="mx-2">•</span>
                      <span className="capitalize">{meditation.niveau_difficulte}</span>
                      <span className="mx-2">•</span>
                      <span className="capitalize">{meditation.type_meditation}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Appel à l'action */}
        <div className="lg:col-span-4 space-y-6">
          {/* Invitation à méditer */}
          <div className="card text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-zen-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-10 w-10 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-zen-900 mb-2">Prêt à méditer ?</h3>
            <p className="text-zen-600 text-sm mb-6">
              Prenez quelques minutes pour vous recentrer et cultiver votre bien-être.
            </p>
            <button
              onClick={() => navigate('/meditations')}
              className="w-full btn-primary"
            >
              <Play className="h-4 w-4 mr-2" />
              Commencer une méditation
            </button>
          </div>

          {/* Niveau utilisateur simplifié */}
          <div className="card text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">
                {user.niveau_experience.charAt(0).toUpperCase()}
              </span>
            </div>
            <h4 className="font-medium text-zen-900 capitalize mb-2">
              Niveau {user.niveau_experience}
            </h4>
            <p className="text-zen-600 text-sm">
              Continuez votre pratique pour progresser sur le chemin du bien-être.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 