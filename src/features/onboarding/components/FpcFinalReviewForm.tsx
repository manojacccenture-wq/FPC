import React from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import type {
  FpcBasicDetailsFormData,
  FpcLegalRegistrationFormData,
  FpcFinancialInformationFormData,
  FpcBoardOfDirectorsFormData,
  FpcLogoDocumentsFormData,
  FpcAddressLocationFormData,
  FpcBusinessActivitiesFormData,
} from '../types';

export interface FpcFinalReviewFormProps {
  step1Data?: Partial<FpcBasicDetailsFormData> | null;
  step2Data?: Partial<FpcLegalRegistrationFormData> | null;
  step3Data?: Partial<FpcFinancialInformationFormData> | null;
  step4Data?: Partial<FpcBoardOfDirectorsFormData> | null;
  step5Data?: Partial<FpcLogoDocumentsFormData> | null;
  step6Data?: Partial<FpcAddressLocationFormData> | null;
  step7Data?: Partial<FpcBusinessActivitiesFormData> | null;
  onEditStep: (stepNumber: number) => void;
  onPreviousStep: () => void;
  onSubmit: () => Promise<void> | void;
  isSubmitting?: boolean;
}

interface ReviewSectionItem {
  step: number;
  badge: string;
  title: string;
  summary: string;
}

export const FpcFinalReviewForm: React.FC<FpcFinalReviewFormProps> = ({
  step1Data,
  step3Data,
  step4Data,
  step6Data,
  step7Data,
  onEditStep,
  onPreviousStep,
  onSubmit,
  isSubmitting = false,
}) => {
  const sections: ReviewSectionItem[] = [
    {
      step: 1,
      badge: '01',
      title: 'Basic company details',
      summary: `${step1Data?.legalName || 'Kalinganagar Farmer Producer Company Ltd.'} • ${step1Data?.rocOffice || 'ROC Cuttack'}`,
    },
    {
      step: 2,
      badge: '02',
      title: 'Legal & registration',
      summary: 'Company identifiers and operating licenses',
    },
    {
      step: 3,
      badge: '03',
      title: 'Financial information',
      summary: `${step3Data?.authorizedCapital || '₹10,00,000'} authorized • ${step3Data?.paidUpCapital || '₹6,00,000'} paid up • 6,000 shares`,
    },
    {
      step: 4,
      badge: '04',
      title: 'Board of directors',
      summary: `Total entered: ${step4Data?.directors?.length || 5} • Managing Director ${step4Data?.directors?.[0]?.fullName || 'Subhashree Jena'}`,
    },
    {
      step: 5,
      badge: '05',
      title: 'Logo & documents',
      summary: 'Company logo and 8 statutory attachments',
    },
    {
      step: 6,
      badge: '06',
      title: 'Address & location',
      summary: `${step6Data?.block || 'Jajpur Sadar'}, ${step6Data?.district || 'Jajpur'}, ${step6Data?.state || 'Odisha'}`,
    },
    {
      step: 7,
      badge: '07',
      title: 'Business activities',
      summary: `${step7Data?.primaryActivity || 'Produce Procurement'} • ${step7Data?.commoditiesHandled || 'Paddy, Maize, Arhar, Mustard'}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <Card
        variant="default"
        padding="none"
        className="p-6 sm:p-8 rounded-2xl border-neutral-200/80 shadow-2xs space-y-6"
      >
        {/* Header with Step 08 Badge */}
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-bold text-sm shrink-0">
            08
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-primary">
              Final review & submission
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              Use the details on your official company documents.
            </p>
          </div>
        </div>

        {/* 7 Review Summary Cards Stack */}
        <div className="space-y-3.5">
          {sections.map((section) => (
            <div
              key={section.step}
              className="rounded-2xl border border-neutral-200/80 p-4 sm:p-5 flex items-center justify-between gap-4 bg-white shadow-2xs hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-bold text-xs shrink-0">
                  {section.badge}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-primary truncate">
                    {section.title}
                  </h3>
                  <p className="text-xs text-secondary mt-0.5 truncate">
                    {section.summary}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onEditStep(section.step)}
                className="rounded-full bg-[#E8F5E9] hover:bg-[#D7EEDF] text-[#0F4C36] px-4 py-1.5 text-xs font-semibold select-none flex items-center gap-1 cursor-pointer transition-colors shrink-0"
              >
                <span>Edit</span>
                <span>→</span>
              </button>
            </div>
          ))}
        </div>

        {/* Onboarding Readiness Warm Banner */}
        <div className="bg-[#FEF9EE] border border-[#FDE68A]/60 rounded-2xl p-5 sm:p-6 space-y-3 shadow-2xs">
          <h4 className="text-sm sm:text-base font-bold text-primary">
            Onboarding Readiness • 92%
          </h4>
          <div className="w-full h-2 bg-neutral-200/80 rounded-full overflow-hidden">
            <div className="h-full bg-[#0F4C36] rounded-full w-[92%] transition-all duration-500" />
          </div>
          <p className="text-xs text-secondary font-medium">
            2 of 8 sections verified
          </p>
        </div>
      </Card>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onPreviousStep}
          className="rounded-full bg-brand-soft text-brand hover:bg-forest-100 px-6 py-2.5 text-xs font-semibold"
        >
          Previous Step
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onSubmit}
          isLoading={isSubmitting}
          loadingText="Submitting..."
          className="rounded-full bg-[#0F4C36] hover:bg-[#0B3B2A] text-white px-7 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
        >
          Submit Onboarding
        </Button>
      </div>
    </div>
  );
};

