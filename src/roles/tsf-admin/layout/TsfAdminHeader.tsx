import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { Button } from '../../../shared/components';

export interface TsfAdminHeaderProps {
  onToggleMobileMenu?: () => void;
}

export const TsfAdminHeader: React.FC<TsfAdminHeaderProps> = ({
  onToggleMobileMenu
}) => {
  const location = useLocation();

  // Dynamic breadcrumb mapping matching the application state
  const getBreadcrumbInfo = (pathname: string) => {
    switch (pathname) {
      case '/admin/onboard':
        return {
          eyebrow: 'FPC MANAGEMENT',
          breadcrumb: 'FPC Management > Onboard New FPC'
        };
      case '/admin/all-fpcs':
        return {
          eyebrow: 'FPC MANAGEMENT',
          breadcrumb: 'FPC Management > All FPCs'
        };
      case '/admin/pending-approvals':
        return {
          eyebrow: 'FPC MANAGEMENT',
          breadcrumb: 'FPC Management > Pending Approvals'
        };
      case '/admin/monitoring':
        return {
          eyebrow: 'PROGRAMME MONITORING',
          breadcrumb: 'Monitoring > Operational Targets'
        };
      case '/admin/network-data':
        return {
          eyebrow: 'NETWORK OVERVIEW',
          breadcrumb: 'Network Data > State Directory'
        };
      case '/admin/analytics':
        return {
          eyebrow: 'ANALYTICS & REPORTING',
          breadcrumb: 'Analytics and MIS > Season Progress'
        };
      case '/admin/gallery':
        return {
          eyebrow: 'DIGITAL ARCHIVE',
          breadcrumb: 'Gallery > Field Documentation'
        };
      case '/admin/administration':
        return {
          eyebrow: 'SYSTEM SETTINGS',
          breadcrumb: 'Administration > Permissions & Roles'
        };
      case '/admin/dashboard':
      default:
        return {
          eyebrow: 'CENTRAL ADMINISTRATION',
          breadcrumb: 'Dashboard > System Overview'
        };
    }
  };

  const { eyebrow, breadcrumb } = getBreadcrumbInfo(location.pathname);

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-default px-4 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left: Mobile Toggle + Breadcrumb Info */}
      <div className="flex items-center gap-3 text-left">
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

      <div>
        <div className="text-[10px] sm:text-[11px] font-bold text-brand uppercase tracking-wider leading-none mb-1">
          {eyebrow}
        </div>
        <div className="text-xs sm:text-[13px] font-medium text-primary">
          {breadcrumb}
        </div>
      </div>
    </div>

  {/* Right: Actions (English Pill + Notification Bell) Reusing Shared Button */ }
  <div className="flex items-center gap-3 sm:gap-4">
    {/* English Pill Button */}
      <Button
          type="button"
      variant="secondary"
      size="sm"
      className="h-8 px-4 sm:px-5 bg-brand-soft hover:bg-forest-100 text-brand text-xs font-semibold rounded-control transition-colors shadow-2xs border-transparent"
    >
      English
  </Button>

  {/* Notification Bell with red badge */ }
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
        </Button >
      </div >
    </header >
  );
};

