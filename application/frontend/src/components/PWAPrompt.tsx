import { useState, useEffect } from 'react'
import { Download, RefreshCw, X } from 'lucide-react'

interface PWAPromptProps {
  onInstall?: () => void
  onUpdate?: () => void
}

export default function PWAPrompt({ onInstall, onUpdate }: PWAPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)

  useEffect(() => {
    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    // Écouter les mises à jour du service worker
    const handleSWUpdate = () => {
      setShowUpdatePrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    // Vérifier si l'app est déjà installée
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false)
    }

    // Écouter les événements personnalisés pour les mises à jour SW
    window.addEventListener('sw-update-available', handleSWUpdate)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('sw-update-available', handleSWUpdate)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('PWA installée avec succès')
        onInstall?.()
      }
      
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    } catch (error) {
      console.error('Erreur lors de l\'installation PWA:', error)
    }
  }

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          window.location.reload()
          onUpdate?.()
        }
      })
    }
    setShowUpdatePrompt(false)
  }

  const handleDismissInstall = () => {
    setShowInstallPrompt(false)
    setDeferredPrompt(null)
  }

  const handleDismissUpdate = () => {
    setShowUpdatePrompt(false)
  }

  return (
    <>
      {/* Prompt d'installation */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 bg-white rounded-lg shadow-lg border border-primary-200 p-4 z-50 animate-slide-up">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-zen-900 mb-1">
                Installer CesiZen
              </h3>
              <p className="text-sm text-zen-600">
                Ajoutez CesiZen à votre écran d'accueil pour un accès rapide et une expérience optimisée.
              </p>
            </div>
            <button
              onClick={handleDismissInstall}
              className="ml-2 p-1 hover:bg-zen-100 rounded transition-colors"
            >
              <X className="h-4 w-4 text-zen-500" />
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Installer
            </button>
            <button
              onClick={handleDismissInstall}
              className="px-4 py-2 text-zen-600 hover:text-zen-800 transition-colors"
            >
              Plus tard
            </button>
          </div>
        </div>
      )}

      {/* Prompt de mise à jour */}
      {showUpdatePrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 bg-primary-600 text-white rounded-lg shadow-lg p-4 z-50 animate-slide-up">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold mb-1">
                Mise à jour disponible
              </h3>
              <p className="text-sm text-primary-100">
                Une nouvelle version de CesiZen est disponible. Redémarrez l'application pour la mettre à jour.
              </p>
            </div>
            <button
              onClick={handleDismissUpdate}
              className="ml-2 p-1 hover:bg-primary-700 rounded transition-colors"
            >
              <X className="h-4 w-4 text-primary-200" />
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleUpdate}
              className="flex-1 bg-white text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Mettre à jour
            </button>
            <button
              onClick={handleDismissUpdate}
              className="px-4 py-2 text-primary-200 hover:text-white transition-colors"
            >
              Plus tard
            </button>
          </div>
        </div>
      )}
    </>
  )
} 