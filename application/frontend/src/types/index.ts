// Types pour l'authentification
export interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  username: string;
  date_naissance?: string;
  niveau_experience: 'debutant' | 'intermediaire' | 'avance';
  date_creation: string;
  derniere_connexion?: string;
  temps_meditation_total: number;
  sessions_completees: number;
  streak_actuel: number;
  meilleur_streak: number;
  preferences: UserPreferences;
  is_active: boolean;
}

export interface UserPreferences {
  duree_preferee: number;
  type_meditation_prefere: string;
  notifications: boolean;
  rappels_quotidiens: boolean;
  heure_rappel: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  username: string;
  date_naissance?: string;
  niveau_experience?: 'debutant' | 'intermediaire' | 'avance';
}

// Types pour les méditations
export interface Meditation {
  _id: string;
  titre: string;
  description: string;
  duree_minutes: number;
  type_meditation: 'mindfulness' | 'respiration' | 'body_scan' | 'visualisation' | 'mantra';
  niveau_difficulte: 'debutant' | 'intermediaire' | 'avance';
  audio_url?: string;
  image_url?: string;
  instructions: string[];
  tags: string[];
  date_creation: string;
  nombre_sessions: number;
  note_moyenne: number;
  is_active: boolean;
}

export interface MeditationType {
  id: string;
  nom: string;
  description: string;
}

// Types pour les sessions
export interface Session {
  _id: string;
  user_id: string;
  meditation_id: string;
  duree_prevue: number;
  duree_reelle?: number;
  statut: 'en_cours' | 'completee' | 'interrompue';
  note?: number;
  commentaire?: string;
  date_debut: string;
  date_fin?: string;
  humeur_avant?: number;
  humeur_apres?: number;
  meditation?: {
    titre: string;
    type_meditation: string;
    niveau_difficulte: string;
    duree_minutes?: number;
    instructions?: string[];
  };
}

export interface SessionStart {
  meditation_id: string;
  humeur_avant?: number;
}

export interface SessionComplete {
  duree_reelle: number;
  note?: number;
  commentaire?: string;
  humeur_apres?: number;
}

// Types pour les statistiques
export interface UserStats {
  temps_meditation_total: number;
  sessions_completees: number;
  streak_actuel: number;
  meilleur_streak: number;
  niveau_experience: string;
  date_creation: string;
  derniere_connexion?: string;
}

export interface PeriodStats {
  total_sessions: number;
  temps_total: number;
  note_moyenne: number;
  humeur_moyenne_avant: number;
  humeur_moyenne_apres: number;
}

export interface DashboardData {
  user_stats: UserStats;
  stats_7_jours: PeriodStats;
  stats_30_jours: PeriodStats;
}

// Types pour les filtres
export interface MeditationFilters {
  type?: string;
  niveau?: string;
  duree_max?: number;
  tags?: string[];
}

// Types pour les réponses API
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Types pour les erreurs
export interface ApiError {
  message: string;
  status?: number;
}

// Types pour les composants
export interface MeditationCardProps {
  meditation: Meditation;
  onClick?: (meditation: Meditation) => void;
}

export interface SessionTimerProps {
  duration: number;
  onComplete: () => void;
  onPause: () => void;
  onStop: () => void;
}

// Types pour les hooks
export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} 