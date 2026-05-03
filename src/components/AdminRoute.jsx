import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AdminRoute({ children }) {
  const { currentUser, userData, loading } = useAuth();
  
  if (loading) return <div>Chargement...</div>;
  if (!currentUser) return <Navigate to="/auth" />;
  if (userData?.role !== 'super_admin') return <Navigate to="/" />;
  
  return children;
}

export default AdminRoute;
