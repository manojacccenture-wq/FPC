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
    soft: "bg-[#EFF6FF] border-transparent",
    bordered: "bg-[#EFF6FF] border-[#DDEBFE]",
    card: "bg-[#EFF6FF] border-[#BFDBFE] shadow-xs",
    text: "text-[#2A5C8E]",
    iconClass: "text-[#2A5C8E]",
    defaultIcon: <ShieldCheck className="w-4 h-4 stroke-[2]" />,
  },
  success: {
    soft: "bg-[#EEF9F4] border-transparent",
    bordered: "bg-[#EEF9F4] border-[#DFF4EB]",
    card: "bg-[#EEF9F4] border-[#BCE5D3] shadow-xs",
    text: "text-[#166B4B]",
    iconClass: "text-[#166B4B]",
    defaultIcon: <CheckCircle2 className="w-4 h-4 stroke-[2]" />,
  },
  warning: {
    soft: "bg-[#FFFAEB] border-transparent",
    bordered: "bg-[#FFFAEB] border-[#FDF2D9]",
    card: "bg-[#FFFAEB] border-[#FDE68A] shadow-xs",
    text: "text-[#946014]",
    iconClass: "text-[#946014]",
    defaultIcon: <Clock className="w-4 h-4 stroke-[2]" />,
  },
  danger: {
    soft: "bg-[#FFF1F0] border-transparent",
    bordered: "bg-[#FFF1F0] border-[#FFE3DF]",
    card: "bg-[#FFF1F0] border-[#FECACA] shadow-xs",
    text: "text-[#A61A24]",
    iconClass: "text-[#A61A24]",
    defaultIcon: <CircleHelp className="w-4 h-4 stroke-[2]" />,
  },
  demo: {
    soft: "bg-[#EEF9F4] border-transparent",
    bordered: "bg-[#EEF9F4] border-[#DFF4EB]",
    card: "bg-[#EEF9F4] border-[#BCE5D3] shadow-xs",
    text: "text-[#166B4B]",
    iconClass: "text-[#166B4B]",
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
  role,
  ...props
}, ref) => {
  const currentTone = toneStyles[tone];
  const currentSize = sizeStyles[size];
  const alertRole = role || (tone === 'danger' ? 'alert' : 'status');
  const alertAriaLive = tone === 'danger' ? 'assertive' : 'polite';

  return (
    <div
      ref={ref}
      role={alertRole}
      aria-live={alertAriaLive}
      className={cn(
        // Base structure & tokens
        "w-full rounded-[8px] border flex items-center transition-all",
        currentTone[variant],
        currentTone.text,
        currentSize.container,
        currentSize.textSize,
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2.5 w-full">
        {showIcon && (
          <span className={cn("shrink-0 flex items-center justify-center", currentTone.iconClass)}>
            {icon || currentTone.defaultIcon}
          </span>
        )}

        <div className="flex-1 font-normal select-none">
          {title && <div className="font-semibold text-current mb-0.5">{title}</div>}
          <div>{children}</div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss alert"
            className="shrink-0 p-1 rounded hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer ml-auto"
          >
            <X className="w-3.5 h-3.5 text-current opacity-70 hover:opacity-100" />
          </button>
        )}
      </div>
    </div>
  );
});

Alert.displayName = "Alert";
