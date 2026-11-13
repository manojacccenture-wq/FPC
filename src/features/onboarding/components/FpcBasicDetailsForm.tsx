import React from 'react';
import { Controller } from 'react-hook-form';
import { ChevronRight } from 'lucide-react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { Select } from '../../../shared/components/Select';
import { DatePicker } from '../../../shared/components/DatePicker';
import { Button } from '../../../shared/components/Button';
import { useFpcForm, applyServerErrors, FormServerError } from '../../../shared/forms';
import { basicDetailsSchema, type BasicDetailsFormValues } from '../schemas/basicDetails.schema';
import type { FpcInvitation, FpcBasicDetailsFormData } from '../types';

export interface FpcBasicDetailsFormProps {
  invitation: FpcInvitation;
  initialData?: Partial<FpcBasicDetailsFormData> | null;
  onSubmit: (values: BasicDetailsFormValues) => Promise<void> | void;
  onBackToLogin: () => void;
}

const ROC_OFFICES = [
  { value: 'ROC Cuttack', label: 'ROC Cuttack' },
  { value: 'ROC Kolkata', label: 'ROC Kolkata' },
  { value: 'ROC Patna', label: 'ROC Patna' },
  { value: 'ROC Ranchi', label: 'ROC Ranchi' },
  { value: 'ROC Delhi', label: 'ROC Delhi' },
  { value: 'ROC Mumbai', label: 'ROC Mumbai' },
  { value: 'ROC Bangalore', label: 'ROC Bangalore' },
  { value: 'ROC Hyderabad', label: 'ROC Hyderabad' },
  { value: 'ROC Chennai', label: 'ROC Chennai' },
];

const COMPANY_CATEGORIES = [
  {
    value: 'Producer Company under Section 378A of CA 2013',
    label: 'Producer Company under Section 378A of CA 2013',
  },
  {
    value: 'Private Limited Producer Company',
    label: 'Private Limited Producer Company',
  },
  {
    value: 'Farmers Producer Organization (FPO)',
    label: 'Farmers Producer Organization (FPO)',
  },
];

export const FpcBasicDetailsForm: React.FC<FpcBasicDetailsFormProps> = ({
  invitation,
  initialData,
  onSubmit,
  onBackToLogin,
}) => {
  const defaultRoc = invitation.state === 'Odisha' ? 'ROC Cuttack' : 'ROC Kolkata';
  const formValues: BasicDetailsFormValues = {
    legalName: initialData?.legalName || invitation.companyName || '',
    cin: initialData?.cin || '',
    registrationNumber: initialData?.registrationNumber || '',
    rocOffice: initialData?.rocOffice || defaultRoc,
    dateOfIncorporation: initialData?.dateOfIncorporation || '',
    companyCategory: initialData?.companyCategory || 'Producer Company under Section 378A of CA 2013',
    contactEmail: initialData?.contactEmail || invitation.email || '',
    contactMobile: initialData?.contactMobile || invitation.phoneNumber || '',
    website: initialData?.website || '',
  };

  // ZERO useEffect: Initial and restored values populated synchronously
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useFpcForm<BasicDetailsFormValues>({
    schema: basicDetailsSchema,
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

      {/* Form Card */}
      <Card
        variant="default"
        padding="none"
        className="p-6 sm:p-8 rounded-2xl border-neutral-200/80 shadow-2xs"
      >
        {/* Card Header with Step 01 Badge */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-bold text-sm shrink-0">
            01
          </div>
          <div>
            <h3 className="text-primary">
              Basic company details
            </h3>
            <p className="text-secondary mt-0.5">
              Use the details on your official company documents.
            </p>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Row 1: Legal Name & CIN */}
          <Input
            id="fpc-legal-name"
            label="FPC legal name *"
            required
            placeholder="Kalinganagar Farmer Producer Company Ltd."
            error={errors.legalName?.message}
            {...register('legalName')}
          />
          <Input
            id="fpc-cin"
            label="CIN *"
            required
            placeholder="U01100OD2026PTC000001"
            helperText="21 alphanumeric characters"
            error={errors.cin?.message}
            {...register('cin')}
          />

          {/* Row 2: Registration Number & ROC Office */}
          <Input
            id="fpc-reg-number"
            label="FPC registration number *"
            required
            placeholder="000001"
            error={errors.registrationNumber?.message}
            {...register('registrationNumber')}
          />
          <Controller
            control={control}
            name="rocOffice"
            render={({ field }) => (
              <Select
                id="fpc-roc-office"
                label="ROC office *"
                required
                options={ROC_OFFICES}
                placeholder="Select ROC office"
                trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
                error={errors.rocOffice?.message}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
              />
            )}
          />

          {/* Row 3: Date of Incorporation & Company Category */}
          <Controller
            control={control}
            name="dateOfIncorporation"
            render={({ field }) => (
              <DatePicker
                id="fpc-date-incorporation"
                label="Date of incorporation *"
                required
                placeholder="dd-mm-yyyy"
                error={errors.dateOfIncorporation?.message}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Controller
            control={control}
            name="companyCategory"
            render={({ field }) => (
              <Select
                id="fpc-company-category"
                label="Company category *"
                required
                options={COMPANY_CATEGORIES}
                helperText="Producer Company under Section 378A of CA 2013"
                trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
                error={errors.companyCategory?.message}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
              />
            )}
          />

          {/* Row 4: Official Email & Mobile (Read-only from invitation) */}
          <Input
            id="fpc-contact-email"
            type="email"
            label="Official contact email *"
            required
            readOnly
            helperText="Read-only • Provided in your invitation"
            error={errors.contactEmail?.message}
            {...register('contactEmail')}
          />
          <Input
            id="fpc-contact-mobile"
            type="tel"
            label="Official contact mobile *"
            required
            readOnly
            helperText="Read-only • Provided in your invitation"
            error={errors.contactMobile?.message}
            {...register('contactMobile')}
          />

          {/* Row 5: Official Website (Optional, full-width) */}
          <div className="col-span-1 md:col-span-2">
            <Input
              id="fpc-website"
              type="url"
              label="Official website"
              placeholder="https://kalinganagarfpc.in"
              helperText="Optional"
              error={errors.website?.message}
              {...register('website')}
            />
          </div>
        </div>
      </Card>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onBackToLogin}
          className="rounded-full bg-brand-soft text-brand hover:bg-forest-100 px-6 py-2.5 text-xs font-semibold"
        >
          Back to Login
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          loadingText="Saving details..."
          className="rounded-full bg-[#0F4C36] hover:bg-[#0B3B2A] text-white px-7 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
        >
          Save and Continue →
        </Button>
      </div>
    </form>
  );
};

