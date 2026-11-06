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
          checked && !disabled && !hasError && "bg-[#166B4B]",
          !checked && !disabled && !hasError && "bg-[#75847D]",
          disabled && "bg-[#E1E8E6] cursor-not-allowed",
          hasError && "bg-[#A61A24]",
          // Focus state
          "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[#166B4B] peer-focus-visible:ring-offset-2"
        )}
      >
        {/* Thumb */}
        <div
          className={cn(
            "w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 flex items-center justify-center",
            checked ? "translate-x-5" : "translate-x-0",
            disabled && "bg-[#F5F8F7]"
          )}
        >
          {loading && <Loader2 className="w-3 h-3 text-[#166B4B] animate-spin" />}
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
          "min-h-[44px] px-4 py-2.5 rounded-[12px] border transition-all duration-150 flex items-center gap-3 select-none cursor-pointer w-full",
          // Background & border states
          !checked && !hasError && !disabled && "bg-white border-[#E1E8E6] hover:bg-[#F5F8F7] hover:border-[#B9C6C0]",
          checked && !hasError && !disabled && "bg-[#EDF8F3] border-[#166B4B]",
          hasError && !disabled && "bg-white border-[#A61A24]",
          disabled && "bg-[#F5F8F7] border-[#E1E8E6] opacity-60 cursor-not-allowed",
          containerClassName
        )}
      >
        {switchTrack}
        <span className={cn(
          "text-sm font-medium",
          disabled ? "text-[#9AA7A3]" : "text-[#0E1B16]"
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
        "min-h-[44px] inline-flex items-center gap-3 select-none cursor-pointer py-1.5",
        !isInteractive && "cursor-not-allowed opacity-60",
        containerClassName
      )}
    >
      {switchTrack}
      <span className={cn(
        "text-sm font-normal",
        disabled ? "text-[#9AA7A3]" : "text-[#0E1B16]"
      )}>
        {currentLabel}
      </span>
    </label>
  );
});

Switch.displayName = "Switch";

