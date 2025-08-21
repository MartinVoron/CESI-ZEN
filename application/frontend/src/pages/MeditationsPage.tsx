import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { Search, Filter, Clock, Star, Play } from 'lucide-react'
import type { Meditation, MeditationFilters } from '../types'

export default function MeditationsPage() {
  const navigate = useNavigate()
  
  const [meditations, setMeditations] = useState<Meditation[]>([])
  const [filteredMeditations, setFilteredMeditations] = useState<Meditation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<MeditationFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  const types = [
    { value: 'mindfulness', label: 'Pleine conscience' },
    { value: 'respiration', label: 'Respiration' },
    { value: 'body_scan', label: 'Body scan' },
    { value: 'visualisation', label: 'Visualisation' },
    { value: 'mantra', label: 'Mantra' }
  ]

  const niveaux = [
    { value: 'debutant', label: 'Débutant' },
    { value: 'intermediaire', label: 'Intermédiaire' },
    { value: 'avance', label: 'Avancé' }
  ]

  const durees = [
    { value: 5, label: '5 min' },
    { value: 10, label: '10 min' },
    { value: 15, label: '15 min' },
    { value: 20, label: '20 min' },
    { value: 30, label: '30 min+' }
  ]

  useEffect(() => {
    fetchMeditations()
  }, [])

  useEffect(() => {
    filterMeditations()
  }, [meditations, searchQuery, filters])

  const fetchMeditations = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getMeditations()
      setMeditations(response.meditations)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors du chargement des méditations')
    } finally {
      setIsLoading(false)
    }
  }

  const filterMeditations = () => {
    let filtered = [...meditations]

    // Recherche par titre/description
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(meditation =>
        meditation.titre.toLowerCase().includes(query) ||
        meditation.description.toLowerCase().includes(query) ||
        meditation.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Filtres
    if (filters.type) {
      filtered = filtered.filter(meditation => meditation.type_meditation === filters.type)
    }

    if (filters.niveau) {
      filtered = filtered.filter(meditation => meditation.niveau_difficulte === filters.niveau)
    }

    if (filters.duree_max) {
      filtered = filtered.filter(meditation => meditation.duree_minutes <= filters.duree_max!)
    }

    setFilteredMeditations(filtered)
  }

  const handleFilterChange = (key: keyof MeditationFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({})
    setSearchQuery('')
  }

  const handleMeditationClick = (meditation: Meditation) => {
    navigate(`/meditations/${meditation._id}`)
  }

  const startMeditation = (meditation: Meditation, e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/meditations/${meditation._id}`)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-zen-600">Chargement des méditations...</p>
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
          <button onClick={fetchMeditations} className="btn-primary">
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zen-900 mb-2">Bibliothèque de méditations</h1>
          <p className="text-zen-600">Découvrez et pratiquez nos méditations guidées</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-zen-600">
            {filteredMeditations.length} méditation{filteredMeditations.length > 1 ? 's' : ''} trouvée{filteredMeditations.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zen-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, description ou tags..."
              className="input pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center ${showFilters ? 'bg-primary-100 text-primary-700' : ''}`}
          >
            <Filter className="h-5 w-5 mr-2" />
            Filtres
          </button>

          {/* Effacer */}
          {(searchQuery || Object.keys(filters).length > 0) && (
            <button onClick={clearFilters} className="btn-ghost">
              Effacer
            </button>
          )}
        </div>

        {/* Panneau de filtres */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-zen-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-zen-700 mb-2">Type</label>
                <select
                  className="input w-full"
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                >
                  <option value="">Tous les types</option>
                  {types.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Niveau */}
              <div>
                <label className="block text-sm font-medium text-zen-700 mb-2">Niveau</label>
                <select
                  className="input w-full"
                  value={filters.niveau || ''}
                  onChange={(e) => handleFilterChange('niveau', e.target.value || undefined)}
                >
                  <option value="">Tous les niveaux</option>
                  {niveaux.map(niveau => (
                    <option key={niveau.value} value={niveau.value}>{niveau.label}</option>
                  ))}
                </select>
              </div>

              {/* Durée max */}
              <div>
                <label className="block text-sm font-medium text-zen-700 mb-2">Durée max</label>
                <select
                  className="input w-full"
                  value={filters.duree_max || ''}
                  onChange={(e) => handleFilterChange('duree_max', e.target.value ? parseInt(e.target.value) : undefined)}
                >
                  <option value="">Toutes les durées</option>
                  {durees.map(duree => (
                    <option key={duree.value} value={duree.value}>{duree.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grille des méditations */}
      {filteredMeditations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-zen-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-zen-400" />
          </div>
          <h3 className="text-lg font-semibold text-zen-900 mb-2">Aucune méditation trouvée</h3>
          <p className="text-zen-600 mb-4">
            {searchQuery || Object.keys(filters).length > 0
              ? 'Essayez de modifier vos critères de recherche'
              : 'Aucune méditation disponible pour le moment'
            }
          </p>
          {(searchQuery || Object.keys(filters).length > 0) && (
            <button onClick={clearFilters} className="btn-primary">
              Voir toutes les méditations
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeditations.map((meditation) => (
            <div
              key={meditation._id}
              className="card group cursor-pointer hover:shadow-lg transition-all duration-200"
              onClick={() => handleMeditationClick(meditation)}
            >
              {/* Image */}
              <div className="aspect-video bg-zen-200 rounded-lg overflow-hidden mb-4 relative">
                {meditation.image_url ? (
                  <img
                    src={meditation.image_url}
                    alt={meditation.titre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-12 h-12 bg-zen-300 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🧘</span>
                    </div>
                  </div>
                )}
                
                {/* Bouton play overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all duration-200">
                  <button
                    onClick={(e) => startMeditation(meditation, e)}
                    className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-100"
                  >
                    <Play className="h-6 w-6 text-primary-600 ml-0.5" />
                  </button>
                </div>
              </div>

              {/* Contenu */}
              <div>
                {/* Badges */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                    {types.find(t => t.value === meditation.type_meditation)?.label || meditation.type_meditation}
                  </span>
                  <span className="px-2 py-1 bg-zen-100 text-zen-700 text-xs font-medium rounded-full">
                    {niveaux.find(n => n.value === meditation.niveau_difficulte)?.label || meditation.niveau_difficulte}
                  </span>
                </div>

                {/* Titre et description */}
                <h3 className="text-lg font-semibold text-zen-900 mb-2 group-hover:text-primary-700 transition-colors">
                  {meditation.titre}
                </h3>
                <p className="text-zen-600 text-sm mb-4 line-clamp-2">
                  {meditation.description}
                </p>

                {/* Métadonnées */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-zen-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {meditation.duree_minutes} min
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      {meditation.note_moyenne > 0 ? meditation.note_moyenne.toFixed(1) : '-'}
                    </div>
                  </div>
                  <span className="text-xs text-zen-500">
                    {meditation.nombre_sessions} session{meditation.nombre_sessions > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Tags */}
                {meditation.tags && meditation.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {meditation.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-zen-100 text-zen-600 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {meditation.tags.length > 3 && (
                      <span className="text-xs text-zen-500">
                        +{meditation.tags.length - 3} autres
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 