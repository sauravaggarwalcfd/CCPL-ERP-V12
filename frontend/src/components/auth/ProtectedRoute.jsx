/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

const ProtectedRoute = ({ children, requiredRoles = null }) => {
  const { isAuthenticated, user, hasRole } = useAuthStore();

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (requiredRoles && !hasRole(requiredRoles)) {
    toast.error('You do not have permission to access this page');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
