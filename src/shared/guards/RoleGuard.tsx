import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '../config/appConfig';
import { useAppSelector } from '../../app/store/hooks';

export interface RoleGuardProps {
  currentRole?: UserRole | string;
  allowedRoles: (UserRole | string)[];
  fallbackUrl?: string;
  fallback?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Ensures user has an authorized role before accessing role-gated sections.
 * Supports wrapper components (children), layout routes (Outlet), and declarative redirect fallbacks.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  currentRole: propRole,
  allowedRoles,
  fallbackUrl,
  fallback = null,
  children,
}) => {
  const reduxRole = useAppSelector((state) => state.auth.activeRole);
  const effectiveRole = propRole || reduxRole || '';

  const isAuthorized = Boolean(effectiveRole && allowedRoles.includes(effectiveRole));

  if (!isAuthorized) {
    if (fallbackUrl) {
      return <Navigate to={fallbackUrl} replace />;
    }
    return <>{fallback}</>;
  }

  return children ? <>{children}</> : <Outlet />;
};
export default RoleGuard;
