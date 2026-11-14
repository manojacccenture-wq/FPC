import { Navigate, type RouteObject } from 'react-router-dom';
import { TsfAdminLayout } from '../layout/TsfAdminLayout';
import { RoleGuard } from '../../../shared/guards/RoleGuard';
import { TsfAdminDashboardPage } from '../features/dashboard/pages/TsfAdminDashboardPage';
import { OnboardNewFpcPage } from '../features/fpc-management/pages/OnboardNewFpcPage';
import { FpcInviteDetailsPage } from '../features/fpc-management/pages/FpcInviteDetailsPage';
import { AllFpcsPage } from '../features/fpc-management/pages/AllFpcsPage';
import { PendingApprovalsPage } from '../features/fpc-management/pages/PendingApprovalsPage';
import { MonitoringPage } from '../features/monitoring/pages/MonitoringPage';
import { NetworkDataPage } from '../features/network-data/pages/NetworkDataPage';
import { AnalyticsMisPage } from '../features/analytics/pages/AnalyticsMisPage';
import { GalleryPage } from '../features/gallery/pages/GalleryPage';
import { AdministrationPage } from '../features/administration/pages/AdministrationPage';

export const tsfAdminRoutes: RouteObject = {
  path: 'admin',
  element: (
    <RoleGuard allowedRoles={['TsfAdmin']} fallbackUrl="/fpc/dashboard">
      <TsfAdminLayout />
    </RoleGuard>
  ),
  children: [
    {
      index: true,
      element: <Navigate to="onboard" replace />,
    },
    {
      path: 'onboard',
      element: <OnboardNewFpcPage />,
    },
    {
      path: 'onboard/:id',
      element: <FpcInviteDetailsPage />,
    },
    {
      path: 'dashboard',
      element: <TsfAdminDashboardPage />,
    },
    {
      path: 'all-fpcs',
      element: <AllFpcsPage />,
    },
    {
      path: 'pending-approvals',
      element: <PendingApprovalsPage />,
    },
    {
      path: 'monitoring',
      element: <MonitoringPage />,
    },
    {
      path: 'network-data',
      element: <NetworkDataPage />,
    },
    {
      path: 'analytics',
      element: <AnalyticsMisPage />,
    },
    {
      path: 'gallery',
      element: <GalleryPage />,
    },
    {
      path: 'administration',
      element: <AdministrationPage />,
    },
  ],
};
export default tsfAdminRoutes;
