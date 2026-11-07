import React, { forwardRef } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type ButtonState = 'default' | 'hover' | 'focus' | 'pressed' | 'disabled' | 'loading';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  state?: ButtonState;
  loading?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
}

const variantStyles: Record<ButtonVariant, {
  default: string;
  hover: string;
  active: string;
  focus: string;
  disabled: string;
}> = {
  primary: {
    default: "bg-brand text-white border-transparent shadow-xs",
    hover: "hover:bg-brand-hover",
    active: "active:bg-brand-active",
    focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
    disabled: "disabled:bg-neutral-200 disabled:text-neutral-400 disabled:border-transparent",
  },
  secondary: {
    default: "bg-brand-soft text-brand border-transparent shadow-2xs",
    hover: "hover:bg-forest-100",
    active: "active:bg-forest-200",
    focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
    disabled: "disabled:bg-neutral-200 disabled:text-neutral-400 disabled:border-transparent",
  },
  outline: {
    default: "bg-white text-primary border-default hover:border-neutral-400 shadow-2xs",
    hover: "hover:bg-neutral-50",
    active: "active:bg-neutral-100",
    focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
    disabled: "disabled:bg-transparent disabled:text-neutral-400 disabled:border-default",
  },
  ghost: {
    default: "bg-transparent text-secondary border-transparent",
    hover: "hover:text-primary hover:bg-neutral-50",
    active: "active:bg-neutral-100",
    focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
    disabled: "disabled:bg-transparent disabled:text-neutral-400 disabled:border-transparent",
  },
  destructive: {
    default: "bg-danger text-white border-transparent shadow-2xs",
    hover: "hover:bg-[#8E161F]",
    active: "active:bg-[#700F17]",
    focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2",
    disabled: "disabled:bg-neutral-200 disabled:text-neutral-400 disabled:border-transparent",
  },
};

const forcedStateStyles: Record<ButtonVariant, Partial<Record<ButtonState, string>>> = {
  primary: {
    hover: "bg-brand-hover text-white",
    focus: "bg-brand text-white ring-2 ring-brand ring-offset-2",
    pressed: "bg-brand-active text-white",
    disabled: "bg-neutral-200 text-neutral-400 border-transparent cursor-not-allowed",
    loading: "bg-brand text-white cursor-wait",
  },
  secondary: {
    hover: "bg-forest-100 text-brand",
    focus: "bg-brand-soft text-brand ring-2 ring-brand ring-offset-2",
    pressed: "bg-forest-200 text-brand",
    disabled: "bg-neutral-200 text-neutral-400 border-transparent cursor-not-allowed",
    loading: "bg-brand-soft text-brand cursor-wait",
  },
  outline: {
    hover: "bg-neutral-50 text-primary border-neutral-400",
    focus: "bg-white text-primary border-brand ring-2 ring-brand ring-offset-2",
    pressed: "bg-neutral-100 text-primary border-brand",
    disabled: "bg-transparent text-neutral-400 border-default cursor-not-allowed",
    loading: "bg-white text-primary border-default cursor-wait",
  },
  ghost: {
    hover: "bg-neutral-50 text-primary",
    focus: "bg-transparent text-primary ring-2 ring-brand ring-offset-2",
    pressed: "bg-neutral-100 text-primary",
    disabled: "bg-transparent text-neutral-400 cursor-not-allowed",
    loading: "bg-transparent text-primary cursor-wait",
  },
  destructive: {
    hover: "bg-[#8E161F] text-white",
    focus: "bg-danger text-white ring-2 ring-danger ring-offset-2",
    pressed: "bg-[#700F17] text-white",
    disabled: "bg-neutral-200 text-neutral-400 border-transparent cursor-not-allowed",
    loading: "bg-danger text-white cursor-wait",
  },
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "h-7 min-h-7 px-2.5 text-xs leading-[16px]",
  sm: "h-9 min-h-9 px-3.5 text-[13px] leading-[18px]",
  md: "h-11 min-h-11 px-4 text-sm leading-[20px]",
  lg: "h-[52px] min-h-[52px] px-6 text-base leading-[24px]",
};

const iconOnlySizeStyles: Record<ButtonSize, string> = {
  xs: "w-7 h-7 min-w-7 min-h-7 p-0",
  sm: "w-9 h-9 min-w-9 min-h-9 p-0",
  md: "w-11 h-11 min-w-11 min-h-11 p-0",
  lg: "w-[52px] h-[52px] min-w-[52px] min-h-[52px] p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  state,
  type = 'button',
  loading = false,
  isLoading = false,
  loadingText = "Please wait",
  leadingIcon,
  trailingIcon,
  leftIcon,
  rightIcon,
  iconOnly = false,
  disabled = false,
  children,
  ...props
}, ref) => {
  const currentVariant = variantStyles[variant];
  const isActuallyLoading = loading || isLoading || state === 'loading';
  const isActuallyDisabled = disabled || state === 'disabled' || isActuallyLoading;
  const forcedState = state ? forcedStateStyles[variant][state] : undefined;

  const effectiveLeadingIcon = leadingIcon || leftIcon;
  const effectiveTrailingIcon = trailingIcon || rightIcon;

  const iconSizeClass = size === 'xs' || size === 'sm' ? "w-3.5 h-3.5" : size === 'lg' ? "w-5 h-5" : "w-4 h-4";

  return (
    <button
      ref={ref}
      type={type}
      disabled={isActuallyDisabled}
      className={cn(
        // Base structure & animation footprint
        "inline-flex items-center justify-center font-semibold rounded-control border transition-colors select-none shrink-0 cursor-pointer",
        // Default styling
        currentVariant.default,
        // Dynamic interaction states (only when no forcedState)
        !forcedState && !isActuallyDisabled && currentVariant.hover,
        !forcedState && !isActuallyDisabled && currentVariant.active,
        !forcedState && currentVariant.focus,
        !forcedState && currentVariant.disabled,
        // Sizing
        iconOnly ? iconOnlySizeStyles[size] : sizeStyles[size],
        // 44px minimum hit-target protection for S controls
        size === 'sm' && !iconOnly && "min-w-[44px]",
        // Forced state override
        forcedState,
        className
      )}
      {...props}
    >
      {isActuallyLoading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Clock className={cn(iconSizeClass, "stroke-[2.2] shrink-0", !state && "animate-pulse")} />
          {!iconOnly && <span>{loadingText}</span>}
        </span>
      ) : (
        <span className="inline-flex items-center justify-center gap-2">
          {effectiveLeadingIcon && <span className="shrink-0">{effectiveLeadingIcon}</span>}
          {!iconOnly && children}
          {iconOnly && children}
          {effectiveTrailingIcon && <span className="shrink-0">{effectiveTrailingIcon}</span>}
        </span>
      )}
    </button>
  );
});

Button.displayName = "Button";
