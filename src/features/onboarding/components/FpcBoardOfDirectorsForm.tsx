import { forwardRef, useImperativeHandle, useState } from 'react';
import { useFieldArray, useWatch, Controller } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { Select } from '../../../shared/components/Select';
import { DatePicker } from '../../../shared/components/DatePicker';
import { Button } from '../../../shared/components/Button';
import { FormField } from '../../../shared/components/FormField';
import { FileUpload } from '../../../shared/components/FileUpload';
import { DirectorIdentityDocuments } from './DirectorIdentityDocuments';
import { useFilePreviews } from '../../../shared/hooks/useFilePreviews';
import { useFpcForm, applyServerErrors, FormServerError } from '../../../shared/forms';
import { API_BASE_URL } from '../../../shared/config/env';
import { FPC_ENDPOINTS } from '../../../shared/api/endpoints/fpc.endpoints';
import { INVITATION_ENDPOINTS } from '../../../shared/api/endpoints/invitations.endpoints';
import {
  boardOfDirectorsSchema,
  type BoardOfDirectorsFormValues,
} from '../schemas/boardOfDirectors.schema';
import type { FpcBoardOfDirectorsFormData, FpcDirector, StepFormHandle } from '../types';
import { directorGuidance } from '../constants/fieldGuidance';
import {
  DIRECTOR_IDENTITY_DOCUMENTS,
  directorUploadKey,
  type DirectorDocumentNameField,
  type DirectorDocumentsFileMap,
} from '../constants/documentTypes';

export interface FpcBoardOfDirectorsFormProps {
  initialData?: Partial<FpcBoardOfDirectorsFormData> | null;
  onSubmit: (
    values: BoardOfDirectorsFormValues,
    files: DirectorDocumentsFileMap
  ) => Promise<void> | void;
  onPreviousStep: () => void;
  isReadOnly?: boolean;
  onNextStep?: () => void;
  /** Present when an authenticated FPC is completing its own registration. */
  fpcId?: string;
  /** Present during token-based onboarding; enables saved-file previews. */
  invitationToken?: string;
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

/** Upper bound for the date-of-birth calendar; future dates are never selectable. */
const TODAY = new Date();

const createDirectorKey = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `director-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const emptyDirector = (overrides: Partial<FpcDirector> = {}): BoardOfDirectorsFormValues['directors'][number] => {
  const key = overrides.directorKey || overrides.id || createDirectorKey();
  return {
    id: key,
    directorKey: key,
    fullName: '',
    din: '',
    designation: 'Director',
    gender: '',
    appointmentDate: '',
    dateOfBirth: '',
    mobileNumber: '',
    email: '',
    pan: '',
    socialCategory: '',
    activeStatus: 'Active',
    photographName: '',
    aadhaarDocName: '',
    panDocName: '',
    voterIdDocName: '',
    ...overrides,
  };
};

/** Backfills keys and new fields for drafts saved before this change. */
const normalizeDirector = (
  director: Partial<FpcDirector>
): BoardOfDirectorsFormValues['directors'][number] => {
  const key = director.directorKey || director.id || createDirectorKey();
  return {
    id: director.id || key,
    directorKey: key,
    fullName: director.fullName || '',
    din: director.din || '',
    designation: director.designation || 'Director',
    gender: director.gender || '',
    appointmentDate: director.appointmentDate || '',
    dateOfBirth: director.dateOfBirth || '',
    mobileNumber: director.mobileNumber || '',
    email: director.email || '',
    pan: director.pan || '',
    socialCategory: director.socialCategory || '',
    activeStatus: director.activeStatus || 'Active',
    photographName: director.photographName || '',
    identityDocName: director.identityDocName || '',
    aadhaarDocName: director.aadhaarDocName || '',
    aadhaarDocumentId: director.aadhaarDocumentId || '',
    panDocName: director.panDocName || '',
    panDocumentId: director.panDocumentId || '',
    voterIdDocName: director.voterIdDocName || '',
    voterIdDocumentId: director.voterIdDocumentId || '',
  };
};

export const FpcBoardOfDirectorsForm = forwardRef<
  StepFormHandle<BoardOfDirectorsFormValues, DirectorDocumentsFileMap>,
  FpcBoardOfDirectorsFormProps
>(({
  initialData,
  onSubmit,
  onPreviousStep,
  isReadOnly = false,
  onNextStep,
  fpcId,
  invitationToken,
}, ref) => {
  const defaultDirectors = isReadOnly
    ? []
    : [
        emptyDirector({
          id: 'director-1',
          directorKey: 'director-1',
          designation: 'Managing Director',
          gender: 'Female',
        }),
      ];

  const formValues: BoardOfDirectorsFormValues = {
    directors:
      initialData?.directors && initialData.directors.length > 0
        ? initialData.directors.map(normalizeDirector)
        : defaultDirectors,
  };

  // ZERO useEffect: initial values populated directly during component mount
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setError,
    setValue,
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

  // Thumbnails for image uploads, keyed per director row and per document slot.
  const { previews: filePreviews, setFile: setFilePreview, clearFile } = useFilePreviews();

  // Selected identity-document files stay in memory until Step 4 is submitted.
  const [directorFiles, setDirectorFiles] = useState<DirectorDocumentsFileMap>({});

  useImperativeHandle(ref, () => ({
    getDraftValues: () => getValues(),
    getDraftFiles: () => directorFiles,
  }), [getValues, directorFiles]);

  const previewKey = (directorId: string, field: 'photographName' | 'identityDocName') =>
    `${directorId}:${field}`;

  const directorNamePath = (index: number, field: DirectorDocumentNameField) =>
    `directors.${index}.${field}` as `directors.${number}.${DirectorDocumentNameField}`;

  const validateDirectorFile = (file: File): string | null => {
    const hasAllowedExtension = /\.(pdf|png|jpe?g)$/i.test(file.name);
    const hasAllowedType =
      !file.type || ['application/pdf', 'image/png', 'image/jpeg'].includes(file.type.toLowerCase());

    if (!hasAllowedExtension || !hasAllowedType) {
      return 'Only PDF, JPG, JPEG or PNG files are allowed';
    }
    if (file.size === 0) {
      return 'The selected file is empty';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'File must be 5 MB or smaller';
    }
    return null;
  };

  const handleDirectorFileSelected = (
    index: number,
    directorKey: string,
    field: DirectorDocumentNameField,
    file: File
  ) => {
    const validationError = validateDirectorFile(file);
    if (validationError) {
      setError(directorNamePath(index, field), { type: 'manual', message: validationError });
      return;
    }

    const config = DIRECTOR_IDENTITY_DOCUMENTS.find((doc) => doc.key === field);
    if (!config) return;

    const key = directorUploadKey(directorKey, field);
    setDirectorFiles((previous) => ({
      ...previous,
      [key]: { directorKey, field, documentType: config.documentType, file },
    }));
    setFilePreview(key, file);
  };

  const handleDirectorFileCleared = (directorKey: string, field: DirectorDocumentNameField) => {
    const key = directorUploadKey(directorKey, field);
    clearFile(key);
    setDirectorFiles((previous) => {
      if (!(key in previous)) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const clearDirectorUploads = (directorKey: string) => {
    DIRECTOR_IDENTITY_DOCUMENTS.forEach((doc) => clearFile(directorUploadKey(directorKey, doc.key)));
    setDirectorFiles((previous) => {
      const next: DirectorDocumentsFileMap = {};
      for (const [key, upload] of Object.entries(previous)) {
        if (upload.directorKey !== directorKey) next[key] = upload;
      }
      return next;
    });
  };

  const storedDocumentUrl = (documentId?: string) => {
    if (!documentId) return null;
    if (fpcId) return `${API_BASE_URL}${FPC_ENDPOINTS.DOCUMENT_CONTENT(fpcId, documentId)}`;
    if (invitationToken) {
      return `${API_BASE_URL}${INVITATION_ENDPOINTS.DOCUMENT_CONTENT(invitationToken, documentId)}`;
    }
    return null;
  };

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values, directorFiles);
    } catch (err: unknown) {
      applyServerErrors(err, setError);
    }
  });

  const watchedDirectors = useWatch({ control, name: 'directors' });

  const handleAddDirector = () => {
    if (fields.length >= 20) return;
    append(emptyDirector({ designation: 'Director' }));
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
          {fields.map((directorRow, index) => {
            const directorErrors = errors.directors?.[index];
            const liveDirector = watchedDirectors?.[index] || directorRow;
            const initials = getInitials(liveDirector.fullName);

            return (
              <div
                key={directorRow.id}
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
                      onClick={() => {
                        clearFile(previewKey(directorRow.id, 'photographName'));
                        clearFile(previewKey(directorRow.id, 'identityDocName'));
                        clearDirectorUploads(liveDirector.directorKey);
                        remove(index);
                      }}
                      className="h-8 px-5 rounded-lg text-xs font-semibold shadow-2xs"
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
                      guidance={directorGuidance.fullName}
                      label="Director full name *"
                      required
                      disabled={isReadOnly}
                      placeholder="Enter full name"
                      error={directorErrors?.fullName?.message}
                      {...register(`directors.${index}.fullName`)}
                    />
                    <Input
                      id={`director-din-${index}`}
                      guidance={directorGuidance.din}
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
                          guidance={directorGuidance.designation}
                          label="Designation *"
                          required
                          disabled={isReadOnly}
                          options={DESIGNATION_OPTIONS}
                          placeholder="Select designation"
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
                          guidance={directorGuidance.gender}
                          label="Gender *"
                          required
                          disabled={isReadOnly}
                          options={GENDER_OPTIONS}
                          placeholder="Select gender"
                          error={directorErrors?.gender?.message}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                  </div>

                  {/* Row 3: Appointment date, Date of birth & Mobile number */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-4">
                    <Controller
                      control={control}
                      name={`directors.${index}.appointmentDate`}
                      render={({ field }) => (
                        <DatePicker
                          id={`director-date-${index}`}
                          guidance={directorGuidance.appointmentDate}
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
                    <Controller
                      control={control}
                      name={`directors.${index}.dateOfBirth`}
                      render={({ field }) => (
                        <DatePicker
                          id={`director-dob-${index}`}
                          guidance={directorGuidance.dateOfBirth}
                          label="Date of birth *"
                          required
                          disabled={isReadOnly}
                          placeholder="dd-mm-yyyy"
                          maxDate={TODAY}
                          error={directorErrors?.dateOfBirth?.message}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                    <Input
                      id={`director-mobile-${index}`}
                      guidance={directorGuidance.mobileNumber}
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
                      guidance={directorGuidance.email}
                      label="Email address"
                      disabled={isReadOnly}
                      placeholder="Enter email address"
                      error={directorErrors?.email?.message}
                      {...register(`directors.${index}.email`)}
                    />
                    <Input
                      id={`director-pan-${index}`}
                      guidance={directorGuidance.pan}
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
                          guidance={directorGuidance.socialCategory}
                          label="Social category"
                          disabled={isReadOnly}
                          options={SOCIAL_CATEGORY_OPTIONS}
                          placeholder="Select social category"
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
                          guidance={directorGuidance.activeStatus}
                          label="Active status *"
                          required
                          disabled={isReadOnly}
                          options={ACTIVE_STATUS_OPTIONS}
                          placeholder="Select status"
                          error={directorErrors?.activeStatus?.message}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                  </div>

                  {/* Row 6: Photograph (legacy identity document shown only when already saved) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-1">
                    <Controller
                      control={control}
                      name={`directors.${index}.photographName`}
                      render={({ field }) => (
                        <FormField label="Photograph" guidance={directorGuidance.photographName}>
                          {isReadOnly ? (
                            <div className="w-full rounded-2xl border border-neutral-200 p-4 bg-neutral-50/50 flex items-center gap-2">
                              <span className="font-semibold text-primary text-xs truncate">
                                {field.value || 'No photograph uploaded'}
                              </span>
                            </div>
                          ) : (
                            <FileUpload
                              variant="dashed"
                              accept="image/*,application/pdf"
                              maxSizeMB={5}
                              fileName={field.value}
                              promptText="Upload photograph"
                              helperText="PDF, PNG or JPG • Maximum 5 MB (or password-protected)"
                              previewUrl={filePreviews[previewKey(directorRow.id, 'photographName')]}
                              previewAlt="Director photograph"
                              onFileSelect={(file) => {
                                field.onChange(file.name);
                                setFilePreview(previewKey(directorRow.id, 'photographName'), file);
                              }}
                            />
                          )}
                        </FormField>
                      )}
                    />

                    {liveDirector.identityDocName?.trim() && (
                    <Controller
                      control={control}
                      name={`directors.${index}.identityDocName`}
                      render={({ field }) => (
                        <FormField
                          label="Identity document (legacy attachment)"
                          guidance={directorGuidance.identityDocName}
                        >
                          {isReadOnly ? (
                            <div className="w-full rounded-2xl border border-neutral-200 p-4 bg-neutral-50/50 flex items-center gap-2">
                              <span className="font-semibold text-primary text-xs truncate">
                                {field.value || 'No identity document uploaded'}
                              </span>
                            </div>
                          ) : (
                            <FileUpload
                              variant="dashed"
                              accept="image/*,application/pdf"
                              maxSizeMB={5}
                              fileName={field.value}
                              promptText="Attach identity document"
                              helperText="PDF, PNG or JPG • Maximum 5 MB (or password-protected)"
                              previewUrl={filePreviews[previewKey(directorRow.id, 'identityDocName')]}
                              previewAlt="Director identity document"
                              onFileSelect={(file) => {
                                field.onChange(file.name);
                                setFilePreview(previewKey(directorRow.id, 'identityDocName'), file);
                              }}
                            />
                          )}
                        </FormField>
                      )}
                    />
                    )}
                  </div>

                  {/* Mandatory identity documents: one set per director, associated by directorKey */}
                  <DirectorIdentityDocuments
                    index={index}
                    directorKey={liveDirector.directorKey}
                    director={liveDirector}
                    control={control}
                    setValue={setValue}
                    errors={{
                      aadhaarDocName: directorErrors?.aadhaarDocName,
                      panDocName: directorErrors?.panDocName,
                      voterIdDocName: directorErrors?.voterIdDocName,
                    }}
                    isReadOnly={isReadOnly}
                    previews={filePreviews}
                    onFileSelected={(field, file) =>
                      handleDirectorFileSelected(index, liveDirector.directorKey, field, file)
                    }
                    onFileCleared={(field) => handleDirectorFileCleared(liveDirector.directorKey, field)}
                    storedDocumentUrl={storedDocumentUrl}
                  />
                </div>
              </div>
            );
          })}

          {fields.length === 0 && isReadOnly && (
            <p className="text-xs text-secondary italic">No board of directors recorded.</p>
          )}

          {/* Add Director Dashed Button */}
          {!isReadOnly && (
            <Button
              type="button"
              variant="outline"
              disabled={fields.length >= 20}
              onClick={handleAddDirector}
              className="w-full py-3.5 px-4 rounded-xl border-dashed border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50/50 text-secondary hover:text-primary text-xs sm:text-sm font-semibold shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
              leadingIcon={<Plus className="w-4 h-4" />}
            >
              {fields.length >= 20 ? 'Maximum Directors Limit Reached (20)' : 'Add Director'}
            </Button>
          )}
        </div>
      </Card>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onPreviousStep}
          className="rounded-full px-6 py-2.5 text-xs font-semibold"
        >
          ← Previous Step
        </Button>
        {isReadOnly ? (
          onNextStep && (
            <Button
              type="button"
              variant="primary"
              onClick={onNextStep}
              className="rounded-full px-7 py-2.5 text-xs font-semibold shadow-2xs"
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
            className="rounded-full px-7 py-2.5 text-xs font-semibold shadow-2xs"
          >
            Save and Continue →
          </Button>
        )}
      </div>
    </form>
  );
});

FpcBoardOfDirectorsForm.displayName = 'FpcBoardOfDirectorsForm';


