import {
  Users,
  LayoutGrid,
  FileText,
} from 'lucide-react';
import type { RoleNavigationConfig } from './navigation.types';

export const NAVIGATION_CONFIG: Record<'TsfAdmin' | 'FpcAdmin', RoleNavigationConfig> = {
  TsfAdmin: {
    branding: {
      brandTitle: 'TSF Administration',
      defaultOrganization: 'Tata Steel Foundation',
      brandSubtitleDefault: 'Tata Steel Foundation',
      brandLogoAlt: 'Tata Steel Foundation Seal',
    },
    groups: [
      {
        id: 'workspace',
        label: 'Workspace',
        items: [
          // Dashboard & Monitoring are preserved in configuration for seamless future un-hiding
          /*
          {
            id: 'tsf-dashboard',
            name: 'Dashboard',
            path: '/admin/dashboard',
            icon: LayoutGrid,
          },
          {
            id: 'tsf-monitoring',
            name: 'Monitoring',
            path: '/admin/monitoring',
            icon: ClipboardPen,
          },
          */
          {
            id: 'fpc-management',
            name: 'FPC Management',
            icon: Users,
            defaultOpen: true,
            subItems: [
              { id: 'all-fpcs', name: 'All FPCs', path: '/admin/all-fpcs' },
              { id: 'onboard-fpc', name: 'Onboard New FPC', path: '/admin/onboard' },
              {
                id: 'pending-approvals',
                name: 'Approvals',
                path: '/admin/pending-approvals',
                dynamicBadgeKey: 'pendingApprovals',
              },
            ],
          },
        ],
      },
      /*
      {
        id: 'operations',
        label: 'Operations',
        items: [
          { id: 'network-data', name: 'Network Data', path: '/admin/network-data', icon: House },
          { id: 'analytics', name: 'Analytics and MIS', path: '/admin/analytics', icon: NotepadText },
          { id: 'gallery', name: 'Gallery', path: '/admin/gallery', icon: Box },
          { id: 'administration', name: 'Administration', path: '/admin/administration', icon: User },
        ],
      },
      */
    ],
  },
  FpcAdmin: {
    branding: {
      brandTitle: 'FPC Portal',
      defaultOrganization: '',
      brandSubtitleDefault: '',
      brandLogoAlt: 'FPC Enterprise Seal',
    },
    groups: [
      {
        id: 'workspace',
        label: 'Workspace',
        items: [
          {
            id: 'fpc-dashboard',
            name: 'Dashboard',
            path: '/fpc/dashboard',
            icon: LayoutGrid,
          },
          {
            id: 'fpc-register',
            name: 'Statutory Registration',
            path: '/fpc/register',
            icon: FileText,
          },
        ],
      },
    ],
  },
};

