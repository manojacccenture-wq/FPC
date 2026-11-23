import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';

export type ProgressBarSize = 'xs' | 'sm' | 'md';
export type ProgressBarTone = 'brand' | 'success' | 'warning';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  percent: number;
  size?: ProgressBarSize;
  tone?: ProgressBarTone;
  barClassName?: string;
}

const sizeStyles: Record<ProgressBarSize, string> = {
  xs: "h-1",
  sm: "h-2",
  md: "h-2.5",
};

const toneStyles: Record<ProgressBarTone, string> = {
  brand: "bg-[#0F4C36]",
  success: "bg-success",
  warning: "bg-warning",
};

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(({
  percent,
  size = 'sm',
  tone = 'brand',
  className,
  barClassName,
  ...props
}, ref) => {
  const clampedPercent = Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={clampedPercent}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "w-full bg-neutral-100 rounded-full overflow-hidden select-none",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      <div
        style={{ width: `${clampedPercent}%` }}
        className={cn(
          "h-full rounded-full transition-all duration-300",
          toneStyles[tone],
          barClassName
        )}
      />
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

