import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

export const RoleGuard: React.FC<{
  allow: UserRole;
  children: React.ReactNode;
}> = ({ allow, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (user.role !== allow) {
    return <Navigate to={user.role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor'} replace />;
  }

  return <>{children}</>;
};

