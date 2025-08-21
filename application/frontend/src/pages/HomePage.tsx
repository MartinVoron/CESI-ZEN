import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Clock, Play, Pause, RotateCcw, LogIn, ArrowLeft, Home, BookOpen, User, LogOut, Menu, X } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Logo from '../components/Logo'
import type { ContenuSante } from '../types/health'

interface BreathingExercise {
  id: string
  name: string
  inspiration: number
  apnee: number
  expiration: number
  description: string
  benefits: string[]
}

export default function HomePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
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
  
  // États pour la gestion des contenus de santé depuis l'API
  const [contenus, setContenus] = useState<ContenuSante[]>([])
  const [healthLoading, setHealthLoading] = useState(true)
  const [healthError, setHealthError] = useState<string | null>(null)
  
  // État pour gérer les onglets et le menu mobile
  const [activeTab, setActiveTab] = useState<'exercises' | 'health'>('exercises')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
        
        const response = await fetch('http://localhost:5001/exercices')

        if (response.ok) {
          const exercisesData = await response.json()
          
          // Transformer les données de l'API pour correspondre à notre interface
          const transformedExercises: BreathingExercise[] = exercisesData.map((exercise: any) => ({
            id: exercise.id,
            name: exercise.nom,
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
            name: 'Exercice 7-4-8',
            inspiration: 7,
            apnee: 4,
            expiration: 8,
            description: 'Technique de respiration relaxante pour réduire le stress et favoriser l\'endormissement',
            benefits: ['Réduit le stress', 'Favorise l\'endormissement', 'Calme le système nerveux']
          },
          {
            id: 'default-55',
            name: 'Exercice 5-5',
            inspiration: 5,
            apnee: 0,
            expiration: 5,
            description: 'Respiration équilibrée pour améliorer la concentration et l\'équilibre émotionnel',
            benefits: ['Améliore la concentration', 'Équilibre émotionnel', 'Facile à pratiquer']
          },
          {
            id: 'default-46',
            name: 'Exercice 4-6',
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

  // Récupérer les contenus de santé depuis l'API
  useEffect(() => {
    const fetchContenus = async () => {
      try {
        setHealthLoading(true)
        setHealthError(null)
        
        const response = await fetch('http://localhost:5001/informations-sante/')

        if (response.ok) {
          const contenusData = await response.json()
          setContenus(contenusData)
        } else {
          throw new Error('Erreur lors de la récupération des contenus de santé')
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des contenus de santé:', error)
        setHealthError('Impossible de charger les contenus de santé')
      } finally {
        setHealthLoading(false)
      }
    }

    fetchContenus()
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

  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  const returnToHome = () => {
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

  if (selectedExercise) {
    const timeRemaining = selectedExercise[phase] - phaseTime

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col">
        {/* Header avec bouton retour */}
        <div className="flex items-center justify-between p-6">
          <button 
            onClick={returnToHome}
            className="flex items-center space-x-2 text-zen-600 hover:text-zen-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Retour</span>
          </button>
          
          <Logo size="sm" />
          
          <button 
            onClick={returnToHome}
            className="flex items-center space-x-2 bg-zen-100 hover:bg-zen-200 text-zen-700 px-3 py-2 rounded-lg transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Accueil</span>
          </button>
        </div>

        {/* Contenu de l'exercice centré */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            {/* Header exercice */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-zen-900 mb-2">{selectedExercise.name}</h2>
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-nature-50 to-zen-50">
      {/* Header Mobile-First */}
      <header className="bg-white shadow-lg border-b border-primary-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Logo size="lg" />
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                // Utilisateur connecté - Desktop
                <>
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center space-x-2 text-neutral-700 hover:text-primary-700 hover:bg-primary-50 px-3 py-2 rounded-lg transition-all duration-200"
                  >
                    <User className="h-5 w-5 text-primary-600" />
                    <span className="font-medium text-sm lg:text-base">
                      {user.prenom} {user.nom}
                    </span>
                  </button>
                  <button
                    onClick={() => logout()}
                    className="flex items-center space-x-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="text-sm lg:text-base">Déconnexion</span>
                  </button>
                </>
              ) : (
                // Visiteur non connecté - Desktop
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <LogIn className="h-5 w-5" />
                  <span className="text-sm lg:text-base">Se connecter</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-primary-100 pt-4 animate-slide-down">
              {user ? (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      navigate('/profile')
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-3 w-full text-left text-neutral-700 hover:text-primary-700 hover:bg-primary-50 px-3 py-3 rounded-lg transition-all duration-200"
                  >
                    <User className="h-5 w-5 text-primary-600" />
                    <span className="font-medium">
                      {user.prenom} {user.nom}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-3 w-full text-left text-neutral-600 hover:text-red-600 hover:bg-red-50 px-3 py-3 rounded-lg transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    navigate('/login')
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-3 w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg transition-all duration-200 shadow-md"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Se connecter</span>
                </button>
              )}
            </div>
          )}
          
          {/* Subtitle */}
          <div className="text-center mt-4 sm:mt-6">
            <p className="text-sm sm:text-lg lg:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Exercices de respiration et cohérence cardiaque
            </p>
            {user && (
              <p className="text-sm sm:text-lg text-primary-600 mt-2 font-medium">
                Bienvenue {user.prenom} ! 🌱
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Introduction */}
          <section className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 sm:mb-6">
              Respirez pour votre bien-être
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Découvrez nos exercices de cohérence cardiaque et apprenez-en plus sur les bienfaits de la respiration consciente.
            </p>
          </section>

          {/* Navigation par onglets - Mobile First */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-1 w-full max-w-md sm:max-w-lg">
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => setActiveTab('exercises')}
                  className={`flex items-center justify-center space-x-2 px-3 sm:px-6 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'exercises'
                      ? 'bg-primary-600 text-white shadow-md transform scale-[0.98]'
                      : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
                  }`}
                >
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">Exercices</span>
                </button>
                <button
                  onClick={() => setActiveTab('health')}
                  className={`flex items-center justify-center space-x-2 px-3 sm:px-6 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'health'
                      ? 'bg-primary-600 text-white shadow-md transform scale-[0.98]'
                      : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
                  }`}
                >
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">Infos Santé</span>
                </button>
              </div>
            </div>
          </div>

          {/* Call to action pour l'inscription - Mobile First */}
          {!user && (
            <section className="mb-8 sm:mb-12 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-center shadow-lg">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-900 mb-2 sm:mb-4">
                🌱 Créez votre compte pour plus de fonctionnalités
              </h3>
              <p className="text-sm sm:text-base lg:text-lg text-primary-700 mb-4 sm:mb-6 max-w-2xl mx-auto leading-relaxed">
                Sauvegardez vos sessions préférées et suivez votre parcours de bien-être.
              </p>
              <button
                onClick={() => navigate('/register')}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium text-sm sm:text-base"
              >
                S'inscrire gratuitement
              </button>
            </section>
          )}

          {/* Contenu des onglets */}
          {activeTab === 'exercises' ? (
            <>
              {/* Message d'erreur */}
              {error && (
                <div className="mb-6 sm:mb-8 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-center shadow-sm">
                  <p className="text-sm sm:text-base">{error} - Affichage des exercices par défaut</p>
                </div>
              )}

              {/* État de chargement */}
              {loading ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary-600 mb-4"></div>
                  <p className="text-neutral-600 text-sm sm:text-base">Chargement des exercices...</p>
                </div>
              ) : (
                <>
                  {/* Introduction aux exercices */}
                  <section className="text-center mb-8 sm:mb-12">
                    <p className="text-sm sm:text-lg lg:text-xl text-neutral-600 max-w-4xl mx-auto leading-relaxed">
                      Nos exercices de cohérence cardiaque basés sur des rythmes respiratoires spécifiques.
                      Chaque exercice combine inspiration, apnée et expiration pour un maximum de bénéfices.
                    </p>
                  </section>

                  {/* Exercices - Mobile First Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {exercises.map((exercise) => (
                      <article key={exercise.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-primary-100 p-4 sm:p-6 hover:shadow-xl hover:border-primary-200 transition-all duration-300 hover:scale-[1.02]">
                        <div className="text-center mb-4 sm:mb-6">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-100 to-zen-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md">
                            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2">{exercise.name}</h3>
                          <div className="text-xs sm:text-sm text-neutral-500 bg-primary-50 px-3 py-1 rounded-full inline-block">
                            {exercise.inspiration}s - {exercise.apnee}s - {exercise.expiration}s
                          </div>
                        </div>

                        <p className="text-neutral-700 text-xs sm:text-sm mb-4 text-center leading-relaxed">{exercise.description}</p>

                        {/* Bénéfices */}
                        <div className="mb-4 sm:mb-6">
                          <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 mb-2 flex items-center">
                            <div className="w-1 h-4 bg-primary-500 rounded-full mr-2"></div>
                            Bénéfices
                          </h4>
                          <ul className="space-y-1.5">
                            {exercise.benefits.map((benefit, index) => (
                              <li key={index} className="text-xs sm:text-sm text-neutral-600 flex items-center">
                                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 flex-shrink-0"></div>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Détails de l'exercice */}
                        <div className="bg-gradient-to-r from-primary-50 to-zen-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                          <div className={`grid ${exercise.apnee > 0 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 text-xs sm:text-sm`}>
                            <div className="text-center">
                              <div className="text-zen-600 font-bold text-sm sm:text-base">{exercise.inspiration}s</div>
                              <div className="text-neutral-500 text-xs">Inspiration</div>
                            </div>
                            {exercise.apnee > 0 && (
                              <div className="text-center">
                                <div className="text-secondary-600 font-bold text-sm sm:text-base">{exercise.apnee}s</div>
                                <div className="text-neutral-500 text-xs">Apnée</div>
                              </div>
                            )}
                            <div className="text-center">
                              <div className="text-primary-600 font-bold text-sm sm:text-base">{exercise.expiration}s</div>
                              <div className="text-neutral-500 text-xs">Expiration</div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => startExercise(exercise)}
                          className="w-full bg-gradient-to-r from-primary-600 to-zen-600 hover:from-primary-700 hover:to-zen-700 text-white font-medium py-3 sm:py-4 px-4 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-[0.98] active:scale-95"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          <span className="text-sm sm:text-base">Commencer</span>
                        </button>
                      </article>
                    ))}
                  </div>

                                    {/* Info supplémentaire sur la cohérence cardiaque */}
                  <section className="mt-12 sm:mt-16 lg:mt-20 bg-gradient-to-br from-primary-50 via-zen-50 to-nature-50 rounded-xl sm:rounded-2xl shadow-lg border border-primary-200 p-6 sm:p-8 lg:p-12">
                    <div className="text-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-zen-100 to-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-md">
                        <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-zen-600" />
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 mb-4 sm:mb-6">À propos de la cohérence cardiaque</h3>
                      <p className="text-sm sm:text-base lg:text-lg text-neutral-600 max-w-4xl mx-auto leading-relaxed">
                        La cohérence cardiaque est une technique de respiration qui permet de réguler le rythme cardiaque 
                        et d'optimiser la variabilité de la fréquence cardiaque. Ces exercices simples mais efficaces 
                        vous aident à gérer le stress, améliorer votre concentration et favoriser un état de calme intérieur.
                      </p>
                    </div>
                  </section>
                </>
              )}
            </>
          ) : (
            <>
              {/* Contenu de l'onglet Informations Santé */}
              <div className="space-y-6 sm:space-y-8">
                {/* État de chargement */}
                {healthLoading ? (
                  <div className="text-center py-12 sm:py-16">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary-600 mb-4"></div>
                    <p className="text-neutral-600 text-sm sm:text-base">Chargement des contenus de santé...</p>
                  </div>
                ) : healthError ? (
                  <div className="text-center py-12 sm:py-16">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 shadow-sm">
                      <p className="text-sm sm:text-base">{healthError}</p>
                    </div>
                    <p className="text-neutral-600 text-sm sm:text-base">Impossible de charger les contenus de santé.</p>
                  </div>
                ) : (
                  <>
                    {/* Introduction */}
                    <section className="text-center mb-8 sm:mb-12">
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 mb-4 sm:mb-6">
                        Informations de santé et bien-être
                      </h3>
                      <p className="text-sm sm:text-lg lg:text-xl text-neutral-600 max-w-4xl mx-auto leading-relaxed">
                        Découvrez nos contenus sur la respiration consciente et le bien-être.
                      </p>
                    </section>

                    {/* Liste des contenus */}
                    <div className="space-y-6 sm:space-y-8">
                      {contenus.length === 0 ? (
                        <div className="text-center py-12 sm:py-16">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-100 to-zen-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-md">
                            <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-primary-600" />
                          </div>
                          <p className="text-neutral-600 text-sm sm:text-base">Aucun contenu disponible pour le moment.</p>
                        </div>
                      ) : (
                        contenus.map((contenu) => (
                          <article key={contenu.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-primary-100 p-4 sm:p-6 lg:p-8 hover:shadow-xl hover:border-primary-200 transition-all duration-300">
                            <div className="flex flex-col sm:flex-row sm:items-start mb-4 sm:mb-6">
                              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-100 to-zen-100 rounded-full flex items-center justify-center mb-3 sm:mb-0 sm:mr-4 mx-auto sm:mx-0 flex-shrink-0 shadow-md">
                                <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 text-primary-600" />
                              </div>
                              <div className="flex-1 text-center sm:text-left">
                                <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900 mb-2 sm:mb-3">{contenu.titre}</h4>
                                {(contenu.date_creation || contenu.date_mise_a_jour) && (
                                  <div className="text-xs sm:text-sm text-neutral-500 mb-3 sm:mb-4 bg-primary-50 px-3 py-1 rounded-full inline-block">
                                    {contenu.date_creation && (
                                      <span>Créé le {formatDate(contenu.date_creation)}</span>
                                    )}
                                    {contenu.date_mise_a_jour && contenu.date_mise_a_jour !== contenu.date_creation && (
                                      <span> • Mis à jour le {formatDate(contenu.date_mise_a_jour)}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-primary-50 via-zen-50 to-nature-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                              <p className="text-neutral-700 text-sm sm:text-base lg:text-lg leading-relaxed whitespace-pre-wrap">
                                {contenu.texte}
                              </p>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
} 