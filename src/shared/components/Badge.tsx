import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';

export type BadgeVariant = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'count';
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
    container: "bg-[#E6F8F0] text-[#166B4B] border-transparent",
    dot: "bg-[#166B4B]",
  },
  success: {
    container: "bg-[#EEF9F4] text-[#166B4B] border-transparent",
    dot: "bg-[#166B4B]",
  },
  warning: {
    container: "bg-[#FFFAEB] text-[#946014] border-transparent",
    dot: "bg-[#946014]",
  },
  danger: {
    container: "bg-[#FFF1F0] text-[#A61A24] border-transparent",
    dot: "bg-[#A61A24]",
  },
  info: {
    container: "bg-[#EFF6FF] text-[#2A5C8E] border-transparent",
    dot: "bg-[#2A5C8E]",
  },
  neutral: {
    container: "bg-[#F0F4F2] text-[#5B6B65] border-transparent",
    dot: "bg-[#5B6B65]",
  },
  count: {
    container: "bg-[#FFFAEB] text-[#946014] border-transparent font-bold min-w-[20px] h-[20px] p-0 flex items-center justify-center",
    dot: "",
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-[11px] px-2 py-0.5 leading-[14px]",
  md: "text-[12px] px-2.5 py-1 leading-[16px]",
  lg: "text-[13px] px-3 py-1.5 leading-[18px]",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({
  className,
  variant = 'brand',
  size = 'sm',
  pill = true,
  dot = false,
  uppercase = false,
  children,
  ...props
}, ref) => {
  const currentVariant = variantStyles[variant];

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 font-medium whitespace-nowrap select-none border transition-colors",
        pill ? "rounded-full" : "rounded-[6px]",
        variant === 'count' ? currentVariant.container : cn(currentVariant.container, sizeStyles[size]),
        uppercase && "uppercase tracking-wider font-semibold text-[11px]",
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

