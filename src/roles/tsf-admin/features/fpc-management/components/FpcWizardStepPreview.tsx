import React from 'react';
import { Button, Card, Input } from '../../../../../shared/components';

export interface FpcPreviewData {
  companyName: string;
  nominatedAdmin?: string;
  email?: string;
  phoneNumber?: string;
  state?: string;
  district?: string;
  pincode?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  cin?: string;
  fpcCode?: string;
  registrationNumber?: string;
  rocOffice?: string;
  companyCategory?: string;
  website?: string | null;
  pan?: string | null;
  tan?: string | null;
  gstin?: string | null;
  fssaiLicense?: string | null;
  seedLicense?: string | null;
  fertilizerLicense?: string | null;
  registrationDate?: string;
  authorizedCapital?: string | null;
  paidUpCapital?: string | null;
  faceValuePerShare?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankIfsc?: string | null;
  farmersCount?: number;
  shareholdersCount?: number;
  directorsSummary?: string | null;
  logoFileName?: string | null;
  incorporationCertName?: string | null;
  panCertName?: string | null;
  moaAoaDocName?: string | null;
  boardResolutionDocName?: string | null;
  fssaiLicenseName?: string | null;
  fssaiExpiryDate?: string | null;
  seedLicenseName?: string | null;
  seedLicenseExpiryDate?: string | null;
  fertilizerLicenseName?: string | null;
  fertilizerLicenseExpiryDate?: string | null;
  documents?: Array<{
    documentType: string;
    fileName: string;
    storagePath?: string | null;
    expiryDate?: string | null;
  }> | null;
  primaryCommodities?: string | string[] | null;
  primaryBusinessActivities?: string | string[] | null;
  businessOperations?: string | null;
  status?: string;
  statusLabel?: string;
  progressPercentage?: number;
  completedStepsCount?: number;
}

export interface FpcWizardStepPreviewProps {
  currentStep: number;
  fpcData: FpcPreviewData;
  onPreviousStep: () => void;
  onNextStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

interface StepHeaderConfig {
  badge: string;
  title: string;
  subtitle: string;
}

const STEP_HEADER_CONFIGS: Record<number, StepHeaderConfig> = {
  1: {
    badge: 'STEP 01 OF 08 · PREVIEW ONLY',
    title: 'Basic company details',
    subtitle: 'Use the details on your official company documents.',
  },
  2: {
    badge: 'STEP 02 OF 08 · PREVIEW ONLY',
    title: 'Legal & registration',
    subtitle: 'Company statutory identifiers and operating licenses.',
  },
  3: {
    badge: 'STEP 03 OF 08 · PREVIEW ONLY',
    title: 'Financial information',
    subtitle: 'Share capital structure and authorized banking details.',
  },
  4: {
    badge: 'STEP 04 OF 08 · PREVIEW ONLY',
    title: 'Board of directors',
    subtitle: 'Key managerial personnel and governance structure.',
  },
  5: {
    badge: 'STEP 05 OF 08 · PREVIEW ONLY',
    title: 'Logo & documents',
    subtitle: 'Statutory company documents and brand assets.',
  },
  6: {
    badge: 'STEP 06 OF 08 · PREVIEW ONLY',
    title: 'Address & location',
    subtitle: 'Registered office address and geographical coverage.',
  },
  7: {
    badge: 'STEP 07 OF 08 · PREVIEW ONLY',
    title: 'Business activities',
    subtitle: 'Core agricultural commodities and operational scope.',
  },
};

export const FpcWizardStepPreview: React.FC<FpcWizardStepPreviewProps> = ({
  currentStep,
  fpcData,
  onPreviousStep,
  onNextStep,
  isLastStep,
}) => {
  const header = STEP_HEADER_CONFIGS[currentStep] || STEP_HEADER_CONFIGS[1];

  const renderField = (
    label: string,
    value: string | undefined | null,
    helperText?: string,
    isFullWidth = false
  ) => {
    const displayValue = value && value.trim() ? value.trim() : 'Not provided';
    return (
      <Input
        label={label}
        value={displayValue}
        helperText={helperText}
        readOnly
        size="sm"
        containerClassName={isFullWidth ? 'col-span-full' : 'col-span-1'}
        className="bg-[#F3F4F6] border-neutral-200/60 rounded-xl cursor-default text-xs font-medium text-primary select-text"
      />
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            {/* Full-width FPC Legal Name */}
            {renderField('FPC Legal Name', fpcData.companyName, undefined, true)}

            {/* 2-Column CSS Grid for Step 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {renderField('CIN', fpcData.cin, '21 alphanumeric characters')}
              {renderField('FPC Registration Number', fpcData.registrationNumber || fpcData.fpcCode)}
              {renderField('ROC Office', fpcData.rocOffice)}
              {renderField(
                'Date of Incorporation',
                fpcData.registrationDate
                  ? new Date(fpcData.registrationDate).toLocaleDateString('en-IN')
                  : null
              )}
              {renderField('Company Category', fpcData.companyCategory)}
              {renderField('Official Contact Email', fpcData.email)}
              {renderField('Official Contact Mobile', fpcData.phoneNumber)}
              {renderField('Official Website (Optional)', fpcData.website)}
            </div>
          </>
        );

      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {renderField('Company PAN', fpcData.pan, '10 character statutory PAN')}
            {renderField('Company TAN', fpcData.tan)}
            {renderField('GSTIN', fpcData.gstin, '15 alphanumeric characters')}
            {renderField('FSSAI License', fpcData.fssaiLicense)}
            {renderField('Seed License', fpcData.seedLicense)}
            {renderField('Fertilizer License', fpcData.fertilizerLicense)}
          </div>
        );

      case 3:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {renderField('Authorized Capital', fpcData.authorizedCapital)}
            {renderField('Paid-up Capital', fpcData.paidUpCapital)}
            {renderField('Primary Bank Name', fpcData.bankName)}
            {renderField(
              'Bank Account Number',
              fpcData.bankAccountNumber
                ? (fpcData.bankAccountNumber.length > 4
                    ? '•••• •••• ' + fpcData.bankAccountNumber.slice(-4)
                    : fpcData.bankAccountNumber)
                : null
            )}
            {renderField('Bank IFSC Code', fpcData.bankIfsc)}
            {renderField(
              'Farmers Enrolled',
              fpcData.farmersCount !== undefined ? String(fpcData.farmersCount) : '0'
            )}
            {renderField(
              'Shareholders',
              fpcData.shareholdersCount !== undefined && fpcData.shareholdersCount > 0
                ? String(fpcData.shareholdersCount)
                : null
            )}
            {renderField('Face Value Per Share', fpcData.faceValuePerShare)}
          </div>
        );

      case 4:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {renderField('Nominated Administrator', fpcData.nominatedAdmin)}
            {renderField('Admin Contact Email', fpcData.email)}
            {renderField('Admin Contact Mobile', fpcData.phoneNumber)}
            {renderField(
              'Directorship Registry',
              fpcData.directorsSummary || 'Awaiting FPC Admin submission'
            )}
          </div>
        );

      case 5: {
        const getDoc = (type: string) => fpcData.documents?.find((d) => d.documentType === type);
        const fssaiDoc = getDoc('FssaiLicense');
        const seedDoc = getDoc('SeedLicense');
        const fertDoc = getDoc('FertilizerLicense');
        const incDoc = getDoc('CertificateOfIncorporation');
        const panDoc = getDoc('PanCard');
        const moaDoc = getDoc('MoaAoa');
        const boardDoc = getDoc('BoardResolution');

        const fssaiFile = fpcData.fssaiLicenseName || fssaiDoc?.fileName;
        const fssaiExp = fpcData.fssaiExpiryDate || fssaiDoc?.expiryDate;
        const seedFile = fpcData.seedLicenseName || seedDoc?.fileName;
        const seedExp = fpcData.seedLicenseExpiryDate || seedDoc?.expiryDate;
        const fertFile = fpcData.fertilizerLicenseName || fertDoc?.fileName;
        const fertExp = fpcData.fertilizerLicenseExpiryDate || fertDoc?.expiryDate;

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {renderField('Company Logo Attachment', fpcData.logoFileName)}
            {renderField('Certificate of Incorporation', fpcData.incorporationCertName || incDoc?.fileName)}
            {renderField('PAN Card Document', fpcData.panCertName || panDoc?.fileName)}
            {renderField('MOA & AOA Document', fpcData.moaAoaDocName || moaDoc?.fileName)}
            {renderField('Board Resolution Document', fpcData.boardResolutionDocName || boardDoc?.fileName)}
            {renderField('FSSAI Food Safety License', fssaiFile)}
            {fssaiFile && renderField('FSSAI License Expiry Date', fssaiExp)}
            {renderField('Seed Production/Distribution License', seedFile)}
            {seedFile && renderField('Seed License Expiry Date', seedExp)}
            {renderField('Fertilizer Retail/Wholesale License', fertFile)}
            {fertFile && renderField('Fertilizer License Expiry Date', fertExp)}
          </div>
        );
      }

      case 6:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {renderField('Registered Street Address', fpcData.addressLine1, undefined, true)}
            {renderField('Address Line 2', fpcData.addressLine2)}
            {renderField('Pincode', fpcData.pincode)}
            {renderField('District', fpcData.district)}
            {renderField('State', fpcData.state)}
            {renderField('Official Contact Email', fpcData.email)}
            {renderField('Official Contact Mobile', fpcData.phoneNumber)}
          </div>
        );

      case 7:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {renderField('Operational Status', fpcData.statusLabel || fpcData.status || 'Onboarding')}
            {renderField('Primary Operating State', fpcData.state)}
            {renderField('Operating District', fpcData.district)}
            {renderField(
              'Primary Business Activities',
              Array.isArray(fpcData.primaryBusinessActivities)
                ? fpcData.primaryBusinessActivities.join(', ')
                : fpcData.primaryBusinessActivities
            )}
            {renderField(
              'Commodities Handled',
              Array.isArray(fpcData.primaryCommodities)
                ? fpcData.primaryCommodities.join(', ')
                : fpcData.primaryCommodities
            )}
            {renderField('Activity Scope', fpcData.businessOperations)}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Preview Container Card Reusing Shared Card */}
      <Card
        padding="none"
        variant="default"
        className="rounded-2xl border-neutral-200/80 shadow-2xs overflow-hidden"
      >
        {/* Dark Forest Green Header Banner */}
        <header className="bg-[#18533F] p-6 sm:p-7 text-white select-none">
          <span className="inline-block text-[11px] font-bold tracking-wider uppercase text-emerald-200 mb-1">
            {header.badge}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {header.title}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 font-normal">
            {header.subtitle}
          </p>
        </header>

        {/* Read-only Explanatory Notice Strip */}
        <div className="px-6 sm:px-7 py-3 bg-[#EAF3EF] border-b border-[#D5E8DF] flex items-center justify-between text-xs font-medium text-emerald-900 select-none">
          <span>Read-only preview. Unfilled values will be supplied by the FPC Admin.</span>
        </div>

        {/* Dynamic Step Form Fields Stack */}
        <div className="p-6 sm:p-7 space-y-5 bg-white">
          {renderStepContent()}
        </div>
      </Card>

      {/* Step Navigation Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onPreviousStep}
          className="rounded-full px-6 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-primary shadow-2xs"
        >
          &larr; Previous
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onNextStep}
          className="rounded-full px-6 text-xs font-semibold bg-[#18533F] hover:bg-[#134333] text-white shadow-2xs"
        >
          {isLastStep ? 'Return to step 1' : 'Next step \u2192'}
        </Button>
      </div>
    </div>
  );
};
