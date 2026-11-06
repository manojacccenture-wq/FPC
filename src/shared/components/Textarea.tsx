import { forwardRef, useId } from 'react';
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
          "w-full rounded-[8px] border bg-white text-[#0E1B16] text-sm p-3 font-normal placeholder:text-[#9AA7A3] transition-colors resize-y min-h-[90px]",
          // Border & focus
          "border-[#CDD7D4] hover:border-[#9AA7A3]",
          "focus:outline-none focus:ring-2 focus:ring-[#166B4B] focus:ring-offset-2 focus:border-transparent",
          // Error tokens
          error && "border-[#A61A24] focus:ring-[#A61A24] text-[#A61A24]",
          // Disabled tokens
          disabled && "bg-[#F5F8F7] text-[#9AA7A3] border-[#E1E8E6] cursor-not-allowed",
          className
        )}
        {...props}
      />

      {showCount && maxLength && (
        <div className="text-right text-[11px] text-[#5B6B65] mt-1">
          {currentLength} / {maxLength}
        </div>
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

