import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export interface AuthGuardProps {
  isAuthenticated?: boolean;
  redirectPath?: string;
  fallback?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Ensures a user is authenticated before rendering protected children or child routes.
 * Supports both standalone child wrapping and React Router <Outlet /> route protection.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  isAuthenticated,
  redirectPath = '/',
  fallback = null,
  children,
}) => {
  // Check explicit prop or persisted session
  const hasSession = 
    isAuthenticated !== undefined 
      ? isAuthenticated 
      : Boolean(localStorage.getItem('fpc_auth_user') || sessionStorage.getItem('fpc_auth_user'));

  if (!hasSession) {
    if (fallback) return <>{fallback}</>;
    return <Navigate to={redirectPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
