import React from 'react';
import { Badge, Card } from '../../../../../shared/components';

export const MonitoringPage: React.FC = () => {
  return (
    <div className="section-flow text-left">
      <div>
        <div className="floating-label font-bold text-brand mb-1">
          PROGRAMME MONITORING
        </div>
        <h1 className="page-heading text-primary">
          Operational Targets & KPIs
        </h1>
        <p className="text-secondary mt-1">
          Real-time delivery indicators across field clusters and partner agencies.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="none" className="card-padding-compact">
          <span className="floating-label text-secondary block mb-1">Kharif Yield Realization</span>
          <h2 className="text-brand">92.4%</h2>
          <div className="mt-2"><Badge variant="brand">On Track</Badge></div>
        </Card>
        <Card padding="none" className="card-padding-compact">
          <span className="floating-label text-secondary block mb-1">Active Cluster Outlets</span>
          <h2 className="text-primary">18 / 20</h2>
          <div className="mt-2"><Badge variant="brand">Operational</Badge></div>
        </Card>
        <Card padding="none" className="card-padding-compact">
          <span className="floating-label text-secondary block mb-1">Disbursement Audits</span>
          <h2 className="text-brand">100%</h2>
          <div className="mt-2"><Badge variant="success">Compliant</Badge></div>
        </Card>
      </div>
    </div>
  );
};

