import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import Login from './views/auth/Login'
import Register from './views/auth/Register'
import AdminDashboard from './views/AdminDashboard'
import UserProfile from './views/UserProfile'
import HomePage from './pages/HomePage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PWAPrompt from './components/PWAPrompt'

function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <Router>
      <div className="min-h-screen bg-zen-50">
        <Routes>
          {/* Route publique - exercices de respiration, adaptée selon l'état de connexion */}
          <Route path="/" element={<HomePage />} />
          
          {/* Routes d'authentification */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Redirection de /dashboard vers la page d'accueil */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          
          {/* Route d'administration */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Route de profil utilisateur */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          
          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* PWA Prompt pour installation et mises à jour */}
        <PWAPrompt />
      </div>
    </Router>
  )
}

export default App 