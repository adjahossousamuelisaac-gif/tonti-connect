import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tontines = lazy(() => import('./pages/Tontines'));
const TontineDetails = lazy(() => import('./pages/TontineDetails'));
const JoinGroup = lazy(() => import('./pages/JoinGroup'));
const Paiements = lazy(() => import('./pages/Paiements'));
const Auth = lazy(() => import('./pages/Auth'));
const Profil = lazy(() => import('./pages/Profil'));
const Support = lazy(() => import('./pages/Support'));

// Admin imports
import AdminRoute from './components/AdminRoute';
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminTontines = lazy(() => import('./pages/admin/AdminTontines'));
const AdminSupport = lazy(() => import('./pages/admin/AdminSupport'));
const AdminDatabase = lazy(() => import('./pages/admin/AdminDatabase'));
const AdminStats = lazy(() => import('./pages/admin/AdminStats'));

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/auth" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1115' }}><div className="loader"></div></div>}>
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;