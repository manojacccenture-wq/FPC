import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight } from 'lucide-react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { Select } from '../../../shared/components/Select';
import { Button } from '../../../shared/components/Button';
import {
  addressLocationSchema,
  type AddressLocationFormValues,
} from '../schemas/addressLocation.schema';
import type { FpcAddressLocationFormData } from '../types';

export interface FpcAddressLocationFormProps {
  initialData?: Partial<FpcAddressLocationFormData> | null;
  onSubmit: (values: AddressLocationFormValues) => Promise<void> | void;
  onPreviousStep: () => void;
  isSubmitting?: boolean;
}

const STATE_OPTIONS = [
  { value: 'Odisha', label: 'Odisha' },
  { value: 'Jharkhand', label: 'Jharkhand' },
  { value: 'West Bengal', label: 'West Bengal' },
  { value: 'Bihar', label: 'Bihar' },
];

const DISTRICT_OPTIONS = [
  { value: 'Jajpur', label: 'Jajpur' },
  { value: 'Keonjhar', label: 'Keonjhar' },
  { value: 'West Singhbhum', label: 'West Singhbhum' },
  { value: 'Seraikela-Kharsawan', label: 'Seraikela-Kharsawan' },
];

const BLOCK_OPTIONS = [
  { value: 'Jajpur Sadar', label: 'Jajpur Sadar' },
  { value: 'Danagadi', label: 'Danagadi' },
  { value: 'Sukinda', label: 'Sukinda' },
  { value: 'Korei', label: 'Korei' },
  { value: 'Dharamsala', label: 'Dharamsala' },
];

const GRAM_PANCHAYAT_OPTIONS = [
  { value: 'Kalinganagar', label: 'Kalinganagar' },
  { value: 'Danagadi', label: 'Danagadi' },
  { value: 'Brahmanajhar', label: 'Brahmanajhar' },
  { value: 'Chorda', label: 'Chorda' },
  { value: 'Jakhapura', label: 'Jakhapura' },
];

const VILLAGE_OPTIONS = [
  { value: 'Kalinganagar', label: 'Kalinganagar' },
  { value: 'Gobardhanpur', label: 'Gobardhanpur' },
  { value: 'Duburi', label: 'Duburi' },
  { value: 'Salijanga', label: 'Salijanga' },
];

export const FpcAddressLocationForm: React.FC<FpcAddressLocationFormProps> = ({
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
  } = useForm<AddressLocationFormValues>({
    resolver: zodResolver(addressLocationSchema),
    defaultValues: {
      streetAddress: initialData?.streetAddress || '',
      state: initialData?.state || 'Odisha',
      district: initialData?.district || 'Jajpur',
      block: initialData?.block || 'Jajpur Sadar',
      gramPanchayat: initialData?.gramPanchayat || '',
      village: initialData?.village || '',
      pinCode: initialData?.pinCode || '',
      officeMobile: initialData?.officeMobile || '+91 9437890123',
      officialEmail: initialData?.officialEmail || 'admin@kalinganagarfpc.in',
      latitude: initialData?.latitude || '',
      longitude: initialData?.longitude || '',
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
        {/* Header with Step 06 Badge */}
        <div>
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-bold text-sm shrink-0">
              06
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-primary">
                Address & location
              </h2>
              <p className="text-xs text-secondary mt-0.5">
                Use the details on your official company documents.
              </p>
            </div>
          </div>

          {/* Location Hierarchy Trail */}
          <p className="text-xs text-secondary font-medium mt-3">
            State → District → Block → Gram Panchayat → Village
          </p>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Row 1: Street Address & State */}
          <Input
            id="fpc-street-address"
            label="Registered office street address *"
            required
            placeholder="Enter registered office address"
            error={errors.streetAddress?.message}
            {...register('streetAddress')}
          />
          <Select
            id="fpc-state"
            label="State *"
            required
            options={STATE_OPTIONS}
            trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
            error={errors.state?.message}
            {...register('state')}
          />

          {/* Row 2: District & Block */}
          <Select
            id="fpc-district"
            label="District *"
            required
            options={DISTRICT_OPTIONS}
            trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
            error={errors.district?.message}
            {...register('district')}
          />
          <Select
            id="fpc-block"
            label="Block *"
            required
            options={BLOCK_OPTIONS}
            trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
            error={errors.block?.message}
            {...register('block')}
          />

          {/* Row 3: Gram Panchayat & Village */}
          <Select
            id="fpc-gp"
            label="Gram Panchayat *"
            required
            options={GRAM_PANCHAYAT_OPTIONS}
            placeholder="Select Gram Panchayat"
            trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
            error={errors.gramPanchayat?.message}
            {...register('gramPanchayat')}
          />
          <Select
            id="fpc-village"
            label="Village *"
            required
            options={VILLAGE_OPTIONS}
            placeholder="Select village"
            trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
            error={errors.village?.message}
            {...register('village')}
          />

          {/* Row 4: PIN code & Office mobile number */}
          <Input
            id="fpc-pincode"
            label="PIN code *"
            required
            placeholder="Enter PIN code"
            helperText="6 digits"
            error={errors.pinCode?.message}
            {...register('pinCode')}
          />
          <Input
            id="fpc-office-mobile"
            type="tel"
            label="Office mobile number *"
            required
            placeholder="+91 9437890123"
            error={errors.officeMobile?.message}
            {...register('officeMobile')}
          />

          {/* Row 5: Official email & Latitude */}
          <Input
            id="fpc-official-email"
            type="email"
            label="Official email address *"
            required
            placeholder="admin@kalinganagarfpc.in"
            error={errors.officialEmail?.message}
            {...register('officialEmail')}
          />
          <Input
            id="fpc-latitude"
            label="Latitude"
            placeholder="Enter latitude"
            helperText="Optional"
            error={errors.latitude?.message}
            {...register('latitude')}
          />

          {/* Row 6: Longitude (full-width) */}
          <div className="col-span-1 md:col-span-2">
            <Input
              id="fpc-longitude"
              label="Longitude"
              placeholder="Enter longitude"
              helperText="Optional"
              error={errors.longitude?.message}
              {...register('longitude')}
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
          loadingText="Saving location..."
          className="rounded-full bg-[#0F4C36] hover:bg-[#0B3B2A] text-white px-7 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
        >
          Save and Continue →
        </Button>
      </div>
    </form>
  );
};

