import React from 'react';
import type { UserRole } from '../config/appConfig';
import { useAppSelector } from '../../app/store/hooks';

export interface RoleGuardProps {
  currentRole?: UserRole | string;
  allowedRoles: (UserRole | string)[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Ensures user has an authorized role before accessing role-gated sections.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  currentRole: propRole,
  allowedRoles,
  fallback = null,
  children,
}) => {
  const reduxRole = useAppSelector((state) => state.auth.activeRole);
  const effectiveRole = propRole || reduxRole || '';

  if (!allowedRoles.includes(effectiveRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
