import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../app/store/hooks';
import { ChangePasswordModal } from '../../features/auth/components/ChangePasswordModal';

export interface AuthGuardProps {
  isAuthenticated?: boolean;
  redirectPath?: string;
  fallback?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Ensures a user is authenticated before rendering protected children or child routes.
 * Relies strictly on verified Redux authentication state populated from backend cookies.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  isAuthenticated: propIsAuthenticated,
  redirectPath = '/login',
  fallback = null,
  children,
}) => {
  const { isAuthenticated, isInitialized, mustChangePassword, currentUser } = useAppSelector((state) => state.auth);

  const effectiveAuth = propIsAuthenticated !== undefined ? propIsAuthenticated : isAuthenticated;
  const requiresPasswordChange = Boolean(mustChangePassword ?? currentUser?.mustChangePassword);

  // If session is still verifying on initial application mount, wait for gate completion
  if (!isInitialized) {
    return <>{fallback}</>;
  }

  if (!effectiveAuth) {
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <>
      {requiresPasswordChange && <ChangePasswordModal isOpen={true} />}
      {children ? <>{children}</> : <Outlet />}
    </>
  );
};
