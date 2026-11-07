import React, { forwardRef } from 'react';
import { ShieldCheck, CheckCircle2, Clock, CircleHelp, X } from 'lucide-react';
import { cn } from '../utils/cn';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger' | 'demo';
export type AlertVariant = 'soft' | 'bordered' | 'card';
export type AlertSize = 'sm' | 'md' | 'lg';

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: AlertTone;
  variant?: AlertVariant;
  size?: AlertSize;
  icon?: React.ReactNode;
  title?: React.ReactNode;
  onClose?: () => void;
  showIcon?: boolean;
}

const toneStyles: Record<AlertTone, {
  soft: string;
  bordered: string;
  card: string;
  text: string;
  iconClass: string;
  defaultIcon: React.ReactNode;
}> = {
  info: {
    soft: "bg-info-soft border-transparent",
    bordered: "bg-info-soft border-info-border",
    card: "bg-info-soft border-info-border shadow-xs",
    text: "text-info",
    iconClass: "text-info",
    defaultIcon: <ShieldCheck className="w-4 h-4 stroke-[2]" />,
  },
  success: {
    soft: "bg-success-soft border-transparent",
    bordered: "bg-success-soft border-success-border",
    card: "bg-success-soft border-success-border shadow-xs",
    text: "text-success",
    iconClass: "text-success",
    defaultIcon: <CheckCircle2 className="w-4 h-4 stroke-[2]" />,
  },
  warning: {
    soft: "bg-warning-soft border-transparent",
    bordered: "bg-warning-soft border-warning-border",
    card: "bg-warning-soft border-warning-border shadow-xs",
    text: "text-warning",
    iconClass: "text-warning",
    defaultIcon: <Clock className="w-4 h-4 stroke-[2]" />,
  },
  danger: {
    soft: "bg-danger-soft border-transparent",
    bordered: "bg-danger-soft border-danger-border",
    card: "bg-danger-soft border-danger-border shadow-xs",
    text: "text-danger",
    iconClass: "text-danger",
    defaultIcon: <CircleHelp className="w-4 h-4 stroke-[2]" />,
  },
  demo: {
    soft: "bg-brand-soft border-transparent",
    bordered: "bg-brand-soft border-forest-200",
    card: "bg-brand-soft border-forest-200 shadow-xs",
    text: "text-brand",
    iconClass: "text-brand",
    defaultIcon: <ShieldCheck className="w-4 h-4 stroke-[2]" />,
  },
};

const sizeStyles: Record<AlertSize, {
  container: string;
  iconSize: string;
  textSize: string;
}> = {
  sm: {
    container: "min-h-[34px] py-1.5 px-3",
    iconSize: "w-3.5 h-3.5",
    textSize: "text-[12px] leading-[18px]",
  },
  md: {
    container: "min-h-[38px] py-2 px-3.5",
    iconSize: "w-4 h-4",
    textSize: "text-[12.5px] leading-[18px]",
  },
  lg: {
    container: "min-h-[48px] py-3 px-4",
    iconSize: "w-5 h-5",
    textSize: "text-[13px] leading-[20px]",
  },
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(({
  className,
  tone = 'info',
  variant = 'bordered',
  size = 'md',
  icon,
  title,
  showIcon = true,
  onClose,
  children,
  ...props
}, ref) => {
  const currentTone = toneStyles[tone];
  const currentSize = sizeStyles[size];

  const variantClass = variant === 'soft'
    ? currentTone.soft
    : variant === 'card'
      ? currentTone.card
      : currentTone.bordered;

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "rounded-control border transition-all flex items-start gap-2.5 w-full select-none text-left",
        variantClass,
        currentSize.container,
        className
      )}
      {...props}
    >
      {showIcon && (
        <span className={cn("shrink-0 mt-0.5", currentTone.iconClass)}>
          {icon || currentTone.defaultIcon}
        </span>
      )}

      <div className={cn("flex-1 min-w-0 font-normal", currentTone.text, currentSize.textSize)}>
        {title && (
          <div className="font-semibold text-xs mb-0.5">
            {title}
          </div>
        )}
        <div>{children}</div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className={cn(
            "shrink-0 p-1 rounded-sm hover:bg-black/5 transition-colors cursor-pointer -mr-1 -mt-0.5",
            currentTone.text
          )}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
});

Alert.displayName = "Alert";
