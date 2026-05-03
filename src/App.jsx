import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tontines from './pages/Tontines';
import TontineDetails from './pages/TontineDetails';
import JoinGroup from './pages/JoinGroup';
import Paiements from './pages/Paiements';
import Auth from './pages/Auth';
import Profil from './pages/Profil';
import Support from './pages/Support';

// Admin imports
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTontines from './pages/admin/AdminTontines';
import AdminSupport from './pages/admin/AdminSupport';
import AdminDatabase from './pages/admin/AdminDatabase';
import AdminStats from './pages/admin/AdminStats';

import { useLocation, useNavigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/auth" />;
}

function InitialRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Si on arrive sur l'app et qu'on n'est pas sur la racine ni sur l'auth, on redirige vers /
    // On exclut aussi les routes spéciales comme les invitations si nécessaire
    const path = location.pathname;
    if (path !== '/' && path !== '/auth' && !path.startsWith('/join/')) {
      navigate('/', { replace: true });
    }
  }, []); // Exécuté une seule fois au montage initial

  return null;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <InitialRedirect />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="tontines" element={<Tontines />} />
              <Route path="tontines/:id" element={<TontineDetails />} />
              <Route path="join/:id" element={<JoinGroup />} />
              <Route path="paiements" element={<Paiements />} />
              <Route path="profil" element={<Profil />} />
              <Route path="support" element={<Support />} />
              
              {/* Admin Routes */}
              <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="admin/tontines" element={<AdminRoute><AdminTontines /></AdminRoute>} />
              <Route path="admin/support" element={<AdminRoute><AdminSupport /></AdminRoute>} />
              <Route path="admin/database" element={<AdminRoute><AdminDatabase /></AdminRoute>} />
              <Route path="admin/stats" element={<AdminRoute><AdminStats /></AdminRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;