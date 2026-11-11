import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { AppProviders } from './app/providers';
import { API_BASE_URL, APP_ENV } from './shared/config/env';
import './styles/index.css';

// Non-visual environment identity for operators and smoke tests.
document.documentElement.dataset.appEnv = APP_ENV;
console.info(`[FPC] environment=${APP_ENV} api=${API_BASE_URL}`);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);
