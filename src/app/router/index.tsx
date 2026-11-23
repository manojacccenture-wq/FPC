/* eslint-disable react-refresh/only-export-components */
import { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { TsfAdminLoginPage } from '../../pages/TsfAdminLoginPage';
import { tsfAdminRoutes } from '../../roles/tsf-admin/routing';
import { fpcAdminRoutes } from '../../roles/fpc-admin/routing';
import { AuthGuard } from '../../shared/guards/AuthGuard';
import { PageLoadingFallback } from '../../shared/components/PageLoadingFallback';
import { RouteErrorBoundary } from '../../shared/components/RouteErrorBoundary';
import { lazyWithRetry } from '../../shared/utils/lazyWithRetry';
import { useAppSelector } from '../store/hooks';

// Eagerly loaded for immediate first-paint login experience
// (TsfAdminLoginPage is imported directly above)

// Lazily loaded routes
const TwoFactorVerificationPage = lazyWithRetry(
  () => import('../../pages/TwoFactorVerificationPage'),
  'TwoFactorVerificationPage'
);
const FpcRegistrationPage = lazyWithRetry(
  () => import('../../features/onboarding/pages/FpcRegistrationPage'),
  'FpcRegistrationPage'
);
const ForgotPasswordPage = lazyWithRetry(
  () => import('../../pages/ForgotPasswordPage'),
  'ForgotPasswordPage'
);
const ResetPasswordPage = lazyWithRetry(
  () => import('../../pages/ResetPasswordPage'),
  'ResetPasswordPage'
);

/**
 * LoginRoute: Renders the TSF Admin Login page eagerly,
 * or redirects directly to the authenticated admin section if already authenticated.
 */
const LoginRoute = () => {
  const { isAuthenticated, isInitialized, activeRole } = useAppSelector((state) => state.auth);

  if (!isInitialized) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={activeRole === 'FpcAdmin' ? '/fpc/dashboard' : '/admin/onboard'} replace />;
  }

  return <TsfAdminLoginPage />;
};

/**
 * TwoFactorRoute: Renders the 2FA verification page if a challenge is pending,
 * or redirects to the dashboard if already authenticated,
 * or redirects back to login if no challenge is pending.
 */
const TwoFactorRoute = () => {
  const { isAuthenticated, pendingTwoFactor, isInitialized, activeRole } = useAppSelector((state) => state.auth);

  if (!isInitialized) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={activeRole === 'FpcAdmin' ? '/fpc/dashboard' : '/admin/onboard'} replace />;
  }

  return !pendingTwoFactor ? (
    <Navigate to="/login" replace />
  ) : (
    <Suspense fallback={<PageLoadingFallback fullScreen />}>
      <TwoFactorVerificationPage />
    </Suspense>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginRoute />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/login',
    element: <LoginRoute />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/verify-2fa',
    element: <TwoFactorRoute />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/login/2fa',
    element: <TwoFactorRoute />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/forgot-password',
    element: (
      <Suspense fallback={<PageLoadingFallback fullScreen />}>
        <ForgotPasswordPage />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/reset-password',
    element: (
      <Suspense fallback={<PageLoadingFallback fullScreen />}>
        <ResetPasswordPage />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/onboard/register',
    element: (
      <Suspense fallback={<PageLoadingFallback fullScreen />}>
        <FpcRegistrationPage />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/invite/register',
    element: (
      <Suspense fallback={<PageLoadingFallback fullScreen />}>
        <FpcRegistrationPage />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/',
    element: <AuthGuard redirectPath="/login" />,
    errorElement: <RouteErrorBoundary />,
    children: [
      tsfAdminRoutes,
      fpcAdminRoutes,
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
