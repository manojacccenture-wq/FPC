import React from 'react';
import { Badge, Card } from '../../../../../shared/components';

export const GalleryPage: React.FC = () => {
  return (
    <div className="section-flow text-left">
      <div>
        <div className="page-eyebrow mb-1">
          DIGITAL ARCHIVE
        </div>
        <h1 className="page-title">
          Field Documentation Gallery
        </h1>
        <p className="page-subtitle mt-1">
          High-resolution site imagery, facility certifications, and farmer interaction photos.
        </p>
      </div>

      <Card className="card-padding">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-primary">Recent Uploads</h2>
          <Badge variant="brand">Cloud Storage</Badge>
        </div>
        <p className="text-xs text-secondary leading-relaxed">
          Field visit photographs, soil health testing clinics, and agri-input handover documentation.
        </p>
      </Card>
    </div>
  );
};

