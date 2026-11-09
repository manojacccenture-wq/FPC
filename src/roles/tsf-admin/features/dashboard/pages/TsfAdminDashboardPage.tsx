import React from 'react';
import { Badge, Card } from '../../../../../shared/components';

export const TsfAdminDashboardPage: React.FC = () => {
  return (
    <div className="section-flow text-left">
      <div>
        <h1 className="page-heading text-primary">
          TSF Central Administration
        </h1>
        <p className="text-secondary mt-1">
          Statewide Farmer Producer Company oversight, active procurement targets, and verification queues.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="none" className="card-padding-compact rounded-card">
          <span className="floating-label text-secondary block mb-1">Active FPCs</span>
          <h2 className="text-primary">24</h2>
          <div className="mt-2">
            <Badge variant="brand" dot>100% Operational</Badge>
          </div>
        </Card>

        <Card padding="none" className="card-padding-compact rounded-card">
          <span className="floating-label text-secondary block mb-1">Registered Farmers</span>
          <h2 className="text-primary">14,820</h2>
          <div className="mt-2">
            <Badge variant="success">Kharif Season</Badge>
          </div>
        </Card>

        <Card padding="none" className="card-padding-compact rounded-card">
          <span className="floating-label text-secondary block mb-1">Pending Verifications</span>
          <h2 className="text-warning">42</h2>
          <div className="mt-2">
            <Badge variant="warning" dot>Action Required</Badge>
          </div>
        </Card>

        <Card padding="none" className="card-padding-compact rounded-card">
          <span className="floating-label text-secondary block mb-1">Procurement Value</span>
          <h2 className="text-brand">₹ 8.4 Cr</h2>
          <div className="mt-2">
            <Badge variant="brand">Target Met: 84%</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};

