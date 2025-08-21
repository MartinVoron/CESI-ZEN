import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { 
  User, 
  AuthTokens, 
  LoginCredentials, 
  RegisterData, 
  Meditation, 
  MeditationType,
  Session, 
  SessionStart, 
  SessionComplete,
  DashboardData,
  MeditationFilters,
  UserPreferences
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL = 'http://localhost:5000';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token d'authentification
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Intercepteur pour gérer les erreurs de token
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expiré, essayer de le rafraîchir
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('access_token', response.access_token);
              
              // Retry la requête originale
              error.config.headers.Authorization = `Bearer ${response.access_token}`;
              return this.api.request(error.config);
            } catch (refreshError) {
              // Refresh failed, redirect to login
              this.logout();
              window.location.href = '/login';
            }
          } else {
            // No refresh token, redirect to login
            this.logout();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentification
  async register(data: RegisterData): Promise<{ user: User; access_token: string; refresh_token: string }> {
    const response: AxiosResponse = await this.api.post('/auth/register', data);
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; access_token: string; refresh_token: string }> {
    const response: AxiosResponse = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    const response: AxiosResponse = await this.api.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const response: AxiosResponse = await this.api.get('/auth/me');
    return response.data;
  }

  // Utilisateurs
  async getUserProfile(): Promise<{ user: User }> {
    const response: AxiosResponse = await this.api.get('/users/profile');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<{ user: User }> {
    const response: AxiosResponse = await this.api.put('/users/profile', data);
    return response.data;
  }

  async updatePreferences(preferences: UserPreferences): Promise<{ preferences: UserPreferences }> {
    const response: AxiosResponse = await this.api.put('/users/preferences', { preferences });
    return response.data;
  }

  async getUserStats(periode: number = 30): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/users/stats?periode=${periode}`);
    return response.data;
  }

  async updateStreak(): Promise<any> {
    const response: AxiosResponse = await this.api.post('/users/streak');
    return response.data;
  }

  // Méditations
  async getMeditations(filters?: MeditationFilters): Promise<{ meditations: Meditation[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.niveau) params.append('niveau', filters.niveau);
    if (filters?.duree_max) params.append('duree_max', filters.duree_max.toString());
    if (filters?.tags) params.append('tags', filters.tags.join(','));

    const response: AxiosResponse = await this.api.get(`/meditations/?${params.toString()}`);
    return response.data;
  }

  async getMeditation(id: string): Promise<{ meditation: Meditation }> {
    const response: AxiosResponse = await this.api.get(`/meditations/${id}`);
    return response.data;
  }

  async getRecommendedMeditations(): Promise<{ meditations: Meditation[]; total: number }> {
    const response: AxiosResponse = await this.api.get('/meditations/recommended');
    return response.data;
  }

  async getMeditationTypes(): Promise<{ types: MeditationType[] }> {
    const response: AxiosResponse = await this.api.get('/meditations/types');
    return response.data;
  }

  async searchMeditations(query: string): Promise<{ meditations: Meditation[]; total: number; query: string }> {
    const response: AxiosResponse = await this.api.get(`/meditations/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  async rateMeditation(meditationId: string, note: number): Promise<any> {
    const response: AxiosResponse = await this.api.post(`/meditations/${meditationId}/rate`, { note });
    return response.data;
  }

  // Sessions
  async startSession(data: SessionStart): Promise<{ session: Session; meditation: any }> {
    const response: AxiosResponse = await this.api.post('/sessions/start', data);
    return response.data;
  }

  async completeSession(sessionId: string, data: SessionComplete): Promise<{ session: Session }> {
    const response: AxiosResponse = await this.api.post(`/sessions/${sessionId}/complete`, data);
    return response.data;
  }

  async interruptSession(sessionId: string, dureeReelle: number): Promise<{ session: Session }> {
    const response: AxiosResponse = await this.api.post(`/sessions/${sessionId}/interrupt`, { duree_reelle: dureeReelle });
    return response.data;
  }

  async getSessionHistory(limit: number = 20): Promise<{ sessions: Session[]; total: number }> {
    const response: AxiosResponse = await this.api.get(`/sessions/history?limit=${limit}`);
    return response.data;
  }

  async getSession(sessionId: string): Promise<{ session: Session }> {
    const response: AxiosResponse = await this.api.get(`/sessions/${sessionId}`);
    return response.data;
  }

  async getCurrentSession(): Promise<{ current_session: Session | null }> {
    const response: AxiosResponse = await this.api.get('/sessions/current');
    return response.data;
  }

  // Statistiques et progression
  async getDashboardData(): Promise<DashboardData> {
    const response: AxiosResponse = await this.api.get('/progress/dashboard');
    return response.data;
  }

  // Utilitaires
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  setTokens(tokens: AuthTokens): void {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  }

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

export const apiService = new ApiService();
export default apiService; 