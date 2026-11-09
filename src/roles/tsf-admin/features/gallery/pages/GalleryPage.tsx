import React from 'react';
import { Badge, Card } from '../../../../../shared/components';

export const GalleryPage: React.FC = () => {
  return (
    <div className="section-flow text-left">
      <div>
        <div className="floating-label font-bold text-brand mb-1">
          DIGITAL ARCHIVE
        </div>
        <h1 className="page-heading text-primary">
          Field Documentation Gallery
        </h1>
        <p className="text-secondary mt-1">
          High-resolution site imagery, facility certifications, and farmer interaction photos.
        </p>
      </div>

      <Card className="card-padding">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-primary">Recent Uploads</h3>
          <Badge variant="brand">Cloud Storage</Badge>
        </div>
        <p className="text-secondary leading-relaxed">
          Field visit photographs, soil health testing clinics, and agri-input handover documentation.
        </p>
      </Card>
    </div>
  );
};

