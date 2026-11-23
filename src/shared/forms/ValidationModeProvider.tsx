import React, { useMemo, type ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectValidationEnabled,
  setValidationEnabled as setValidationEnabledAction,
  toggleValidation as toggleValidationAction,
} from '../slices/demoValidationSlice';
import { VALIDATION_TOGGLE_ENABLED } from '../config/env';
import { ValidationModeContext, type ValidationModeValue } from './validationModeContext';

export interface ValidationModeProviderProps {
  children: ReactNode;
}

/**
 * Binds the centralized demo validation mode to one workflow (the onboarding
 * wizard). Single Redux subscription for the whole subtree; consumers only
 * re-render when the mode actually changes.
 */
export const ValidationModeProvider: React.FC<ValidationModeProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const storedEnabled = useSelector(selectValidationEnabled);

  // A build without the demo flag can never run with validation bypassed,
  // regardless of what the store holds: enforcement is forced ON.
  const validationEnabled = !VALIDATION_TOGGLE_ENABLED || storedEnabled;

  const value = useMemo<ValidationModeValue>(
    () => ({
      validationEnabled,
      setValidationEnabled: (enabled: boolean) => dispatch(setValidationEnabledAction(enabled)),
      toggleValidation: () => dispatch(toggleValidationAction()),
    }),
    [validationEnabled, dispatch]
  );

  return <ValidationModeContext.Provider value={value}>{children}</ValidationModeContext.Provider>;
};
