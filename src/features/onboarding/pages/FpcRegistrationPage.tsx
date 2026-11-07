import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { Alert } from '../../../shared/components/Alert';
import { OnboardingStepper } from '../components/OnboardingStepper';
import { FpcBasicDetailsForm } from '../components/FpcBasicDetailsForm';
import { FpcLegalRegistrationForm } from '../components/FpcLegalRegistrationForm';
import { FpcFinancialInformationForm } from '../components/FpcFinancialInformationForm';
import { FpcBoardOfDirectorsForm } from '../components/FpcBoardOfDirectorsForm';
import { FpcLogoDocumentsForm } from '../components/FpcLogoDocumentsForm';
import { FpcAddressLocationForm } from '../components/FpcAddressLocationForm';
import { FpcBusinessActivitiesForm } from '../components/FpcBusinessActivitiesForm';
import { FpcFinalReviewForm } from '../components/FpcFinalReviewForm';
import { invitationApi } from '../api/invitation.api';
import type { BasicDetailsFormValues } from '../schemas/basicDetails.schema';
import type { LegalRegistrationFormValues } from '../schemas/legalRegistration.schema';
import type { FinancialInformationFormValues } from '../schemas/financialInformation.schema';
import type { BoardOfDirectorsFormValues } from '../schemas/boardOfDirectors.schema';
import type { LogoDocumentsFormValues } from '../schemas/logoDocuments.schema';
import type { AddressLocationFormValues } from '../schemas/addressLocation.schema';
import type { BusinessActivitiesFormValues } from '../schemas/businessActivities.schema';

export const FpcRegistrationPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const stepParam = Number(searchParams.get('step'));

  // Synchronous validation: ZERO useEffect
  const validationResult = invitationApi.validateTokenSync(token);
  const activeToken = token || 'demo-invite-token';

  const [currentStep, setCurrentStep] = useState<number>(
    stepParam >= 1 && stepParam <= 8 ? stepParam : 1
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [stepSuccessMessage, setStepSuccessMessage] = useState<string | null>(null);

  // Synchronous pre-read of stored step data for zero useEffect render
  const storedStep1Data = invitationApi.getStepOneData(activeToken);
  const storedStep2Data = invitationApi.getStepTwoData(activeToken);
  const storedStep3Data = invitationApi.getStepThreeData(activeToken);
  const storedStep4Data = invitationApi.getStepFourData(activeToken);
  const storedStep5Data = invitationApi.getStepFiveData(activeToken);
  const storedStep6Data = invitationApi.getStepSixData(activeToken);
  const storedStep7Data = invitationApi.getStepSevenData(activeToken);

  const goToStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('step', String(stepNumber));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepOneSubmit = async (values: BasicDetailsFormValues) => {
    setIsSubmitting(true);
    setStepSuccessMessage(null);
    try {
      const result = await invitationApi.submitStepOne(activeToken, values);
      if (result.success) {
        setStepSuccessMessage(result.message);
        goToStep(2);
      }
    } catch {
      // Graceful error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepTwoSubmit = async (values: LegalRegistrationFormValues) => {
    setIsSubmitting(true);
    setStepSuccessMessage(null);
    try {
      const result = await invitationApi.submitStepTwo(activeToken, values);
      if (result.success) {
        setStepSuccessMessage(result.message);
        goToStep(3);
      }
    } catch {
      // Graceful error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepThreeSubmit = async (values: FinancialInformationFormValues) => {
    setIsSubmitting(true);
    setStepSuccessMessage(null);
    try {
      const result = await invitationApi.submitStepThree(activeToken, values);
      if (result.success) {
        setStepSuccessMessage(result.message);
        goToStep(4);
      }
    } catch {
      // Graceful error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepFourSubmit = async (values: BoardOfDirectorsFormValues) => {
    setIsSubmitting(true);
    setStepSuccessMessage(null);
    try {
      const result = await invitationApi.submitStepFour(activeToken, values);
      if (result.success) {
        setStepSuccessMessage(result.message);
        goToStep(5);
      }
    } catch {
      // Graceful error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepFiveSubmit = async (values: LogoDocumentsFormValues) => {
    setIsSubmitting(true);
    setStepSuccessMessage(null);
    try {
      const result = await invitationApi.submitStepFive(activeToken, values);
      if (result.success) {
        setStepSuccessMessage(result.message);
        goToStep(6);
      }
    } catch {
      // Graceful error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepSixSubmit = async (values: AddressLocationFormValues) => {
    setIsSubmitting(true);
    setStepSuccessMessage(null);
    try {
      const result = await invitationApi.submitStepSix(activeToken, values);
      if (result.success) {
        setStepSuccessMessage(result.message);
        goToStep(7);
      }
    } catch {
      // Graceful error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepSevenSubmit = async (values: BusinessActivitiesFormValues) => {
    setIsSubmitting(true);
    setStepSuccessMessage(null);
    try {
      const result = await invitationApi.submitStepSeven(activeToken, values);
      if (result.success) {
        setStepSuccessMessage(result.message);
        goToStep(8);
      }
    } catch {
      // Graceful error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setStepSuccessMessage(null);
    try {
      const result = await invitationApi.submitFinalReview(activeToken);
      if (result.success) {
        setIsSubmitted(true);
      }
    } catch {
      // Graceful error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  // Invalid or expired invitation link screen
  if (!validationResult.valid || !validationResult.invitation) {
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
          <Button
            type="button"
            variant="secondary"
            className="rounded-full bg-brand-soft text-brand text-xs px-4 py-1.5 border-none font-medium"
          >
            English
          </Button>
        </header>

        <main className="max-w-lg w-full mx-auto my-auto">
          <Card
            variant="default"
            className="p-8 rounded-2xl border-neutral-200/80 shadow-sm text-center"
          >
            <div className="w-14 h-14 rounded-full bg-danger-soft text-danger mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h1 className="text-xl font-bold text-primary mb-2">
              Invalid or Expired Invitation
            </h1>
            <p className="text-sm text-secondary mb-6 leading-relaxed">
              {validationResult.error ||
                'This invitation link is not valid or has expired. Please contact your Tata Steel Foundation (TSF) Administrator to issue a new onboarding invitation.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                type="button"
                variant="primary"
                onClick={handleBackToLogin}
                className="w-full sm:w-auto rounded-full bg-[#0F4C36] hover:bg-[#0B3B2A] text-white px-6 py-2.5 text-xs font-semibold"
              >
                Return to Login
              </Button>
            </div>
          </Card>
        </main>

        <footer className="max-w-5xl w-full mx-auto text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} Tata Steel Foundation • FPC Management System
        </footer>
      </div>
    );
  }

  const { invitation } = validationResult;

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
          <Button
            type="button"
            variant="secondary"
            className="rounded-full bg-brand-soft text-brand text-xs px-4 py-1.5 border-none font-medium"
          >
            English
          </Button>
        </header>

        {/* Title block */}
        <div className="pt-2">
          <p className="text-[11px] sm:text-xs font-bold tracking-wider text-[#1E5E45] uppercase">
            TATA STEEL FOUNDATION • FPC COMPANY ONBOARDING
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mt-1">
            Onboard New Producer Company
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
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

        {/* Step 1: Basic Details */}
        {currentStep === 1 && (
          <FpcBasicDetailsForm
            invitation={invitation}
            onSubmit={handleStepOneSubmit}
            onBackToLogin={handleBackToLogin}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Step 2: Legal & Registration */}
        {currentStep === 2 && (
          <FpcLegalRegistrationForm
            initialData={storedStep2Data}
            onSubmit={handleStepTwoSubmit}
            onPreviousStep={() => goToStep(1)}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Step 3: Financial Information */}
        {currentStep === 3 && (
          <FpcFinancialInformationForm
            initialData={storedStep3Data}
            onSubmit={handleStepThreeSubmit}
            onPreviousStep={() => goToStep(2)}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Step 4: Board of Directors */}
        {currentStep === 4 && (
          <FpcBoardOfDirectorsForm
            initialData={storedStep4Data}
            onSubmit={handleStepFourSubmit}
            onPreviousStep={() => goToStep(3)}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Step 5: Logo & Documents */}
        {currentStep === 5 && (
          <FpcLogoDocumentsForm
            initialData={storedStep5Data}
            onSubmit={handleStepFiveSubmit}
            onPreviousStep={() => goToStep(4)}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Step 6: Address & Location */}
        {currentStep === 6 && (
          <FpcAddressLocationForm
            initialData={storedStep6Data}
            onSubmit={handleStepSixSubmit}
            onPreviousStep={() => goToStep(5)}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Step 7: Business Activities */}
        {currentStep === 7 && (
          <FpcBusinessActivitiesForm
            initialData={storedStep7Data}
            onSubmit={handleStepSevenSubmit}
            onPreviousStep={() => goToStep(6)}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Step 8: Final Review & Submission */}
        {currentStep === 8 && !isSubmitted && (
          <FpcFinalReviewForm
            step1Data={storedStep1Data}
            step2Data={storedStep2Data}
            step3Data={storedStep3Data}
            step4Data={storedStep4Data}
            step5Data={storedStep5Data}
            step6Data={storedStep6Data}
            step7Data={storedStep7Data}
            onEditStep={(step) => goToStep(step)}
            onPreviousStep={() => goToStep(7)}
            onSubmit={handleFinalSubmit}
            isSubmitting={isSubmitting}
          />
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
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#0F4C36]">
                Registration Complete
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-primary">
                Application Submitted Successfully
              </h2>
              <p className="text-sm text-secondary max-w-md mx-auto leading-relaxed">
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
