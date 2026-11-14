import React from 'react';
import { useFieldArray, useWatch, Controller } from 'react-hook-form';
import { ChevronRight, Plus, Upload } from 'lucide-react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { Select } from '../../../shared/components/Select';
import { DatePicker } from '../../../shared/components/DatePicker';
import { Button } from '../../../shared/components/Button';
import { FormField } from '../../../shared/components/FormField';
import { useFpcForm, applyServerErrors, FormServerError } from '../../../shared/forms';
import {
  boardOfDirectorsSchema,
  type BoardOfDirectorsFormValues,
} from '../schemas/boardOfDirectors.schema';
import type { FpcBoardOfDirectorsFormData } from '../types';

export interface FpcBoardOfDirectorsFormProps {
  initialData?: Partial<FpcBoardOfDirectorsFormData> | null;
  onSubmit: (values: BoardOfDirectorsFormValues) => Promise<void> | void;
  onPreviousStep: () => void;
  isReadOnly?: boolean;
  onNextStep?: () => void;
}

const DESIGNATION_OPTIONS = [
  { value: 'Managing Director', label: 'Managing Director' },
  { value: 'Chairperson', label: 'Chairperson' },
  { value: 'Director', label: 'Director' },
  { value: 'Whole-time Director', label: 'Whole-time Director' },
  { value: 'Nominee Director', label: 'Nominee Director' },
  { value: 'Additional Director', label: 'Additional Director' },
];

const GENDER_OPTIONS = [
  { value: 'Female', label: 'Female' },
  { value: 'Male', label: 'Male' },
  { value: 'Other', label: 'Other' },
];

const SOCIAL_CATEGORY_OPTIONS = [
  { value: 'General', label: 'General' },
  { value: 'OBC', label: 'OBC' },
  { value: 'SC', label: 'SC' },
  { value: 'ST', label: 'ST' },
  { value: 'Minority', label: 'Minority' },
];

const ACTIVE_STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

export const FpcBoardOfDirectorsForm: React.FC<FpcBoardOfDirectorsFormProps> = ({
  initialData,
  onSubmit,
  onPreviousStep,
  isReadOnly = false,
  onNextStep,
}) => {
  const defaultDirectors = isReadOnly
    ? []
    : [
        {
          id: 'director-1',
          fullName: '',
          din: '',
          designation: 'Managing Director',
          gender: 'Female',
          appointmentDate: '',
          mobileNumber: '',
          email: '',
          pan: '',
          socialCategory: '',
          activeStatus: 'Active',
        },
      ];

  const formValues: BoardOfDirectorsFormValues = {
    directors: initialData?.directors && initialData.directors.length > 0
      ? initialData.directors
      : defaultDirectors,
  };

  // ZERO useEffect: initial values populated directly during component mount
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useFpcForm<BoardOfDirectorsFormValues>({
    schema: boardOfDirectorsSchema,
    defaultValues: formValues,
    values: formValues,
    resetOptions: { keepDirtyValues: true },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'directors',
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (err: unknown) {
      applyServerErrors(err, setError);
    }
  });

  const watchedDirectors = useWatch({ control, name: 'directors' });

  const handleAddDirector = () => {
    append({
      id: `director-${Date.now()}`,
      fullName: '',
      din: '',
      designation: 'Director',
      gender: '',
      appointmentDate: '',
      mobileNumber: '',
      email: '',
      pan: '',
      socialCategory: '',
      activeStatus: 'Active',
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return 'D';
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
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
        {/* Header with Step 04 Badge */}
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-bold text-sm shrink-0">
            04
          </div>
          <div>
            <h3 className="text-primary">
              Board of directors
            </h3>
            <p className="text-secondary mt-0.5">
              Board of directors • Total entered: {fields.length}
            </p>
          </div>
        </div>

        {/* Directors List */}
        <div className="space-y-6">
          {fields.map((field, index) => {
            const directorErrors = errors.directors?.[index];
            const liveDirector = watchedDirectors?.[index] || field;
            const initials = getInitials(liveDirector.fullName);

            return (
              <div
                key={field.id}
                className="rounded-2xl border border-neutral-200/80 p-5 sm:p-6 bg-white space-y-5 shadow-2xs"
              >
                {/* Director Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-soft text-brand font-bold text-xs flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-primary">
                        Director #{index + 1} • {liveDirector.fullName || 'New Director'}
                      </h3>
                      <p className="text-xs text-secondary mt-0.5">
                        {liveDirector.designation || 'Director'} • DIN{' '}
                        {liveDirector.din || 'not entered'} •{' '}
                        {liveDirector.activeStatus || 'Not enacted'}
                      </p>
                    </div>
                  </div>

                  {fields.length > 1 && !isReadOnly && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                      className="h-8 px-5 rounded-lg text-xs font-semibold bg-[#8B2323] hover:bg-[#721C1C] text-white shadow-2xs"
                    >
                      Delete
                    </Button>
                  )}
                </div>

                {/* Director Inputs Grid: 6 Rows */}
                <div className="space-y-4">
                  {/* Row 1: Full name & DIN */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <Input
                      id={`director-name-${index}`}
                      label="Director full name *"
                      required
                      disabled={isReadOnly}
                      placeholder="Enter full name"
                      error={directorErrors?.fullName?.message}
                      {...register(`directors.${index}.fullName`)}
                    />
                    <Input
                      id={`director-din-${index}`}
                      label="DIN *"
                      required
                      disabled={isReadOnly}
                      placeholder="Enter DIN"
                      helperText="8 digits"
                      error={directorErrors?.din?.message}
                      {...register(`directors.${index}.din`)}
                    />
                  </div>

                  {/* Row 2: Designation & Gender */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <Controller
                      control={control}
                      name={`directors.${index}.designation`}
                      render={({ field }) => (
                        <Select
                          id={`director-desig-${index}`}
                          label="Designation *"
                          required
                          disabled={isReadOnly}
                          options={DESIGNATION_OPTIONS}
                          placeholder="Select designation"
                          trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
                          error={directorErrors?.designation?.message}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name={`directors.${index}.gender`}
                      render={({ field }) => (
                        <Select
                          id={`director-gender-${index}`}
                          label="Gender *"
                          required
                          disabled={isReadOnly}
                          options={GENDER_OPTIONS}
                          placeholder="Select gender"
                          trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
                          error={directorErrors?.gender?.message}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                  </div>

                  {/* Row 3: Appointment date & Mobile number */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <Controller
                      control={control}
                      name={`directors.${index}.appointmentDate`}
                      render={({ field }) => (
                        <DatePicker
                          id={`director-date-${index}`}
                          label="Appointment date *"
                          required
                          disabled={isReadOnly}
                          placeholder="dd-mm-yyyy"
                          error={directorErrors?.appointmentDate?.message}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                    <Input
                      id={`director-mobile-${index}`}
                      label="Mobile number *"
                      required
                      disabled={isReadOnly}
                      placeholder="Enter mobile number"
                      error={directorErrors?.mobileNumber?.message}
                      {...register(`directors.${index}.mobileNumber`)}
                    />
                  </div>

                  {/* Row 4: Email address & Director PAN */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <Input
                      id={`director-email-${index}`}
                      type="email"
                      label="Email address"
                      disabled={isReadOnly}
                      placeholder="Enter email address"
                      error={directorErrors?.email?.message}
                      {...register(`directors.${index}.email`)}
                    />
                    <Input
                      id={`director-pan-${index}`}
                      label="Director PAN *"
                      required
                      disabled={isReadOnly}
                      placeholder="Enter PAN"
                      helperText="10 characters"
                      error={directorErrors?.pan?.message}
                      {...register(`directors.${index}.pan`)}
                    />
                  </div>

                  {/* Row 5: Social category & Active status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <Controller
                      control={control}
                      name={`directors.${index}.socialCategory`}
                      render={({ field }) => (
                        <Select
                          id={`director-social-${index}`}
                          label="Social category"
                          disabled={isReadOnly}
                          options={SOCIAL_CATEGORY_OPTIONS}
                          placeholder="Select social category"
                          trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
                          error={directorErrors?.socialCategory?.message}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name={`directors.${index}.activeStatus`}
                      render={({ field }) => (
                        <Select
                          id={`director-status-${index}`}
                          label="Active status *"
                          required
                          disabled={isReadOnly}
                          options={ACTIVE_STATUS_OPTIONS}
                          placeholder="Select status"
                          trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
                          error={directorErrors?.activeStatus?.message}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                  </div>

                  {/* Row 6: Uploads (Photograph & Identity Document) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-1">
                    <Controller
                      control={control}
                      name={`directors.${index}.photographName`}
                      render={({ field }) => (
                        <FormField label="Photograph">
                          {isReadOnly ? (
                            <div className="w-full rounded-2xl border border-neutral-200 p-4 bg-neutral-50/50 flex items-center gap-2">
                              <span className="font-semibold text-primary text-xs truncate">
                                {field.value || 'No photograph uploaded'}
                              </span>
                            </div>
                          ) : (
                            <label className="w-full rounded-2xl border border-dashed border-neutral-300 hover:border-neutral-400 p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-white hover:bg-neutral-50/50 transition-colors">
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={(e) => field.onChange(e.target.files?.[0]?.name ?? '')}
                              />
                              <Upload className="w-4 h-4 text-secondary mb-1" />
                              <span className="font-semibold text-primary">
                                {field.value || 'Upload photograph'}
                              </span>
                              <small className="text-secondary mt-0.5 block">
                                PDF, PNG or JPG • Maximum 5 MB (or password-protected)
                              </small>
                            </label>
                          )}
                        </FormField>
                      )}
                    />

                    <Controller
                      control={control}
                      name={`directors.${index}.identityDocName`}
                      render={({ field }) => (
                        <FormField label="Identity document • Aadhaar / PAN">
                          {isReadOnly ? (
                            <div className="w-full rounded-2xl border border-neutral-200 p-4 bg-neutral-50/50 flex items-center gap-2">
                              <span className="font-semibold text-primary text-xs truncate">
                                {field.value || 'No identity document uploaded'}
                              </span>
                            </div>
                          ) : (
                            <label className="w-full rounded-2xl border border-dashed border-neutral-300 hover:border-neutral-400 p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-white hover:bg-neutral-50/50 transition-colors">
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={(e) => field.onChange(e.target.files?.[0]?.name ?? '')}
                              />
                              <Upload className="w-4 h-4 text-secondary mb-1" />
                              <span className="font-semibold text-primary">
                                {field.value || 'Attach identity document'}
                              </span>
                              <small className="text-secondary mt-0.5 block">
                                PDF, PNG or JPG • Maximum 5 MB (or password-protected)
                              </small>
                            </label>
                          )}
                        </FormField>
                      )}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {fields.length === 0 && isReadOnly && (
            <p className="text-xs text-secondary italic">No board of directors recorded.</p>
          )}

          {/* Add Director Dashed Button */}
          {!isReadOnly && (
            <button
              type="button"
              onClick={handleAddDirector}
              className="w-full py-3.5 px-4 rounded-xl border border-dashed border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50/50 text-secondary hover:text-primary text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span> Add Director</span>
            </button>
          )}
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
        {isReadOnly ? (
          onNextStep && (
            <Button
              type="button"
              variant="primary"
              onClick={onNextStep}
              className="rounded-full bg-[#0F4C36] hover:bg-[#0B3B2A] text-white px-7 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            >
              Next: Logo & Documents →
            </Button>
          )
        ) : (
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            loadingText="Saving directors..."
            className="rounded-full bg-[#0F4C36] hover:bg-[#0B3B2A] text-white px-7 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
          >
            Save and Continue →
          </Button>
        )}
      </div>
    </form>
  );
};

