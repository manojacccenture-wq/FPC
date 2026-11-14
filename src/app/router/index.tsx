/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { TsfAdminLoginPage } from '../../pages/TsfAdminLoginPage';
import { TwoFactorVerificationPage } from '../../pages/TwoFactorVerificationPage';
import { tsfAdminRoutes } from '../../roles/tsf-admin/routing';
import { fpcAdminRoutes } from '../../roles/fpc-admin/routing';
import { AuthGuard } from '../../shared/guards/AuthGuard';
import { FpcRegistrationPage } from '../../features/onboarding/pages/FpcRegistrationPage';
import { useAppSelector } from '../store/hooks';

/**
 * LoginRoute: Renders the TSF Admin Login page,
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

  return !pendingTwoFactor ? <Navigate to="/login" replace /> : <TwoFactorVerificationPage />;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginRoute />,
  },
  {
    path: '/login',
    element: <LoginRoute />,
  },
  {
    path: '/verify-2fa',
    element: <TwoFactorRoute />,
  },
  {
    path: '/login/2fa',
    element: <TwoFactorRoute />,
  },
  {
    path: '/onboard/register',
    element: <FpcRegistrationPage />,
  },
  {
    path: '/invite/register',
    element: <FpcRegistrationPage />,
  },
  {
    path: '/',
    element: <AuthGuard redirectPath="/login" />,
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
