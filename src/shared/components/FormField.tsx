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
  return (
    <div className={cn("flex flex-col gap-1.5 w-full text-left", className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-[13px] sm:text-sm font-medium text-[#0E1B16] flex items-center gap-1 select-none"
        >
          <span>{label}</span>
          {required && <span className="text-[#A61A24] font-bold" aria-hidden="true">*</span>}
        </label>
      )}

      {children}

      {error ? (
        <p id={id ? `${id}-error` : undefined} className="text-xs text-[#A61A24] font-medium flex items-center gap-1">
          {error}
        </p>
      ) : helperText ? (
        <p id={id ? `${id}-desc` : undefined} className="text-xs text-[#5B6B65]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

