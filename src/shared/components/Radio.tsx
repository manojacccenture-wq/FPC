import React, { forwardRef, useId } from 'react';
import { cn } from '../utils/cn';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  checked?: boolean;
  error?: boolean | string;
  card?: boolean;
  containerClassName?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(({
  className,
  containerClassName,
  label,
  checked = false,
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

  const radioCircle = (
    <div className="relative flex items-center justify-center shrink-0 w-5 h-5 min-w-5 min-h-5">
      <input
        type="radio"
        id={inputId}
        ref={ref}
        disabled={disabled}
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
        {...props}
      />
      {/* Visual Radio Circle */}
      <div
        className={cn(
          "w-5 h-5 rounded-full border transition-all duration-150 flex items-center justify-center",
          className,
          // Default unselected state
          !checked && !disabled && !hasError && "border-neutral-300 bg-white hover:border-brand",
          // Selected state
          checked && !disabled && !hasError && "border-brand bg-white",
          // Disabled state
          disabled && "border-default bg-neutral-50 text-neutral-400 cursor-not-allowed",
          // Error state
          hasError && !disabled && "border-danger bg-white",
          // Focus state
          "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2"
        )}
      >
        {checked && (
          <span
            className={cn(
              "w-2.5 h-2.5 rounded-full",
              hasError ? "bg-danger" : disabled ? "bg-neutral-400" : "bg-brand"
            )}
          />
        )}
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
        {radioCircle}
        {label && (
          <span className={cn(
            "text-sm font-medium",
            disabled ? "text-neutral-400" : "text-primary"
          )}>
            {label}
          </span>
        )}
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
      {radioCircle}
      {label && (
        <span className={cn(
          "text-sm font-normal",
          disabled ? "text-neutral-400" : "text-primary"
        )}>
          {label}
        </span>
      )}
    </label>
  );
});

Radio.displayName = "Radio";
