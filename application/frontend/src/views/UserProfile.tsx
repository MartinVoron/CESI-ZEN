import React, { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Calendar, Shield, Edit3, Save, X } from 'lucide-react'

const UserProfile: React.FC = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [editData, setEditData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || ''
  })

  if (!user) {
    navigate('/login')
    return null
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Profil mis à jour avec succès !')
        setIsEditing(false)
        
        // TODO: Mettre à jour le store authStore avec les nouvelles données
        // Pour l'instant, on peut recharger la page ou mettre à jour manuellement
        window.location.reload()
        
      } else {
        throw new Error(data.error || 'Erreur lors de la mise à jour du profil')
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      email: user?.email || ''
    })
    setIsEditing(false)
    setError(null)
    setSuccess(null)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date inconnue'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-zen-600 hover:text-zen-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Retour à l'accueil</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-zen-900">Mon Profil</h1>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-zen-600 hover:text-zen-800 transition-colors"
            >
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header du profil */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.prenom} {user.nom}
                </h2>
                <p className="text-gray-600 flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                </p>
              </div>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>Modifier</span>
              </button>
            )}
          </div>

          {/* Formulaire de profil */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prénom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="prenom"
                    value={editData.prenom}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {user.prenom}
                  </div>
                )}
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="nom"
                    value={editData.nom}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {user.nom}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                    {user.email}
                  </div>
                )}
              </div>
            </div>

            {/* Informations en lecture seule */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du compte</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 flex items-center">
                    <Shield className="h-4 w-4 text-gray-500 mr-2" />
                    {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'inscription
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    {formatDate(user.dateInscription)}
                  </div>
                </div>

                {user.derniereConnexion && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dernière connexion
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      {formatDate(user.derniereConnexion)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Boutons d'action en mode édition */}
            {isEditing && (
              <div className="flex space-x-4 pt-6 border-t">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Annuler</span>
                </button>
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  )
}

export default UserProfile 