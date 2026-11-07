import React from 'react';
import { Badge, Card } from '../../../../../shared/components';

export const TsfAdminDashboardPage: React.FC = () => {
  return (
    <div className="section-flow text-left">
      <div>
        <h1 className="page-title">
          TSF Central Administration
        </h1>
        <p className="page-subtitle mt-1">
          Statewide Farmer Producer Company oversight, active procurement targets, and verification queues.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="none" className="card-padding-compact rounded-card">
          <span className="text-xs font-semibold text-secondary uppercase block mb-1">Active FPCs</span>
          <span className="text-2xl font-bold text-primary">24</span>
          <div className="mt-2">
            <Badge variant="brand" dot>100% Operational</Badge>
          </div>
        </Card>

        <Card padding="none" className="card-padding-compact rounded-card">
          <span className="text-xs font-semibold text-secondary uppercase block mb-1">Registered Farmers</span>
          <span className="text-2xl font-bold text-primary">14,820</span>
          <div className="mt-2">
            <Badge variant="success">Kharif Season</Badge>
          </div>
        </Card>

        <Card padding="none" className="card-padding-compact rounded-card">
          <span className="text-xs font-semibold text-secondary uppercase block mb-1">Pending Verifications</span>
          <span className="text-2xl font-bold text-warning">42</span>
          <div className="mt-2">
            <Badge variant="warning" dot>Action Required</Badge>
          </div>
        </Card>

        <Card padding="none" className="card-padding-compact rounded-card">
          <span className="text-xs font-semibold text-secondary uppercase block mb-1">Procurement Value</span>
          <span className="text-2xl font-bold text-brand">₹ 8.4 Cr</span>
          <div className="mt-2">
            <Badge variant="brand">Target Met: 84%</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};

