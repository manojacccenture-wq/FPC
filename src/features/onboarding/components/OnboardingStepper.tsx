import React from 'react';
import { cn } from '../../../shared/utils/cn';
import type { OnboardingWizardStep } from '../types';

export interface OnboardingStepperProps {
  currentStep?: number;
  className?: string;
  onStepClick?: (stepNumber: number) => void;
}

const ONBOARDING_STEPS: OnboardingWizardStep[] = [
  { number: 1, id: 'basic', label: 'BASIC DETAILS', status: 'completed' },
  { number: 2, id: 'legal', label: 'LEGAL & REGISTRATION', status: 'completed' },
  { number: 3, id: 'financial', label: 'FINANCIAL INFORMATION', status: 'completed' },
  { number: 4, id: 'board', label: 'BOARD & DIRECTORS', status: 'completed' },
  { number: 5, id: 'documents', label: 'LOGO & DOCUMENTS', status: 'completed' },
  { number: 6, id: 'address', label: 'ADDRESS & ACTIVTIES', status: 'completed' },
  { number: 7, id: 'business', label: 'BUISNESS', status: 'completed' },
  { number: 8, id: 'review', label: 'FINAL REVIEW', status: 'active' },
];

export const OnboardingStepper: React.FC<OnboardingStepperProps> = ({
  currentStep = 1,
  className,
  onStepClick,
}) => {
  // Reference percentages: Step 1 = 13%, Step 2 = 26%, Step 3 = 39%, Step 4 = 53%, Step 5 = 66%, Step 6 = 69%, Step 7 = 82%, Step 8 = 100%
  const percentComplete =
    currentStep === 1
      ? 13
      : currentStep === 2
      ? 26
      : currentStep === 3
      ? 39
      : currentStep === 4
      ? 53
      : currentStep === 5
      ? 66
      : currentStep === 6
      ? 69
      : currentStep === 7
      ? 82
      : currentStep === 8
      ? 100
      : Math.round((currentStep / ONBOARDING_STEPS.length) * 100);

  return (
    <div
      className={cn(
        "w-full bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs",
        className
      )}
    >
      {/* Top step progress info */}
      <div className="text-center mb-4">
        <p className="text-[11px] sm:text-xs font-semibold tracking-wider text-secondary uppercase">
          STEP {currentStep} OF {ONBOARDING_STEPS.length} • BASIC COMPANY DETAILS • {percentComplete}% COMPLETE
        </p>
      </div>

      {/* Steps horizontal pills */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {ONBOARDING_STEPS.map((step) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center">
                <button
                  type="button"
                  disabled={!isCompleted && !isActive}
                  onClick={() => onStepClick?.(step.number)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all select-none",
                    isActive
                      ? "bg-[#0F4C36] text-white shadow-2xs"
                      : isCompleted
                      ? "bg-[#F3F5F4] text-neutral-700 hover:text-primary hover:bg-neutral-200 cursor-pointer"
                      : "bg-[#F3F5F4] text-neutral-600 cursor-default"
                  )}
                >
                  {isActive && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white leading-none">
                      {String(step.number).padStart(2, '0')}
                    </span>
                  )}
                  <span>{step.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active step progress indicator bar extending across completed + current steps */}
      <div className="mt-3 w-full bg-neutral-100 h-1 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full bg-[#0F4C36] rounded-full transition-all duration-300",
            currentStep === 1
              ? "w-[12%]"
              : currentStep === 2
              ? "w-[25%]"
              : currentStep === 3
              ? "w-[38%]"
              : currentStep === 4
              ? "w-[50%]"
              : currentStep === 5
              ? "w-[62%]"
              : currentStep === 6
              ? "w-[74%]"
              : currentStep === 7
              ? "w-[85%]"
              : "w-[85%]"
          )}
        />
      </div>
    </div>
  );
};
