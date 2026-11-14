import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Building2, CheckCircle2 } from 'lucide-react';
import { useAppSelector } from '../../../../../app/store/hooks';
import {
  useGetFpcDetailsQuery,
  useSaveFpcDraftMutation,
  useSubmitFpcRegistrationMutation,
  useUploadFpcDocumentMutation,
} from '../../../../../features/fpc/api/fpcApi';
import {
  mapFpcToRegistrationDrafts,
  type RegistrationStepDrafts,
} from '../../../../../features/onboarding/utils/fpcFormMapper';
import { OnboardingStepper } from '../../../../../features/onboarding/components/OnboardingStepper';
import { FpcRegistrationForm } from '../../../../../features/onboarding/components/registration-form/FpcRegistrationForm';
import { Button, Alert } from '../../../../../shared/components';
import type { LogoDocumentsFileMap } from '../../../../../features/onboarding/components/FpcLogoDocumentsForm';
import {
  DOCUMENT_TYPE_BY_FIELD,
  EXPIRY_FIELD_BY_FIELD,
} from '../../../../../features/onboarding/constants/documentTypes';
import { formatDateToISO } from '../../../../../shared/utils/date';
import type { LogoDocumentsFormValues } from '../../../../../features/onboarding/schemas/logoDocuments.schema';

export const FpcSelfRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeFpcId, currentUser } = useAppSelector((state) => state.auth);

  const { data: fpcDetails, isLoading } = useGetFpcDetailsQuery(activeFpcId || '', {
    skip: !activeFpcId,
  });

  const [saveFpcDraft, { isLoading: isSavingDraft }] = useSaveFpcDraftMutation();
  const [submitFpcRegistration, { isLoading: isSubmittingFinal }] = useSubmitFpcRegistrationMutation();
  const [uploadFpcDocument] = useUploadFpcDocumentMutation();

  const stepParam = Number(searchParams.get('step'));
  const isValidStepParam = stepParam >= 1 && stepParam <= 8;

  const [activeStepOverride, setActiveStepOverride] = useState<number | null>(
    isValidStepParam ? stepParam : null
  );

  const completedStepsCount = fpcDetails?.completedStepsCount ?? 0;

  // Active step priority: user override > URL search param > (completedStepsCount + 1) > 1
  const currentStep =
    activeStepOverride ??
    (isValidStepParam
      ? stepParam
      : completedStepsCount > 0
      ? Math.min(8, completedStepsCount + 1)
      : 1);

  const goToStep = (stepNumber: number) => {
    setActiveStepOverride(stepNumber);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('step', String(stepNumber));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [localDrafts, setLocalDrafts] = useState<RegistrationStepDrafts>(() =>
    mapFpcToRegistrationDrafts(fpcDetails, null, null)
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedLastModified, setSavedLastModified] = useState<string | null>(null);

  const currentLastModified = savedLastModified ?? fpcDetails?.lastModifiedAtUtc ?? undefined;

  // Compute merged drafts
  const drafts = mapFpcToRegistrationDrafts(fpcDetails, null, localDrafts);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F4C36]" />
      </div>
    );
  }

  const isSubmittedOrApproved =
    fpcDetails?.statusLabel === 'Pending Review' ||
    fpcDetails?.status === 'Active' ||
    fpcDetails?.statusLabel === 'Active';

  const persistDraft = async (updatedDrafts: RegistrationStepDrafts, completedStepNumber: number): Promise<boolean> => {
    if (!activeFpcId) return false;
    setErrorMessage(null);
    try {
      const response = await saveFpcDraft({
        id: activeFpcId,
        registrationDataJson: JSON.stringify(updatedDrafts),
        lastCompletedStep: completedStepNumber,
        baseLastModifiedAtUtc: currentLastModified,
      }).unwrap();

      if (response?.data?.lastModifiedAtUtc) {
        setSavedLastModified(response.data.lastModifiedAtUtc);
      }
      setStatusMessage(`Step ${completedStepNumber} progress saved successfully.`);
      setTimeout(() => setStatusMessage(null), 3000);
      return true;
    } catch (err: unknown) {
      console.error('Failed to save draft to server', err);
      const serverMsg =
        (err as { data?: { message?: string }; message?: string })?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to save progress to server.';
      setErrorMessage(`Error saving Step ${completedStepNumber}: ${serverMsg}`);
      return false;
    }
  };

  const handleStepOneSubmit = async (values: typeof drafts.step1) => {
    const updated = { ...drafts, step1: values };
    setLocalDrafts(updated);
    const ok = await persistDraft(updated, 1);
    if (ok) goToStep(2);
  };

  const handleStepTwoSubmit = async (values: typeof drafts.step2) => {
    const updated = { ...drafts, step2: values };
    setLocalDrafts(updated);
    const ok = await persistDraft(updated, 2);
    if (ok) goToStep(3);
  };

  const handleStepThreeSubmit = async (values: typeof drafts.step3) => {
    const updated = { ...drafts, step3: values };
    setLocalDrafts(updated);
    const ok = await persistDraft(updated, 3);
    if (ok) goToStep(4);
  };

  const handleStepFourSubmit = async (values: typeof drafts.step4) => {
    const updated = { ...drafts, step4: values };
    setLocalDrafts(updated);
    const ok = await persistDraft(updated, 4);
    if (ok) goToStep(5);
  };

  const handleStepFiveSubmit = async (values: typeof drafts.step5, files: LogoDocumentsFileMap) => {
    if (!activeFpcId) {
      setErrorMessage('Cannot save documents: No active FPC identifier resolved.');
      return;
    }

    setErrorMessage(null);
    const documentIds: Record<string, string> = { ...(drafts.step5?.documentIds ?? {}) };

    if (files) {
      for (const [fieldKey, file] of Object.entries(files) as Array<
        [keyof LogoDocumentsFormValues, File | undefined]
      >) {
        if (!file) continue;

        const canonicalDocType = DOCUMENT_TYPE_BY_FIELD[fieldKey];
        if (!canonicalDocType) continue;

        const formData = new FormData();
        formData.append('documentType', canonicalDocType);
        formData.append('file', file, file.name);

        const expiryField = EXPIRY_FIELD_BY_FIELD[fieldKey];
        if (expiryField && values) {
          const rawDate = values[expiryField as keyof typeof values] as string | undefined;
          const formattedExpiry = formatDateToISO(rawDate);
          if (formattedExpiry) {
            formData.append('expiryDate', formattedExpiry);
          }
        }

        try {
          const uploadResult = await uploadFpcDocument({ fpcId: activeFpcId, formData }).unwrap();
          const uploadedDocId = uploadResult?.data?.documentId;
          if (uploadedDocId) {
            documentIds[fieldKey] = uploadedDocId;
          }
        } catch (uploadErr: unknown) {
          console.error(`Failed to upload ${fieldKey} (${canonicalDocType})`, uploadErr);
          const apiMsg =
            (uploadErr as { data?: { detail?: string; message?: string } })?.data?.detail ||
            (uploadErr as { data?: { message?: string } })?.data?.message ||
            (uploadErr as { message?: string })?.message ||
            `Failed to upload file for ${canonicalDocType}.`;

          // Preserve partial documentIds already uploaded
          const partialUpdated = {
            ...drafts,
            step5: { ...(values || {}), documentIds },
          };
          setLocalDrafts(partialUpdated);
          setErrorMessage(`Upload failed for ${file.name}: ${apiMsg}`);
          // Stop progression on failure
          return;
        }
      }
    }

    const updatedStep5 = { ...(values || {}), documentIds };
    const updated = { ...drafts, step5: updatedStep5 };
    setLocalDrafts(updated);

    const ok = await persistDraft(updated, 5);
    if (ok) {
      goToStep(6);
    }
  };

  const handleStepSixSubmit = async (values: typeof drafts.step6) => {
    const updated = { ...drafts, step6: values };
    setLocalDrafts(updated);
    const ok = await persistDraft(updated, 6);
    if (ok) goToStep(7);
  };

  const handleStepSevenSubmit = async (values: typeof drafts.step7) => {
    const updated = { ...drafts, step7: values };
    setLocalDrafts(updated);
    const ok = await persistDraft(updated, 7);
    if (ok) goToStep(8);
  };

  const handleFinalSubmit = async () => {
    if (!activeFpcId) return;
    try {
      await submitFpcRegistration({
        id: activeFpcId,
        remarks: 'Submitted by FPC Administrator via Self-Registration Portal',
      }).unwrap();

      navigate('/fpc/dashboard');
    } catch (err) {
      console.error('Failed to submit registration', err);
    }
  };

  const handleSaveAndReturn = async () => {
    const ok = await persistDraft(drafts, currentStep);
    if (ok) {
      navigate('/fpc/dashboard');
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E1E8E6] shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/fpc/dashboard')}
            className="text-[#5b6b63] hover:text-[#0E1B16]"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Button>
          <div className="h-4 w-px bg-[#E1E8E6]" />
          <div className="flex items-center gap-2 text-sm font-semibold text-[#0E1B16]">
            <Building2 className="w-4 h-4 text-[#0F4C36]" />
            <span>{fpcDetails?.name || currentUser?.activeFpcName || 'FPC Registration'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveAndReturn}
            disabled={isSavingDraft}
            className="flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSavingDraft ? 'Saving Draft...' : 'Save & Exit'}</span>
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert tone="danger" onClose={() => setErrorMessage(null)}>
          <span>{errorMessage}</span>
        </Alert>
      )}

      {statusMessage && (
        <Alert tone="success">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        </Alert>
      )}

      {/* 8-Step Progress & Navigation */}
      <OnboardingStepper
        currentStep={currentStep}
        completedStepsCount={completedStepsCount}
        onStepClick={goToStep}
      />

      {/* The Unified Reusable Registration Form */}
      <div className="bg-white rounded-xl border border-[#E1E8E6] p-6 shadow-sm">
        <FpcRegistrationForm
          mode={isSubmittedOrApproved ? 'readonly' : 'editable'}
          currentStep={currentStep}
          onStepChange={goToStep}
          drafts={drafts}
          fpcDetails={fpcDetails}
          onStepOneSubmit={handleStepOneSubmit}
          onStepTwoSubmit={handleStepTwoSubmit}
          onStepThreeSubmit={handleStepThreeSubmit}
          onStepFourSubmit={handleStepFourSubmit}
          onStepFiveSubmit={handleStepFiveSubmit}
          onStepSixSubmit={handleStepSixSubmit}
          onStepSevenSubmit={handleStepSevenSubmit}
          onFinalSubmit={handleFinalSubmit}
          isSubmitting={isSubmittingFinal}
          onBackToLogin={() => navigate('/fpc/dashboard')}
        />
      </div>
    </div>
  );
};
