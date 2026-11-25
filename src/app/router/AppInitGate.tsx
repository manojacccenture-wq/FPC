import React from 'react';
import { useGetCurrentUserQuery } from '../../features/auth/api/authApi';

const PUBLIC_ROUTE_PREFIXES = [
  '/login',
  '/verify-2fa',
  '/login/2fa',
  '/forgot-password',
  '/reset-password',
  '/onboard/register',
  '/invite/register',
];

/**
 * Checks whether the target route is a publicly accessible route that does not
 * require session initialization or blocking gates before first paint.
 */
const isPublicPath = (pathname: string): boolean => {
  return PUBLIC_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
};

export const AppInitGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading } = useGetCurrentUserQuery();

  // If visiting an explicit public route (e.g. login, onboarding registration, password reset),
  // do not block first paint with a full-screen session verification spinner.
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const isPublic = isPublicPath(currentPath);

  if (isLoading && !isPublic) {
    return (
      <div className="min-h-screen w-full bg-neutral-50 flex flex-col items-center justify-center p-4 selection:bg-forest-200">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-9 h-9 border-3 border-brand/20 border-t-brand rounded-full animate-spin" />
          <p className="floating-label font-semibold text-brand">
            Verifying secure session...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
