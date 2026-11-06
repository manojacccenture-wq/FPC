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
    <div className="relative flex items-center justify-center shrink-0 w-5 h-5">
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
          !checked && !disabled && !hasError && "border-[#B9C6C0] bg-white hover:border-[#166B4B]",
          // Selected state
          checked && !disabled && !hasError && "border-[#166B4B] bg-white",
          // Disabled state
          disabled && "border-[#E1E8E6] bg-[#F5F8F7] text-[#9AA7A3] cursor-not-allowed",
          // Error state
          hasError && !disabled && "border-[#A61A24] bg-white",
          // Focus state
          "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[#166B4B] peer-focus-visible:ring-offset-2"
        )}
      >
        {checked && (
          <span
            className={cn(
              "w-2.5 h-2.5 rounded-full",
              hasError ? "bg-[#A61A24]" : disabled ? "bg-[#9AA7A3]" : "bg-[#166B4B]"
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
          "min-h-[44px] px-4 py-2.5 rounded-[12px] border transition-all duration-150 flex items-center gap-3 select-none cursor-pointer w-full",
          // Background & border states
          !checked && !hasError && !disabled && "bg-white border-[#E1E8E6] hover:bg-[#F5F8F7] hover:border-[#B9C6C0]",
          checked && !hasError && !disabled && "bg-[#EDF8F3] border-[#166B4B]",
          hasError && !disabled && "bg-white border-[#A61A24]",
          disabled && "bg-[#F5F8F7] border-[#E1E8E6] opacity-60 cursor-not-allowed",
          containerClassName
        )}
      >
        {radioCircle}
        {label && (
          <span className={cn(
            "text-sm font-medium",
            disabled ? "text-[#9AA7A3]" : "text-[#0E1B16]"
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
        "min-h-[44px] inline-flex items-center gap-3 select-none cursor-pointer py-1.5",
        disabled && "cursor-not-allowed opacity-60",
        containerClassName
      )}
    >
      {radioCircle}
      {label && (
        <span className={cn(
          "text-sm font-normal",
          disabled ? "text-[#9AA7A3]" : "text-[#0E1B16]"
        )}>
          {label}
        </span>
      )}
    </label>
  );
});

Radio.displayName = "Radio";

