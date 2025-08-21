import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { Clock, Star, User, Play, Heart, ArrowLeft } from 'lucide-react'
import MeditationSession from '../components/MeditationSession'
import type { Meditation } from '../types'

export default function MeditationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [meditation, setMeditation] = useState<Meditation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSessionActive, setIsSessionActive] = useState(false)
  
  useEffect(() => {
    const fetchMeditation = async () => {
      if (!id) return
      
      try {
        setIsLoading(true)
        const response = await apiService.getMeditation(id)
        setMeditation(response.meditation)
      } catch (error: any) {
        setError(error.response?.data?.message || 'Erreur lors du chargement de la méditation')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMeditation()
  }, [id])

  const handleStartSession = () => {
    setIsSessionActive(true)
  }

  const handleSessionComplete = () => {
    setIsSessionActive(false)
    // Optionnel: recharger les données pour mettre à jour les statistiques
  }

  const handleSessionExit = () => {
    setIsSessionActive(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-zen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !meditation) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zen-900 mb-4">Méditation introuvable</h1>
          <p className="text-zen-600 mb-6">{error || 'Cette méditation n\'existe pas ou n\'est plus disponible.'}</p>
          <button onClick={() => navigate('/meditations')} className="btn-primary">
            Retour aux méditations
          </button>
        </div>
      </div>
    )
  }

  if (isSessionActive) {
    return (
      <MeditationSession
        meditation={meditation}
        onComplete={handleSessionComplete}
        onExit={handleSessionExit}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-zen">
      <div className="container mx-auto px-4 py-8">
        {/* Header avec retour */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/meditations')}
            className="btn-ghost mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour
          </button>
          <h1 className="text-2xl font-bold text-zen-900">Détails de la méditation</h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image principale */}
            <div className="lg:col-span-1">
              <div className="aspect-square bg-zen-200 rounded-xl overflow-hidden mb-6">
                {meditation.image_url ? (
                  <img
                    src={meditation.image_url}
                    alt={meditation.titre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Heart className="h-24 w-24 text-zen-400" />
                  </div>
                )}
              </div>

              {/* Bouton de démarrage */}
              <button
                onClick={handleStartSession}
                className="w-full btn-primary text-lg py-4 mb-4"
              >
                <Play className="h-6 w-6 mr-2" />
                Commencer la méditation
              </button>

              {/* Informations de la méditation */}
              <div className="card">
                <h3 className="font-semibold text-zen-900 mb-4">Informations</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zen-600">Durée:</span>
                    <span className="font-medium">{meditation.duree_minutes} min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zen-600">Niveau:</span>
                    <span className="font-medium capitalize">{meditation.niveau_difficulte}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zen-600">Type:</span>
                    <span className="font-medium">{meditation.type_meditation}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="lg:col-span-2">
              <div className="card mb-6">
                {/* Titre et badges */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <h1 className="text-3xl font-bold text-zen-900">
                      {meditation.titre}
                    </h1>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                        {meditation.type_meditation}
                      </span>
                      <span className="px-3 py-1 bg-zen-100 text-zen-700 text-sm font-medium rounded-full">
                        {meditation.niveau_difficulte}
                      </span>
                    </div>
                  </div>

                  {/* Métadonnées */}
                  <div className="flex items-center space-x-6 text-sm text-zen-600 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {meditation.duree_minutes} minutes
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {meditation.nombre_sessions} session{meditation.nombre_sessions > 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      {meditation.note_moyenne > 0 ? meditation.note_moyenne.toFixed(1) : 'Pas encore notée'}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-zen-900 mb-3">Description</h2>
                  <p className="text-zen-700 leading-relaxed">
                    {meditation.description}
                  </p>
                </div>

                {/* Instructions */}
                {meditation.instructions && meditation.instructions.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-zen-900 mb-3">Instructions</h2>
                    <div className="space-y-3">
                      {meditation.instructions.map((instruction, index) => (
                        <div key={index} className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                            {index + 1}
                          </span>
                          <p className="text-zen-700">{instruction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {meditation.tags && meditation.tags.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-zen-900 mb-3">Mots-clés</h2>
                    <div className="flex flex-wrap gap-2">
                      {meditation.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-zen-100 text-zen-700 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 