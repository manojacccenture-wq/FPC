import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Demo-phase switch that controls whether client-side validation is *enforced*.
 *
 * It never disables, edits or removes a validation rule: the schemas are still
 * registered and still describe every field. Only the form resolver decides
 * whether their result blocks the user (see `useFpcForm`).
 *
 * Deliberately in-memory only — a page reload always restores enforcement.
 */
export interface DemoValidationState {
  validationEnabled: boolean;
}

const initialState: DemoValidationState = {
  validationEnabled: true,
};

export const demoValidationSlice = createSlice({
  name: 'demoValidation',
  initialState,
  reducers: {
    setValidationEnabled: (state, action: PayloadAction<boolean>) => {
      state.validationEnabled = action.payload;
    },
    toggleValidation: (state) => {
      state.validationEnabled = !state.validationEnabled;
    },
  },
});

export const { setValidationEnabled, toggleValidation } = demoValidationSlice.actions;

/**
 * Structurally typed so any store shape carrying this slice satisfies it,
 * without `shared/` importing `app/`.
 */
export const selectValidationEnabled = (state: {
  demoValidation: DemoValidationState;
}): boolean => state.demoValidation.validationEnabled;

export default demoValidationSlice.reducer;
