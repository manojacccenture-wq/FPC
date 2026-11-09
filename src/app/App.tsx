import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AppInitGate } from './router/AppInitGate';

export const App: React.FC = () => {
  return (
    <AppInitGate>
      <RouterProvider router={router} />
    </AppInitGate>
  );
};

export default App;
