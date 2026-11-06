import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { TsfAdminSidebar } from './TsfAdminSidebar';
import { TsfAdminHeader } from './TsfAdminHeader';
import { authApi } from '../../../features/auth/api/auth.api';

export interface TsfAdminLayoutProps {
  children?: React.ReactNode;
}

export const TsfAdminLayout: React.FC<TsfAdminLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await authApi.logout();
    localStorage.removeItem('fpc_auth_user');
    sessionStorage.removeItem('fpc_auth_user');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-primary flex flex-row w-full overflow-x-hidden">
      {/* 1. Left Sidebar: Reusable Persistent Navigation */}
      <TsfAdminSidebar
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onSignOut={handleSignOut}
      />

      {/* 2. Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-neutral-50">
        {/* Reusable Application Header */}
        <TsfAdminHeader
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* 3. Dynamic Center Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
