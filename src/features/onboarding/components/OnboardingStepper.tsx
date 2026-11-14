import React from 'react';
import { cn } from '../../../shared/utils/cn';
import type { OnboardingWizardStep } from '../types';

export interface OnboardingStepperProps {
  currentStep?: number;
  completedStepsCount?: number;
  className?: string;
  onStepClick?: (stepNumber: number) => void;
}

const ONBOARDING_STEPS: OnboardingWizardStep[] = [
  { number: 1, id: 'basic', label: 'BASIC DETAILS', status: 'completed' },
  { number: 2, id: 'legal', label: 'LEGAL & REGISTRATION', status: 'completed' },
  { number: 3, id: 'financial', label: 'FINANCIAL INFORMATION', status: 'completed' },
  { number: 4, id: 'board', label: 'BOARD & DIRECTORS', status: 'completed' },
  { number: 5, id: 'documents', label: 'LOGO & DOCUMENTS', status: 'completed' },
  { number: 6, id: 'address', label: 'ADDRESS & LOCATION', status: 'completed' },
  { number: 7, id: 'business', label: 'BUSINESS ACTIVITIES', status: 'completed' },
  { number: 8, id: 'review', label: 'FINAL REVIEW', status: 'active' },
];

export const OnboardingStepper: React.FC<OnboardingStepperProps> = ({
  currentStep = 1,
  completedStepsCount,
  className,
  onStepClick,
}) => {
  const effectiveCompletedCount = Math.max(
    completedStepsCount !== undefined ? completedStepsCount : currentStep - 1,
    currentStep - 1
  );

  const percentComplete = Math.min(100, Math.round((currentStep / ONBOARDING_STEPS.length) * 100));
  const activeStep = ONBOARDING_STEPS[currentStep - 1] || ONBOARDING_STEPS[0];

  return (
    <div
      className={cn(
        "w-full bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs",
        className
      )}
    >
      {/* Top step progress info */}
      <div className="text-center mb-4">
        <p className="floating-label font-semibold text-secondary">
          STEP {currentStep} OF {ONBOARDING_STEPS.length} • {activeStep.label} • {percentComplete}% COMPLETE
        </p>
      </div>

      {/* Steps horizontal pills */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {ONBOARDING_STEPS.map((step) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number <= effectiveCompletedCount && !isActive;
            const isClickable = isCompleted || isActive;

            return (
              <div key={step.id} className="flex flex-col items-center">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => onStepClick?.(step.number)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all select-none",
                    isActive
                      ? "bg-[#0F4C36] text-white shadow-2xs"
                      : isCompleted
                      ? "bg-[#F3F5F4] text-neutral-700 hover:text-primary hover:bg-neutral-200 cursor-pointer"
                      : "bg-[#F3F5F4] text-neutral-400 cursor-not-allowed opacity-60"
                  )}
                >
                  {isActive && (
                    <span className="px-1.5 py-0.5 rounded floating-label font-bold bg-white/20 text-white leading-none">
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
          style={{ width: `${percentComplete}%` }}
          className="h-full bg-[#0F4C36] rounded-full transition-all duration-300"
        />
      </div>
    </div>
  );
};
