import React from 'react';
import { Badge, Card } from '../../../../../shared/components';

export const AdministrationPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      <div>
        <div className="page-eyebrow">
          SYSTEM SETTINGS
        </div>
        <h1 className="page-title">
          System Administration
        </h1>
        <p className="page-subtitle">
          Role-based access controls, security audits, and centralized configuration parameters.
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-primary">Platform Governance</h2>
          <Badge variant="success">Secured</Badge>
        </div>
        <p className="text-xs text-secondary">
          Session timeouts, authentication policies, audit logs, and external API webhook configurations.
        </p>
      </Card>
    </div>
  );
};

