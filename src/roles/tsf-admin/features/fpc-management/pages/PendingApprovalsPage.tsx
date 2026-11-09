import React from 'react';
import { Clock, CheckCircle2, Building2 } from 'lucide-react';
import { Badge, Card, Button } from '../../../../../shared/components';
import { useGetFpcInvitationsQuery } from '../../../../../features/onboarding/api/fpcInvitationApi';

export const PendingApprovalsPage: React.FC = () => {
  const { data: invitations = [] } = useGetFpcInvitationsQuery();
  const pendingInvitations = invitations.filter(
    (i) => i.status === 'Pending' || i.status === 'InProgress' || i.status === 'Completed'
  );

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
              {pendingInvitations.length} Active Records in Pipeline
            </p>
          </div>
          <Badge variant="warning" dot>Action Required</Badge>
        </div>

        {pendingInvitations.length === 0 ? (
          <div className="py-8 text-center text-secondary">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 stroke-[1.5]" />
            <p className="text-sm font-semibold text-primary">All approvals clear</p>
            <p className="text-xs text-secondary mt-1">No pending onboarding requests awaiting review.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 border border-neutral-200/80 rounded-xl overflow-hidden">
            {pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 sm:p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/70 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0F4C36] flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">
                      {inv.companyName}
                    </h4>
                    <small className="text-secondary mt-0.5 block">
                      Nominated: <span className="font-medium text-primary">{inv.nominatedAdmin}</span> ({inv.email})
                    </small>
                    <small className="text-neutral-400 block">
                      Region: {inv.district}, {inv.state}
                    </small>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  <Badge
                    variant={inv.status === 'Completed' ? 'success' : 'info'}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" />
                    <span>{inv.status}</span>
                  </Badge>

                  <Button
                    size="xs"
                    variant="outline"
                    className="text-xs h-7 px-3 bg-white hover:bg-neutral-50"
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
