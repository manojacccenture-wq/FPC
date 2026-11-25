import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../../features/auth/slices/authSlice';
import uiReducer from '../../shared/slices/uiSlice';
import syncReducer from '../../shared/slices/syncSlice';
import demoValidationReducer from '../../shared/slices/demoValidationSlice';
import { baseApi } from '../api/baseApi';
import { geocodingApi } from '../../features/onboarding/api/geocodingApi';
import { ifscApi } from '../../features/onboarding/api/ifscApi';

export const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  sync: syncReducer,
  demoValidation: demoValidationReducer,
  [baseApi.reducerPath]: baseApi.reducer,
  [geocodingApi.reducerPath]: geocodingApi.reducer,
  [ifscApi.reducerPath]: ifscApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

