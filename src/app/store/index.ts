import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { rootReducer } from './rootReducer';
import { baseApi } from '../api/baseApi';
import { geocodingApi } from '../../features/onboarding/api/geocodingApi';
import { ifscApi } from '../../features/onboarding/api/ifscApi';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Date or specific offline payload fields if necessary
        ignoredActions: ['sync/syncCompleted'],
      },
    }).concat(baseApi.middleware, geocodingApi.middleware, ifscApi.middleware),
  devTools: import.meta.env.DEV,
});

// Enables refetchOnFocus and refetchOnReconnect behaviors for RTK Query
setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type { RootState } from './rootReducer';
