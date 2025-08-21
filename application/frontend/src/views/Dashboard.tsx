import { useState, useEffect, useRef } from 'react'
import { Heart, Play, Pause, RotateCcw, LogOut, User, ArrowLeft, Home } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

interface BreathingExercise {
  id: string
  nom: string
  inspiration: number
  apnee: number
  expiration: number
  description: string
  benefits?: string[]
}

export default function Dashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<'inspiration' | 'apnee' | 'expiration'>('inspiration')
  const [phaseTime, setPhaseTime] = useState(0)
  const [cycle, setCycle] = useState(0)
  const intervalRef = useRef<number | null>(null)
  
  // États pour la gestion des exercices depuis l'API
  const [exercises, setExercises] = useState<BreathingExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Rediriger les admins vers l'interface d'administration
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin')
    }
  }, [user, navigate])

  // Récupérer les exercices depuis l'API
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/exercices', {
          credentials: 'include'
        })

        if (response.ok) {
          const exercisesData = await response.json()
          
          // Transformer les données de l'API pour correspondre à notre interface
          const transformedExercises: BreathingExercise[] = exercisesData.map((exercise: any) => ({
            id: exercise.id,
            nom: exercise.nom,
            inspiration: exercise.duree_inspiration,
            apnee: exercise.duree_apnee,
            expiration: exercise.duree_expiration,
            description: exercise.description,
            benefits: generateBenefits(exercise.duree_inspiration, exercise.duree_apnee, exercise.duree_expiration)
          }))
          
          setExercises(transformedExercises)
        } else {
          throw new Error('Erreur lors de la récupération des exercices')
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des exercices:', error)
        setError('Impossible de charger les exercices')
        // En cas d'erreur, utiliser des exercices par défaut
        setExercises([
          {
            id: 'default-748',
            nom: 'Exercice 7-4-8',
            inspiration: 7,
            apnee: 4,
            expiration: 8,
            description: 'Technique de respiration relaxante pour réduire le stress et favoriser l\'endormissement',
            benefits: ['Réduit le stress', 'Favorise l\'endormissement', 'Calme le système nerveux']
          },
          {
            id: 'default-55',
            nom: 'Exercice 5-5',
            inspiration: 5,
            apnee: 0,
            expiration: 5,
            description: 'Respiration équilibrée pour améliorer la concentration et l\'équilibre émotionnel',
            benefits: ['Améliore la concentration', 'Équilibre émotionnel', 'Facile à pratiquer']
          },
          {
            id: 'default-46',
            nom: 'Exercice 4-6',
            inspiration: 4,
            apnee: 0,
            expiration: 6,
            description: 'Respiration apaisante avec expiration prolongée pour une relaxation profonde',
            benefits: ['Relaxation profonde', 'Diminue l\'anxiété', 'Activation du système parasympathique']
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchExercises()
  }, [])

  // Fonction pour générer des bénéfices basés sur les durées de l'exercice
  const generateBenefits = (inspiration: number, apnee: number, expiration: number): string[] => {
    const benefits = []
    
    // Bénéfices basés sur la durée d'inspiration
    if (inspiration >= 6) {
      benefits.push('Activation du système parasympathique')
    } else {
      benefits.push('Améliore la concentration')
    }
    
    // Bénéfices basés sur l'apnée
    if (apnee > 0) {
      benefits.push('Développe la capacité pulmonaire')
      benefits.push('Favorise la méditation')
    } else {
      benefits.push('Facile à pratiquer')
    }
    
    // Bénéfices basés sur l'expiration
    if (expiration > inspiration) {
      benefits.push('Relaxation profonde')
      benefits.push('Réduit le stress')
    } else if (expiration === inspiration) {
      benefits.push('Équilibre émotionnel')
    } else {
      benefits.push('Énergisant')
    }
    
    return benefits
  }

  // Effet pour gérer le timer
  useEffect(() => {
    if (isActive && selectedExercise) {
      intervalRef.current = window.setInterval(() => {
        setPhaseTime(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, selectedExercise])

  // Effet pour gérer les transitions de phase
  useEffect(() => {
    if (!selectedExercise || !isActive) return

    const currentPhaseDuration = selectedExercise[phase]
    
    if (phaseTime >= currentPhaseDuration) {
      setPhaseTime(0)
      
      if (phase === 'inspiration') {
        if (selectedExercise.apnee > 0) {
          setPhase('apnee')
        } else {
          setPhase('expiration')
        }
      } else if (phase === 'apnee') {
        setPhase('expiration')
      } else if (phase === 'expiration') {
        setPhase('inspiration')
        setCycle(prev => prev + 1)
      }
    }
  }, [phaseTime, phase, selectedExercise, isActive])

  const startExercise = (exercise: BreathingExercise) => {
    setSelectedExercise(exercise)
    setIsActive(true)
    setPhase('inspiration')
    setPhaseTime(0)
    setCycle(1)
  }

  const stopExercise = () => {
    setIsActive(false)
    setSelectedExercise(null)
    setPhase('inspiration')
    setPhaseTime(0)
    setCycle(0)
  }

  const restartExercise = () => {
    setIsActive(false)
    setPhase('inspiration')
    setPhaseTime(0)
    setCycle(1)
  }

  const returnToDashboard = () => {
    // Arrêter l'exercice en cours s'il y en a un
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    setIsActive(false)
    setSelectedExercise(null)
    setPhase('inspiration')
    setPhaseTime(0)
    setCycle(0)
  }

  const togglePause = () => {
    setIsActive(!isActive)
  }

  const getPhaseText = () => {
    switch (phase) {
      case 'inspiration':
        return 'Inspirez'
      case 'apnee':
        return 'Retenez'
      case 'expiration':
        return 'Expirez'
      default:
        return ''
    }
  }

  const getPhaseColor = () => {
    switch (phase) {
      case 'inspiration':
        return 'text-blue-600'
      case 'apnee':
        return 'text-yellow-600'
      case 'expiration':
        return 'text-green-600'
      default:
        return 'text-zen-600'
    }
  }

  const handleLogout = () => {
    logout()
  }

  if (selectedExercise) {
    const timeRemaining = selectedExercise[phase] - phaseTime

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col">
        {/* Header avec bouton retour et déconnexion */}
        <div className="flex items-center justify-between p-6">
          <button 
            onClick={returnToDashboard}
            className="flex items-center space-x-2 text-zen-600 hover:text-zen-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Retour</span>
          </button>
          
          <Logo size="sm" />
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={returnToDashboard}
              className="flex items-center space-x-2 bg-zen-100 hover:bg-zen-200 text-zen-700 px-3 py-2 rounded-lg transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contenu de l'exercice centré */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            {/* Header exercice */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-zen-900 mb-2">{selectedExercise.nom}</h2>
              <p className="text-zen-600">Cycle {cycle}</p>
            </div>

            {/* Circle de respiration */}
            <div className="relative mb-8">
              <div className={`w-48 h-48 mx-auto rounded-full border-4 transition-all duration-1000 ${
                phase === 'inspiration' ? 'border-blue-500 scale-110' :
                phase === 'apnee' ? 'border-yellow-500 scale-105' :
                'border-green-500 scale-95'
              } flex items-center justify-center bg-white shadow-lg`}>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${getPhaseColor()}`}>
                    {timeRemaining}
                  </div>
                  <div className={`text-lg ${getPhaseColor()}`}>
                    {getPhaseText()}
                  </div>
                </div>
              </div>
            </div>

            {/* Contrôles */}
            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={togglePause}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
              </button>
              <button
                onClick={restartExercise}
                className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <RotateCcw className="h-6 w-6" />
              </button>
            </div>

            {/* Instructions actuelles */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-zen-600 mb-2">Phase actuelle :</div>
              <div className={`text-lg font-semibold ${getPhaseColor()}`}>
                {getPhaseText()} pendant {selectedExercise[phase]} seconde{selectedExercise[phase] > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header avec navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 text-zen-700 hover:text-zen-900 hover:bg-zen-50 px-3 py-2 rounded-lg transition-all cursor-pointer"
              >
                <User className="h-5 w-5 text-zen-600" />
                <span className="font-medium">
                  {user?.prenom} {user?.nom}
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-zen-600 hover:text-zen-800 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Message de bienvenue */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zen-900 mb-4">
              Bienvenue {user?.prenom} ! 👋
            </h2>
            <p className="text-lg text-zen-600 max-w-2xl mx-auto">
              Prêt pour une séance de respiration ? Choisissez votre exercice préféré et laissez-vous guider.
            </p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-8 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-center">
              {error} - Utilisation des exercices par défaut
            </div>
          )}

          {/* État de chargement */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-zen-600">Chargement des exercices...</p>
            </div>
          ) : (
            <>
              {/* Exercices */}
              <div className="grid md:grid-cols-3 gap-8">
                {exercises.map((exercise) => (
              <div key={exercise.id} className="bg-white rounded-xl shadow-sm border border-zen-200 p-6 hover:shadow-md transition-shadow">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-zen-900 mb-2">{exercise.nom}</h3>
                  <div className="text-sm text-zen-600 mb-3">
                    {exercise.inspiration}s - {exercise.apnee}s - {exercise.expiration}s
                  </div>
                </div>

                <p className="text-zen-700 text-sm mb-4 text-center">{exercise.description}</p>

                {/* Bénéfices */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-zen-900 mb-2">Bénéfices :</h4>
                  <ul className="space-y-1">
                    {exercise.benefits?.map((benefit, index) => (
                      <li key={index} className="text-sm text-zen-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Détails de l'exercice */}
                <div className="bg-zen-50 rounded-lg p-3 mb-6">
                  <div className={`grid ${exercise.apnee > 0 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 text-xs`}>
                    <div className="text-center">
                      <div className="text-blue-600 font-semibold">{exercise.inspiration}s</div>
                      <div className="text-zen-600">Inspiration</div>
                    </div>
                    {exercise.apnee > 0 && (
                      <div className="text-center">
                        <div className="text-yellow-600 font-semibold">{exercise.apnee}s</div>
                        <div className="text-zen-600">Apnée</div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-green-600 font-semibold">{exercise.expiration}s</div>
                      <div className="text-zen-600">Expiration</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => startExercise(exercise)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Commencer
                </button>
              </div>
            ))}
              </div>

              {/* Info supplémentaire */}
              <div className="mt-16 bg-white rounded-xl shadow-sm border border-zen-200 p-8">
                <div className="text-center">
                  <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-zen-900 mb-4">Votre parcours zen</h3>
                  <p className="text-zen-600 max-w-3xl mx-auto leading-relaxed">
                    Bienvenue dans votre espace de bien-être. 
                    Continuez votre pratique quotidienne pour profiter pleinement des bienfaits de la cohérence cardiaque.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 