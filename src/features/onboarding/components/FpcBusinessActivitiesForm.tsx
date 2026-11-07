import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, Search } from 'lucide-react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { Select } from '../../../shared/components/Select';
import { Button } from '../../../shared/components/Button';
import {
  businessActivitiesSchema,
  type BusinessActivitiesFormValues,
} from '../schemas/businessActivities.schema';
import type { FpcBusinessActivitiesFormData } from '../types';

export interface FpcBusinessActivitiesFormProps {
  initialData?: Partial<FpcBusinessActivitiesFormData> | null;
  onSubmit: (values: BusinessActivitiesFormValues) => Promise<void> | void;
  onPreviousStep: () => void;
  isSubmitting?: boolean;
}

const PRIMARY_ACTIVITY_OPTIONS = [
  { value: 'Produce Procurement', label: 'Produce Procurement' },
  { value: 'Input Supply / Seeds & Fertilizers', label: 'Input Supply / Seeds & Fertilizers' },
  { value: 'Processing & Value Addition', label: 'Processing & Value Addition' },
  { value: 'Custom Hiring Center / Farm Mechanization', label: 'Custom Hiring Center / Farm Mechanization' },
  { value: 'Marketing & Aggregation', label: 'Marketing & Aggregation' },
  { value: 'Dairy & Livestock Farming', label: 'Dairy & Livestock Farming' },
  { value: 'Fisheries & Aquaculture', label: 'Fisheries & Aquaculture' },
];

const OPERATIONAL_STATUS_OPTIONS = [
  { value: 'Operational', label: 'Operational' },
  { value: 'Pre-operational', label: 'Pre-operational' },
  { value: 'Pilot Operations', label: 'Pilot Operations' },
  { value: 'Commercial Operations', label: 'Commercial Operations' },
];

export const FpcBusinessActivitiesForm: React.FC<FpcBusinessActivitiesFormProps> = ({
  initialData,
  onSubmit,
  onPreviousStep,
  isSubmitting = false,
}) => {
  // ZERO useEffect: initial values populated directly during component mount
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessActivitiesFormValues>({
    resolver: zodResolver(businessActivitiesSchema),
    defaultValues: {
      primaryActivity: initialData?.primaryActivity || 'Produce Procurement',
      operationalStatus: initialData?.operationalStatus || 'Operational',
      commencementDate: initialData?.commencementDate || '',
      commoditiesHandled: initialData?.commoditiesHandled || 'Paddy / Maize / Arhar / Mustard',
      targetFarmers: initialData?.targetFarmers || '250',
      villagesCovered: initialData?.villagesCovered || '15',
      activityScope:
        initialData?.activityScope ||
        'Procurement, aggregation and marketing of paddy, maize, arhar and mustard across 15 villages, supporting 250 enrolled farmers.',
    },
    mode: 'onBlur',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Main Card */}
      <Card
        variant="default"
        padding="none"
        className="p-6 sm:p-8 rounded-2xl border-neutral-200/80 shadow-2xs space-y-6"
      >
        {/* Header with Step 07 Badge */}
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-bold text-sm shrink-0">
            07
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-primary">
              Business activities
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              Use the details on your official company documents.
            </p>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Row 1: Primary business activity & Operational status */}
          <Select
            id="fpc-primary-activity"
            label="Primary business activity *"
            required
            options={PRIMARY_ACTIVITY_OPTIONS}
            trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
            error={errors.primaryActivity?.message}
            {...register('primaryActivity')}
          />
          <Select
            id="fpc-operational-status"
            label="Operational status *"
            required
            options={OPERATIONAL_STATUS_OPTIONS}
            trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
            error={errors.operationalStatus?.message}
            {...register('operationalStatus')}
          />

          {/* Row 2: Date of commencement & Commodities handled */}
          <Input
            id="fpc-commencement-date"
            label="Date of commencement *"
            required
            placeholder="dd-mm-yyyy"
            trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
            error={errors.commencementDate?.message}
            {...register('commencementDate')}
          />
          <Input
            id="fpc-commodities-handled"
            label="Commodities handled *"
            required
            leadingIcon={<Search className="w-4 h-4 text-secondary" />}
            trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
            placeholder="Paddy / Maize / Arhar / Mustard"
            error={errors.commoditiesHandled?.message}
            {...register('commoditiesHandled')}
          />

          {/* Row 3: Target farmers enrolment & Villages covered */}
          <Input
            id="fpc-target-farmers"
            label="Target farmers enrolment *"
            required
            placeholder="250"
            error={errors.targetFarmers?.message}
            {...register('targetFarmers')}
          />
          <Input
            id="fpc-villages-covered"
            label="Villages covered *"
            required
            placeholder="15"
            error={errors.villagesCovered?.message}
            {...register('villagesCovered')}
          />

          {/* Row 4: Activity scope & operational description (full-width) */}
          <div className="col-span-1 md:col-span-2">
            <Input
              id="fpc-activity-scope"
              label="Activity scope & operational description *"
              required
              placeholder="Procurement, aggregation and marketing of paddy, maize, arhar and mustard across 15 villages, supporting 250 enrolled farmers."
              error={errors.activityScope?.message}
              {...register('activityScope')}
            />
          </div>
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
          ← Previous Step
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          loadingText="Saving activities..."
          className="rounded-full bg-[#0F4C36] hover:bg-[#0B3B2A] text-white px-7 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
        >
          Save and Continue →
        </Button>
      </div>
    </form>
  );
};

