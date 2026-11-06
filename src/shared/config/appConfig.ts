/**
 * Application Configuration for Farmer Producer Company (FPC) Management Platform
 * Centralized constants used across the application.
 */

export const APP_CONFIG = {
  appName: 'TSF FPC Management',
  appVersion: 'v1.0',
  organization: 'Tata Steel Foundation',
  supportEmail: 'admin@tsf.org',
  tollFreeHelpline: '1800-419-0022',
  defaultRole: 'TSF Admin',
  apiBaseUrl: import.meta.env.VITE_API_URL || '/api/v1',
};

export const ROLES = {
  TSF_ADMIN: 'TSF Admin',
  FPC_ADMIN: 'FPC Admin',
  FARMER: 'Farmer Member',
  COORDINATOR: 'Block Coordinator',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

