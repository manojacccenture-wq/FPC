import type { LucideIcon } from 'lucide-react';

export interface NavigationSubItem {
  id: string;
  name: string;
  path: string;
  badge?: number | string;
  badgeTone?: 'default' | 'brand' | 'danger';
  dynamicBadgeKey?: 'pendingApprovals';
}

export interface NavigationItem {
  id: string;
  name: string;
  path?: string;
  icon: LucideIcon;
  badge?: number | string;
  subItems?: NavigationSubItem[];
  defaultOpen?: boolean;
}

export interface NavigationGroup {
  id: string;
  label?: string; // e.g. "Workspace", "Operations"
  items: NavigationItem[];
}

export interface RoleBrandingConfig {
  brandTitle: string;
  brandSubtitleDefault?: string;
  defaultOrganization?: string;
  brandLogoAlt: string;
}

export interface RoleNavigationConfig {
  branding: RoleBrandingConfig;
  groups: NavigationGroup[];
}

