import React from 'react';
import { Badge, Card } from '../../../../../shared/components';

export const AdministrationPage: React.FC = () => {
  return (
    <div className="section-flow text-left">
      <div>
        <div className="floating-label font-bold text-brand mb-1">
          SYSTEM SETTINGS
        </div>
        <h1 className="page-heading text-primary">
          System Administration
        </h1>
        <p className="text-secondary mt-1">
          Role-based access controls, security audits, and centralized configuration parameters.
        </p>
      </div>

      <Card className="card-padding">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-primary">Platform Governance</h3>
          <Badge variant="success">Secured</Badge>
        </div>
        <p className="text-secondary leading-relaxed">
          Session timeouts, authentication policies, audit logs, and external API webhook configurations.
        </p>
      </Card>
    </div>
  );
};

