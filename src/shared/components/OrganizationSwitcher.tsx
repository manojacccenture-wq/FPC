import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Building2,
  Shield,
  Check,
  ChevronDown,
  Search,
  X,
  Loader2,
} from 'lucide-react';
import { useAppSelector } from '../../app/store/hooks';
import type { UserMembership } from '../../features/auth/slices/authSlice';
import { useSwitchFpcMutation } from '../../features/auth/api/authApi';
import { useGetFpcsQuery } from '../../features/fpc/api/fpcApi';
import { useNotification } from '../notifications/NotificationProvider';
import { Badge } from './Badge';
import { cn } from '../utils/cn';

export interface OrganizationSwitcherProps {
  className?: string;
  isCollapsed?: boolean;
}

/**
 * Reusable Organization / FPC Workspace Switcher.
 * Provides role-governed switching for Platform Administrators (TsfAdmin)
 * between Central Administration (Platform Root) and all registered FPCs,
 * while strictly restricting FPC Administrators (FpcAdmin) to their assigned database memberships.
 */
export const OrganizationSwitcher: React.FC<OrganizationSwitcherProps> = ({
  className,
  isCollapsed = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { notify } = useNotification();
  const [switchFpc, { isLoading: isSwitching }] = useSwitchFpcMutation();

  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const activeFpcId = useAppSelector((state) => state.auth.activeFpcId);
  const activeRole = useAppSelector((state) => state.auth.activeRole);

  const isTsfAdmin = activeRole === 'TsfAdmin' || currentUser?.memberships?.some((m) => m.roleCode === 'TsfAdmin');
  const currentActiveFpcId = activeFpcId || currentUser?.activeFpcId;

  // For TSF Admin: fetch all registered FPCs from the authoritative platform query
  const { data: allFpcs = [], isLoading: isLoadingFpcs } = useGetFpcsQuery(undefined, {
    skip: !isTsfAdmin,
  });

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input on open
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Current active workspace display name
  const currentWorkspaceName = useMemo(() => {
    if (isTsfAdmin) {
      if (!currentActiveFpcId) {
        return 'TSF Central Administration';
      }
      return currentUser?.activeFpcName || 'Active FPC Workspace';
    }
    return currentUser?.activeFpcName || currentUser?.organizationName || 'Assigned FPC';
  }, [isTsfAdmin, currentActiveFpcId, currentUser]);

  // Filtered FPC options
  const filteredFpcs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (isTsfAdmin) {
      if (!q) return allFpcs;
      return allFpcs.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.code.toLowerCase().includes(q) ||
          (f.district && f.district.toLowerCase().includes(q)) ||
          (f.state && f.state.toLowerCase().includes(q))
      );
    }

    // FPC Admin: strictly filter assigned active memberships
    const userMemberships = currentUser?.memberships?.filter((m) => m.isActive) || [];
    if (!q) return userMemberships;
    return userMemberships.filter(
      (m) =>
        m.fpcName.toLowerCase().includes(q) ||
        (m.cin && m.cin.toLowerCase().includes(q))
    );
  }, [isTsfAdmin, allFpcs, currentUser?.memberships, searchQuery]);

  const handleSelectWorkspace = async (targetFpcId: string | null, targetName: string) => {
    // If already active, just close dropdown
    if (targetFpcId === (currentActiveFpcId ?? null)) {
      setIsOpen(false);
      return;
    }

    try {
      await switchFpc({ targetFpcId }).unwrap();
      notify(`Switched workspace to ${targetName}`, 'success');
      setIsOpen(false);
      setSearchQuery('');
    } catch (err: unknown) {
      const apiErr = err as { data?: { detail?: string } };
      notify(apiErr?.data?.detail || 'Failed to switch workspace.', 'danger');
    }
  };

  if (isCollapsed) {
    return (
      <div className={cn('relative inline-flex items-center justify-center', className)}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          title={`Active: ${currentWorkspaceName}. Click to switch.`}
          aria-label={`Active organization: ${currentWorkspaceName}`}
          disabled={isSwitching}
        >
          {isSwitching ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : !currentActiveFpcId ? (
            <Shield className="w-4 h-4 text-emerald-300" />
          ) : (
            <Building2 className="w-4 h-4 text-white/90" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={cn('relative w-full', className)}>
      {/* Trigger Button: seamlessly replaces static subtitle in sidebar header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isSwitching}
        className={cn(
          'group flex items-center justify-between gap-1.5 w-full text-left rounded-md px-1.5 py-0.5 -mx-1.5 transition-all',
          'hover:bg-white/10 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40',
          isOpen && 'bg-white/10 ring-1 ring-white/30'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={`Active Workspace: ${currentWorkspaceName} (Click to switch)`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {!currentActiveFpcId ? (
            <Shield className="w-3.5 h-3.5 text-emerald-300 shrink-0" aria-hidden="true" />
          ) : (
            <Building2 className="w-3.5 h-3.5 text-white/70 shrink-0" aria-hidden="true" />
          )}
          <span className="text-xs font-medium text-white/90 truncate max-w-[135px]">
            {currentWorkspaceName}
          </span>
        </div>
        <div className="flex items-center shrink-0 text-white/60 group-hover:text-white/90">
          {isSwitching ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 transition-transform duration-200',
                isOpen && 'rotate-180 text-white'
              )}
            />
          )}
        </div>
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Select organization workspace"
          className="absolute left-0 top-full mt-2 w-72 rounded-xl bg-white shadow-xl border border-neutral-200 text-neutral-900 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Search Header */}
          <div className="p-2.5 border-b border-neutral-100 bg-neutral-50/70">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search organizations..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg placeholder-neutral-400 text-neutral-900 focus:outline-hidden focus:border-brand focus:ring-1 focus:ring-brand"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-neutral-400 hover:text-neutral-600 p-0.5"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1.5 divide-y divide-neutral-100">
            {/* Section 1: Platform Root (Only for TsfAdmin) */}
            {isTsfAdmin && (
              <div className="pb-1.5 mb-1.5">
                <p className="px-2.5 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Platform Workspace
                </p>
                <button
                  type="button"
                  onClick={() => handleSelectWorkspace(null, 'TSF Central Administration')}
                  className={cn(
                    'w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left transition-colors',
                    !currentActiveFpcId
                      ? 'bg-emerald-50 text-emerald-950 font-semibold'
                      : 'hover:bg-neutral-100 text-neutral-800'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs truncate">TSF Central Administration</span>
                        <Badge variant="brand" size="sm" pill>
                          Root
                        </Badge>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-normal">
                        Platform-wide oversight
                      </span>
                    </div>
                  </div>
                  {!currentActiveFpcId && (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </button>
              </div>
            )}

            {/* Section 2: FPC Enterprises */}
            <div className="pt-1.5">
              <p className="px-2.5 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                {isTsfAdmin ? 'FPC Enterprises' : 'Your Assigned Organizations'}
              </p>

              {isLoadingFpcs ? (
                <div className="py-6 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading organizations...</span>
                </div>
              ) : filteredFpcs.length === 0 ? (
                <div className="py-5 text-center text-xs text-neutral-500">
                  No matching organizations found
                </div>
              ) : (
                <div className="space-y-0.5">
                  {isTsfAdmin
                    ? (filteredFpcs as typeof allFpcs).map((fpc) => {
                        const isSelected = fpc.id === currentActiveFpcId;
                        return (
                          <button
                            key={fpc.id}
                            type="button"
                            onClick={() => handleSelectWorkspace(fpc.id, fpc.name)}
                            className={cn(
                              'w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left transition-colors',
                              isSelected
                                ? 'bg-emerald-50 text-emerald-950 font-semibold'
                                : 'hover:bg-neutral-100 text-neutral-800'
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs truncate">{fpc.name}</span>
                                  {fpc.status === 'Active' ? (
                                    <Badge variant="success" size="sm" pill>
                                      Active
                                    </Badge>
                                  ) : (
                                    <Badge variant="warning" size="sm" pill>
                                      Onboarding
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-[10px] text-neutral-500 font-normal truncate block">
                                  {fpc.location || `${fpc.district}, ${fpc.state}`} • {fpc.code}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </button>
                        );
                      })
                    : (filteredFpcs as UserMembership[]).map((m) => {
                        const isSelected = m.fpcId === currentActiveFpcId;
                        return (
                          <button
                            key={m.fpcId}
                            type="button"
                            onClick={() => handleSelectWorkspace(m.fpcId, m.fpcName)}
                            className={cn(
                              'w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left transition-colors',
                              isSelected
                                ? 'bg-emerald-50 text-emerald-950 font-semibold'
                                : 'hover:bg-neutral-100 text-neutral-800'
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs truncate">{m.fpcName}</span>
                                  <Badge variant="info" size="sm" pill>
                                    {m.roleName}
                                  </Badge>
                                </div>
                                {m.cin && (
                                  <span className="text-[10px] text-neutral-500 font-normal truncate block">
                                    CIN: {m.cin}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
