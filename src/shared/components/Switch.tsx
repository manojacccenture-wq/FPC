import React, { forwardRef, useId } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  offLabel?: string;
  checked?: boolean;
  loading?: boolean;
  error?: boolean | string;
  card?: boolean;
  containerClassName?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({
  className,
  containerClassName,
  label,
  offLabel,
  checked = false,
  loading = false,
  error = false,
  disabled = false,
  card = false,
  id,
  onChange,
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const hasError = Boolean(error);
  const isInteractive = !disabled && !loading;

  // Determine current active label
  const currentLabel = loading
    ? "Connecting..."
    : checked
      ? (label || "Connected · Sync enabled")
      : (offLabel || "Sync paused");

  const switchTrack = (
    <div className="relative flex items-center justify-center shrink-0">
      <input
        type="checkbox"
        id={inputId}
        ref={ref}
        disabled={!isInteractive}
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
        {...props}
      />
      {/* Pill Track */}
      <div
        className={cn(
          "w-11 h-6 rounded-full transition-colors duration-200 p-0.5 flex items-center",
          className,
          // Background states
          checked && !disabled && !hasError && "bg-brand",
          !checked && !disabled && !hasError && "bg-neutral-400",
          disabled && "bg-neutral-200 cursor-not-allowed",
          hasError && "bg-danger",
          // Focus state
          "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2"
        )}
      >
        {/* Thumb */}
        <div
          className={cn(
            "w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 flex items-center justify-center",
            checked ? "translate-x-5" : "translate-x-0",
            disabled && "bg-neutral-50"
          )}
        >
          {loading && <Loader2 className="w-3 h-3 text-brand animate-spin" />}
        </div>
      </div>
    </div>
  );

  // Card variant (enclosed row container)
  if (card) {
    return (
      <label
        htmlFor={inputId}
        className={cn(
          "min-h-11 px-4 py-2.5 rounded-card border transition-all duration-150 flex items-center gap-3 select-none cursor-pointer w-full",
          // Background & border states
          !checked && !hasError && !disabled && "bg-white border-default hover:bg-neutral-50 hover:border-neutral-400",
          checked && !hasError && !disabled && "bg-brand-soft border-brand",
          hasError && !disabled && "bg-white border-danger",
          disabled && "bg-neutral-50 border-default opacity-60 cursor-not-allowed",
          containerClassName
        )}
      >
        {switchTrack}
        <span className={cn(
          "text-sm font-medium",
          disabled ? "text-neutral-400" : "text-primary"
        )}>
          {currentLabel}
        </span>
      </label>
    );
  }

  // Standard standalone row with 44px hit target
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "min-h-11 inline-flex items-center gap-3 select-none cursor-pointer py-1.5",
        disabled && "cursor-not-allowed opacity-60",
        containerClassName
      )}
    >
      {switchTrack}
      {currentLabel && (
        <span className={cn(
          "text-sm font-normal",
          disabled ? "text-neutral-400" : "text-primary"
        )}>
          {currentLabel}
        </span>
      )}
    </label>
  );
});

Switch.displayName = "Switch";
