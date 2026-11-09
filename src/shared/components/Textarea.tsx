import React, { forwardRef, useId } from 'react';
import { cn } from '../utils/cn';
import { FormField } from './FormField';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  id: explicitId,
  className,
  containerClassName,
  label,
  required,
  error,
  helperText,
  disabled,
  maxLength,
  showCount,
  value,
  defaultValue,
  rows = 3,
  ...props
}, ref) => {
  const generatedId = useId();
  const id = explicitId || generatedId;

  const currentLength = typeof value === 'string' ? value.length : typeof defaultValue === 'string' ? defaultValue.length : 0;

  const textareaElement = (
    <div className="relative w-full">
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-desc` : undefined}
        className={cn(
          // Base textarea styling
          "w-full rounded-control border bg-white text-primary text-sm p-3 font-normal placeholder:text-neutral-400 transition-colors resize-y min-h-[96px]",
          "outline-none",
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
      />

      {showCount && maxLength && (
        <small className="block text-right text-secondary mt-1">
          {currentLength} / {maxLength}
        </small>
      )}
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
        {textareaElement}
      </FormField>
    );
  }

  return textareaElement;
});

Textarea.displayName = "Textarea";
