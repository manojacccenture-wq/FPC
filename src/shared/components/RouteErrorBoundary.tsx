import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div
      role="alert"
      className="min-h-[380px] flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 stroke-[2]" />
      </div>
      <h2 className="text-lg font-semibold text-primary mb-1">
        Failed to load page
      </h2>
      <p className="text-xs text-secondary max-w-md mb-5">
        {error instanceof Error
          ? error.message
          : 'A network interruption occurred while loading this section. Please check your connectivity and try again.'}
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-xs"
        >
          Go Back
        </Button>
        <Button
          variant="primary"
          size="sm"
          leadingIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={handleRetry}
          className="text-xs"
        >
          Retry
        </Button>
      </div>
    </div>
  );
};

export default RouteErrorBoundary;

