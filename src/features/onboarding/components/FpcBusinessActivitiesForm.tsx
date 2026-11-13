import React from 'react';
import { Controller } from 'react-hook-form';
import { ChevronRight, Search } from 'lucide-react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { Select } from '../../../shared/components/Select';
import { DatePicker } from '../../../shared/components/DatePicker';
import { MultiSelect, type MultiSelectOption } from '../../../shared/components/MultiSelect';
import { Button } from '../../../shared/components/Button';
import { useFpcForm, applyServerErrors, FormServerError } from '../../../shared/forms';
import {
  businessActivitiesSchema,
  type BusinessActivitiesFormValues,
} from '../schemas/businessActivities.schema';
import type { FpcBusinessActivitiesFormData } from '../types';

export interface FpcBusinessActivitiesFormProps {
  initialData?: Partial<FpcBusinessActivitiesFormData> | null;
  onSubmit: (values: BusinessActivitiesFormValues) => Promise<void> | void;
  onPreviousStep: () => void;
}

const PRIMARY_ACTIVITY_OPTIONS: MultiSelectOption[] = [
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

const COMMODITIES_HANDLED_OPTIONS: MultiSelectOption[] = [
  { value: 'Produce procurement', label: 'Produce procurement' },
  { value: 'Dairy & Livestock', label: 'Dairy & Livestock' },
  { value: 'Paddy', label: 'Paddy' },
  { value: 'Maize', label: 'Maize' },
  { value: 'Arhar', label: 'Arhar' },
  { value: 'Mustard', label: 'Mustard' },
  { value: 'Wheat', label: 'Wheat' },
  { value: 'Millets', label: 'Millets' },
  { value: 'Vegetables', label: 'Vegetables' },
  { value: 'Fruits', label: 'Fruits' },
  { value: 'Chana', label: 'Chana' },
  { value: 'Moong', label: 'Moong' },
  { value: 'Urad', label: 'Urad' },
  { value: 'Soybean', label: 'Soybean' },
  { value: 'Groundnut', label: 'Groundnut' },
  { value: 'Cotton', label: 'Cotton' },
  { value: 'Turmeric', label: 'Turmeric' },
  { value: 'Ginger', label: 'Ginger' },
  { value: 'Chilli', label: 'Chilli' },
];

const parseActivities = (val?: string[] | string | null): string[] => {
  if (!val) return ['Produce Procurement'];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return [];
    // Match against known options first (handles options containing slashes/ampersands)
    const exactMatch = PRIMARY_ACTIVITY_OPTIONS.find(
      (opt) => opt.value.toLowerCase() === trimmed.toLowerCase()
    );
    if (exactMatch) {
      return [exactMatch.value];
    }
    // If it is comma-separated multiple selections
    if (trimmed.includes(',')) {
      return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [trimmed];
  }
  return [];
};

const parseCommodities = (val?: string[] | string | null): string[] => {
  if (!val) return ['Produce procurement', 'Dairy & Livestock'];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'string') {
    if (val.includes('/')) return val.split('/').map((s) => s.trim()).filter(Boolean);
    if (val.includes(',')) return val.split(',').map((s) => s.trim()).filter(Boolean);
    return [val.trim()].filter(Boolean);
  }
  return [];
};

export const FpcBusinessActivitiesForm: React.FC<FpcBusinessActivitiesFormProps> = ({
  initialData,
  onSubmit,
  onPreviousStep,
}) => {
  const formValues: BusinessActivitiesFormValues = {
    primaryActivity: parseActivities(initialData?.primaryActivity),
    operationalStatus: initialData?.operationalStatus || 'Operational',
    commencementDate: initialData?.commencementDate || '',
    commoditiesHandled: parseCommodities(initialData?.commoditiesHandled),
    targetFarmers: initialData?.targetFarmers || '250',
    villagesCovered: initialData?.villagesCovered || '15',
    activityScope:
      initialData?.activityScope ||
      'Procurement, aggregation and marketing of paddy, maize, arhar and mustard across 15 villages, supporting 250 enrolled farmers.',
  };

  // ZERO useEffect: initial values populated directly during component mount
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useFpcForm<BusinessActivitiesFormValues>({
    schema: businessActivitiesSchema,
    defaultValues: formValues,
    values: formValues,
    resetOptions: { keepDirtyValues: true },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (err: unknown) {
      applyServerErrors(err, setError);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <FormServerError errors={errors} />

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
            <h3 className="text-primary">
              Business activities
            </h3>
            <p className="text-secondary mt-0.5">
              Use the details on your official company documents.
            </p>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Row 1: Primary business activity & Operational status */}
          <Controller
            name="primaryActivity"
            control={control}
            render={({ field }) => (
              <MultiSelect
                id="fpc-primary-activity"
                label="Primary business activity *"
                required
                trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
                placeholder="Select primary business activities..."
                options={PRIMARY_ACTIVITY_OPTIONS}
                value={Array.isArray(field.value) ? field.value : parseActivities(field.value)}
                onChange={(vals) => field.onChange(vals)}
                onBlur={field.onBlur}
                error={errors.primaryActivity?.message}
              />
            )}
          />
          <Controller
            name="operationalStatus"
            control={control}
            render={({ field }) => (
              <Select
                id="fpc-operational-status"
                label="Operational status *"
                required
                options={OPERATIONAL_STATUS_OPTIONS}
                trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
                error={errors.operationalStatus?.message}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
              />
            )}
          />

          {/* Row 2: Date of commencement & Commodities handled */}
          <Controller
            name="commencementDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="fpc-commencement-date"
                label="Date of commencement *"
                required
                placeholder="dd-mm-yyyy"
                error={errors.commencementDate?.message}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Controller
            name="commoditiesHandled"
            control={control}
            render={({ field }) => (
              <MultiSelect
                id="fpc-commodities-handled"
                label="Commodities handled *"
                required
                leadingIcon={<Search className="w-4 h-4 text-secondary" />}
                trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
                placeholder="Select commodities handled..."
                options={COMMODITIES_HANDLED_OPTIONS}
                value={Array.isArray(field.value) ? field.value : parseCommodities(field.value)}
                onChange={(vals) => field.onChange(vals)}
                onBlur={field.onBlur}
                error={errors.commoditiesHandled?.message}
              />
            )}
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

