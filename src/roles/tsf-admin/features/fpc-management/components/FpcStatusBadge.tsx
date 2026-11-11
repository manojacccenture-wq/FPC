import React from 'react';
import { Badge, type BadgeVariant } from '../../../../../shared/components';

/** FPC lifecycle statuses shown in FPC management tables. */
export type FpcStatus = 'Active' | 'Onboarding' | 'Overdue' | 'Inactive' | 'Compliance';

const STATUS_VARIANTS: Record<FpcStatus, BadgeVariant> = {
  Active: 'brand',
  Onboarding: 'info',
  Overdue: 'warning',
  Inactive: 'neutral',
  Compliance: 'danger',
};

export interface FpcStatusBadgeProps {
  status: FpcStatus;
  label: string;
}

/** Single source of truth for FPC status presentation (Badge variant + dot). */
export const FpcStatusBadge: React.FC<FpcStatusBadgeProps> = ({ status, label }) => (
  <Badge variant={STATUS_VARIANTS[status]} dot size="md">
    {label}
  </Badge>
);
