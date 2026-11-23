import React from 'react';
import { cn } from '../utils/cn';
import { InfoTooltip } from './InfoTooltip';
import type { FieldGuidance } from '../types/fieldGuidance.types';

export interface FormFieldProps {
  id?: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  /** Explanatory content rendered as an information icon next to the label. */
  guidance?: FieldGuidance;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required,
  error,
  helperText,
  className,
  guidance,
  children,
}) => {
  const labelText = typeof label === 'string' ? label.replace(/\s*\*+$/, '') : label;
  const isRequired = required || (typeof label === 'string' && label.includes('*'));

  return (
    <div className={cn("flex flex-col gap-2 w-full text-left", className)}>
      {label && (
        <div className="flex items-center gap-0.5 min-w-0">
          {/* The icon lives outside the <label> so tapping it never focuses or toggles the input. */}
          <label
            htmlFor={id}
            className="text-primary flex items-center gap-0.5 select-none min-w-0"
          >
            <span>{labelText}</span>
            {isRequired && <span className="text-danger font-semibold ml-0.5" aria-hidden="true">*</span>}
          </label>
          {guidance && <InfoTooltip guidance={guidance} fieldLabel={labelText} />}
        </div>
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
