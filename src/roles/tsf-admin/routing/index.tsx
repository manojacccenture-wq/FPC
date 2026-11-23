import { Navigate, type RouteObject } from 'react-router-dom';
import { TsfAdminLayout } from '../layout/TsfAdminLayout';
import { RoleGuard } from '../../../shared/guards/RoleGuard';
import { RouteErrorBoundary } from '../../../shared/components/RouteErrorBoundary';
import { lazyWithRetry } from '../../../shared/utils/lazyWithRetry';

const TsfAdminDashboardPage = lazyWithRetry(
  () => import('../features/dashboard/pages/TsfAdminDashboardPage'),
  'TsfAdminDashboardPage'
);
const OnboardNewFpcPage = lazyWithRetry(
  () => import('../features/fpc-management/pages/OnboardNewFpcPage'),
  'OnboardNewFpcPage'
);
const FpcInviteDetailsPage = lazyWithRetry(
  () => import('../features/fpc-management/pages/FpcInviteDetailsPage'),
  'FpcInviteDetailsPage'
);
const AllFpcsPage = lazyWithRetry(
  () => import('../features/fpc-management/pages/AllFpcsPage'),
  'AllFpcsPage'
);
const PendingApprovalsPage = lazyWithRetry(
  () => import('../features/fpc-management/pages/PendingApprovalsPage'),
  'PendingApprovalsPage'
);
const MonitoringPage = lazyWithRetry(
  () => import('../features/monitoring/pages/MonitoringPage'),
  'MonitoringPage'
);
const NetworkDataPage = lazyWithRetry(
  () => import('../features/network-data/pages/NetworkDataPage'),
  'NetworkDataPage'
);
const AnalyticsMisPage = lazyWithRetry(
  () => import('../features/analytics/pages/AnalyticsMisPage'),
  'AnalyticsMisPage'
);
const GalleryPage = lazyWithRetry(
  () => import('../features/gallery/pages/GalleryPage'),
  'GalleryPage'
);
const AdministrationPage = lazyWithRetry(
  () => import('../features/administration/pages/AdministrationPage'),
  'AdministrationPage'
);

export const tsfAdminRoutes: RouteObject = {
  path: 'admin',
  element: (
    <RoleGuard allowedRoles={['TsfAdmin']} fallbackUrl="/fpc/dashboard">
      <TsfAdminLayout />
    </RoleGuard>
  ),
  errorElement: <RouteErrorBoundary />,
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
