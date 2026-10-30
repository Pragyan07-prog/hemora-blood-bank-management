import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const RoleRoute = ({ children, role }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user || user.role !== role) {
    // If the logged in user has a different role, send them to their dashboard
    if (user?.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'DONOR') {
      return <Navigate to="/donor/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
