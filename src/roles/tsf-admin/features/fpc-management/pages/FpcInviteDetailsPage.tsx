import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Card } from '../../../../../shared/components';
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

  const [currentStep, setCurrentStep] = useState<number>(1);

  const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // 1. Fetch live single-entity records (never skip FpcDetails for completed onboarding invitations!)
  const {
    data: directFpcDetails,
    isLoading: isLoadingFpcDetails,
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
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleApprove = async () => {
    try {
      await approveFpc({ id, remarks: 'Approved by TSF Central Administration' }).unwrap();
      setActionMessage('FPC enterprise has been approved and activated successfully.');
    } catch (err: unknown) {
      const apiErr = err as { data?: { detail?: string } };
      alert(apiErr?.data?.detail || 'Failed to approve FPC.');
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Please enter the reason for rejecting this registration dossier:');
    if (!reason || !reason.trim()) return;

    try {
      await rejectFpc({ id, reason: reason.trim() }).unwrap();
      setActionMessage('FPC registration dossier has been rejected.');
    } catch (err: unknown) {
      const apiErr = err as { data?: { detail?: string } };
      alert(apiErr?.data?.detail || 'Failed to reject FPC.');
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

          {directFpcDetails?.statusLabel === 'Pending Review' && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="text-red-700 border-red-300 hover:bg-red-50"
                onClick={handleReject}
                disabled={isRejecting || isApproving}
              >
                {isRejecting ? 'Rejecting...' : 'Reject Application'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-800 text-white"
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
              >
                {isApproving ? 'Approving...' : 'Approve & Activate FPC'}
              </Button>
            </div>
          )}
        </div>

        {actionMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium">
            {actionMessage}
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
    </div>
  );
};
