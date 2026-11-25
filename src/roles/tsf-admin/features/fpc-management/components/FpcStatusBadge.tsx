import React from 'react';
import { Badge, type BadgeVariant } from '../../../../../shared/components';

/**
 * FPC and onboarding-invitation lifecycle statuses shown in FPC management tables.
 * Invitation rows surface their own lifecycle (Pending/InProgress/Completed/Expired/Revoked).
 */
export type FpcStatus =
  | 'Active'
  | 'Onboarding'
  | 'Overdue'
  | 'Inactive'
  | 'Compliance'
  | 'Pending'
  | 'InProgress'
  | 'Completed'
  | 'Expired'
  | 'Revoked';

const STATUS_VARIANTS: Record<FpcStatus, BadgeVariant> = {
  Active: 'brand',
  Onboarding: 'info',
  Overdue: 'warning',
  Inactive: 'neutral',
  Compliance: 'danger',
  Pending: 'neutral',
  InProgress: 'info',
  Completed: 'brand',
  Expired: 'warning',
  Revoked: 'warning',
};

export interface FpcStatusBadgeProps {
  status: FpcStatus;
  label: string;
  variant?: BadgeVariant;
}

/** Single source of truth for FPC status presentation (Badge variant + dot). */
export const FpcStatusBadge: React.FC<FpcStatusBadgeProps> = ({ status, label, variant }) => (
  <Badge variant={variant || STATUS_VARIANTS[status]} dot size="md">
    {label}
  </Badge>
);
