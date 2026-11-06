import React from 'react';
import { Badge, Card } from '../../../../../shared/components';

export const AllFpcsPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      <div>
        <div className="page-eyebrow">
          FPC MANAGEMENT
        </div>
        <h1 className="page-title">
          All Partner FPCs
        </h1>
        <p className="page-subtitle">
          Complete directory of affiliated Farmer Producer Companies across operational districts.
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-primary">Directory Index</h2>
            <p className="text-xs text-secondary">24 Active Enterprises in Network</p>
          </div>
          <Badge variant="brand" dot>Active Sync</Badge>
        </div>
        <p className="text-xs text-secondary leading-relaxed">
          Comprehensive profile registry, registration details, board compositions, and compliance track records.
        </p>
      </Card>
    </div>
  );
};

