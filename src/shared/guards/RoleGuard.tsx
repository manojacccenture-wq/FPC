import React from 'react';
import type { UserRole } from '../config/appConfig';

export interface RoleGuardProps {
  currentRole: UserRole | string;
  allowedRoles: (UserRole | string)[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Ensures user has an authorized role before accessing role-gated sections.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  currentRole,
  allowedRoles,
  fallback = null,
  children,
}) => {
  if (!allowedRoles.includes(currentRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

