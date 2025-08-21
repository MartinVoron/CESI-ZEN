import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Volume2,
  VolumeX,
  Heart,
  Star
} from 'lucide-react'
import type { Meditation, Session, SessionComplete } from '../types'

interface MeditationSessionProps {
  meditation: Meditation
  onComplete?: () => void
  onExit?: () => void
}

export default function MeditationSession({ meditation, onComplete, onExit }: MeditationSessionProps) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  // État de la session
  const [session, setSession] = useState<Session | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [humeurAvant, setHumeurAvant] = useState<number | null>(null)
  const [showHumeurDialog, setShowHumeurDialog] = useState(true)
  
  // États de fin de session
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [humeurApres, setHumeurApres] = useState<number | null>(null)
  const [note, setNote] = useState<number | null>(null)
  const [commentaire, setCommentaire] = useState('')
  
  // Refs
  const timerRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // Durée totale en secondes
  const totalDuration = meditation.duree_minutes * 60

  useEffect(() => {
    // Initialiser l'audio si disponible
    if (meditation.audio_url && !audioRef.current) {
      audioRef.current = new Audio(meditation.audio_url)
      audioRef.current.loop = true
      audioRef.current.volume = volume
    }

    return () => {
      // Cleanup
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [meditation.audio_url, volume])

  const startSession = async () => {
    try {
      const response = await apiService.startSession({
        meditation_id: meditation._id,
        humeur_avant: humeurAvant || undefined
      })
      
      setSession(response.session)
      setShowHumeurDialog(false)
      setIsPlaying(true)
      startTimeRef.current = Date.now()
      
      // Démarrer le timer
      timerRef.current = window.setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1
          if (newTime >= totalDuration) {
            handleSessionComplete()
            return totalDuration
          }
          return newTime
        })
      }, 1000)

      // Démarrer l'audio si disponible
      if (audioRef.current) {
        audioRef.current.play().catch(console.error)
      }
    } catch (error) {
      console.error('Erreur lors du démarrage de la session:', error)
    }
  }

  const pauseSession = () => {
    setIsPlaying(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  const resumeSession = () => {
    setIsPlaying(true)
    timerRef.current = window.setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 1
        if (newTime >= totalDuration) {
          handleSessionComplete()
          return totalDuration
        }
        return newTime
      })
    }, 1000)

    if (audioRef.current) {
      audioRef.current.play().catch(console.error)
    }
  }

  const stopSession = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    if (audioRef.current) {
      audioRef.current.pause()
    }

    if (session) {
      try {
        const dureeReelle = Math.floor(currentTime / 60) // en minutes
        await apiService.interruptSession(session._id, dureeReelle)
      } catch (error) {
        console.error('Erreur lors de l\'arrêt de la session:', error)
      }
    }

    handleExit()
  }

  const handleSessionComplete = () => {
    setIsPlaying(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    if (audioRef.current) {
      audioRef.current.pause()
    }

    setShowCompletionDialog(true)
  }

  const completeSession = async () => {
    if (!session) return

    try {
      const sessionData: SessionComplete = {
        duree_reelle: meditation.duree_minutes,
        humeur_apres: humeurApres || undefined,
        note: note || undefined,
        commentaire: commentaire || undefined
      }

      await apiService.completeSession(session._id, sessionData)
      
      // Mettre à jour le streak
      await apiService.updateStreak()
      
      setShowCompletionDialog(false)
      onComplete?.()
      handleExit()
    } catch (error) {
      console.error('Erreur lors de la finalisation de la session:', error)
    }
  }

  const handleExit = () => {
    onExit?.()
    navigate('/meditations')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = (currentTime / totalDuration) * 100

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume
    }
  }

  // Dialog de sélection de l'humeur avant
  if (showHumeurDialog) {
    return (
      <div className="min-h-screen bg-gradient-zen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <h2 className="text-2xl font-bold text-zen-900 mb-4">
              Comment vous sentez-vous ?
            </h2>
            <p className="text-zen-600 mb-6">
              Évaluez votre état émotionnel avant de commencer la méditation
            </p>
            
            <div className="flex justify-center items-center space-x-4 mb-6">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setHumeurAvant(value)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-colors ${
                    humeurAvant === value
                      ? 'bg-primary-600 text-white'
                      : 'bg-zen-100 text-zen-600 hover:bg-zen-200'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            
            <div className="text-sm text-zen-500 mb-6">
              1 = Très mal • 5 = Très bien
            </div>
            
            <div className="flex gap-3">
              <button onClick={handleExit} className="btn-secondary flex-1">
                Annuler
              </button>
              <button 
                onClick={startSession}
                className="btn-primary flex-1"
                disabled={!humeurAvant}
              >
                Commencer
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Dialog de fin de session
  if (showCompletionDialog) {
    return (
      <div className="min-h-screen bg-gradient-zen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-zen-900 mb-2">
                Félicitations !
              </h2>
              <p className="text-zen-600">
                Vous avez terminé votre session de méditation
              </p>
            </div>

            <div className="space-y-4">
              {/* Humeur après */}
              <div>
                <label className="block text-sm font-medium text-zen-700 mb-2">
                  Comment vous sentez-vous maintenant ?
                </label>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setHumeurApres(value)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        humeurApres === value
                          ? 'bg-primary-600 text-white'
                          : 'bg-zen-100 text-zen-600 hover:bg-zen-200'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-zen-700 mb-2">
                  Notez cette méditation
                </label>
                <div className="flex justify-center space-x-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setNote(value)}
                      className="transition-colors"
                    >
                      <Star 
                        className={`h-6 w-6 ${
                          note && value <= note
                            ? 'text-yellow-500 fill-current'
                            : 'text-zen-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Commentaire */}
              <div>
                <label className="block text-sm font-medium text-zen-700 mb-2">
                  Commentaire (optionnel)
                </label>
                <textarea
                  className="input h-20 resize-none"
                  placeholder="Partagez votre expérience..."
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleExit} className="btn-secondary flex-1">
                Ignorer
              </button>
              <button onClick={completeSession} className="btn-primary flex-1">
                Terminer
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Interface principale de méditation
  return (
    <div className="min-h-screen bg-gradient-zen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button onClick={stopSession} className="btn-ghost">
          ← Arrêter
        </button>
        <h1 className="text-xl font-bold text-zen-900">{meditation.titre}</h1>
        <div className="w-20"></div> {/* Spacer */}
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Image ou placeholder */}
        <div className="w-48 h-48 bg-zen-200 rounded-full flex items-center justify-center mb-8">
          {meditation.image_url ? (
            <img 
              src={meditation.image_url} 
              alt={meditation.titre}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <Heart className="h-24 w-24 text-zen-400" />
          )}
        </div>

        {/* Timer */}
        <div className="text-center mb-8">
          <div className="text-6xl font-light text-zen-900 mb-2">
            {formatTime(currentTime)}
          </div>
          <div className="text-zen-600">
            sur {formatTime(totalDuration)}
          </div>
        </div>

        {/* Barre de progression */}
        <div className="w-full max-w-md mb-8">
          <div className="h-2 bg-zen-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-600 transition-all duration-1000"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex items-center space-x-6 mb-8">
          <button
            onClick={() => setCurrentTime(0)}
            className="w-12 h-12 bg-zen-200 hover:bg-zen-300 rounded-full flex items-center justify-center transition-colors"
            disabled={!session}
          >
            <RotateCcw className="h-5 w-5 text-zen-700" />
          </button>

          <button
            onClick={isPlaying ? pauseSession : resumeSession}
            className="w-16 h-16 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center transition-colors"
            disabled={!session}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 text-white" />
            ) : (
              <Play className="h-8 w-8 text-white ml-1" />
            )}
          </button>

          <button
            onClick={stopSession}
            className="w-12 h-12 bg-zen-200 hover:bg-zen-300 rounded-full flex items-center justify-center transition-colors"
          >
            <Square className="h-5 w-5 text-zen-700" />
          </button>
        </div>

        {/* Contrôles audio */}
        {meditation.audio_url && (
          <div className="flex items-center space-x-4">
            <button onClick={toggleMute} className="text-zen-600 hover:text-zen-800">
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-24"
            />
          </div>
        )}

        {/* Instructions */}
        {meditation.instructions && meditation.instructions.length > 0 && (
          <div className="max-w-md text-center mt-8">
            <div className="text-zen-600 text-sm">
              {meditation.instructions[Math.floor(currentTime / 30) % meditation.instructions.length]}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 