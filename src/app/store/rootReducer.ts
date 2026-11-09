import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../../features/auth/slices/authSlice';
import uiReducer from '../../shared/slices/uiSlice';
import syncReducer from '../../shared/slices/syncSlice';
import { baseApi } from '../api/baseApi';

export const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  sync: syncReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

