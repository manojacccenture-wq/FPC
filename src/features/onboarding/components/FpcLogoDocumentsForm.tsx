import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload } from 'lucide-react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import {
  logoDocumentsSchema,
  type LogoDocumentsFormValues,
} from '../schemas/logoDocuments.schema';
import type { FpcLogoDocumentsFormData } from '../types';

export interface FpcLogoDocumentsFormProps {
  initialData?: Partial<FpcLogoDocumentsFormData> | null;
  onSubmit: (values: LogoDocumentsFormValues) => Promise<void> | void;
  onPreviousStep: () => void;
  isSubmitting?: boolean;
}

interface StatutoryDocConfig {
  key: keyof LogoDocumentsFormValues;
  title: string;
}

const STATUTORY_DOCUMENTS: StatutoryDocConfig[] = [
  { key: 'incorporationCertName', title: 'Certificate of Incorporation' },
  { key: 'panCertName', title: 'Company PAN Certificate' },
  { key: 'gstinCertName', title: 'GSTIN Certificate' },
  { key: 'fssaiLicenseName', title: 'FSSAI Food Safety License' },
  { key: 'seedLicenseName', title: 'Seed Production/Distribution License' },
  { key: 'fertilizerLicenseName', title: 'Fertilizer Retail/Wholesale License' },
  { key: 'moaAoaDocName', title: 'ROC MOA & AOA Documents' },
  { key: 'boardResolutionDocName', title: 'Board Resolution / Supporting Documents' },
];

export const FpcLogoDocumentsForm: React.FC<FpcLogoDocumentsFormProps> = ({
  initialData,
  onSubmit,
  onPreviousStep,
  isSubmitting = false,
}) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // ZERO useEffect: initial values populated directly during component mount
  const {
    register,
    control,
    handleSubmit,
    setValue,
  } = useForm<LogoDocumentsFormValues>({
    resolver: zodResolver(logoDocumentsSchema),
    defaultValues: {
      logoFileName: initialData?.logoFileName || '',
      incorporationCertName: initialData?.incorporationCertName || '',
      panCertName: initialData?.panCertName || '',
      gstinCertName: initialData?.gstinCertName || '',
      fssaiLicenseName: initialData?.fssaiLicenseName || '',
      seedLicenseName: initialData?.seedLicenseName || '',
      fertilizerLicenseName: initialData?.fertilizerLicenseName || '',
      moaAoaDocName: initialData?.moaAoaDocName || '',
      boardResolutionDocName: initialData?.boardResolutionDocName || '',
    },
    mode: 'onBlur',
  });

  const watchedValues = useWatch({ control }) || {};

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('logoFileName', file.name);
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);
    }
  };

  const handleDocUpload = (key: keyof LogoDocumentsFormValues, file?: File) => {
    if (file) {
      setValue(key, file.name);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Main Card */}
      <Card
        variant="default"
        padding="none"
        className="p-6 sm:p-8 rounded-2xl border-neutral-200/80 shadow-2xs space-y-6"
      >
        {/* Header with Step 05 Badge */}
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-bold text-sm shrink-0">
            05
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-primary">
              Logo & documents
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              Use the details on your official company documents.
            </p>
          </div>
        </div>

        {/* Company Logo Section */}
        <div className="space-y-2">
          <label className="text-xs sm:text-[13px] font-semibold text-primary block">
            Company logo
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Logo Preview Square */}
            <div className="w-24 h-24 rounded-2xl bg-neutral-100 flex items-center justify-center text-xs text-secondary font-medium select-none shrink-0 border border-neutral-200/60 overflow-hidden">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>No logo</span>
              )}
            </div>

            {/* Logo Upload Dropzone */}
            <label className="flex-1 w-full border border-neutral-200 hover:border-brand rounded-2xl p-5 flex flex-col justify-center cursor-pointer bg-white hover:bg-neutral-50/50 transition-colors">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-primary">
                <span className="w-7 h-7 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4 stroke-[2]" />
                </span>
                <span>
                  {watchedValues.logoFileName
                    ? watchedValues.logoFileName
                    : 'Upload Logo (PNG, JPG, WebP)'}
                </span>
              </div>
              <p className="text-[11px] text-secondary mt-1 ml-9.5">
                PNG, JPG, WebP • Max file size 2 MB
              </p>
            </label>
          </div>
        </div>

        {/* Statutory Document Attachments Section */}
        <div className="pt-2">
          <h3 className="text-base font-bold text-primary mb-4">
            Statutory Document Attachments
          </h3>

          {/* 2-Column Grid for the 8 Documents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {STATUTORY_DOCUMENTS.map((doc) => {
              const uploadedFileName = watchedValues[doc.key] as string | undefined;
              const isUploaded = Boolean(uploadedFileName);

              return (
                <div
                  key={doc.key}
                  className="rounded-2xl border border-neutral-200/80 p-5 bg-white space-y-3.5 shadow-2xs"
                >
                  {/* Card Header: Title & Pending / Uploaded Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-primary">
                      {doc.title}
                    </h4>
                    <Badge
                      variant={isUploaded ? 'brand' : 'warning'}
                      size="sm"
                      className={
                        isUploaded
                          ? 'bg-brand-soft text-brand font-semibold text-[11px]'
                          : 'bg-warning-soft text-warning font-semibold text-[11px]'
                      }
                    >
                      {isUploaded ? 'Uploaded' : 'Pending'}
                    </Badge>
                  </div>

                  {/* Subtext info */}
                  <p className="text-xs text-secondary truncate">
                    {uploadedFileName || 'No document file uploaded yet.'}
                  </p>

                  {/* Dashed Upload Box */}
                  <label className="w-full rounded-2xl border border-dashed border-neutral-300 hover:border-neutral-400 p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-white hover:bg-neutral-50/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleDocUpload(doc.key, e.target.files?.[0])}
                    />
                    <div className="flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-primary">
                      <Upload className="w-3.5 h-3.5 text-secondary" />
                      <span>Attach File</span>
                    </div>
                    <span className="text-[11px] text-secondary mt-0.5">
                      PDF, PNG or JPG • Maximum 5 MB (proposed policy)
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Hidden inputs to guarantee registration with react-hook-form */}
      <input type="hidden" {...register('logoFileName')} />
      <input type="hidden" {...register('incorporationCertName')} />
      <input type="hidden" {...register('panCertName')} />
      <input type="hidden" {...register('gstinCertName')} />
      <input type="hidden" {...register('fssaiLicenseName')} />
      <input type="hidden" {...register('seedLicenseName')} />
      <input type="hidden" {...register('fertilizerLicenseName')} />
      <input type="hidden" {...register('moaAoaDocName')} />
      <input type="hidden" {...register('boardResolutionDocName')} />

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
          loadingText="Saving documents..."
          className="rounded-full bg-[#0F4C36] hover:bg-[#0B3B2A] text-white px-7 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
        >
          Save and Continue →
        </Button>
      </div>
    </form>
  );
};
