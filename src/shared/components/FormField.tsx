import React from 'react';
import { cn } from '../utils/cn';

export interface FormFieldProps {
  id?: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required,
  error,
  helperText,
  className,
  children,
}) => {
  const labelText = typeof label === 'string' ? label.replace(/\s*\*+$/, '') : label;
  const isRequired = required || (typeof label === 'string' && label.includes('*'));

  return (
    <div className={cn("flex flex-col gap-2 w-full text-left", className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-primary flex items-center gap-0.5 select-none"
        >
          <span>{labelText}</span>
          {isRequired && <span className="text-danger font-semibold ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}

      {children}

      {error ? (
        <small id={id ? `${id}-error` : undefined} className="text-danger font-medium flex items-center gap-1 mt-0.5">
          {error}
        </small>
      ) : helperText ? (
        <small id={id ? `${id}-desc` : undefined} className="text-secondary mt-0.5">
          {helperText}
        </small>
      ) : null}
    </div>
  );
};

