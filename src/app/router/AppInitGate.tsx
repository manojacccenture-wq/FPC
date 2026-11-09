import React, { useEffect } from 'react';
import { useGetCurrentUserQuery } from '../../features/auth/api/authApi';
import { useAppDispatch } from '../store/hooks';
import { setCredentials, loggedOut } from '../../features/auth/slices/authSlice';

export const AppInitGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { data, isLoading, isSuccess, isError } = useGetCurrentUserQuery();

  useEffect(() => {
    if (isSuccess && data?.data) {
      dispatch(
        setCredentials({
          user: data.data,
          activeFpcId: data.data.activeFpcId ?? undefined,
          activeRole: data.data.activeRoleCode ?? undefined,
          memberships: data.data.memberships,
        })
      );
    } else if (isError) {
      dispatch(loggedOut());
    }
  }, [isSuccess, isError, data, dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-neutral-50 flex flex-col items-center justify-center p-4 selection:bg-forest-200">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-9 h-9 border-3 border-brand/20 border-t-brand rounded-full animate-spin" />
          <p className="floating-label font-semibold text-brand">
            Verifying secure session...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
