import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, Building2 } from 'lucide-react';
import { Badge, Card, Button } from '../../../../../shared/components';
import { useGetFpcsQuery } from '../../../../../features/fpc/api/fpcApi';

export const PendingApprovalsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: fpcs = [], isLoading } = useGetFpcsQuery();
  const pendingFpcs = fpcs.filter((f) => f.statusLabel === 'Pending Review');

  return (
    <div className="section-flow text-left">
      <div>
        <div className="page-eyebrow mb-1">
          FPC MANAGEMENT
        </div>
        <h1 className="page-title">
          Pending Approvals
        </h1>
        <p className="page-subtitle mt-1">
          Verification requests awaiting TSF State Directorate authorization.
        </p>
      </div>

      <Card className="card-padding space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-primary">Verification Queue</h2>
            <p className="text-xs text-secondary mt-0.5">
              {pendingFpcs.length} Submitted Applications in Queue
            </p>
          </div>
          {pendingFpcs.length > 0 && (
            <Badge variant="warning" dot>Action Required</Badge>
          )}
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-secondary">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold text-secondary uppercase tracking-wider">
              Loading verification queue...
            </p>
          </div>
        ) : pendingFpcs.length === 0 ? (
          <div className="py-8 text-center text-secondary">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 stroke-[1.5]" />
            <p className="text-sm font-semibold text-primary">All approvals clear</p>
            <p className="text-xs text-secondary mt-1">No completed registration applications awaiting review.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 border border-neutral-200/80 rounded-xl overflow-hidden">
            {pendingFpcs.map((fpc) => (
              <div
                key={fpc.id}
                className="p-3.5 sm:p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/70 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0F4C36] flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">
                      {fpc.name}
                    </h4>
                    <small className="text-secondary mt-0.5 block">
                      Code: <span className="font-mono text-primary">{fpc.code}</span> {fpc.cin ? `| CIN: ${fpc.cin}` : ''}
                    </small>
                    <small className="text-neutral-400 block">
                      Region: {fpc.district}, {fpc.state}
                    </small>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  <Badge
                    variant="info"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" />
                    <span>Pending Review</span>
                  </Badge>

                  <Button
                    size="xs"
                    variant="outline"
                    className="text-xs h-7 px-3 bg-white hover:bg-neutral-50"
                    onClick={() => navigate(`/admin/onboard/${fpc.id}`)}
                  >
                    Review Dossier
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
