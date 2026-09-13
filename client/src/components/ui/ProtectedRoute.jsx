import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from './UI';

export const ProtectedRoute = ({ children }) => {
  const { user, initialized } = useAuth();
  const location = useLocation();
  if (!initialized) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, initialized, isAdmin } = useAuth();
  const location = useLocation();
  if (!initialized) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};
