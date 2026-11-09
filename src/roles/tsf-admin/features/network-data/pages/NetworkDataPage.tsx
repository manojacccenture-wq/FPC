import React from 'react';
import { Badge, Card } from '../../../../../shared/components';

export const NetworkDataPage: React.FC = () => {
  return (
    <div className="section-flow text-left">
      <div>
        <div className="floating-label font-bold text-brand mb-1">
          NETWORK OVERVIEW
        </div>
        <h1 className="page-heading text-primary">
          Statewide Network Data
        </h1>
        <p className="text-secondary mt-1">
          Geographic node maps, cluster centers, and warehouse infrastructure.
        </p>
      </div>

      <Card className="card-padding">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-primary">Regional Aggregation Points</h3>
          <Badge variant="brand">Geo-tagged</Badge>
        </div>
        <p className="text-secondary leading-relaxed">
          12 primary hubs across Odisha and Jharkhand operational under TSF programme guidelines.
        </p>
      </Card>
    </div>
  );
};

