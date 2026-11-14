/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { cn } from '../../../../../shared/utils/cn';
import { Badge, Card } from '../../../../../shared/components';

export interface WizardStepItem {
  step: number;
  badgeNumber: string;
  title: string;
  fieldCountSummary: string;
  countBadge: string;
}

export const WIZARD_STEPS: WizardStepItem[] = [
  {
    step: 1,
    badgeNumber: '01',
    title: 'Basic company details',
    fieldCountSummary: '9 fields',
    countBadge: '9',
  },
  {
    step: 2,
    badgeNumber: '02',
    title: 'Legal & registration',
    fieldCountSummary: '6 fields + repeatable licenses',
    countBadge: '6+',
  },
  {
    step: 3,
    badgeNumber: '03',
    title: 'Financial information',
    fieldCountSummary: '8 fields + bank accounts',
    countBadge: '8+',
  },
  {
    step: 4,
    badgeNumber: '04',
    title: 'Board of directors',
    fieldCountSummary: '12 fields per director',
    countBadge: '12',
  },
  {
    step: 5,
    badgeNumber: '05',
    title: 'Logo & documents',
    fieldCountSummary: '9 uploads',
    countBadge: '9',
  },
  {
    step: 6,
    badgeNumber: '06',
    title: 'Address & location',
    fieldCountSummary: '11 fields',
    countBadge: '11',
  },
  {
    step: 7,
    badgeNumber: '07',
    title: 'Business activities',
    fieldCountSummary: '7 fields',
    countBadge: '7',
  },
  {
    step: 8,
    badgeNumber: '08',
    title: 'Final review & submission',
    fieldCountSummary: 'Review all 7 sections',
    countBadge: 'Review',
  },
];

export interface FpcWizardStepSidebarProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  readinessPercentage?: number;
  sectionsVerifiedText?: string;
}

export const FpcWizardStepSidebar: React.FC<FpcWizardStepSidebarProps> = ({
  currentStep,
  onSelectStep,
  readinessPercentage = 92,
  sectionsVerifiedText = '2 of 8 sections verified',
}) => {
  return (
    <aside className="w-full space-y-4 select-none">
      {/* 7 Step Navigation Cards Stack */}
      <nav aria-label="Wizard Steps Navigation" className="space-y-2.5">
        {WIZARD_STEPS.map((item) => {
          const isActive = currentStep === item.step;
          return (
            <button
              key={item.step}
              type="button"
              onClick={() => onSelectStep(item.step)}
              className={cn(
                'w-full text-left rounded-2xl p-4 sm:p-4.5 flex items-center justify-between gap-3 transition-all duration-150',
                isActive
                  ? 'bg-[#CDE5DC] border border-[#A7D1C2] shadow-2xs'
                  : 'bg-white border border-neutral-200/80 hover:border-neutral-300 hover:bg-neutral-50/60 shadow-2xs'
              )}
            >
              {/* Left: Step Number Box + Title and Field Summary */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors',
                    isActive
                      ? 'bg-[#1F6E50] text-white shadow-2xs'
                      : 'bg-[#EFF2F1] text-secondary'
                  )}
                >
                  {item.badgeNumber}
                </div>
                <div className="min-w-0">
                  <h4
                    className={cn(
                      'text-sm truncate leading-snug',
                      isActive
                        ? 'font-bold text-primary'
                        : 'font-semibold text-primary'
                    )}
                  >
                    {item.title}
                  </h4>
                  <p className="text-secondary text-xs truncate mt-0.5">
                    {item.fieldCountSummary}
                  </p>
                </div>
              </div>

              {/* Right: Count Badge Reusing Shared Badge */}
              <Badge
                variant={isActive ? 'warning' : 'neutral'}
                size="sm"
                pill
                className={cn(
                  'shrink-0 text-center min-w-[28px] justify-center',
                  isActive
                    ? 'bg-[#F9F9ED] text-primary border border-neutral-200/50 font-bold'
                    : 'bg-neutral-100 text-secondary border-transparent font-semibold'
                )}
              >
                {item.countBadge}
              </Badge>
            </button>
          );
        })}
      </nav>

      {/* Onboarding Readiness Warm Banner Reusing Shared Card */}
      <Card
        padding="none"
        className="bg-[#FEF9EE] border border-[#FDE68A]/70 rounded-2xl p-5 sm:p-6 space-y-3 shadow-2xs"
      >
        <h4 className="font-bold text-primary text-base">
          Onboarding Readiness • {readinessPercentage}%
        </h4>
        <div className="w-full h-2 bg-neutral-200/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0F4C36] rounded-full transition-all duration-500"
            style={{ width: `${readinessPercentage}%` }}
          />
        </div>
        <p className="text-secondary font-medium text-xs">
          {sectionsVerifiedText}
        </p>
      </Card>
    </aside>
  );
};

