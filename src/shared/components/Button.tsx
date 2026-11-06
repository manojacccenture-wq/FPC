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
    default: "bg-[#166B4B] text-white border-transparent",
    hover: "hover:bg-[#0E593E]",
    active: "active:bg-[#0C4A34]",
    focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#166B4B] focus-visible:ring-offset-2",
    disabled: "disabled:bg-[#E1E8E6] disabled:text-[#9AA7A3] disabled:border-transparent",
  },
  secondary: {
    default: "bg-[#EDF8F3] text-[#166B4B] border-transparent",
    hover: "hover:bg-[#DCF2E9]",
    active: "active:bg-[#BCE5D3]",
    focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#166B4B] focus-visible:ring-offset-2",
    disabled: "disabled:bg-[#E1E8E6] disabled:text-[#9AA7A3] disabled:border-transparent",
  },
  outline: {
    default: "bg-transparent text-[#166B4B] border-[#166B4B]",
    hover: "hover:bg-[#EDF8F3]",
    active: "active:bg-[#DCF2E9]",
    focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#166B4B] focus-visible:ring-offset-2",
    disabled: "disabled:bg-transparent disabled:text-[#9AA7A3] disabled:border-[#E1E8E6]",
  },
  ghost: {
    default: "bg-transparent text-[#166B4B] border-transparent",
    hover: "hover:bg-[#EDF8F3]",
    active: "active:bg-[#DCF2E9]",
    focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#166B4B] focus-visible:ring-offset-2",
    disabled: "disabled:bg-transparent disabled:text-[#9AA7A3] disabled:border-transparent",
  },
  destructive: {
    default: "bg-[#A61A24] text-white border-transparent",
    hover: "hover:bg-[#8E161F]",
    active: "active:bg-[#700F17]",
    focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A61A24] focus-visible:ring-offset-2",
    disabled: "disabled:bg-[#E1E8E6] disabled:text-[#9AA7A3] disabled:border-transparent",
  },
};

// Static simulated state overrides for design system matrix presentation
const forcedStateStyles: Record<ButtonVariant, Partial<Record<ButtonState, string>>> = {
  primary: {
    hover: "bg-[#0E593E] text-white",
    focus: "bg-[#166B4B] text-white ring-2 ring-[#166B4B] ring-offset-2",
    pressed: "bg-[#0C4A34] text-white",
    disabled: "bg-[#E1E8E6] text-[#9AA7A3] border-transparent cursor-not-allowed",
    loading: "bg-[#166B4B] text-white cursor-wait",
  },
  secondary: {
    hover: "bg-[#DCF2E9] text-[#166B4B]",
    focus: "bg-[#EDF8F3] text-[#166B4B] ring-2 ring-[#166B4B] ring-offset-2",
    pressed: "bg-[#BCE5D3] text-[#166B4B]",
    disabled: "bg-[#E1E8E6] text-[#9AA7A3] border-transparent cursor-not-allowed",
    loading: "bg-[#EDF8F3] text-[#166B4B] cursor-wait",
  },
  outline: {
    hover: "bg-[#EDF8F3] text-[#166B4B] border-[#166B4B]",
    focus: "bg-transparent text-[#166B4B] border-[#166B4B] ring-2 ring-[#166B4B] ring-offset-2",
    pressed: "bg-[#DCF2E9] text-[#166B4B] border-[#166B4B]",
    disabled: "bg-transparent text-[#9AA7A3] border-[#E1E8E6] cursor-not-allowed",
    loading: "bg-transparent text-[#166B4B] border-[#166B4B] cursor-wait",
  },
  ghost: {
    hover: "bg-[#EDF8F3] text-[#166B4B]",
    focus: "bg-transparent text-[#166B4B] ring-2 ring-[#166B4B] ring-offset-2",
    pressed: "bg-[#DCF2E9] text-[#166B4B]",
    disabled: "bg-transparent text-[#9AA7A3] cursor-not-allowed",
    loading: "bg-transparent text-[#166B4B] cursor-wait",
  },
  destructive: {
    hover: "bg-[#8E161F] text-white",
    focus: "bg-[#A61A24] text-white ring-2 ring-[#A61A24] ring-offset-2",
    pressed: "bg-[#700F17] text-white",
    disabled: "bg-[#E1E8E6] text-[#9AA7A3] border-transparent cursor-not-allowed",
    loading: "bg-[#A61A24] text-white cursor-wait",
  },
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "h-7 px-2.5 text-xs leading-[16px]",            /* XS: 28px compact height */
  sm: "h-9 px-3 text-[13px] leading-[18px]",           /* S: 36px visual height */
  md: "h-11 px-4 text-sm leading-[20px]",             /* M: 44px default */
  lg: "h-[52px] px-6 text-base leading-[24px]",       /* L: 52px */
};

const iconOnlySizeStyles: Record<ButtonSize, string> = {
  xs: "w-7 h-7 p-0",
  sm: "w-9 h-9 p-0",
  md: "w-11 h-11 p-0",
  lg: "w-[52px] h-[52px] p-0",
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
        "inline-flex items-center justify-center font-medium rounded-[8px] border transition-colors select-none shrink-0 cursor-pointer",
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
