import React from 'react';
import { Badge, Card } from '../../../../../shared/components';

export const MonitoringPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      <div>
        <div className="page-eyebrow">
          PROGRAMME MONITORING
        </div>
        <h1 className="page-title">
          Operational Targets & KPIs
        </h1>
        <p className="page-subtitle">
          Real-time delivery indicators across field clusters and partner agencies.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="none" className="p-5">
          <span className="text-xs text-secondary font-semibold block mb-1">Kharif Yield Realization</span>
          <span className="text-2xl font-bold text-brand">92.4%</span>
          <div className="mt-2"><Badge variant="brand">On Track</Badge></div>
        </Card>
        <Card padding="none" className="p-5">
          <span className="text-xs text-secondary font-semibold block mb-1">Active Cluster Outlets</span>
          <span className="text-2xl font-bold text-primary">18 / 20</span>
          <div className="mt-2"><Badge variant="brand">Operational</Badge></div>
        </Card>
        <Card padding="none" className="p-5">
          <span className="text-xs text-secondary font-semibold block mb-1">Disbursement Audits</span>
          <span className="text-2xl font-bold text-brand">100%</span>
          <div className="mt-2"><Badge variant="success">Compliant</Badge></div>
        </Card>
      </div>
    </div>
  );
};

