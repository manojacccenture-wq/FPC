import React, { useState, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Users,
  Search,
  X,
  LogOut,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { Button, Input } from '../../../shared/components';
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks';
import { setSidebarCollapsed, toggleSidebar } from '../../../shared/slices/uiSlice';
import fpcSeal from '../../../assets/fpc-seal.svg';

export interface TsfAdminSidebarProps {
  isMobileOpen?: boolean;
  isCollapsed?: boolean;
  onCloseMobile?: () => void;
  onSignOut?: () => void;
}

/** Static approvals counter shown on the sub-item badge (as per reference design). */
const APPROVALS_COUNT = 7;

export const TsfAdminSidebar: React.FC<TsfAdminSidebarProps> = ({
  isMobileOpen = false,
  isCollapsed = false,
  onCloseMobile,
  onSignOut
}) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [fpcManagementOpen, setFpcManagementOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const activeFpcId = useAppSelector((state) => state.auth.activeFpcId);

  // Dynamically resolve active FPC context and active membership from authenticated profile
  const currentActiveFpcId = activeFpcId || currentUser?.activeFpcId;
  const activeMembership = useMemo(
    () => currentUser?.memberships?.find((m) => m.fpcId === currentActiveFpcId),
    [currentUser?.memberships, currentActiveFpcId]
  );

  const activeFpcDisplayName =
    activeMembership?.fpcName || currentUser?.activeFpcName || '';

  const displayName = currentUser?.fullName?.trim() || '';

  const displayRole = useMemo(() => {
    if (activeMembership?.roleName) return activeMembership.roleName;
    if (currentUser?.activeRoleCode === 'TsfAdmin') return 'TSF Central Admin';
    return currentUser?.activeRoleCode || '';
  }, [activeMembership?.roleName, currentUser?.activeRoleCode]);

  const userInitials = useMemo(() => {
    if (!displayName) return '--';
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [displayName]);

  // Only the FPC Management group is shown in the sidebar for now.
  // Uncomment the entries below to restore the other workspace pages.
  const workspaceItems: Array<{ name: string; path: string; icon: LucideIcon }> = [
    // { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutGrid },
    // { name: 'Monitoring', path: '/admin/monitoring', icon: ClipboardPen },
  ];

  const fpcSubItems = [
    { name: 'All FPCs', path: '/admin/all-fpcs' },
    { name: 'Onboard New FPC', path: '/admin/onboard' },
    { name: 'Approvals', path: '/admin/pending-approvals', badge: APPROVALS_COUNT },
  ];

  // Operations navigation is temporarily hidden along with the other pages.
  // const operationsItems = [
  //   { name: 'Network Data', path: '/admin/network-data', icon: House },
  //   { name: 'Analytics and MIS', path: '/admin/analytics', icon: NotepadText },
  //   { name: 'Gallery', path: '/admin/gallery', icon: Box },
  //   { name: 'Administration', path: '/admin/administration', icon: User },
  // ];

  const query = searchQuery.trim().toLowerCase();
  const filteredWorkspaceItems = query
    ? workspaceItems.filter((i) => i.name.toLowerCase().includes(query))
    : workspaceItems;
  const filteredFpcSubItems = query
    ? fpcSubItems.filter((i) => i.name.toLowerCase().includes(query))
    : fpcSubItems;
  // const filteredOperationsItems = query
  //   ? operationsItems.filter((i) => i.name.toLowerCase().includes(query))
  //   : operationsItems;

  const showFpcSection =
    !query || 'fpc management'.includes(query) || filteredFpcSubItems.length > 0;
  const showWorkspaceSection = filteredWorkspaceItems.length > 0 || showFpcSection;
  const isAccordionOpen = fpcManagementOpen || Boolean(query);
  const activeFpcSubItem = fpcSubItems.find((sub) => location.pathname === sub.path);
  const isFpcManagementActive = Boolean(activeFpcSubItem);

  const handleFpcManagementClick = () => {
    if (isCollapsed) {
      dispatch(setSidebarCollapsed(false));
      setFpcManagementOpen(true);
      return;
    }
    setFpcManagementOpen((open) => !open);
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
        className={`app-sidebar fixed md:sticky top-0 left-0 h-screen z-50 ${isCollapsed ? 'is-collapsed' : ''
          } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Branding */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src={fpcSeal} alt="FPC seal" className="sidebar-brand-logo" />
            <div className="sidebar-brand-text">
              <h1 className="sidebar-brand-title">FPC Desk</h1>
              <p className="sidebar-brand-subtitle" title={activeFpcDisplayName}>
                {activeFpcDisplayName}
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

          <nav className="sidebar-nav" aria-label="Primary">
            {showWorkspaceSection && (
              <>
                <p className="sidebar-section-label">Workspace</p>
                <ul className="sidebar-menu">
                  {filteredWorkspaceItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.path}>
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
                            <span className="sidebar-tooltip-subtitle">Workspace</span>
                          </span>
                        </NavLink>
                      </li>
                    );
                  })}

                  {showFpcSection && (
                    <li>
                      <button
                        type="button"
                        onClick={handleFpcManagementClick}
                        aria-label={isCollapsed ? (activeFpcSubItem?.name || 'FPC Management') : undefined}
                        aria-expanded={isAccordionOpen}
                        className={`sidebar-link sidebar-accordion${isFpcManagementActive ? ' has-active-route' : ''
                          }`}
                      >
                        <Users className="sidebar-link-icon" aria-hidden="true" />
                        <span className="sidebar-link-label">FPC Management</span>
                        <span className="sidebar-tooltip" role="tooltip">
                          <span className="sidebar-tooltip-title">
                            {activeFpcSubItem?.name || 'FPC Management'}
                          </span>
                          <span className="sidebar-tooltip-subtitle">
                            {activeFpcSubItem ? 'FPC Management' : 'Workspace'}
                          </span>
                        </span>
                      </button>

                      {isAccordionOpen && (
                        <div className="sidebar-submenu">
                          {filteredFpcSubItems.map((sub) => (
                            <NavLink
                              key={sub.path}
                              to={sub.path}
                              onClick={() => onCloseMobile && onCloseMobile()}
                              title={isCollapsed ? sub.name : undefined}
                              className={({ isActive }) =>
                                `sidebar-sublink${isActive ? ' is-active' : ''}${sub.badge ? ' has-badge' : ''
                                }`
                              }
                            >
                              <span className="sidebar-link-label">{sub.name}</span>
                              {sub.badge ? (
                                <span className="sidebar-badge">{sub.badge}</span>
                              ) : null}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </li>
                  )}
                </ul>
              </>
            )}

            {/* Operations navigation is temporarily hidden.
            {filteredOperationsItems.length > 0 && (
              <>
                <p className="sidebar-section-label">Operations</p>
                <ul className="sidebar-menu">
                  {filteredOperationsItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.path}>
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
                            <span className="sidebar-tooltip-subtitle">Operations</span>
                          </span>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            */}
          </nav>
        </div>

        {/* Account */}
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
