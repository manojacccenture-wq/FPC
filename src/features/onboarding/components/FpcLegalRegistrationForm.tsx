import React from 'react';
import { useFieldArray, Controller } from 'react-hook-form';
import { ChevronRight, Plus } from 'lucide-react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { Select } from '../../../shared/components/Select';
import { Button } from '../../../shared/components/Button';
import { useFpcForm, applyServerErrors, FormServerError } from '../../../shared/forms';
import {
  legalRegistrationSchema,
  type LegalRegistrationFormValues,
} from '../schemas/legalRegistration.schema';
import type { FpcLegalRegistrationFormData } from '../types';

export interface FpcLegalRegistrationFormProps {
  initialData?: Partial<FpcLegalRegistrationFormData> | null;
  onSubmit: (values: LegalRegistrationFormValues) => Promise<void> | void;
  onPreviousStep: () => void;
}

const LICENSE_TYPE_OPTIONS = [
  { value: 'Mandi License', label: 'Mandi License' },
  { value: 'Trade License', label: 'Trade License' },
  { value: 'Pesticide License', label: 'Pesticide License' },
  { value: 'Pollution Control Board NOC', label: 'Pollution Control Board NOC' },
  { value: 'Warehouse / Storage License', label: 'Warehouse / Storage License' },
  { value: 'APMC Market License', label: 'APMC Market License' },
  { value: 'Organic Certification', label: 'Organic Certification' },
  { value: 'Other Operating License', label: 'Other Operating License' },
];

export const FpcLegalRegistrationForm: React.FC<FpcLegalRegistrationFormProps> = ({
  initialData,
  onSubmit,
  onPreviousStep,
}) => {
  const formValues: LegalRegistrationFormValues = {
    companyPan: initialData?.companyPan || '',
    companyTan: initialData?.companyTan || '',
    gstin: initialData?.gstin || '',
    fssaiLicense: initialData?.fssaiLicense || '',
    seedLicense: initialData?.seedLicense || '',
    fertilizerLicense: initialData?.fertilizerLicense || '',
    additionalLicenses: initialData?.additionalLicenses && initialData.additionalLicenses.length > 0
      ? initialData.additionalLicenses
      : [
          {
            id: 'license-1',
            licenseType: '',
            licenseNumber: '',
            issuingAuthority: '',
          },
        ],
  };

  // ZERO useEffect: initial values populated directly during component mount
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useFpcForm<LegalRegistrationFormValues>({
    schema: legalRegistrationSchema,
    defaultValues: formValues,
    values: formValues,
    resetOptions: { keepDirtyValues: true },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'additionalLicenses',
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (err: unknown) {
      applyServerErrors(err, setError);
    }
  });

  const handleAddLicense = () => {
    append({
      id: `license-${Date.now()}`,
      licenseType: '',
      licenseNumber: '',
      issuingAuthority: '',
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <FormServerError errors={errors} />

      {/* Main Card */}
      <Card
        variant="default"
        padding="none"
        className="p-6 sm:p-8 rounded-2xl border-neutral-200/80 shadow-2xs space-y-6"
      >
        {/* Header with Step 02 Badge */}
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-bold text-sm shrink-0">
            02
          </div>
          <div>
            <h3 className="text-primary">
              Legal & registration
            </h3>
            <p className="text-secondary mt-0.5">
              Use the details on your official company documents.
            </p>
          </div>
        </div>

        {/* Form Inputs Grid: Rows 1-3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Row 1: Company PAN & Company TAN */}
          <Input
            id="fpc-company-pan"
            label="Company PAN *"
            required
            placeholder="AABCK6954F"
            helperText="10 characters"
            error={errors.companyPan?.message}
            {...register('companyPan')}
          />
          <Input
            id="fpc-company-tan"
            label="Company TAN *"
            required
            placeholder="BBSK01234A"
            helperText="10 characters"
            error={errors.companyTan?.message}
            {...register('companyTan')}
          />

          {/* Row 2: GSTIN & FSSAI license number */}
          <Input
            id="fpc-gstin"
            label="GSTIN *"
            required
            placeholder="21AABCK6954F1Z5"
            helperText="15 characters • State codes: 21 Odisha / 20 Jharkhand"
            error={errors.gstin?.message}
            {...register('gstin')}
          />
          <Input
            id="fpc-fssai"
            label="FSSAI license number *"
            required
            placeholder="12026021000123"
            helperText="14 digits"
            error={errors.fssaiLicense?.message}
            {...register('fssaiLicense')}
          />

          {/* Row 3: Seed license number & Fertilizer license number */}
          <Input
            id="fpc-seed-license"
            label="Seed license number *"
            required
            placeholder="Enter license number"
            error={errors.seedLicense?.message}
            {...register('seedLicense')}
          />
          <Input
            id="fpc-fertilizer-license"
            label="Fertilizer license number *"
            required
            placeholder="Enter license number"
            error={errors.fertilizerLicense?.message}
            {...register('fertilizerLicense')}
          />
        </div>

        {/* Sub-cards: Additional Operating Licenses */}
        <div className="space-y-4 pt-2">
          {fields.map((field, index) => {
            const licenseErrors = errors.additionalLicenses?.[index];

            return (
              <div
                key={field.id}
                className="rounded-2xl border border-neutral-200/80 p-5 sm:p-6 bg-white space-y-4 shadow-2xs"
              >
                {/* Header with Title & Delete button */}
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-primary">
                    Additional Operating Licenses
                  </h4>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                    className="h-8 px-5 rounded-lg bg-[#8B2323] hover:bg-[#721C1C] text-white shadow-2xs"
                  >
                    Delete
                  </Button>
                </div>

                {/* Sub-card Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <Controller
                    control={control}
                    name={`additionalLicenses.${index}.licenseType`}
                    render={({ field }) => (
                      <Select
                        id={`license-type-${index}`}
                        label="License type *"
                        required
                        options={LICENSE_TYPE_OPTIONS}
                        placeholder="Select license type"
                        trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
                        error={licenseErrors?.licenseType?.message}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  <Input
                    id={`license-number-${index}`}
                    label="License number *"
                    required
                    placeholder="Enter license number"
                    error={licenseErrors?.licenseNumber?.message}
                    {...register(`additionalLicenses.${index}.licenseNumber`)}
                  />
                </div>

                <div>
                  <Input
                    id={`license-authority-${index}`}
                    label="Issuing authority *"
                    required
                    placeholder="Enter issuing authority"
                    error={licenseErrors?.issuingAuthority?.message}
                    {...register(`additionalLicenses.${index}.issuingAuthority`)}
                  />
                </div>
              </div>
            );
          })}

          {/* Add Another License Dashed Button */}
          <button
            type="button"
            onClick={handleAddLicense}
            className="w-full py-3.5 px-4 rounded-xl border border-dashed border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50/50 text-secondary hover:text-primary text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Another License</span>
          </button>
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
          loadingText="Saving records..."
          className="rounded-full bg-[#0F4C36] hover:bg-[#0B3B2A] text-white px-7 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
        >
          Save and Continue →
        </Button>
      </div>
    </form>
  );
};

