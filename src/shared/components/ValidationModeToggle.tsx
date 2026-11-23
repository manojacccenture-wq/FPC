import React from 'react';
import { Switch } from './Switch';
import { useValidationMode } from '../forms/validationModeContext';
import { cn } from '../utils/cn';

export interface ValidationModeToggleProps {
  className?: string;
  disabled?: boolean;
}

/**
 * Demo-only switch that turns frontend validation enforcement ON/OFF for the
 * workflow wrapped in `ValidationModeProvider`.
 *
 * It toggles *enforcement*, never the rules themselves, and it never reaches
 * the backend: the API payload is byte-identical in both states.
 */
export const ValidationModeToggle: React.FC<ValidationModeToggleProps> = ({ className, disabled }) => {
  const { validationEnabled, setValidationEnabled } = useValidationMode();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 rounded-full border bg-white pl-3 pr-2 py-0.5 shadow-2xs transition-colors',
        validationEnabled ? 'border-neutral-200' : 'border-amber-300 bg-amber-50/60',
        className
      )}
    >
      <span
        className={cn(
          'floating-label font-bold tracking-wider',
          validationEnabled ? 'text-neutral-500' : 'text-amber-700'
        )}
      >
        VALIDATION
      </span>
      <Switch
        id="validation-mode-toggle"
        checked={validationEnabled}
        onChange={(event) => setValidationEnabled(event.target.checked)}
        label="ON"
        offLabel="OFF"
        disabled={disabled}
        aria-label="Toggle frontend validation enforcement for this demo"
        containerClassName="min-h-0 py-0 gap-2"
      />
    </div>
  );
};
