import React, { useState, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Search,
  X,
  LogOut,
  ChevronRight,
  User,
} from 'lucide-react';
import { Button, Input } from '../components';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import { setSidebarCollapsed, toggleSidebar } from '../slices/uiSlice';
import { useGetFpcsQuery } from '../../features/fpc/api/fpcApi';
import { NAVIGATION_CONFIG } from './navigation.config';
import type { NavigationItem, NavigationSubItem } from './navigation.types';

export interface AppSidebarProps {
  isMobileOpen?: boolean;
  isCollapsed?: boolean;
  onCloseMobile?: () => void;
  onSignOut?: () => void;
}

interface LogoAvatarProps {
  url: string | null;
  alt: string;
}

/**
 * Keyed brand avatar component.
 * When the active FPC or logo URL changes, this component remounts with fresh error state.
 * If no logo exists or an image fails to load, gracefully displays the Lucide profile icon
 * inside the circular badge without fallback images.
 */
const LogoAvatar: React.FC<LogoAvatarProps> = ({ url, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (!url || hasError) {
    return (
      <div
        className="sidebar-brand-logo flex items-center justify-center bg-white/10 rounded-full border border-white/20 text-white shrink-0 select-none"
        aria-label={alt}
      >
        <User className="w-5 h-5 text-white/90 stroke-[1.75]" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className="sidebar-brand-logo object-cover"
      onError={() => setHasError(true)}
    />
  );
};

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isMobileOpen = false,
  isCollapsed = false,
  onCloseMobile,
  onSignOut,
}) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    'fpc-management': true,
  });

  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const activeFpcId = useAppSelector((state) => state.auth.activeFpcId);
  const activeRole = useAppSelector((state) => state.auth.activeRole);

  // Dynamic backend pending verification query for TSF Admin approvals badge
  const { data: fpcs = [] } = useGetFpcsQuery(undefined, {
    skip: activeRole !== 'TsfAdmin',
  });
  const pendingApprovalsCount = useMemo(() => {
    if (activeRole !== 'TsfAdmin' || !fpcs) return 0;
    return fpcs.filter((f) => f.statusLabel === 'Pending Review').length;
  }, [activeRole, fpcs]);

  // Server-authoritative role configuration - NEVER defaults blindly to TsfAdmin
  const roleConfig = useMemo(() => {
    if (activeRole === 'TsfAdmin') return NAVIGATION_CONFIG.TsfAdmin;
    if (activeRole === 'FpcAdmin') return NAVIGATION_CONFIG.FpcAdmin;
    return null;
  }, [activeRole]);

  // Dynamically resolve active FPC context and active membership from authenticated profile
  const currentActiveFpcId = activeFpcId || currentUser?.activeFpcId;
  const activeMembership = useMemo(
    () => currentUser?.memberships?.find((m) => m.fpcId === currentActiveFpcId),
    [currentUser?.memberships, currentActiveFpcId]
  );

  // Dynamic application / workspace branding title (Line 1)
  const brandTitle = useMemo(() => {
    if (currentUser?.workspaceTitle) return currentUser.workspaceTitle;
    if (roleConfig?.branding.brandTitle) return roleConfig.branding.brandTitle;
    if (activeRole === 'TsfAdmin') return 'TSF Administration';
    if (activeRole === 'FpcAdmin') return 'FPC Portal';
    return 'Portal';
  }, [currentUser, roleConfig, activeRole]);

  // Dynamic legal organization subtitle (Line 2)
  const brandSubtitle = useMemo(() => {
    if (activeRole === 'TsfAdmin') {
      // In an active FPC workspace, display the active FPC's actual legal name
      if (currentActiveFpcId || currentUser?.activeFpcName) {
        return (
          currentUser?.activeFpcName ||
          activeMembership?.fpcName ||
          currentUser?.organizationName ||
          'Active Workspace'
        );
      }
      // At central platform root, display Tata Steel Foundation
      return (
        currentUser?.organizationName ||
        roleConfig?.branding.defaultOrganization ||
        'Tata Steel Foundation'
      );
    }

    // For FPC Admin, strictly display the authenticated FPC enterprise name from /auth/me
    return (
      currentUser?.activeFpcName ||
      activeMembership?.fpcName ||
      currentUser?.organizationName ||
      'No Active Organization'
    );
  }, [
    activeRole,
    currentActiveFpcId,
    currentUser?.activeFpcName,
    currentUser?.organizationName,
    activeMembership?.fpcName,
    roleConfig?.branding.defaultOrganization,
  ]);

  // Dynamic logo URL reflecting active FPC enterprise context
  const activeFpcLogoUrl = useMemo(() => {
    return activeMembership?.logoUrl || currentUser?.activeFpcLogoUrl || null;
  }, [activeMembership?.logoUrl, currentUser?.activeFpcLogoUrl]);

  const displayName = currentUser?.fullName?.trim() || '';

  const displayRole = useMemo(() => {
    if (activeMembership?.roleName) return activeMembership.roleName;
    if (activeRole === 'TsfAdmin') return 'TSF Central Admin';
    if (activeRole === 'FpcAdmin') return 'FPC Administrator';
    return currentUser?.activeRoleCode || '';
  }, [activeMembership?.roleName, activeRole, currentUser?.activeRoleCode]);

  const userInitials = useMemo(() => {
    if (!displayName) return '--';
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [displayName]);

  // Accordion toggle handler
  const handleAccordionToggle = (accordionId: string) => {
    if (isCollapsed) {
      dispatch(setSidebarCollapsed(false));
      setOpenAccordions((prev) => ({ ...prev, [accordionId]: true }));
      return;
    }
    setOpenAccordions((prev) => ({ ...prev, [accordionId]: !prev[accordionId] }));
  };

  const query = searchQuery.trim().toLowerCase();

  // Filter navigation items by search query
  const filteredGroups = useMemo(() => {
    if (!roleConfig?.groups) return [];
    if (!query) return roleConfig.groups;

    return roleConfig.groups
      .map((group) => {
        const matchingItems = group.items
          .map((item) => {
            const itemMatches = item.name.toLowerCase().includes(query);
            const matchingSubItems = item.subItems?.filter((sub) =>
              sub.name.toLowerCase().includes(query)
            );

            if (itemMatches || (matchingSubItems && matchingSubItems.length > 0)) {
              return {
                ...item,
                subItems: matchingSubItems && matchingSubItems.length > 0 ? matchingSubItems : item.subItems,
              };
            }
            return null;
          })
          .filter(Boolean) as NavigationItem[];

        return {
          ...group,
          items: matchingItems,
        };
      })
      .filter((group) => group.items.length > 0);
  }, [roleConfig, query]);

  // Helper to resolve badge values (including dynamic backend approvals count)
  const resolveSubItemBadge = (subItem: NavigationSubItem) => {
    if (subItem.dynamicBadgeKey === 'pendingApprovals') {
      return pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined;
    }
    return subItem.badge;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`app-sidebar fixed md:relative inset-y-0 md:inset-auto left-0 h-full z-50 md:z-40 shrink-0 flex flex-col ${
          isCollapsed ? 'is-collapsed' : ''
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Branding */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <LogoAvatar
              key={activeFpcLogoUrl ?? 'no-logo'}
              url={activeFpcLogoUrl}
              alt={brandSubtitle || brandTitle}
            />
            <div className="sidebar-brand-text">
              <h1 className="sidebar-brand-title">{brandTitle}</h1>
              <p className="sidebar-brand-subtitle" title={brandSubtitle}>
                {brandSubtitle}
              </p>
            </div>
          </div>

          {/* Collapse / expand toggle */}
          <Button
            variant="ghost"
            size="xs"
            iconOnly
            className="sidebar-toggle hidden md:inline-flex"
            onClick={() => dispatch(toggleSidebar())}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronRight className="w-4 h-4 stroke-[1.75]" />
          </Button>

          {/* Mobile Close Button */}
          <Button
            type="button"
            variant="ghost"
            size="xs"
            iconOnly
            onClick={onCloseMobile}
            className="md:hidden p-1 rounded-md text-sidebar-muted hover:text-white hover:bg-sidebar-surface w-8 h-8 shrink-0"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="sidebar-body">
          {/* Search */}
          <div className="sidebar-search-wrap">
            <Input
              size="sm"
              containerClassName="sidebar-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pages"
              aria-label="Search pages"
              leadingIcon={<Search className="sidebar-search-icon" aria-hidden="true" />}
              trailingIcon={
                <span className="sidebar-search-hint" aria-hidden="true">⌘K</span>
              }
            />
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav" aria-label="Primary">
            {filteredGroups.map((group) => (
              <React.Fragment key={group.id}>
                {group.label && <p className="sidebar-section-label">{group.label}</p>}
                <ul className="sidebar-menu">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const hasSubItems = item.subItems && item.subItems.length > 0;

                    // Standalone nav link
                    if (!hasSubItems && item.path) {
                      return (
                        <li key={item.id}>
                          <NavLink
                            to={item.path}
                            onClick={() => onCloseMobile && onCloseMobile()}
                            aria-label={isCollapsed ? item.name : undefined}
                            className={({ isActive }) =>
                              `sidebar-link${isActive ? ' is-active' : ''}`
                            }
                          >
                            <Icon className="sidebar-link-icon" aria-hidden="true" />
                            <span className="sidebar-link-label">{item.name}</span>
                            <span className="sidebar-tooltip" role="tooltip">
                              <span className="sidebar-tooltip-title">{item.name}</span>
                              <span className="sidebar-tooltip-subtitle">{group.label || 'Workspace'}</span>
                            </span>
                          </NavLink>
                        </li>
                      );
                    }

                    // Accordion item with sub-items
                    const isAccordionOpen = Boolean(openAccordions[item.id] || query);
                    const activeSubItem = item.subItems?.find((sub) => location.pathname === sub.path);
                    const isAccordionActive = Boolean(activeSubItem);

                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => handleAccordionToggle(item.id)}
                          aria-label={isCollapsed ? (activeSubItem?.name || item.name) : undefined}
                          aria-expanded={isAccordionOpen}
                          className={`sidebar-link sidebar-accordion${
                            isAccordionActive ? ' has-active-route' : ''
                          }`}
                        >
                          <Icon className="sidebar-link-icon" aria-hidden="true" />
                          <span className="sidebar-link-label">{item.name}</span>
                          <span className="sidebar-tooltip" role="tooltip">
                            <span className="sidebar-tooltip-title">
                              {activeSubItem?.name || item.name}
                            </span>
                            <span className="sidebar-tooltip-subtitle">
                              {activeSubItem ? item.name : (group.label || 'Workspace')}
                            </span>
                          </span>
                        </button>

                        {isAccordionOpen && item.subItems && (
                          <div className="sidebar-submenu">
                            {item.subItems.map((sub) => {
                              const badgeValue = resolveSubItemBadge(sub);
                              return (
                                <NavLink
                                  key={sub.id}
                                  to={sub.path}
                                  onClick={() => onCloseMobile && onCloseMobile()}
                                  title={isCollapsed ? sub.name : undefined}
                                  className={({ isActive }) =>
                                    `sidebar-sublink${isActive ? ' is-active' : ''}${
                                      badgeValue ? ' has-badge' : ''
                                    }`
                                  }
                                >
                                  <span className="sidebar-link-label">{sub.name}</span>
                                  {badgeValue !== undefined && badgeValue !== null ? (
                                    <span className="sidebar-badge">{badgeValue}</span>
                                  ) : null}
                                </NavLink>
                              );
                            })}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Account / User Profile Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar" title={displayName}>
              {userInitials}
            </div>
            <div className="sidebar-user-text">
              <p className="sidebar-user-name" title={displayName}>{displayName}</p>
              <span className="sidebar-user-role">{displayRole}</span>
            </div>
            {onSignOut && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                iconOnly
                onClick={onSignOut}
                title="Sign out"
                aria-label="Sign out"
                className="shrink-0 rounded-md text-sidebar-muted hover:text-white hover:bg-sidebar-surface cursor-pointer transition-colors w-8 h-8"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
export default AppSidebar;
