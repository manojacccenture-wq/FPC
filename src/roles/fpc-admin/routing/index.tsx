import { Navigate, type RouteObject } from 'react-router-dom';
import { FpcAdminLayout } from '../layout/FpcAdminLayout';
import { RoleGuard } from '../../../shared/guards/RoleGuard';
import { FpcAdminDashboardPage } from '../features/dashboard/pages/FpcAdminDashboardPage';
import { FpcSelfRegistrationPage } from '../features/registration/pages/FpcSelfRegistrationPage';

export const fpcAdminRoutes: RouteObject = {
  path: 'fpc',
  element: (
    <RoleGuard allowedRoles={['FpcAdmin', 'TsfAdmin']} fallbackUrl="/admin/onboard">
      <FpcAdminLayout />
    </RoleGuard>
  ),
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
