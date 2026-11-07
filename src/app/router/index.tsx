/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { TsfAdminLoginPage } from '../../pages/TsfAdminLoginPage';
import { tsfAdminRoutes } from '../../roles/tsf-admin/routing';
import { AuthGuard } from '../../shared/guards/AuthGuard';
import { FpcRegistrationPage } from '../../features/onboarding/pages/FpcRegistrationPage';

/**
 * LoginRoute: Renders the TSF Admin Login page,
 * or redirects directly to the dashboard if a valid session already exists.
 */
const LoginRoute = () => {
  const hasSession = Boolean(
    localStorage.getItem('fpc_auth_user') || sessionStorage.getItem('fpc_auth_user')
  );
  if (hasSession) {
    return <Navigate to="/admin/onboard" replace />;
  }
  return <TsfAdminLoginPage />;
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
    path: '/onboard/register',
    element: <FpcRegistrationPage />,
  },
  {
    path: '/invite/register',
    element: <FpcRegistrationPage />,
  },
  {
    path: '/',
    element: <AuthGuard redirectPath="/" />,
    children: [
      tsfAdminRoutes,
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
