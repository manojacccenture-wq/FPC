import React from 'react';
import { FpcBasicDetailsForm } from '../FpcBasicDetailsForm';
import { FpcLegalRegistrationForm } from '../FpcLegalRegistrationForm';
import { FpcFinancialInformationForm } from '../FpcFinancialInformationForm';
import { FpcBoardOfDirectorsForm } from '../FpcBoardOfDirectorsForm';
import { FpcLogoDocumentsForm, type LogoDocumentsFileMap } from '../FpcLogoDocumentsForm';
import { FpcAddressLocationForm } from '../FpcAddressLocationForm';
import { FpcBusinessActivitiesForm } from '../FpcBusinessActivitiesForm';
import { FpcFinalReviewForm } from '../FpcFinalReviewForm';
import type { FpcInvitation } from '../../types';
import type { FpcInvitationDto } from '../../api/fpcInvitationApi';
import type { FpcDetailsDto } from '../../../fpc/api/fpcApi';
import type { BasicDetailsFormValues } from '../../schemas/basicDetails.schema';
import type { LegalRegistrationFormValues } from '../../schemas/legalRegistration.schema';
import type { FinancialInformationFormValues } from '../../schemas/financialInformation.schema';
import type { BoardOfDirectorsFormValues } from '../../schemas/boardOfDirectors.schema';
import type { LogoDocumentsFormValues } from '../../schemas/logoDocuments.schema';
import type { AddressLocationFormValues } from '../../schemas/addressLocation.schema';
import type { BusinessActivitiesFormValues } from '../../schemas/businessActivities.schema';
import type { RegistrationStepDrafts } from '../../utils/fpcFormMapper';

export interface FpcRegistrationFormProps {
  mode: 'editable' | 'readonly';
  currentStep: number;
  onStepChange: (step: number) => void;
  drafts: RegistrationStepDrafts;
  // Editable mode handlers & props
  invitation?: FpcInvitation | FpcInvitationDto | null;
  onStepOneSubmit?: (values: BasicDetailsFormValues) => Promise<void> | void;
  onStepTwoSubmit?: (values: LegalRegistrationFormValues) => Promise<void> | void;
  onStepThreeSubmit?: (values: FinancialInformationFormValues) => Promise<void> | void;
  onStepFourSubmit?: (values: BoardOfDirectorsFormValues) => Promise<void> | void;
  onStepFiveSubmit?: (values: LogoDocumentsFormValues, files: LogoDocumentsFileMap) => Promise<void> | void;
  onStepSixSubmit?: (values: AddressLocationFormValues) => Promise<void> | void;
  onStepSevenSubmit?: (values: BusinessActivitiesFormValues) => Promise<void> | void;
  onFinalSubmit?: () => Promise<void> | void;
  onBackToLogin?: () => void;
  isSubmitting?: boolean;
  // Readonly mode props
  fpcDetails?: FpcDetailsDto | null;
}

const noop = () => {};

export const FpcRegistrationForm: React.FC<FpcRegistrationFormProps> = ({
  mode,
  currentStep,
  onStepChange,
  drafts,
  invitation,
  onStepOneSubmit,
  onStepTwoSubmit,
  onStepThreeSubmit,
  onStepFourSubmit,
  onStepFiveSubmit,
  onStepSixSubmit,
  onStepSevenSubmit,
  onFinalSubmit,
  onBackToLogin,
  isSubmitting = false,
  fpcDetails,
}) => {
  const isReadOnly = mode === 'readonly';

  // Construct fallback minimal invitation for Step 1 when in readonly mode without an invitation object
  const activeInvitation: FpcInvitation = invitation
    ? {
        companyName: invitation.companyName,
        email: invitation.email,
        phoneNumber: invitation.phoneNumber,
        nominatedAdmin: invitation.nominatedAdmin,
        district: invitation.district,
        state: invitation.state,
        status: (invitation.status as FpcInvitation['status']) || 'completed',
        createdAt: 'createdAt' in invitation ? invitation.createdAt : (invitation as FpcInvitationDto).createdAtUtc,
        expiresAt: 'expiresAt' in invitation ? invitation.expiresAt : (invitation as FpcInvitationDto).expiresAtUtc,
        token: 'token' in invitation ? invitation.token : '',
      }
    : {
        companyName: drafts.step1?.legalName || fpcDetails?.name || 'FPC Enterprise',
        email: drafts.step1?.contactEmail || fpcDetails?.primaryEmail || '',
        phoneNumber: drafts.step1?.contactMobile || fpcDetails?.primaryMobile || '',
        nominatedAdmin: 'TSF Nominated Administrator',
        district: drafts.step6?.district || fpcDetails?.district || 'Jajpur',
        state: drafts.step6?.state || fpcDetails?.state || 'Odisha',
        status: 'completed',
        createdAt: '',
        expiresAt: '',
        token: '',
      };

  switch (currentStep) {
    case 1:
      return (
        <FpcBasicDetailsForm
          invitation={activeInvitation}
          initialData={drafts.step1}
          onSubmit={onStepOneSubmit || noop}
          onBackToLogin={onBackToLogin}
          isReadOnly={isReadOnly}
          onNextStep={() => onStepChange(2)}
        />
      );

    case 2:
      return (
        <FpcLegalRegistrationForm
          initialData={drafts.step2}
          onSubmit={onStepTwoSubmit || noop}
          onPreviousStep={() => onStepChange(1)}
          isReadOnly={isReadOnly}
          onNextStep={() => onStepChange(3)}
        />
      );

    case 3:
      return (
        <FpcFinancialInformationForm
          initialData={drafts.step3}
          onSubmit={onStepThreeSubmit || noop}
          onPreviousStep={() => onStepChange(2)}
          isReadOnly={isReadOnly}
          onNextStep={() => onStepChange(4)}
        />
      );

    case 4:
      return (
        <FpcBoardOfDirectorsForm
          initialData={drafts.step4}
          onSubmit={onStepFourSubmit || noop}
          onPreviousStep={() => onStepChange(3)}
          isReadOnly={isReadOnly}
          onNextStep={() => onStepChange(5)}
        />
      );

    case 5:
      return (
        <FpcLogoDocumentsForm
          initialData={drafts.step5}
          onSubmit={onStepFiveSubmit || noop}
          onPreviousStep={() => onStepChange(4)}
          isReadOnly={isReadOnly}
          onNextStep={() => onStepChange(6)}
          fpcId={fpcDetails?.id || (invitation as { id?: string })?.id}
          storedDocuments={fpcDetails?.documents}
        />
      );

    case 6:
      return (
        <FpcAddressLocationForm
          initialData={drafts.step6}
          onSubmit={onStepSixSubmit || noop}
          onPreviousStep={() => onStepChange(5)}
          isReadOnly={isReadOnly}
          onNextStep={() => onStepChange(7)}
        />
      );

    case 7:
      return (
        <FpcBusinessActivitiesForm
          initialData={drafts.step7}
          onSubmit={onStepSevenSubmit || noop}
          onPreviousStep={() => onStepChange(6)}
          isReadOnly={isReadOnly}
          onNextStep={() => onStepChange(8)}
        />
      );

    case 8:
      return (
        <FpcFinalReviewForm
          step1Data={drafts.step1}
          step2Data={drafts.step2}
          step3Data={drafts.step3}
          step4Data={drafts.step4}
          step5Data={drafts.step5}
          step6Data={drafts.step6}
          step7Data={drafts.step7}
          onEditStep={(step) => onStepChange(step)}
          onPreviousStep={() => onStepChange(7)}
          onSubmit={onFinalSubmit || noop}
          isSubmitting={isSubmitting}
          isReadOnly={isReadOnly}
        />
      );

    default:
      return (
        <FpcBasicDetailsForm
          invitation={activeInvitation}
          initialData={drafts.step1}
          onSubmit={onStepOneSubmit || noop}
          onBackToLogin={onBackToLogin}
          isReadOnly={isReadOnly}
          onNextStep={() => onStepChange(2)}
        />
      );
  }
};
