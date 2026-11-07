import React from 'react';
import { Badge, Card } from '../../../../../shared/components';

export const NetworkDataPage: React.FC = () => {
  return (
    <div className="section-flow text-left">
      <div>
        <div className="page-eyebrow mb-1">
          NETWORK OVERVIEW
        </div>
        <h1 className="page-title">
          Statewide Network Data
        </h1>
        <p className="page-subtitle mt-1">
          Geographic node maps, cluster centers, and warehouse infrastructure.
        </p>
      </div>

      <Card className="card-padding">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-primary">Regional Aggregation Points</h2>
          <Badge variant="brand">Geo-tagged</Badge>
        </div>
        <p className="text-xs text-secondary leading-relaxed">
          12 primary hubs across Odisha and Jharkhand operational under TSF programme guidelines.
        </p>
      </Card>
    </div>
  );
};

