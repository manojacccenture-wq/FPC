import { createContext, useContext } from 'react';

export interface ValidationModeValue {
  /** True when client-side validation is enforced (the default everywhere). */
  validationEnabled: boolean;
  setValidationEnabled: (enabled: boolean) => void;
  toggleValidation: () => void;
}

const noop = () => {};

/**
 * Default is `true`, so any form rendered outside an explicit provider keeps
 * full validation — the demo switch can never leak into unrelated workflows.
 */
export const ValidationModeContext = createContext<ValidationModeValue>({
  validationEnabled: true,
  setValidationEnabled: noop,
  toggleValidation: noop,
});

export const useValidationMode = (): ValidationModeValue => useContext(ValidationModeContext);
