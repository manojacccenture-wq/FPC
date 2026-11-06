import React from 'react';
import { Badge, Card } from '../../../../../shared/components';

export const PendingApprovalsPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      <div>
        <div className="page-eyebrow">
          FPC MANAGEMENT
        </div>
        <h1 className="page-title">
          Pending Approvals
        </h1>
        <p className="page-subtitle">
          Verification requests awaiting TSF State Directorate authorization.
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-primary">Verification Queue</h2>
            <p className="text-xs text-secondary">7 Requests Requiring Decision</p>
          </div>
          <Badge variant="warning" dot>Action Required</Badge>
        </div>
        <p className="text-xs text-secondary leading-relaxed">
          Farmer onboarding batches, procurement quota increments, and auditor sign-offs.
        </p>
      </Card>
    </div>
  );
};

