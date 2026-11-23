import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button, Card, Modal, Badge, Textarea } from '../../../../../shared/components';
import { useNotification } from '../../../../../shared/notifications/NotificationProvider';
import { FpcWizardStepSidebar } from '../components/FpcWizardStepSidebar';
import { FpcRegistrationForm } from '../../../../../features/onboarding/components/registration-form/FpcRegistrationForm';
import { useGetFpcInvitationByIdQuery } from '../../../../../features/onboarding/api/fpcInvitationApi';
import { useGetFpcDetailsQuery, useApproveFpcMutation, useRejectFpcMutation } from '../../../../../features/fpc/api/fpcApi';
import { invitationApi } from '../../../../../features/onboarding/api/invitation.api';
import { calculateRegistrationProgress } from '../utils/registrationProgress';
import { mapFpcToRegistrationDrafts } from '../../../../../features/onboarding/utils/fpcFormMapper';

export const FpcInviteDetailsPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // 1. Fetch live single-entity records (never skip FpcDetails for completed onboarding invitations!)
  const {
    data: directFpcDetails,
    isLoading: isLoadingFpcDetails,
    refetch: refetchFpcDetails,
  } = useGetFpcDetailsQuery(id, {
    skip: !isGuid,
  });

  const {
    data: directInvitation,
    isLoading: isLoadingInvitation,
  } = useGetFpcInvitationByIdQuery(id, {
    skip: !isGuid,
  });

  const [approveFpc, { isLoading: isApproving }] = useApproveFpcMutation();
  const [rejectFpc, { isLoading: isRejecting }] = useRejectFpcMutation();

  const handleApproveWithRevalidation = async () => {
    try {
      // 1. Mandatory pre-flight revalidation: fetch fresh server state
      const freshResult = await refetchFpcDetails().unwrap();
      if (!freshResult.canApprove) {
        notify(
          freshResult.approvalEligibilityReason || 'This FPC registration is not eligible for approval.',
          'warning',
          'Approval Blocked'
        );
        return;
      }

      await approveFpc({ id, remarks: 'Approved by TSF Central Administration after verification' }).unwrap();
      notify('FPC enterprise has been approved and activated successfully.', 'success');
      refetchFpcDetails();
    } catch (err: unknown) {
      const apiErr = err as { status?: number; data?: { detail?: string } };
      if (apiErr?.status === 409) {
        notify(
          apiErr.data?.detail || 'Another administrator updated this FPC concurrently. Refreshing latest record...',
          'danger',
          'Concurrency Conflict'
        );
        refetchFpcDetails();
      } else {
        notify(apiErr?.data?.detail || 'Failed to approve FPC.', 'danger');
      }
    }
  };

  const handleConfirmReject = async () => {
    const trimmed = rejectionReason.trim();
    if (!trimmed || trimmed.length < 10) {
      setRejectionError('Rejection remarks must be at least 10 characters.');
      return;
    }
    if (trimmed.length > 1000) {
      setRejectionError('Rejection remarks cannot exceed 1000 characters.');
      return;
    }
    setRejectionError(null);

    try {
      // Mandatory pre-flight revalidation
      const freshResult = await refetchFpcDetails().unwrap();
      if (!freshResult.canReject) {
        notify(
          freshResult.rejectionEligibilityReason || 'This FPC registration cannot be rejected.',
          'warning',
          'Rejection Blocked'
        );
        setIsRejectModalOpen(false);
        return;
      }

      await rejectFpc({ id, reason: trimmed }).unwrap();
      notify('FPC registration dossier has been rejected.', 'info');
      setIsRejectModalOpen(false);
      setRejectionReason('');
      refetchFpcDetails();
    } catch (err: unknown) {
      const apiErr = err as { status?: number; data?: { detail?: string } };
      if (apiErr?.status === 409) {
        notify(
          apiErr.data?.detail || 'Another administrator updated this FPC concurrently. Refreshing latest record...',
          'danger',
          'Concurrency Conflict'
        );
        setIsRejectModalOpen(false);
        refetchFpcDetails();
      } else {
        notify(apiErr?.data?.detail || 'Failed to reject FPC.', 'danger');
      }
    }
  };

  // 2. Read local drafts if available for this token or entity
  const draftIdentifier = directInvitation?.token
    ? {
        tokenOrId: directInvitation.token,
        companyName: directInvitation?.companyName,
        email: directInvitation?.email,
      }
    : id;

  const localDrafts = useMemo(
    () => ({
      step1: invitationApi.getStepOneData(draftIdentifier),
      step2: invitationApi.getStepTwoData(draftIdentifier),
      step3: invitationApi.getStepThreeData(draftIdentifier),
      step4: invitationApi.getStepFourData(draftIdentifier),
      step5: invitationApi.getStepFiveData(draftIdentifier),
      step6: invitationApi.getStepSixData(draftIdentifier),
      step7: invitationApi.getStepSevenData(draftIdentifier),
    }),
    [draftIdentifier]
  );

  // 3. Map live database record + JSONB registration data into all 8 wizard step drafts
  const stepDrafts = useMemo(
    () => mapFpcToRegistrationDrafts(directFpcDetails, directInvitation, localDrafts),
    [directFpcDetails, directInvitation, localDrafts]
  );

  // 4. Compute dynamic readiness progress for the sidebar
  const readiness = useMemo(() => {
    const isRegisteredFpc = Boolean(directFpcDetails);
    const progress = calculateRegistrationProgress({
      status: directFpcDetails ? directFpcDetails.status : (directInvitation?.status || 'Pending'),
      isRegisteredFpc,
      token: directInvitation?.token || null,
      invitationId: id,
      companyName: directFpcDetails?.name || directInvitation?.companyName,
      email: directFpcDetails?.primaryEmail || directInvitation?.email,
    });

    return {
      percentage: progress.percentage,
      text: `${progress.completedStepsCount} of 8 sections verified`,
    };
  }, [directFpcDetails, directInvitation, id]);

  const isLoading = (isLoadingFpcDetails || isLoadingInvitation) && !directFpcDetails && !directInvitation;

  if (isLoading) {
    return (
      <div className="section-flow text-left py-12">
        <Card className="card-padding text-center space-y-4 max-w-lg mx-auto">
          <div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-secondary uppercase tracking-wider">
            Loading FPC record details...
          </p>
        </Card>
      </div>
    );
  }

  if (!directFpcDetails && !directInvitation) {
    return (
      <div className="section-flow text-left py-12">
        <Card className="card-padding text-center space-y-4 max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-primary">FPC Record Not Found</h2>
          <p className="text-xs text-secondary leading-relaxed">
            We could not find an onboarding invitation or registered FPC matching
            the identifier &ldquo;{id}&rdquo;.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/admin/onboard')}
              className="rounded-full px-6"
            >
              &larr; Return to FPC Onboarding
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const companyName = directFpcDetails?.name || directInvitation?.companyName || 'Farmer Producer Company';

  return (
    <div className="section-flow text-left">
      {/* 1. Header with Back Navigation Link and Page Titles */}
      <div className="space-y-4">
        {/* Back Link */}
        <div>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            leadingIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            onClick={() => navigate('/admin/onboard')}
            className="p-0 h-auto text-xs font-semibold text-brand hover:underline hover:bg-transparent min-w-0"
          >
            Back to Onboard New FPC
          </Button>
        </div>

        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">{companyName}</h1>
            <p className="text-xs text-secondary mt-0.5">
              Status: <span className="font-semibold text-primary">{directFpcDetails?.statusLabel || directInvitation?.status || 'Draft'}</span>
            </p>
          </div>

          {/* Backend-Driven Action Buttons & Status Indicators */}
          <div className="flex items-center gap-3">
            {directFpcDetails?.canReject && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-700 border-red-300 hover:bg-red-50"
                onClick={() => {
                  setRejectionReason('');
                  setRejectionError(null);
                  setIsRejectModalOpen(true);
                }}
                disabled={isRejecting || isApproving}
              >
                {isRejecting ? 'Rejecting...' : 'Reject Application'}
              </Button>
            )}

            {directFpcDetails?.canApprove && (
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
                onClick={handleApproveWithRevalidation}
                disabled={isApproving || isRejecting}
              >
                {isApproving ? 'Approving...' : 'Approve & Activate FPC'}
              </Button>
            )}

            {directFpcDetails?.status === 'Active' && (
              <Badge variant="success" size="md" className="flex items-center gap-1.5 py-1 px-3">
                <CheckCircle2 className="w-4 h-4" />
                <span>Approved Enterprise</span>
              </Badge>
            )}

            {directFpcDetails?.statusLabel === 'Rejected' && (
              <Badge variant="danger" size="md" className="py-1 px-3">
                Registration Rejected
              </Badge>
            )}
          </div>
        </div>

        {/* Backend-Driven Eligibility Warning Banner for Incomplete Dossiers */}
        {directFpcDetails?.approvalEligibilityReason && !directFpcDetails?.canApprove && directFpcDetails?.status !== 'Active' && directFpcDetails?.statusLabel !== 'Rejected' && (
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 text-amber-900 rounded-xl text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-950">Approval Pending Requirements</p>
              <p className="text-amber-800 leading-relaxed">{directFpcDetails.approvalEligibilityReason}</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Responsive 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 lg:gap-8 items-start pt-2">
        {/* Left Column: 8 Step Cards + Dynamic Readiness Tracker */}
        <FpcWizardStepSidebar
          currentStep={currentStep}
          onSelectStep={(step) => setCurrentStep(step)}
          readinessPercentage={readiness.percentage}
          sectionsVerifiedText={readiness.text}
        />

        {/* Right Column: Reusable Registration Form in Read-Only Mode */}
        <div className="min-w-0">
          <FpcRegistrationForm
            mode="readonly"
            currentStep={currentStep}
            onStepChange={(step) => setCurrentStep(step)}
            drafts={stepDrafts}
            fpcDetails={directFpcDetails}
            invitation={directInvitation}
          />
        </div>
      </div>

      {/* Design-System Rejection Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => {
          if (!isRejecting) {
            setIsRejectModalOpen(false);
            setRejectionError(null);
          }
        }}
        title="Reject FPC Registration Application"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRejectModalOpen(false)}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="bg-red-700 hover:bg-red-800 text-white"
              onClick={handleConfirmReject}
              disabled={isRejecting || rejectionReason.trim().length < 10}
            >
              {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-1">
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Administrative Action Notice</p>
              <p className="mt-0.5 text-red-800 leading-relaxed">
                Rejecting this application will mark the registration dossier as Rejected. The applicant will be informed with the reasons provided below.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="rejection-reason" className="block text-xs font-semibold text-neutral-800">
              Rejection Remarks <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (rejectionError) setRejectionError(null);
              }}
              placeholder="Provide a detailed explanation for rejection (minimum 10 characters)..."
              rows={4}
              maxLength={1000}
              className="w-full text-xs"
              disabled={isRejecting}
            />
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span>{rejectionError ? <span className="text-red-600 font-medium">{rejectionError}</span> : 'Minimum 10 characters required'}</span>
              <span>{rejectionReason.length} / 1000</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
