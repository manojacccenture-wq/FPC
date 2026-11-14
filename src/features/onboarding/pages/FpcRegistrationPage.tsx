import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { Alert } from '../../../shared/components/Alert';
import { NetworkStatusBadge } from '../../../shared/components/NetworkStatusBadge';
import { OnboardingStepper } from '../components/OnboardingStepper';
import { FpcRegistrationForm } from '../components/registration-form/FpcRegistrationForm';
import { type LogoDocumentsFileMap } from '../components/FpcLogoDocumentsForm';
import { invitationApi } from '../api/invitation.api';
import { onboardingSyncService } from '../services/onboardingSyncService';
import { resolveErrorMessage } from '../../../shared/forms';
import { formatDateToISO } from '../../../shared/utils/date';
import {
  useValidateFpcInvitationQuery,
  useCompleteFpcInvitationMutation,
  useUploadDocumentMutation,
} from '../api/fpcInvitationApi';
import type { FpcInvitation, FpcLogoDocumentsFormData } from '../types';
import type { BasicDetailsFormValues } from '../schemas/basicDetails.schema';
import type { LegalRegistrationFormValues } from '../schemas/legalRegistration.schema';
import type { FinancialInformationFormValues } from '../schemas/financialInformation.schema';
import type { BoardOfDirectorsFormValues } from '../schemas/boardOfDirectors.schema';
import type { LogoDocumentsFormValues } from '../schemas/logoDocuments.schema';
import type { AddressLocationFormValues } from '../schemas/addressLocation.schema';
import type { BusinessActivitiesFormValues } from '../schemas/businessActivities.schema';
import {
  DOCUMENT_TYPE_BY_FIELD,
  EXPIRY_FIELD_BY_FIELD,
} from '../constants/documentTypes';

export const FpcRegistrationPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawToken = searchParams.get('token') || '';
  const stepParam = Number(searchParams.get('step'));

  // Live token validation from PostgreSQL backend
  const { data: validationResult, isLoading: isValidating } = useValidateFpcInvitationQuery(rawToken, {
    skip: !rawToken,
  });
  const [completeInvitation] = useCompleteFpcInvitationMutation();
  const [uploadDocument] = useUploadDocumentMutation();
  const activeToken = rawToken;

  const [currentStep, setCurrentStep] = useState<number>(
    stepParam >= 1 && stepParam <= 8 ? stepParam : 1
  );
  const [isFinalSubmitting, setIsFinalSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [stepSuccessMessage, setStepSuccessMessage] = useState<string | null>(null);
  const [finalErrorMessage, setFinalErrorMessage] = useState<string | null>(null);

  // Synchronous pre-read of stored step data for zero useEffect render
  const [drafts, setDrafts] = useState<{
    step1: Partial<BasicDetailsFormValues> | null;
    step2: Partial<LegalRegistrationFormValues> | null;
    step3: Partial<FinancialInformationFormValues> | null;
    step4: Partial<BoardOfDirectorsFormValues> | null;
    step5: Partial<FpcLogoDocumentsFormData> | null;
    step6: Partial<AddressLocationFormValues> | null;
    step7: Partial<BusinessActivitiesFormValues> | null;
  }>(() => ({
    step1: invitationApi.getStepOneData(activeToken),
    step2: invitationApi.getStepTwoData(activeToken),
    step3: invitationApi.getStepThreeData(activeToken),
    step4: invitationApi.getStepFourData(activeToken),
    step5: invitationApi.getStepFiveData(activeToken),
    step6: invitationApi.getStepSixData(activeToken),
    step7: invitationApi.getStepSevenData(activeToken),
  }));

  // Asynchronous Dexie IndexedDB hydration on page refresh/mount
  useEffect(() => {
    let isCancelled = false;
    async function hydrateFromDexie() {
      if (!activeToken) return;
      try {
        const dexieDrafts = await invitationApi.loadAllDraftsFromDexie(activeToken);
        if (!isCancelled) {
          setDrafts((prev) => ({
            step1: dexieDrafts.step1 || prev.step1,
            step2: dexieDrafts.step2 || prev.step2,
            step3: dexieDrafts.step3 || prev.step3,
            step4: dexieDrafts.step4 || prev.step4,
            step5: dexieDrafts.step5 || prev.step5,
            step6: dexieDrafts.step6 || prev.step6,
            step7: dexieDrafts.step7 || prev.step7,
          }));
        }
      } catch (err) {
        console.warn('Dexie hydration warning:', err);
      }
    }
    hydrateFromDexie();
    return () => {
      isCancelled = true;
    };
  }, [activeToken]);

  const goToStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('step', String(stepNumber));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Saves one onboarding step and advances the wizard.
   * Throws on failure so the step form's `handleSubmit` can surface the message
   * through its own error handling instead of silently staying on the page.
   */
  const runStep = async <T,>(
    stepNumber: number,
    action: () => Promise<{ success: boolean; message: string }>,
    savedData?: T
  ) => {
    setStepSuccessMessage(null);

    const result = await action();
    if (!result.success) {
      throw new Error(result.message || 'We could not save this step. Please try again.');
    }

    if (savedData !== undefined) {
      setDrafts((prev) => ({
        ...prev,
        [`step${stepNumber}`]: savedData,
      }));
    }

    setStepSuccessMessage(result.message);
    goToStep(stepNumber + 1);
  };

  const handleStepOneSubmit = (values: BasicDetailsFormValues) =>
    runStep(1, () => invitationApi.submitStepOne(activeToken, values), values);

  const handleStepTwoSubmit = (values: LegalRegistrationFormValues) =>
    runStep(2, () => invitationApi.submitStepTwo(activeToken, values), values);

  const handleStepThreeSubmit = (values: FinancialInformationFormValues) =>
    runStep(3, () => invitationApi.submitStepThree(activeToken, values), values);

  const handleStepFourSubmit = (values: BoardOfDirectorsFormValues) =>
    runStep(4, () => invitationApi.submitStepFour(activeToken, values), values);

  /**
   * Uploads the selected files first, then saves the step with the returned document IDs.
   * Only IDs are persisted; the File objects stay in memory for the duration of the submit.
   */
  const handleStepFiveSubmit = async (
    values: LogoDocumentsFormValues,
    files: LogoDocumentsFileMap
  ) => {
    setStepSuccessMessage(null);

    const documentIds: Record<string, string> = { ...(drafts.step5?.documentIds ?? {}) };

    for (const [field, file] of Object.entries(files) as Array<
      [keyof LogoDocumentsFormValues, File | undefined]
    >) {
      const documentType = DOCUMENT_TYPE_BY_FIELD[field];
      if (!file || !documentType) {
        continue;
      }

      const expiryField = EXPIRY_FIELD_BY_FIELD[field];
      const expiryDate = expiryField
        ? formatDateToISO(values[expiryField] as string | undefined)
        : undefined;

      const uploaded = await uploadDocument({
        token: activeToken,
        documentType,
        file,
        expiryDate,
      }).unwrap();

      documentIds[field] = uploaded.documentId;
    }

    const savedStep: Partial<FpcLogoDocumentsFormData> = { ...values, documentIds };
    await runStep(5, () => invitationApi.submitStepFive(activeToken, savedStep), savedStep);
  };

  const handleStepSixSubmit = (values: AddressLocationFormValues) =>
    runStep(6, () => invitationApi.submitStepSix(activeToken, values), values);

  const handleStepSevenSubmit = (values: BusinessActivitiesFormValues) =>
    runStep(7, () => invitationApi.submitStepSeven(activeToken, values), values);

  const handleFinalSubmit = async () => {
    if (isFinalSubmitting) return;

    setIsFinalSubmitting(true);
    setStepSuccessMessage(null);
    setFinalErrorMessage(null);

    try {
      if (activeToken) {
        // Collect verified data from all steps for atomic server-side persistence
        const step1 = drafts.step1 || invitationApi.getStepOneData(activeToken);
        const step2 = drafts.step2 || invitationApi.getStepTwoData(activeToken);
        const step3 = drafts.step3 || invitationApi.getStepThreeData(activeToken);
        const step5 = drafts.step5 || invitationApi.getStepFiveData(activeToken);
        const step6 = drafts.step6 || invitationApi.getStepSixData(activeToken);

        const primaryBank = step3?.bankAccounts?.[0];
        const address2Parts = [step6?.block, step6?.village].filter(Boolean);
        const normalizedRegistrationDate = formatDateToISO(step1?.dateOfIncorporation);

        const step5DocumentIds = step5?.documentIds ?? {};

        const documents: Array<{
          documentType: string;
          fileName: string;
          documentId?: string;
          expiryDate?: string;
        }> = [];

        if (step5?.logoFileName) {
          documents.push({
            documentType: 'CompanyLogo',
            fileName: step5.logoFileName,
            documentId: step5DocumentIds.logoFileName,
          });
        }
        if (step5?.incorporationCertName) {
          documents.push({
            documentType: 'CertificateOfIncorporation',
            fileName: step5.incorporationCertName,
            documentId: step5DocumentIds.incorporationCertName,
          });
        }
        if (step5?.panCertName) {
          documents.push({
            documentType: 'PanCard',
            fileName: step5.panCertName,
            documentId: step5DocumentIds.panCertName,
          });
        }
        if (step5?.gstinCertName) {
          documents.push({
            documentType: 'GstinCertificate',
            fileName: step5.gstinCertName,
            documentId: step5DocumentIds.gstinCertName,
          });
        }
        if (step5?.fssaiLicenseName) {
          documents.push({
            documentType: 'FssaiLicense',
            fileName: step5.fssaiLicenseName,
            documentId: step5DocumentIds.fssaiLicenseName,
            expiryDate: formatDateToISO(step5.fssaiExpiryDate),
          });
        }
        if (step5?.seedLicenseName) {
          documents.push({
            documentType: 'SeedLicense',
            fileName: step5.seedLicenseName,
            documentId: step5DocumentIds.seedLicenseName,
            expiryDate: formatDateToISO(step5.seedLicenseExpiryDate),
          });
        }
        if (step5?.fertilizerLicenseName) {
          documents.push({
            documentType: 'FertilizerLicense',
            fileName: step5.fertilizerLicenseName,
            documentId: step5DocumentIds.fertilizerLicenseName,
            expiryDate: formatDateToISO(step5.fertilizerLicenseExpiryDate),
          });
        }
        if (step5?.moaAoaDocName) {
          documents.push({
            documentType: 'MoaAoa',
            fileName: step5.moaAoaDocName,
            documentId: step5DocumentIds.moaAoaDocName,
          });
        }
        if (step5?.boardResolutionDocName) {
          documents.push({
            documentType: 'BoardResolution',
            fileName: step5.boardResolutionDocName,
            documentId: step5DocumentIds.boardResolutionDocName,
          });
        }

        const fullRegistrationPayload = {
          step1,
          step2,
          step3,
          step4: drafts.step4 || invitationApi.getStepFourData(activeToken),
          step5,
          step6,
          step7: drafts.step7 || invitationApi.getStepSevenData(activeToken),
        };

        const result = await onboardingSyncService.submitOnboarding(
          {
            token: activeToken,
            legalName: step1?.legalName,
            cin: step1?.cin,
            registrationDate: normalizedRegistrationDate,
            officialEmail: step1?.contactEmail,
            officialMobile: step1?.contactMobile,
            pan: step2?.companyPan,
            tan: step2?.companyTan,
            gstin: step2?.gstin,
            bankName: primaryBank?.bankName,
            bankAccountNumber: primaryBank?.accountNumber,
            bankIfsc: primaryBank?.ifscCode,
            addressLine1: step6?.streetAddress,
            addressLine2: address2Parts.length > 0 ? address2Parts.join(', ') : undefined,
            pincode: step6?.pinCode,
            district: step6?.district,
            state: step6?.state,
            documents: documents.length > 0 ? documents : undefined,
            registrationDataJson: JSON.stringify(fullRegistrationPayload),
          },
          (payload) => completeInvitation(payload).unwrap()
        );

        if (result.queuedOffline) {
          setStepSuccessMessage(result.message || 'Saved offline successfully.');
        }
      }
      await invitationApi.submitFinalReview(activeToken);
      setIsSubmitted(true);
    } catch (err: unknown) {
      // Stay on the review step and explain the failure instead of showing a false success screen.
      setFinalErrorMessage(
        resolveErrorMessage(err, 'We could not submit your onboarding application. Please try again.')
      );
    } finally {
      setIsFinalSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  // Loading validation state
  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col justify-center items-center p-8">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-secondary uppercase tracking-wider">
          Validating Invitation Security Credentials...
        </p>
      </div>
    );
  }

  // Invalid or expired invitation link screen
  if (!rawToken || !validationResult?.isValid) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
        <header className="max-w-5xl w-full mx-auto flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBackToLogin}
            className="rounded-full bg-white text-secondary text-xs px-4 py-1.5 border-neutral-200 shadow-2xs hover:bg-neutral-50"
          >
            Back to Login
          </Button>
          <div className="flex items-center gap-3">
            <NetworkStatusBadge />
            <Button
              type="button"
              variant="secondary"
              className="rounded-full bg-brand-soft text-brand text-xs px-4 py-1.5 border-none font-medium"
            >
              English
            </Button>
          </div>
        </header>

        <main className="max-w-lg w-full mx-auto my-auto">
          <Card
            variant="default"
            className="p-8 rounded-2xl border-neutral-200/80 shadow-sm text-center"
          >
            <div className="w-14 h-14 rounded-full bg-danger-soft text-danger mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h1 className="modal-title text-primary mb-2">
              Invalid or Expired Invitation
            </h1>
            <p className="text-secondary mb-6 leading-relaxed">
              {validationResult?.errorMessage ||
                (!rawToken
                  ? 'No invitation token was supplied in the registration link. Please use the complete link provided in your invitation email.'
                  : 'This invitation link is not valid or has expired. Please contact your Tata Steel Foundation (TSF) Administrator to issue a new onboarding invitation.')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                type="button"
                variant="primary"
                onClick={handleBackToLogin}
                className="w-full sm:w-auto rounded-full bg-[#0F4C36] hover:bg-[#0B3B2A] text-white px-6 py-2.5 font-semibold"
              >
                Return to Login
              </Button>
            </div>
          </Card>
        </main>

        <footer className="max-w-5xl w-full mx-auto text-center text-neutral-400">
          <small>© {new Date().getFullYear()} Tata Steel Foundation • FPC Management System</small>
        </footer>
      </div>
    );
  }

  const invitation: FpcInvitation = {
    token: rawToken,
    companyName: validationResult.companyName || '',
    nominatedAdmin: validationResult.nominatedAdmin || '',
    email: validationResult.email || '',
    phoneNumber: validationResult.phoneNumber || '',
    state: validationResult.state || '',
    district: validationResult.district || '',
    createdAt: '',
    expiresAt: validationResult.expiresAtUtc || '',
    status: 'pending',
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto space-y-6">
        {/* Top bar */}
        <header className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBackToLogin}
            className="rounded-full bg-white text-secondary text-xs px-4 py-1.5 border-neutral-200 shadow-2xs hover:bg-neutral-50"
          >
            Back to Login
          </Button>
          <div className="flex items-center gap-3">
            <NetworkStatusBadge />
            <Button
              type="button"
              variant="secondary"
              className="rounded-full bg-brand-soft text-brand text-xs px-4 py-1.5 border-none font-medium"
            >
              English
            </Button>
          </div>
        </header>

        {/* Title block */}
        <div className="pt-2">
          <p className="floating-label font-bold text-brand">
            TATA STEEL FOUNDATION • FPC COMPANY ONBOARDING
          </p>
          <h1 className="page-heading text-primary mt-1">
            Onboard New Producer Company
          </h1>
          <p className="text-secondary mt-1">
            8-Step structured onboarding wizard. Complete company legal, financial, governance, and operational records.
          </p>
        </div>

        {/* Stepper bar */}
        <OnboardingStepper
          currentStep={currentStep}
          onStepClick={(step) => goToStep(step)}
        />

        {/* Step Success Feedback */}
        {stepSuccessMessage && (
          <Alert
            tone="success"
            variant="card"
            title="Progress Saved"
            onClose={() => setStepSuccessMessage(null)}
            icon={<CheckCircle2 className="w-5 h-5 text-success" />}
          >
            {stepSuccessMessage}
          </Alert>
        )}

        {/* Unified 8-Step Registration Form */}
        {!isSubmitted && (
          <>
            {currentStep === 8 && finalErrorMessage && (
              <Alert
                tone="danger"
                variant="card"
                title="Submission failed"
                onClose={() => setFinalErrorMessage(null)}
              >
                {finalErrorMessage}
              </Alert>
            )}

            <FpcRegistrationForm
              mode="editable"
              currentStep={currentStep}
              onStepChange={(step) => goToStep(step)}
              drafts={drafts}
              invitation={invitation}
              onStepOneSubmit={handleStepOneSubmit}
              onStepTwoSubmit={handleStepTwoSubmit}
              onStepThreeSubmit={handleStepThreeSubmit}
              onStepFourSubmit={handleStepFourSubmit}
              onStepFiveSubmit={handleStepFiveSubmit}
              onStepSixSubmit={handleStepSixSubmit}
              onStepSevenSubmit={handleStepSevenSubmit}
              onFinalSubmit={handleFinalSubmit}
              onBackToLogin={handleBackToLogin}
              isSubmitting={isFinalSubmitting}
            />
          </>
        )}

        {/* Final Submission Success Confirmation */}
        {isSubmitted && (
          <Card
            variant="default"
            className="p-8 sm:p-12 rounded-2xl border-neutral-200/80 shadow-sm text-center max-w-2xl mx-auto space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#0F4C36] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 stroke-[2]" />
            </div>
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full font-semibold bg-emerald-50 text-[#0F4C36]">
                <small className="font-semibold">Registration Complete</small>
              </span>
              <h2 className="modal-title text-primary">
                Application Submitted Successfully
              </h2>
              <p className="text-secondary max-w-md mx-auto leading-relaxed">
                Your onboarding records for{' '}
                <strong className="text-primary font-semibold">
                  {invitation.companyName}
                </strong>{' '}
                have been securely submitted to the Tata Steel Foundation (TSF) Administrative team for statutory review and verification.
              </p>
            </div>

            <div className="bg-[#F8FAF9] rounded-xl p-4 text-xs text-secondary border border-neutral-200/80 space-y-2 text-left max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-neutral-500">Application Reference:</span>
                <span className="font-mono font-semibold text-primary">{activeToken}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Nominated Admin:</span>
                <span className="font-semibold text-primary">{invitation.nominatedAdmin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Official Email:</span>
                <span className="font-semibold text-primary">{invitation.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Status:</span>
                <span className="font-semibold text-emerald-700">Pending TSF Review</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSubmitted(false)}
                className="w-full sm:w-auto rounded-full bg-white text-secondary text-xs px-6 py-2.5 border-neutral-200 shadow-2xs hover:bg-neutral-50"
              >
                Review Application Details
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleBackToLogin}
                className="w-full sm:w-auto rounded-full bg-[#0F4C36] hover:bg-[#0B3B2A] text-white px-7 py-2.5 text-xs font-semibold shadow-2xs"
              >
                Return to Login
              </Button>
            </div>
          </Card>
        )}
      </div>

      <footer className="max-w-5xl w-full mx-auto text-center text-xs text-neutral-400 pt-8 pb-4">
        © {new Date().getFullYear()} Tata Steel Foundation • All rights reserved
      </footer>
    </div>
  );
};
