import React, { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn';
import { FormField } from './FormField';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: SelectSize;
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
  trailingIcon?: React.ReactNode;
}

const sizeClasses: Record<SelectSize, {
  select: string;
  icon: string;
}> = {
  sm: {
    select: "h-9 min-h-9 pl-3 pr-8",
    icon: "w-3.5 h-3.5 right-2.5",
  },
  md: {
    select: "h-11 min-h-11 pl-3.5 pr-10",
    icon: "w-4 h-4 right-3.5",
  },
  lg: {
    select: "h-[52px] min-h-[52px] pl-4 pr-12",
    icon: "w-5 h-5 right-4",
  },
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  id: explicitId,
  className,
  containerClassName,
  size = 'md',
  label,
  required,
  error,
  helperText,
  options = [],
  placeholder,
  disabled,
  children,
  trailingIcon,
  ...props
}, ref) => {
  const generatedId = useId();
  const id = explicitId || generatedId;
  const currentSize = sizeClasses[size];

  const selectElement = (
    <div className="relative w-full flex items-center">
      <select
        ref={ref}
        id={id}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-desc` : undefined}
        className={cn(
          // Base select styling
          "w-full rounded-control border bg-white text-primary font-normal appearance-none transition-colors cursor-pointer select-none",
          "outline-none",
          currentSize.select,
          // Border & focus
          "border-neutral-200 hover:border-neutral-400",
          "focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:border-transparent",
          // Error tokens
          error && "border-danger focus:ring-danger text-danger",
          // Disabled tokens
          disabled && "bg-neutral-50 text-neutral-400 border-default cursor-not-allowed",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
        {children}
      </select>

      <span className={cn("absolute text-secondary pointer-events-none flex items-center justify-center shrink-0", currentSize.icon)}>
        {trailingIcon || <ChevronDown className="w-full h-full stroke-[2]" />}
      </span>
    </div>
  );

  if (label || error || helperText) {
    return (
      <FormField
        id={id}
        label={label}
        required={required}
        error={error}
        helperText={helperText}
        className={containerClassName}
      >
        {selectElement}
      </FormField>
    );
  }

  return selectElement;
});

Select.displayName = "Select";
