import React from 'react';

export interface PageLoadingFallbackProps {
  fullScreen?: boolean;
}

export const PageLoadingFallback: React.FC<PageLoadingFallbackProps> = ({
  fullScreen = false,
}) => {
  return (
    <div
      role="status"
      aria-label="Loading page content"
      className={`flex flex-col items-center justify-center p-8 transition-opacity duration-200 ${
        fullScreen ? 'min-h-screen bg-neutral-50' : 'min-h-[320px] h-full w-full'
      }`}
    >
      <div className="relative flex items-center justify-center">
        <div className="w-9 h-9 border-3 border-brand/20 border-t-brand rounded-full animate-spin" />
      </div>
      <p className="mt-3 text-xs font-medium text-secondary animate-pulse">
        Loading...
      </p>
    </div>
  );
};

export default PageLoadingFallback;

