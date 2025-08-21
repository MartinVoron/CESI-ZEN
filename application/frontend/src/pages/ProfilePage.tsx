import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { apiService } from '../services/api'
import { User, Settings, Target, Calendar, Edit2, Save, X } from 'lucide-react'
import type { UserPreferences } from '../types'

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingPreferences, setIsEditingPreferences] = useState(false)

  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    username: user?.username || '',
    niveau_experience: user?.niveau_experience || 'debutant'
  })
  const [preferences, setPreferences] = useState<UserPreferences>({
    duree_preferee: user?.preferences?.duree_preferee || 10,
    type_meditation_prefere: user?.preferences?.type_meditation_prefere || 'mindfulness',
    notifications: user?.preferences?.notifications || true,
    rappels_quotidiens: user?.preferences?.rappels_quotidiens || true,
    heure_rappel: user?.preferences?.heure_rappel || '09:00'
  })



  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom,
        prenom: user.prenom,
        username: user.username,
        niveau_experience: user.niveau_experience
      })
      setPreferences(user.preferences)
    }
  }, [user])

  const handleProfileUpdate = async () => {
    try {
      await updateProfile(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)
    }
  }

  const handlePreferencesUpdate = async () => {
    try {
      await apiService.updatePreferences(preferences)
      setIsEditingPreferences(false)
      // Recharger les données utilisateur
      window.location.reload()
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* En-tête du profil */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-primary-600" />
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-zen-900">
                  {user?.prenom} {user?.nom}
                </h1>
                <p className="text-zen-600">@{user?.username}</p>
                <div className="flex items-center mt-2 text-sm text-zen-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  Membre depuis {user?.date_creation ? formatDate(user.date_creation) : '-'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-secondary flex items-center"
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Modifier
                </>
              )}
            </button>
          </div>

          {/* Formulaire de modification du profil */}
          {isEditing && (
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-zen-700 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.prenom}
                    onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zen-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.nom}
                    onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zen-700 mb-2">
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zen-700 mb-2">
                    Niveau d'expérience
                  </label>
                  <select
                    className="input"
                    value={formData.niveau_experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, niveau_experience: e.target.value as any }))}
                  >
                    <option value="debutant">Débutant</option>
                    <option value="intermediaire">Intermédiaire</option>
                    <option value="avance">Avancé</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={handleProfileUpdate} className="btn-primary flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section informations personnelles */}
          <div className="lg:col-span-2 space-y-6">
            {/* Message de bienvenue */}
            <div className="card">
              <h2 className="text-xl font-bold text-zen-900 mb-4">Votre parcours CesiZen</h2>
              <p className="text-zen-600 leading-relaxed">
                Votre profil est configuré et vous êtes prêt à commencer votre voyage vers le bien-être. 
                Explorez nos exercices de respiration et découvrez les bienfaits de la méditation.
              </p>
            </div>
          </div>

          {/* Préférences */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-zen-900">Préférences</h3>
                <button
                  onClick={() => setIsEditingPreferences(!isEditingPreferences)}
                  className="btn-ghost p-2"
                >
                  {isEditingPreferences ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                </button>
              </div>

              {isEditingPreferences ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zen-700 mb-2">
                      Durée préférée (minutes)
                    </label>
                    <select
                      className="input"
                      value={preferences.duree_preferee}
                      onChange={(e) => setPreferences(prev => ({ 
                        ...prev, 
                        duree_preferee: parseInt(e.target.value) 
                      }))}
                    >
                      <option value={5}>5 minutes</option>
                      <option value={10}>10 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={20}>20 minutes</option>
                      <option value={30}>30 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zen-700 mb-2">
                      Type de méditation préféré
                    </label>
                    <select
                      className="input"
                      value={preferences.type_meditation_prefere}
                      onChange={(e) => setPreferences(prev => ({ 
                        ...prev, 
                        type_meditation_prefere: e.target.value 
                      }))}
                    >
                      <option value="mindfulness">Pleine conscience</option>
                      <option value="respiration">Respiration</option>
                      <option value="body_scan">Scan corporel</option>
                      <option value="visualisation">Visualisation</option>
                      <option value="mantra">Mantra</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zen-700">Notifications</span>
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-zen-300 rounded"
                        checked={preferences.notifications}
                        onChange={(e) => setPreferences(prev => ({ 
                          ...prev, 
                          notifications: e.target.checked 
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zen-700">Rappels quotidiens</span>
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-zen-300 rounded"
                        checked={preferences.rappels_quotidiens}
                        onChange={(e) => setPreferences(prev => ({ 
                          ...prev, 
                          rappels_quotidiens: e.target.checked 
                        }))}
                      />
                    </div>

                    {preferences.rappels_quotidiens && (
                      <div>
                        <label className="block text-sm font-medium text-zen-700 mb-2">
                          Heure du rappel
                        </label>
                        <input
                          type="time"
                          className="input"
                          value={preferences.heure_rappel}
                          onChange={(e) => setPreferences(prev => ({ 
                            ...prev, 
                            heure_rappel: e.target.value 
                          }))}
                        />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handlePreferencesUpdate}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder les préférences
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zen-600">Durée préférée:</span>
                    <span className="font-medium">{preferences.duree_preferee} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zen-600">Type préféré:</span>
                    <span className="font-medium capitalize">{preferences.type_meditation_prefere}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zen-600">Notifications:</span>
                    <span className="font-medium">{preferences.notifications ? 'Activées' : 'Désactivées'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zen-600">Rappels:</span>
                    <span className="font-medium">
                      {preferences.rappels_quotidiens ? `${preferences.heure_rappel}` : 'Désactivés'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Badge de niveau */}
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-8 w-8 text-primary-600" />
              </div>
              <h4 className="font-bold text-zen-900 capitalize">
                {user?.niveau_experience || 'Débutant'}
              </h4>
              <p className="text-sm text-zen-600 mt-1">
                Continuez votre pratique pour progresser !
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 