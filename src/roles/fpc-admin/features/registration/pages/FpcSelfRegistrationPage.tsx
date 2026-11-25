import React, { useState, useRef } from 'react';
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
import {
  FpcRegistrationForm,
  type FpcRegistrationFormHandle,
} from '../../../../../features/onboarding/components/registration-form/FpcRegistrationForm';
import { Button, Alert } from '../../../../../shared/components';
import { ValidationModeToggle } from '../../../../../shared/components/ValidationModeToggle';
import { ValidationModeProvider } from '../../../../../shared/forms';
import { selectValidationEnabled } from '../../../../../shared/slices/demoValidationSlice';
import { VALIDATION_TOGGLE_ENABLED } from '../../../../../shared/config/env';
import type { LogoDocumentsFileMap } from '../../../../../features/onboarding/components/FpcLogoDocumentsForm';
import {
  DOCUMENT_TYPE_BY_FIELD,
  EXPIRY_FIELD_BY_FIELD,
  type DirectorDocumentsFileMap,
} from '../../../../../features/onboarding/constants/documentTypes';
import { formatDateToISO } from '../../../../../shared/utils/date';
import type { BasicDetailsFormValues } from '../../../../../features/onboarding/schemas/basicDetails.schema';
import type { LegalRegistrationFormValues } from '../../../../../features/onboarding/schemas/legalRegistration.schema';
import type { FinancialInformationFormValues } from '../../../../../features/onboarding/schemas/financialInformation.schema';
import type { BoardOfDirectorsFormValues } from '../../../../../features/onboarding/schemas/boardOfDirectors.schema';
import type { LogoDocumentsFormValues } from '../../../../../features/onboarding/schemas/logoDocuments.schema';
import type { AddressLocationFormValues } from '../../../../../features/onboarding/schemas/addressLocation.schema';
import type { BusinessActivitiesFormValues } from '../../../../../features/onboarding/schemas/businessActivities.schema';

export const FpcSelfRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const formRef = useRef<FpcRegistrationFormHandle>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeFpcId, currentUser } = useAppSelector((state) => state.auth);
  const storedValidationEnabled = useAppSelector(selectValidationEnabled);
  const isValidationBypassed = VALIDATION_TOGGLE_ENABLED && !storedValidationEnabled;

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

  const handleStepFourSubmit = async (
    values: typeof drafts.step4,
    files: DirectorDocumentsFileMap
  ) => {
    if (!activeFpcId) {
      setErrorMessage('Cannot upload director documents: No active FPC identifier resolved.');
      return;
    }

    setErrorMessage(null);
    const directors = (values?.directors ?? []).map((director) => ({ ...director }));

    for (const upload of Object.values(files)) {
      const formData = new FormData();
      formData.append('documentType', upload.documentType);
      formData.append('file', upload.file, upload.file.name);
      formData.append('directorKey', upload.directorKey);

      try {
        const uploadResult = await uploadFpcDocument({ fpcId: activeFpcId, formData }).unwrap();
        const uploadedDocId = uploadResult?.data?.documentId;
        const director = directors.find((d) => d.directorKey === upload.directorKey);

        if (uploadedDocId && director) {
          if (upload.field === 'aadhaarDocName') {
            director.aadhaarDocName = uploadResult.data.fileName;
            director.aadhaarDocumentId = uploadedDocId;
          } else if (upload.field === 'panDocName') {
            director.panDocName = uploadResult.data.fileName;
            director.panDocumentId = uploadedDocId;
          } else if (upload.field === 'voterIdDocName') {
            director.voterIdDocName = uploadResult.data.fileName;
            director.voterIdDocumentId = uploadedDocId;
          }
        }
      } catch (uploadErr: unknown) {
        const apiMsg =
          (uploadErr as { data?: { detail?: string; message?: string } })?.data?.detail ||
          (uploadErr as { data?: { message?: string } })?.data?.message ||
          (uploadErr as { message?: string })?.message ||
          `Failed to upload ${upload.field}.`;

        setErrorMessage(`Upload failed for ${upload.file.name}: ${apiMsg}`);
        return;
      }
    }

    const updated = { ...drafts, step4: { ...(values ?? {}), directors } };
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
    let currentStepDrafts: RegistrationStepDrafts = { ...drafts };
    const activeData = formRef.current?.getActiveStepData();

    if (activeData && activeData.values) {
      if (currentStep === 1) {
        currentStepDrafts = {
          ...currentStepDrafts,
          step1: activeData.values as BasicDetailsFormValues,
        };
      } else if (currentStep === 2) {
        currentStepDrafts = {
          ...currentStepDrafts,
          step2: activeData.values as LegalRegistrationFormValues,
        };
      } else if (currentStep === 3) {
        currentStepDrafts = {
          ...currentStepDrafts,
          step3: activeData.values as FinancialInformationFormValues,
        };
      } else if (currentStep === 4) {
        const step4Values = activeData.values as BoardOfDirectorsFormValues;
        const directors = (step4Values?.directors ?? []).map((director) => ({ ...director }));
        const files = activeData.files as DirectorDocumentsFileMap | undefined;

        if (files && activeFpcId) {
          for (const upload of Object.values(files)) {
            const director = directors.find((d) => d.directorKey === upload.directorKey);
            if (director) {
              if (upload.field === 'aadhaarDocName' && director.aadhaarDocumentId) continue;
              if (upload.field === 'panDocName' && director.panDocumentId) continue;
              if (upload.field === 'voterIdDocName' && director.voterIdDocumentId) continue;
            }

            const formData = new FormData();
            formData.append('documentType', upload.documentType);
            formData.append('file', upload.file, upload.file.name);
            formData.append('directorKey', upload.directorKey);

            try {
              const uploadResult = await uploadFpcDocument({ fpcId: activeFpcId, formData }).unwrap();
              const uploadedDocId = uploadResult?.data?.documentId;

              if (uploadedDocId && director) {
                if (upload.field === 'aadhaarDocName') {
                  director.aadhaarDocName = uploadResult.data.fileName;
                  director.aadhaarDocumentId = uploadedDocId;
                } else if (upload.field === 'panDocName') {
                  director.panDocName = uploadResult.data.fileName;
                  director.panDocumentId = uploadedDocId;
                } else if (upload.field === 'voterIdDocName') {
                  director.voterIdDocName = uploadResult.data.fileName;
                  director.voterIdDocumentId = uploadedDocId;
                }
              }
            } catch (uploadErr: unknown) {
              const apiMsg =
                (uploadErr as { data?: { detail?: string; message?: string } })?.data?.detail ||
                (uploadErr as { data?: { message?: string } })?.data?.message ||
                (uploadErr as { message?: string })?.message ||
                `Failed to upload ${upload.field}.`;

              setErrorMessage(`Upload failed for ${upload.file.name}: ${apiMsg}`);
              return;
            }
          }
        }

        currentStepDrafts = {
          ...currentStepDrafts,
          step4: { ...(step4Values ?? {}), directors },
        };
      } else if (currentStep === 5) {
        const step5Values = activeData.values as LogoDocumentsFormValues;
        const documentIds: Record<string, string> = { ...(drafts.step5?.documentIds ?? {}) };
        const files = activeData.files as LogoDocumentsFileMap | undefined;

        if (files && activeFpcId) {
          for (const [fieldKey, file] of Object.entries(files) as Array<
            [keyof LogoDocumentsFormValues, File | undefined]
          >) {
            if (!file) continue;
            if (documentIds[fieldKey]) continue;

            const canonicalDocType = DOCUMENT_TYPE_BY_FIELD[fieldKey];
            if (!canonicalDocType) continue;

            const formData = new FormData();
            formData.append('documentType', canonicalDocType);
            formData.append('file', file, file.name);

            const expiryField = EXPIRY_FIELD_BY_FIELD[fieldKey];
            if (expiryField && step5Values) {
              const rawDate = step5Values[expiryField as keyof typeof step5Values] as string | undefined;
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
              const apiMsg =
                (uploadErr as { data?: { detail?: string; message?: string } })?.data?.detail ||
                (uploadErr as { data?: { message?: string } })?.data?.message ||
                (uploadErr as { message?: string })?.message ||
                `Failed to upload file for ${canonicalDocType}.`;

              const partialUpdated = {
                ...drafts,
                step5: { ...(step5Values || {}), documentIds },
              };
              setLocalDrafts(partialUpdated);
              setErrorMessage(`Upload failed for ${file.name}: ${apiMsg}`);
              return;
            }
          }
        }

        currentStepDrafts = {
          ...currentStepDrafts,
          step5: { ...(step5Values || {}), documentIds },
        };
      } else if (currentStep === 6) {
        currentStepDrafts = {
          ...currentStepDrafts,
          step6: activeData.values as AddressLocationFormValues,
        };
      } else if (currentStep === 7) {
        currentStepDrafts = {
          ...currentStepDrafts,
          step7: activeData.values as BusinessActivitiesFormValues,
        };
      }

      setLocalDrafts(currentStepDrafts);
    }

    const completedStepNumber = Math.max(completedStepsCount, currentStep);
    const ok = await persistDraft(currentStepDrafts, completedStepNumber);
    if (ok) {
      navigate('/fpc/dashboard');
    }
  };

  return (
    <ValidationModeProvider>
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
            {VALIDATION_TOGGLE_ENABLED && <ValidationModeToggle />}
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

        {/* Demo mode: frontend validation enforcement is off */}
        {isValidationBypassed && (
          <Alert
            tone="demo"
            variant="card"
            title="Validation paused — demo mode"
          >
            Mandatory-field checks are turned off on this browser so every step can be explored freely.
            Values are still saved, and the server validates everything when the application is submitted.
          </Alert>
        )}

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
            ref={formRef}
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
    </ValidationModeProvider>
  );
};
