import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { Leaf, Menu, X } from 'lucide-react'
import type { ContenuSante } from '../types/health'

interface Exercise {
  id: string
  nom: string
  description: string
  duree_inspiration: number
  duree_apnee: number
  duree_expiration: number
  cree_par_admin: string
  date_creation?: string
}

interface User {
  id: string
  nom: string
  prenom: string
  email: string
  role: string
  est_actif: boolean
  date_creation?: string
}

interface ExerciseFormData {
  nom: string
  description: string
  duree_inspiration: number
  duree_apnee: number
  duree_expiration: number
}

interface UserFormData {
  nom: string
  prenom: string
  email: string
  mot_de_passe: string
  role: string
}

interface ContenuFormData {
  titre: string
  texte: string
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'exercises' | 'users' | 'contenus'>('exercises')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [contenus, setContenus] = useState<ContenuSante[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [showCreateUserForm, setShowCreateUserForm] = useState(false)
  const [showCreateContenuForm, setShowCreateContenuForm] = useState(false)
  const [editingContenu, setEditingContenu] = useState<ContenuSante | null>(null)
  
  const [formData, setFormData] = useState<ExerciseFormData>({
    nom: '',
    description: '',
    duree_inspiration: 4,
    duree_apnee: 0,
    duree_expiration: 6
  })

  const [userFormData, setUserFormData] = useState<UserFormData>({
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    role: 'utilisateur'
  })

  const [contenuFormData, setContenuFormData] = useState<ContenuFormData>({
    titre: '',
    texte: ''
  })

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/')
    }
  }, [user, navigate])

  // Charger les données au montage
  useEffect(() => {
    fetchExercises()
    fetchUsers()
    fetchContenus()
  }, [])

  const fetchExercises = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5001/exercices')
      if (response.ok) {
        const data = await response.json()
        setExercises(data)
      } else {
        throw new Error('Erreur lors du chargement des exercices')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5001/users', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        throw new Error('Erreur lors du chargement des utilisateurs')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const fetchContenus = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5001/informations-sante/', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setContenus(data)
      } else {
        throw new Error('Erreur lors du chargement des contenus')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const createExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('http://localhost:5001/exercices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Exercice créé avec succès !')
        resetForm()
        fetchExercises() // Recharger la liste
      } else {
        throw new Error(data.error || 'Erreur lors de la création')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const updateExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingExercise) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`http://localhost:5001/exercices/${editingExercise.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Exercice mis à jour avec succès !')
        resetForm()
        fetchExercises() // Recharger la liste
      } else {
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      duree_inspiration: 4,
      duree_apnee: 0,
      duree_expiration: 6
    })
    setShowCreateForm(false)
    setEditingExercise(null)
  }

  const startEditing = (exercise: Exercise) => {
    setEditingExercise(exercise)
    setFormData({
      nom: exercise.nom,
      description: exercise.description,
      duree_inspiration: exercise.duree_inspiration,
      duree_apnee: exercise.duree_apnee,
      duree_expiration: exercise.duree_expiration
    })
    setShowCreateForm(true)
    setError(null)
    setSuccess(null)
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('http://localhost:5001/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userFormData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Utilisateur créé avec succès !')
        resetUserForm()
        fetchUsers() // Recharger la liste
      } else {
        throw new Error(data.error || 'Erreur lors de la création')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userName}" ? Cette action est irréversible.`)) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`http://localhost:5001/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Utilisateur supprimé avec succès !')
        fetchUsers() // Recharger la liste
      } else {
        throw new Error(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const resetUserForm = () => {
    setUserFormData({
      nom: '',
      prenom: '',
      email: '',
      mot_de_passe: '',
      role: 'utilisateur'
    })
    setShowCreateUserForm(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('duree') ? parseInt(value) || 0 : value
    }))
  }

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setUserFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Fonctions de gestion des contenus de santé
  const createContenu = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('http://localhost:5001/informations-sante/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(contenuFormData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Contenu créé avec succès !')
        resetContenuForm()
        fetchContenus()
      } else {
        throw new Error(data.error || 'Erreur lors de la création')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const updateContenu = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingContenu) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`http://localhost:5001/informations-sante/${editingContenu.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(contenuFormData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Contenu mis à jour avec succès !')
        resetContenuForm()
        fetchContenus()
      } else {
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const deleteContenu = async (contenuId: string, titre: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le contenu "${titre}" ? Cette action est irréversible.`)) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`http://localhost:5001/informations-sante/${contenuId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Contenu supprimé avec succès !')
        fetchContenus()
      } else {
        throw new Error(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const resetContenuForm = () => {
    setContenuFormData({
      titre: '',
      texte: ''
    })
    setShowCreateContenuForm(false)
    setEditingContenu(null)
  }

  const startEditingContenu = (contenu: ContenuSante) => {
    setEditingContenu(contenu)
    setContenuFormData({
      titre: contenu.titre,
      texte: contenu.texte
    })
    setShowCreateContenuForm(true)
    setError(null)
    setSuccess(null)
  }

  const handleContenuInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setContenuFormData(prev => ({
      ...prev,
      [name]: value
    }))
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

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (!user || user.role !== 'admin') {
    return <div>Accès refusé</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-nature-50 to-zen-50">
      {/* Header Mobile-First */}
      <header className="bg-white shadow-lg border-b border-primary-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            {/* Logo et titre */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Leaf className="h-8 w-8 sm:h-10 sm:w-10 text-primary-600 animate-bounce-gentle" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-neutral-900">CesiZen Admin</h1>
                <span className="hidden sm:inline-block px-3 py-1 bg-primary-100 text-primary-800 text-xs sm:text-sm font-medium rounded-full">
                  Administrateur
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-neutral-700 text-sm lg:text-base">
                Bonjour, {user.prenom} {user.nom}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm lg:text-base"
              >
                Déconnexion
              </button>
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
              <div className="space-y-3">
                <div className="text-neutral-700 text-sm text-center mb-4">
                  Bonjour, {user.prenom} {user.nom}
                </div>
                <span className="block px-3 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full text-center">
                  Administrateur
                </span>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-all duration-200 shadow-md"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm">
            <p className="text-sm sm:text-base">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl shadow-sm">
            <p className="text-sm sm:text-base">{success}</p>
          </div>
        )}

        {/* Navigation par onglets - Mobile First */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-1">
            <nav className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              <button
                onClick={() => setActiveTab('exercises')}
                className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                  activeTab === 'exercises'
                    ? 'bg-primary-600 text-white shadow-md transform scale-[0.98]'
                    : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
                }`}
              >
                <span>🧘‍♂️</span>
                <span className="hidden xs:inline">Gestion des</span>
                <span>Exercices</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                  activeTab === 'users'
                    ? 'bg-primary-600 text-white shadow-md transform scale-[0.98]'
                    : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
                }`}
              >
                <span>👥</span>
                <span className="hidden xs:inline">Gestion des</span>
                <span>Utilisateurs</span>
              </button>
              <button
                onClick={() => setActiveTab('contenus')}
                className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                  activeTab === 'contenus'
                    ? 'bg-primary-600 text-white shadow-md transform scale-[0.98]'
                    : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
                }`}
              >
                <span>📚</span>
                <span className="hidden xs:inline">Gestion des</span>
                <span>Contenus</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'exercises' ? (
          <>
            {/* Actions Exercices */}
            <div className="mb-8 flex space-x-4">
          <button
            onClick={() => {
              if (showCreateForm || editingExercise) {
                resetForm()
              } else {
                setShowCreateForm(true)
              }
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              editingExercise 
                ? 'bg-gray-600 hover:bg-gray-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            <span>{editingExercise ? '❌' : '➕'}</span>
            <span>
              {editingExercise ? 'Annuler la modification' : 
               showCreateForm ? 'Annuler' : 'Créer un exercice'}
            </span>
          </button>
          <button
            onClick={fetchExercises}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>Actualiser</span>
          </button>
        </div>

        {/* Formulaire de création/modification */}
        {showCreateForm && (
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingExercise ? 'Modifier l\'exercice' : 'Créer un nouvel exercice'}
            </h2>
            <form onSubmit={editingExercise ? updateExercise : createExercise} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'exercice
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Respiration 4-7-8"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Description détaillée de l'exercice..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée inspiration (secondes)
                  </label>
                  <input
                    type="number"
                    name="duree_inspiration"
                    value={formData.duree_inspiration}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée apnée (secondes)
                  </label>
                  <input
                    type="number"
                    name="duree_apnee"
                    value={formData.duree_apnee}
                    onChange={handleInputChange}
                    min="0"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée expiration (secondes)
                  </label>
                  <input
                    type="number"
                    name="duree_expiration"
                    value={formData.duree_expiration}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {loading ? 
                    (editingExercise ? 'Mise à jour...' : 'Création...') : 
                    (editingExercise ? 'Mettre à jour' : 'Créer l\'exercice')
                  }
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des exercices */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Exercices existants ({exercises.length})
            </h2>
          </div>
          
          <div className="p-6">
            {loading && exercises.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Chargement des exercices...</p>
              </div>
            ) : exercises.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun exercice trouvé
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exercises.map((exercise) => (
                  <div key={exercise.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900 text-lg">{exercise.nom}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {exercise.cree_par_admin}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {exercise.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Inspiration:</span>
                        <span className="font-medium">{exercise.duree_inspiration}s</span>
                      </div>
                      {exercise.duree_apnee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Apnée:</span>
                          <span className="font-medium">{exercise.duree_apnee}s</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Expiration:</span>
                        <span className="font-medium">{exercise.duree_expiration}s</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="text-gray-500">Créé le:</span>
                        <span className="text-xs">{formatDate(exercise.date_creation)}</span>
                      </div>
                    </div>
                    
                    {/* Bouton de modification */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => startEditing(exercise)}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <span>✏️</span>
                        <span>Modifier</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
          </>
        ) : activeTab === 'users' ? (
          <>
            {/* Actions Utilisateurs */}
            <div className="mb-8 flex space-x-4">
              <button
                onClick={() => setShowCreateUserForm(!showCreateUserForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <span>➕</span>
                <span>{showCreateUserForm ? 'Annuler' : 'Créer un utilisateur'}</span>
              </button>
              <button
                onClick={fetchUsers}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>Actualiser</span>
              </button>
            </div>

            {/* Formulaire de création d'utilisateur */}
            {showCreateUserForm && (
              <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Créer un nouvel utilisateur</h2>
                <form onSubmit={createUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        name="prenom"
                        value={userFormData.prenom}
                        onChange={handleUserInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Prénom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        name="nom"
                        value={userFormData.nom}
                        onChange={handleUserInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={userFormData.email}
                        onChange={handleUserInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="email@exemple.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe
                      </label>
                      <input
                        type="password"
                        name="mot_de_passe"
                        value={userFormData.mot_de_passe}
                        onChange={handleUserInputChange}
                        required
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Mot de passe (min. 6 caractères)"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rôle
                      </label>
                      <select
                        name="role"
                        value={userFormData.role}
                        onChange={handleUserInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="utilisateur">Utilisateur</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      {loading ? 'Création...' : 'Créer l\'utilisateur'}
                    </button>
                    <button
                      type="button"
                      onClick={resetUserForm}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Liste des utilisateurs */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Utilisateurs existants ({users.length})
                </h2>
              </div>
              
              <div className="p-6">
                {loading && users.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Chargement des utilisateurs...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucun utilisateur trouvé
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((userItem) => (
                      <div key={userItem.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {userItem.prenom} {userItem.nom}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            userItem.role === 'admin' 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {userItem.role}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Email:</span>
                            <span className="font-medium text-xs break-all">{userItem.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Statut:</span>
                            <span className={`font-medium ${
                              userItem.est_actif ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {userItem.est_actif ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="text-gray-500">Créé le:</span>
                            <span className="text-xs">{formatDate(userItem.date_creation)}</span>
                          </div>
                        </div>
                        
                        {/* Bouton de suppression */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => deleteUser(userItem.id, `${userItem.prenom} ${userItem.nom}`)}
                            className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                            disabled={userItem.id === user?.id} // Empêcher la suppression de son propre compte
                          >
                            <span>🗑️</span>
                            <span>{userItem.id === user?.id ? 'Votre compte' : 'Supprimer'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Actions Contenus */}
            <div className="mb-8 flex space-x-4">
              <button
                onClick={() => {
                  if (showCreateContenuForm || editingContenu) {
                    resetContenuForm()
                  } else {
                    setShowCreateContenuForm(true)
                  }
                }}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  editingContenu 
                    ? 'bg-gray-600 hover:bg-gray-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                <span>{editingContenu ? '❌' : '➕'}</span>
                <span>
                  {editingContenu ? 'Annuler la modification' : 
                   showCreateContenuForm ? 'Annuler' : 'Créer un contenu'}
                </span>
              </button>
              <button
                onClick={fetchContenus}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>Actualiser</span>
              </button>
            </div>

            {/* Formulaire de création/modification de contenu */}
            {showCreateContenuForm && (
              <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {editingContenu ? 'Modifier le contenu' : 'Créer un nouveau contenu'}
                </h2>
                <form onSubmit={editingContenu ? updateContenu : createContenu} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre
                    </label>
                    <input
                      type="text"
                      name="titre"
                      value={contenuFormData.titre}
                      onChange={handleContenuInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Titre du contenu"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contenu
                    </label>
                    <textarea
                      name="texte"
                      value={contenuFormData.texte}
                      onChange={handleContenuInputChange}
                      required
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contenu détaillé de l'article ou information de santé..."
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      {loading ? (editingContenu ? 'Modification...' : 'Création...') : 
                               (editingContenu ? 'Modifier le contenu' : 'Créer le contenu')}
                    </button>
                    <button
                      type="button"
                      onClick={resetContenuForm}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Liste des contenus */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Contenus de santé existants ({contenus.length})
                </h2>
              </div>
              
              <div className="p-6">
                {loading && contenus.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Chargement des contenus...</p>
                  </div>
                ) : contenus.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucun contenu trouvé
                  </div>
                ) : (
                  <div className="space-y-6">
                    {contenus.map((contenu) => (
                      <div key={contenu.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {contenu.titre}
                          </h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEditingContenu(contenu)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              ✏️ Modifier
                            </button>
                            <button
                              onClick={() => deleteContenu(contenu.id, contenu.titre)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              🗑️ Supprimer
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-4">
                          {contenu.date_creation && (
                            <span>Créé le {formatDate(contenu.date_creation)}</span>
                          )}
                          {contenu.date_mise_a_jour && contenu.date_mise_a_jour !== contenu.date_creation && (
                            <span> • Modifié le {formatDate(contenu.date_mise_a_jour)}</span>
                          )}
                        </div>
                        
                        <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                          <p className="whitespace-pre-wrap line-clamp-4">
                            {contenu.texte.length > 200 
                              ? `${contenu.texte.substring(0, 200)}...` 
                              : contenu.texte
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard 