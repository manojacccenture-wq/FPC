import React from 'react';
import { Badge, Card } from '../../../../../shared/components';

export const AnalyticsMisPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      <div>
        <div className="page-eyebrow">
          ANALYTICS & REPORTING
        </div>
        <h1 className="page-title">
          Management Information Systems (MIS)
        </h1>
        <p className="page-subtitle">
          Comparative sales data, farmer income uplifts, and yield variance records.
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-primary">Quarterly Performance Index</h2>
          <Badge variant="brand">Q3 Validated</Badge>
        </div>
        <p className="text-xs text-secondary">
          Automated aggregate analytics exported to Tata Steel Foundation CSR executive reporting feeds.
        </p>
      </Card>
    </div>
  );
};

