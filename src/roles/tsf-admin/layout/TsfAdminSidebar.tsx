import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  LineChart,
  Users,
  ChevronDown,
  ChevronUp,
  Globe,
  FileText,
  Image as GalleryIcon,
  SlidersHorizontal,
  Search,
  X,
  LogOut
} from 'lucide-react';
import { Button, Input } from '../../../shared/components';
import { useAppSelector } from '../../../app/store/hooks';

export interface TsfAdminSidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onSignOut?: () => void;
}

export const TsfAdminSidebar: React.FC<TsfAdminSidebarProps> = ({
  isMobileOpen = false,
  onCloseMobile,
  onSignOut
}) => {
  const location = useLocation();
  const [fpcManagementOpen, setFpcManagementOpen] = useState(true);
  const [oneGroupActive, setOneGroupActive] = useState(true);
  const [allSyncedActive, setAllSyncedActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const displayName = currentUser?.fullName || 'TSF Central Admin';
  const displayRole = currentUser?.activeRoleCode === 'TsfAdmin'
    ? 'TSF Central Admin'
    : (currentUser?.activeRoleCode || 'Administrator');
  const activeFpcDisplayName = currentUser?.activeFpcName || 'TSF Programme';

  // Primary navigation links configuration
  // NOTE: Items marked hidden: true are temporarily hidden from the visible sidebar.
  // Set hidden: false (or remove the flag) to restore their visibility at any time.
  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutGrid,
      hidden: true, // Temporarily hidden
    },
    {
      name: 'Monitoring',
      path: '/admin/monitoring',
      icon: LineChart,
      hidden: true, // Temporarily hidden
    },
  ];

  const fpcSubItems = [
    { name: 'All FPCs', path: '/admin/all-fpcs' },
    { name: 'Onboard New FPC', path: '/admin/onboard' },
    { name: 'Pending Approvals', path: '/admin/pending-approvals' },
  ];

  // Secondary navigation links configuration
  // Set hidden: false (or remove the flag) to restore their visibility at any time.
  const secondaryNavItems = [
    {
      name: 'Network Data',
      path: '/admin/network-data',
      icon: Globe,
      hidden: true, // Temporarily hidden
    },
    {
      name: 'Analytics and MIS',
      path: '/admin/analytics',
      icon: FileText,
      hidden: true, // Temporarily hidden
    },
    {
      name: 'Gallery',
      path: '/admin/gallery',
      icon: GalleryIcon,
      hidden: true, // Temporarily hidden
    },
    {
      name: 'Administration',
      path: '/admin/administration',
      icon: SlidersHorizontal,
      hidden: true, // Temporarily hidden
    },
  ];

  const visibleNavItems = navItems.filter((i) => !i.hidden);
  const visibleSecondaryNavItems = secondaryNavItems.filter((i) => !i.hidden);

  const query = searchQuery.trim().toLowerCase();
  const filteredNavItems = query
    ? visibleNavItems.filter((i) => i.name.toLowerCase().includes(query))
    : visibleNavItems;
  const filteredFpcSubItems = query
    ? fpcSubItems.filter((i) => i.name.toLowerCase().includes(query))
    : fpcSubItems;
  const filteredSecondaryNavItems = query
    ? visibleSecondaryNavItems.filter((i) => i.name.toLowerCase().includes(query))
    : visibleSecondaryNavItems;

  const showFpcSection =
    !query || 'fpc management'.includes(query) || filteredFpcSubItems.length > 0;
  const isAccordionOpen = fpcManagementOpen || Boolean(query);

  const isFpcManagementActive = fpcSubItems.some(sub => location.pathname === sub.path);

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
        className={`fixed md:sticky top-0 left-0 h-screen w-[220px] lg:w-[230px] shrink-0 bg-sidebar-bg text-white flex flex-col justify-between z-50 transition-transform duration-200 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        {/* Top Section: Branding, Search & Nav */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 select-none scrollbar-thin">

          {/* Header Branding */}
          <div className="flex items-center justify-between pb-1">
            <div>
              <h1 className="brand-title font-bold text-white tracking-tight leading-tight">
                FPC Desk
              </h1>
              <small className="text-sidebar-muted font-medium truncate max-w-[140px] block" title={activeFpcDisplayName}>
                {activeFpcDisplayName}
              </small>
            </div>
              {/* Mobile Close Button: Reusing Shared Button */}
            <Button
              type="button"
              variant="ghost"
              size="xs"
              iconOnly
              onClick={onCloseMobile}
              className="md:hidden p-1 rounded-md text-sidebar-muted hover:text-white hover:bg-sidebar-surface w-7 h-7"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Box: Reusing Shared Input */}
        <div className="space-y-1">
          <Input
            size="sm"
            leadingIcon={<Search className="w-3.5 h-3.5 text-sidebar-muted shrink-0" />}
            placeholder="Search menu ⌘K"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 bg-sidebar-surface border-brand/40 text-xs text-white placeholder:text-sidebar-muted rounded-xl hover:border-brand/60 focus:ring-brand"
          />
          <small className="text-sidebar-muted font-normal px-1 block">
            Search pages Ctrl K
          </small>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 pt-1 text-xs">
          {/* Top items */}
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onCloseMobile && onCloseMobile()}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-control font-medium transition-colors cursor-pointer ${isActive
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-sidebar-icon hover:text-white hover:bg-sidebar-surface/50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 stroke-[2]" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          {/* FPC Management Accordion: Reusing Shared Button */}
          {showFpcSection && (
            <div className="pt-0.5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setFpcManagementOpen(!fpcManagementOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-control font-medium transition-colors ${
                  isFpcManagementActive || isAccordionOpen
                    ? 'text-white hover:bg-sidebar-surface/50'
                    : 'text-sidebar-icon hover:text-white hover:bg-sidebar-surface/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 shrink-0 stroke-[2]" />
                  <span>FPC Management</span>
                </div>
                {isAccordionOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-sidebar-muted" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-sidebar-muted" />
                )}
              </Button>

              {/* Sub-menu items */}
              {isAccordionOpen && (
                <div className="mt-1 space-y-1">
                  {filteredFpcSubItems.map((sub) => (
                    <NavLink
                      key={sub.path}
                      to={sub.path}
                      onClick={() => onCloseMobile && onCloseMobile()}
                      className={({ isActive }) =>
                        `block pl-9 pr-3 py-1.5 rounded-control font-medium transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-brand text-white shadow-xs'
                            : 'text-sidebar-icon hover:text-white hover:bg-sidebar-surface/40'
                        }`
                      }
                    >
                      {sub.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Secondary items */}
          {filteredSecondaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onCloseMobile && onCloseMobile()}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-control font-medium transition-colors cursor-pointer ${isActive
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-sidebar-icon hover:text-white hover:bg-sidebar-surface/50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 stroke-[2]" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
          </nav>
        </div>

        {/* Bottom Section: Controls & User Profile */}
        <div className="p-3.5 border-t border-sidebar-surface/60 space-y-2.5 bg-sidebar-bg">
          {/* Status Switch 1: One group at a time */}
          <div
            onClick={() => setOneGroupActive(!oneGroupActive)}
            className="bg-white rounded-xl px-2.5 py-2 flex items-center justify-between cursor-pointer shadow-2xs select-none hover:bg-neutral-50 transition-colors"
          >
            <div className={`w-7 h-4 rounded-full p-0.5 transition-colors flex items-center ${
              oneGroupActive ? 'bg-brand justify-end' : 'bg-neutral-300 justify-start'
            }`}>
              <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
            </div>
            <small className="font-medium text-primary ml-2 flex-1 text-left">
              One group at a time
            </small>
          </div>

          {/* Status Switch 2: Connected / All changes synced */}
          <div
            onClick={() => setAllSyncedActive(!allSyncedActive)}
            className="bg-white rounded-xl px-2.5 py-2 flex items-center justify-between cursor-pointer shadow-2xs select-none hover:bg-neutral-50 transition-colors"
          >
            <div className={`w-7 h-4 rounded-full p-0.5 transition-colors flex items-center ${
              allSyncedActive ? 'bg-brand justify-end' : 'bg-neutral-300 justify-start'
            }`}>
              <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
            </div>
            <small className="font-medium text-primary ml-2 flex-1 text-left leading-tight">
              Connected / All changes synced
            </small>
          </div>

          {/* User Account / Session Profile */}
          <div className="pt-1 flex items-center justify-between">
            <div className="text-left">
              <p className="text-xs font-semibold text-white leading-tight truncate max-w-[130px]" title={displayName}>
                {displayName}
              </p>
              <small className="text-sidebar-muted font-medium truncate max-w-[130px] block">
                {displayRole} &lt;
              </small>
            </div>
            {onSignOut && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                iconOnly
                onClick={onSignOut}
                title="Sign out"
                className="p-1.5 rounded-md text-sidebar-muted hover:text-white hover:bg-sidebar-surface cursor-pointer transition-colors w-7 h-7"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

