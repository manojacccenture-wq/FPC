import React from 'react';
import { Badge } from './Badge';
import { useAppSelector } from '../../app/store/hooks';

export interface NetworkStatusBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Global Connectivity Status Indicator.
 *
 * Displays:
 * - Red "Offline" badge with dot whenever device loses connectivity (persists indefinitely while offline).
 * - Green "Online" badge with dot when connectivity is restored (persists for 4 seconds, then automatically hides).
 * - Hidden by default on initial application load when online.
 *
 * Adheres strictly to zero-useEffect rule: state and auto-hide timing are managed centrally
 * in Redux syncSlice and networkMonitor.
 */
export const NetworkStatusBadge: React.FC<NetworkStatusBadgeProps> = ({
  className,
  size = 'sm',
}) => {
  const badgeVisibility = useAppSelector((state) => state.sync.badgeVisibility);

  if (badgeVisibility === 'hidden') {
    return null;
  }

  const isOnline = badgeVisibility === 'online';

  return (
    <Badge
      variant={isOnline ? 'success' : 'offline'}
      size={size}
      dot
      aria-live="polite"
      role="status"
      className={className}
    >
      {isOnline ? 'Online' : 'Offline'}
    </Badge>
  );
};

