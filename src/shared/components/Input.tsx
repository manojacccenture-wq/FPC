import React, { forwardRef, useId } from 'react';
import { cn } from '../utils/cn';
import { FormField } from './FormField';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  label?: string;
  error?: string;
  helperText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

const sizeClasses: Record<InputSize, {
  input: string;
  icon: string;
  leadingPadding: string;
  trailingPadding: string;
}> = {
  sm: {
    input: "h-9 min-h-9 px-3",
    icon: "w-3.5 h-3.5",
    leadingPadding: "pl-9",
    trailingPadding: "pr-9",
  },
  md: {
    input: "h-11 min-h-11 px-3.5",
    icon: "w-4 h-4",
    leadingPadding: "pl-10",
    trailingPadding: "pr-10",
  },
  lg: {
    input: "h-[52px] min-h-[52px] px-4",
    icon: "w-5 h-5",
    leadingPadding: "pl-12",
    trailingPadding: "pr-12",
  },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  id: explicitId,
  className,
  containerClassName,
  type = 'text',
  size = 'md',
  label,
  required,
  error,
  helperText,
  leadingIcon,
  trailingIcon,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}, ref) => {
  const generatedId = useId();
  const id = explicitId || generatedId;
  const currentSize = sizeClasses[size];

  const effectiveLeading = leadingIcon || leftIcon;
  const effectiveTrailing = trailingIcon || rightIcon;

  const hasFieldWrapper = Boolean(label || error || helperText);

  const inputElement = (
    <div className={cn("relative w-full flex items-center", !hasFieldWrapper && containerClassName)}>
      {effectiveLeading && (
        <span className="absolute left-3.5 text-secondary pointer-events-none flex items-center justify-center shrink-0">
          {effectiveLeading}
        </span>
      )}

      <input
        ref={ref}
        id={id}
        type={type}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-desc` : undefined}
        className={cn(
          // Base input architecture
          "w-full rounded-control border bg-white text-primary font-normal placeholder:text-neutral-400 transition-colors",
          "outline-none appearance-none",
          currentSize.input,
          effectiveLeading && currentSize.leadingPadding,
          effectiveTrailing && currentSize.trailingPadding,
          // Border & focus tokens
          "border-neutral-200 hover:border-neutral-400",
          "focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:border-transparent",
          // Error tokens
          error && "border-danger focus:ring-danger text-danger",
          // Disabled & Read-only tokens
          disabled && "bg-neutral-50 text-neutral-400 border-default cursor-not-allowed",
          props.readOnly && "bg-neutral-50 text-primary border-neutral-200 cursor-default focus:ring-0",
          className
        )}
        {...props}
      />

      {effectiveTrailing && (
        <span className="absolute right-3.5 text-secondary flex items-center justify-center shrink-0">
          {effectiveTrailing}
        </span>
      )}
    </div>
  );

  if (hasFieldWrapper) {
    return (
      <FormField
        id={id}
        label={label}
        required={required}
        error={error}
        helperText={helperText}
        className={containerClassName}
      >
        {inputElement}
      </FormField>
    );
  }

  return inputElement;
});

Input.displayName = "Input";
