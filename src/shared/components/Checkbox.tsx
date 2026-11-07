import React, { forwardRef, useId } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '../utils/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'checked'> {
  label?: React.ReactNode;
  checked?: boolean | 'mixed';
  error?: boolean | string;
  card?: boolean;
  size?: 'sm' | 'md';
  containerClassName?: string;
  labelClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  className,
  containerClassName,
  labelClassName,
  label,
  checked = false,
  error = false,
  disabled = false,
  card = false,
  size = 'md',
  id,
  onChange,
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const isMixed = checked === 'mixed';
  const isChecked = checked === true;
  const hasError = Boolean(error);
  const isSm = size === 'sm';

  const checkboxBox = (
    <div className={cn("relative flex items-center justify-center shrink-0", isSm ? "w-4 h-4 min-w-4 min-h-4" : "w-5 h-5 min-w-5 min-h-5")}>
      <input
        type="checkbox"
        id={inputId}
        ref={ref}
        disabled={disabled}
        checked={isChecked}
        onChange={onChange}
        className="sr-only peer"
        {...props}
      />
      {/* Visual Checkbox Box */}
      <div
        className={cn(
          isSm ? "w-4 h-4 rounded-[4px]" : "w-5 h-5 rounded-[4px]",
          "border transition-all duration-150 flex items-center justify-center",
          className,
          // Default unselected state
          !isChecked && !isMixed && !disabled && !hasError && "border-neutral-300 bg-white hover:border-brand",
          // Selected / Checked state
          (isChecked || isMixed) && !disabled && !hasError && "bg-brand border-brand text-white",
          // Disabled state
          disabled && "border-default bg-neutral-50 text-neutral-400 cursor-not-allowed",
          // Error state
          hasError && !disabled && "border-danger bg-white",
          hasError && (isChecked || isMixed) && "bg-danger text-white",
          // Focus state
          "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2"
        )}
      >
        {isChecked && <Check className={cn(isSm ? "w-3 h-3 stroke-[3]" : "w-3.5 h-3.5 stroke-[2.5]")} />}
        {isMixed && <Minus className={cn(isSm ? "w-3 h-3 stroke-[3]" : "w-3.5 h-3.5 stroke-[2.5]")} />}
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
          !isChecked && !isMixed && !hasError && !disabled && "bg-white border-default hover:bg-neutral-50 hover:border-neutral-400",
          (isChecked || isMixed) && !hasError && !disabled && "bg-brand-soft border-brand",
          hasError && !disabled && "bg-white border-danger",
          disabled && "bg-neutral-50 border-default opacity-60 cursor-not-allowed",
          containerClassName
        )}
      >
        {checkboxBox}
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
        isSm ? "inline-flex items-center gap-2 select-none cursor-pointer" : "min-h-11 inline-flex items-center gap-3 select-none cursor-pointer py-1.5",
        disabled && "cursor-not-allowed opacity-60",
        containerClassName
      )}
    >
      {checkboxBox}
      {label && (
        <span className={cn(
          isSm ? "text-xs font-normal" : "text-sm font-normal",
          disabled ? "text-neutral-400" : "text-primary",
          labelClassName
        )}
        >
          {label}
        </span>
      )}
    </label>
  );
});

Checkbox.displayName = "Checkbox";
