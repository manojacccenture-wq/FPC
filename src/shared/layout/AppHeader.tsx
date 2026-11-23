import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Menu, HelpCircle } from 'lucide-react';
import { Button, Modal, NetworkStatusBadge } from '../components';
import { APP_CONFIG } from '../config/appConfig';
import { useAppSelector } from '../../app/store/hooks';

export interface AppHeaderProps {
  onToggleMobileMenu?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleMobileMenu,
}) => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const location = useLocation();
  const activeRole = useAppSelector((state) => state.auth.activeRole);

  // Dynamic role-aware breadcrumb mapping matching application location
  const { eyebrow, breadcrumb } = useMemo(() => {
    const pathname = location.pathname;

    // FPC Workspace Routes
    if (pathname.startsWith('/fpc/dashboard')) {
      return {
        eyebrow: 'ENTERPRISE WORKSPACE',
        breadcrumb: 'FPC Portal > Dashboard',
      };
    }
    if (pathname.startsWith('/fpc/register')) {
      return {
        eyebrow: 'STATUTORY ONBOARDING',
        breadcrumb: 'FPC Portal > Statutory Registration',
      };
    }

    // TSF Admin Routes
    if (pathname.startsWith('/admin/onboard')) {
      return {
        eyebrow: 'FPC MANAGEMENT',
        breadcrumb: 'FPC Management > Onboard New FPC',
      };
    }
    if (pathname.startsWith('/admin/all-fpcs')) {
      return {
        eyebrow: 'FPC MANAGEMENT',
        breadcrumb: 'FPC Management > All FPCs',
      };
    }
    if (pathname.startsWith('/admin/pending-approvals')) {
      return {
        eyebrow: 'FPC MANAGEMENT',
        breadcrumb: 'FPC Management > Pending Approvals',
      };
    }
    if (pathname.startsWith('/admin/monitoring')) {
      return {
        eyebrow: 'PROGRAMME MONITORING',
        breadcrumb: 'Monitoring > Operational Targets',
      };
    }
    if (pathname.startsWith('/admin/network-data')) {
      return {
        eyebrow: 'NETWORK OVERVIEW',
        breadcrumb: 'Network Data > State Directory',
      };
    }
    if (pathname.startsWith('/admin/analytics')) {
      return {
        eyebrow: 'ANALYTICS & REPORTING',
        breadcrumb: 'Analytics and MIS > Season Progress',
      };
    }
    if (pathname.startsWith('/admin/gallery')) {
      return {
        eyebrow: 'DIGITAL ARCHIVE',
        breadcrumb: 'Gallery > Field Documentation',
      };
    }
    if (pathname.startsWith('/admin/administration')) {
      return {
        eyebrow: 'SYSTEM SETTINGS',
        breadcrumb: 'Administration > Permissions & Roles',
      };
    }
    if (pathname.startsWith('/admin/dashboard')) {
      return {
        eyebrow: 'CENTRAL ADMINISTRATION',
        breadcrumb: 'Dashboard > System Overview',
      };
    }

    // Contextual Fallbacks
    if (activeRole === 'FpcAdmin') {
      return {
        eyebrow: 'ENTERPRISE WORKSPACE',
        breadcrumb: 'FPC Portal',
      };
    }
    if (activeRole === 'TsfAdmin') {
      return {
        eyebrow: 'CENTRAL ADMINISTRATION',
        breadcrumb: 'Dashboard > System Overview',
      };
    }

    return {
      eyebrow: 'WORKSPACE',
      breadcrumb: 'Home',
    };
  }, [location.pathname, activeRole]);

  return (
    <header className="h-16 bg-white border-b border-default page-header-spacing flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left: Mobile Toggle + Breadcrumb Info */}
      <div className="flex items-center gap-3.5 text-left">
        {onToggleMobileMenu && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            iconOnly
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-neutral-50 w-8 h-8"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}

        <div className="flex flex-col justify-center">
          <div className="floating-label font-bold text-brand leading-none mb-1">
            {eyebrow}
          </div>
          <div className="font-medium text-primary leading-tight">
            {breadcrumb}
          </div>
        </div>
      </div>

      {/* Right: Actions (Connectivity Status + Help + English Pill + Notification Bell) */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Global Connectivity Indicator (Offline persistent / Online 4s transient) */}
        <NetworkStatusBadge />

        {/* Global Help & Support Action */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          leadingIcon={<HelpCircle className="w-3.5 h-3.5 text-secondary" />}
          onClick={() => setIsHelpModalOpen(true)}
          className="h-8 px-3 sm:px-3.5 text-xs font-medium rounded-control border-default hover:bg-neutral-50 shadow-2xs"
          aria-label="Help and Support"
        >
          Help
        </Button>

        {/* English Pill Button */}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-8 px-4 sm:px-5 bg-brand-soft hover:bg-forest-100 text-brand rounded-control transition-colors shadow-2xs border-transparent font-medium"
        >
          English
        </Button>

        {/* Notification Bell with red badge */}
        <Button
          type="button"
          variant="ghost"
          size="xs"
          iconOnly
          aria-label="Notifications"
          className="relative p-2 rounded-full text-secondary hover:text-primary hover:bg-neutral-50 transition-colors w-8 h-8"
        >
          <Bell className="w-4 h-4 stroke-[2]" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger ring-2 ring-white"
            aria-hidden="true"
          />
        </Button>
      </div>

      {/* Centralized Help & Support Dialog */}
      <Modal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="Help & Support Desk"
        description="Operational assistance and technical support for FPC administrators."
        size="md"
        footer={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsHelpModalOpen(false)}
            className="text-xs"
          >
            Close
          </Button>
        }
      >
        <div className="space-y-4 text-xs text-left">
          <div className="p-3 bg-brand-soft/40 border border-brand/20 rounded-control">
            <h4 className="font-semibold text-brand text-sm mb-1">{APP_CONFIG.organization} Support</h4>
            <p className="text-secondary leading-relaxed">
              For queries regarding FPC onboarding, statutory documentation review, or technical issues, reach our dedicated operations desk.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 border border-default rounded-control bg-neutral-50">
              <span className="text-secondary block font-medium mb-1">Toll-Free Helpline</span>
              <a
                href={`tel:${APP_CONFIG.tollFreeHelpline}`}
                className="text-brand font-semibold hover:underline text-sm block"
              >
                {APP_CONFIG.tollFreeHelpline}
              </a>
              <span className="text-secondary text-[11px] block mt-0.5">Mon–Sat (9:00 AM – 6:00 PM)</span>
            </div>

            <div className="p-3 border border-default rounded-control bg-neutral-50">
              <span className="text-secondary block font-medium mb-1">Support Email</span>
              <a
                href={`mailto:${APP_CONFIG.supportEmail}`}
                className="text-brand font-semibold hover:underline text-sm block"
              >
                {APP_CONFIG.supportEmail}
              </a>
              <span className="text-secondary text-[11px] block mt-0.5">Response within 24 business hours</span>
            </div>
          </div>

          <div className="text-secondary text-[11px] leading-relaxed pt-1">
            Documentation guidelines, license validity rules, and user guides are aligned with the Ministry of Corporate Affairs (MCA) and Tata Steel Foundation compliance frameworks.
          </div>
        </div>
      </Modal>
    </header>
  );
};

export default AppHeader;
