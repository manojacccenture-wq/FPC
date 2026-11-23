import { Navigate, type RouteObject } from 'react-router-dom';
import { FpcAdminLayout } from '../layout/FpcAdminLayout';
import { RoleGuard } from '../../../shared/guards/RoleGuard';
import { RouteErrorBoundary } from '../../../shared/components/RouteErrorBoundary';
import { lazyWithRetry } from '../../../shared/utils/lazyWithRetry';

const FpcAdminDashboardPage = lazyWithRetry(
  () => import('../features/dashboard/pages/FpcAdminDashboardPage'),
  'FpcAdminDashboardPage'
);
const FpcSelfRegistrationPage = lazyWithRetry(
  () => import('../features/registration/pages/FpcSelfRegistrationPage'),
  'FpcSelfRegistrationPage'
);

export const fpcAdminRoutes: RouteObject = {
  path: 'fpc',
  element: (
    <RoleGuard allowedRoles={['FpcAdmin', 'TsfAdmin']} fallbackUrl="/admin/onboard">
      <FpcAdminLayout />
    </RoleGuard>
  ),
  errorElement: <RouteErrorBoundary />,
  children: [
    {
      index: true,
      element: <Navigate to="dashboard" replace />,
    },
    {
      path: 'dashboard',
      element: <FpcAdminDashboardPage />,
    },
    {
      path: 'register',
      element: <FpcSelfRegistrationPage />,
    },
  ],
};
export default fpcAdminRoutes;
