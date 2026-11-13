import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';

export type BadgeVariant = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'count' | 'offline';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  pill?: boolean;
  dot?: boolean;
  uppercase?: boolean;
}

const variantStyles: Record<BadgeVariant, {
  container: string;
  dot: string;
}> = {
  brand: {
    container: "bg-brand-soft text-brand border-forest-200/50",
    dot: "bg-brand",
  },
  success: {
    container: "bg-success-soft text-success border-success-border/50",
    dot: "bg-success",
  },
  warning: {
    container: "bg-warning-soft text-warning border-warning-border/50",
    dot: "bg-warning",
  },
  danger: {
    container: "bg-danger-soft text-danger border-danger-border/50",
    dot: "bg-danger",
  },
  info: {
    container: "bg-info-soft text-info border-info-border/50",
    dot: "bg-info",
  },
  neutral: {
    container: "bg-neutral-50 text-secondary border-default",
    dot: "bg-secondary",
  },
  count: {
    container: "bg-warning-soft text-warning border-warning-border/50 font-bold min-w-[20px] h-[20px] p-0 flex items-center justify-center",
    dot: "",
  },
  offline: {
    container: "bg-danger-soft text-danger border-danger-border/50",
    dot: "bg-danger",
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5",
  md: "px-2.5 py-1",
  lg: "px-3 py-1.5",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({
  className,
  variant = 'brand',
  size = 'sm',
  pill = true,
  dot = false,
  uppercase = false,
  children,
  style,
  ...props
}, ref) => {
  const currentVariant = variantStyles[variant];

  return (
    <span
      ref={ref}
      style={{
        fontSize: uppercase ? 'var(--font-size-floating-label)' : 'var(--font-size-badge)',
        lineHeight: 1.3,
        ...style,
      }}
      className={cn(
        "inline-flex items-center gap-1.5 font-medium whitespace-nowrap select-none border transition-colors",
        pill ? "rounded-full" : "rounded-[6px]",
        variant === 'count' ? currentVariant.container : cn(currentVariant.container, sizeStyles[size]),
        uppercase && "uppercase tracking-wider font-semibold",
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", currentVariant.dot)} />
      )}
      {children}
    </span>
  );
});

Badge.displayName = "Badge";
