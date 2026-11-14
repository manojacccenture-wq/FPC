import React, { useEffect, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Upload, Eye, Download } from 'lucide-react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { DatePicker } from '../../../shared/components/DatePicker';
import { useFpcForm, applyServerErrors, FormServerError } from '../../../shared/forms';
import { useLazyGetFpcDocumentContentQuery } from '../../fpc/api/fpcApi';
import {
  logoDocumentsSchema,
  type LogoDocumentsFormValues,
} from '../schemas/logoDocuments.schema';
import type { FpcLogoDocumentsFormData } from '../types';

/** Selected files held in component state only; never persisted to storage. */
export type LogoDocumentsFileMap = Partial<Record<keyof LogoDocumentsFormValues, File>>;

export interface StoredFpcDocument {
  id: string;
  documentType: string;
  fileName: string;
  expiryDate?: string | null;
  storagePath?: string | null;
  uploadStatus?: string | null;
}

export interface FpcLogoDocumentsFormProps {
  initialData?: Partial<FpcLogoDocumentsFormData> | null;
  onSubmit: (values: LogoDocumentsFormValues, files: LogoDocumentsFileMap) => Promise<void> | void;
  onPreviousStep: () => void;
  isReadOnly?: boolean;
  onNextStep?: () => void;
  fpcId?: string;
  storedDocuments?: StoredFpcDocument[] | null;
}

interface StatutoryDocConfig {
  key: keyof LogoDocumentsFormValues;
  title: string;
  documentType: string;
  expiryKey?: keyof LogoDocumentsFormValues;
  expiryLabel?: string;
}

const STATUTORY_DOCUMENTS: StatutoryDocConfig[] = [
  { key: 'incorporationCertName', title: 'Certificate of Incorporation', documentType: 'CertificateOfIncorporation' },
  { key: 'panCertName', title: 'Company PAN Certificate', documentType: 'PanCard' },
  { key: 'gstinCertName', title: 'GSTIN Certificate', documentType: 'GstinCertificate' },
  {
    key: 'fssaiLicenseName',
    title: 'FSSAI Food Safety License',
    documentType: 'FssaiLicense',
    expiryKey: 'fssaiExpiryDate',
    expiryLabel: 'FSSAI License Expiry Date',
  },
  {
    key: 'seedLicenseName',
    title: 'Seed Production/Distribution License',
    documentType: 'SeedLicense',
    expiryKey: 'seedLicenseExpiryDate',
    expiryLabel: 'Seed License Expiry Date',
  },
  {
    key: 'fertilizerLicenseName',
    title: 'Fertilizer Retail/Wholesale License',
    documentType: 'FertilizerLicense',
    expiryKey: 'fertilizerLicenseExpiryDate',
    expiryLabel: 'Fertilizer License Expiry Date',
  },
  { key: 'moaAoaDocName', title: 'ROC MOA & AOA Documents', documentType: 'MoaAoa' },
  { key: 'boardResolutionDocName', title: 'Board Resolution / Supporting Documents', documentType: 'BoardResolution' },
];

export const FpcLogoDocumentsForm: React.FC<FpcLogoDocumentsFormProps> = ({
  initialData,
  onSubmit,
  onPreviousStep,
  isReadOnly = false,
  onNextStep,
  fpcId,
  storedDocuments,
}) => {
  const [triggerGetContent, { isLoading: isFetchingContent }] = useLazyGetFpcDocumentContentQuery();

  const handlePreviewDocument = async (documentId: string) => {
    if (!fpcId) return;

    // Open a blank tab synchronously within user gesture context to avoid popup blocker
    let previewTab: Window | null = null;
    try {
      previewTab = window.open('about:blank', '_blank');
    } catch (popupErr) {
      console.warn('Browser popup blocked', popupErr);
    }

    try {
      const blob = await triggerGetContent({ fpcId, documentId, download: false }).unwrap();
      const objectUrl = URL.createObjectURL(blob);
      if (previewTab && !previewTab.closed) {
        previewTab.location.href = objectUrl;
      } else {
        window.open(objectUrl, '_blank');
      }
      setTimeout(() => URL.revokeObjectURL(objectUrl), 120000);
    } catch (err) {
      console.error('Failed to preview document', err);
      if (previewTab && !previewTab.closed) {
        previewTab.close();
      }
      alert('Failed to retrieve document for preview.');
    }
  };

  const handleDownloadDocument = async (documentId: string, fileName: string) => {
    if (!fpcId) return;
    try {
      const blob = await triggerGetContent({ fpcId, documentId, download: true }).unwrap();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch (err) {
      console.error('Failed to download document', err);
      alert('Failed to download document from server.');
    }
  };

  // Preview URL is UI-only state; the file name itself lives in React Hook Form.
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);
  const logoPreviewRef = useRef<string | null>(null);

  // The actual File objects stay in memory and are uploaded on submit. They are never
  // written to Redux persistence, localStorage or IndexedDB.
  const [selectedFiles, setSelectedFiles] = useState<LogoDocumentsFileMap>({});

  const rememberFile = (field: keyof LogoDocumentsFormValues, file: File | null) => {
    setSelectedFiles((previous) => {
      const next = { ...previous };
      if (file) {
        next[field] = file;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  useEffect(
    () => () => {
      if (logoPreviewRef.current) {
        URL.revokeObjectURL(logoPreviewRef.current);
      }
    },
    []
  );

  const applyLogoPreview = (url: string | null) => {
    if (logoPreviewRef.current) {
      URL.revokeObjectURL(logoPreviewRef.current);
    }
    logoPreviewRef.current = url;
    setLogoLoadFailed(false);
    setLogoPreview(url);
  };

  // Synchronous derivation of server logo URL without useEffect
  const matchingLogoDoc = storedDocuments?.find(
    (d) => d.documentType.toLowerCase() === 'companylogo' || d.documentType.toLowerCase() === 'logo'
  );
  const logoDocId = matchingLogoDoc?.id || initialData?.documentIds?.logoFileName;
  const serverLogoUrl = fpcId && logoDocId ? `/api/v1/fpcs/${fpcId}/documents/${logoDocId}/content` : null;
  const displayLogoUrl = logoPreview || (!logoLoadFailed ? serverLogoUrl : null);

  const formValues: LogoDocumentsFormValues = {
    logoFileName: initialData?.logoFileName || '',
    incorporationCertName: initialData?.incorporationCertName || '',
    panCertName: initialData?.panCertName || '',
    gstinCertName: initialData?.gstinCertName || '',
    fssaiLicenseName: initialData?.fssaiLicenseName || '',
    fssaiExpiryDate: initialData?.fssaiExpiryDate || '',
    seedLicenseName: initialData?.seedLicenseName || '',
    seedLicenseExpiryDate: initialData?.seedLicenseExpiryDate || '',
    fertilizerLicenseName: initialData?.fertilizerLicenseName || '',
    fertilizerLicenseExpiryDate: initialData?.fertilizerLicenseExpiryDate || '',
    moaAoaDocName: initialData?.moaAoaDocName || '',
    boardResolutionDocName: initialData?.boardResolutionDocName || '',
  };

  // ZERO useEffect for form values: initial values populated directly during component mount
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useFpcForm<LogoDocumentsFormValues>({
    schema: logoDocumentsSchema,
    defaultValues: formValues,
    values: formValues,
    resetOptions: { keepDirtyValues: true },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values, selectedFiles);
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
        {/* Header with Step 05 Badge */}
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-bold text-sm shrink-0">
            05
          </div>
          <div>
            <h3 className="text-primary">
              Logo & documents
            </h3>
            <p className="text-secondary mt-0.5">
              Use the details on your official company documents.
            </p>
          </div>
        </div>

        {/* Company Logo Section */}
        <div className="space-y-2">
          <label className="text-primary block">
            Company logo
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Logo Preview Square */}
            <div className="w-24 h-24 rounded-2xl bg-neutral-100 flex items-center justify-center text-xs text-secondary font-medium select-none shrink-0 border border-neutral-200/60 overflow-hidden">
              {displayLogoUrl ? (
                <img
                  src={displayLogoUrl}
                  alt="Company Logo"
                  className="w-full h-full object-contain p-1"
                  onError={() => setLogoLoadFailed(true)}
                />
              ) : (
                <span>No logo</span>
              )}
            </div>

            {/* Logo Upload Dropzone or Readonly Display */}
            {isReadOnly ? (
              <div className="flex-1 w-full border border-neutral-200 rounded-2xl p-5 bg-neutral-50/50">
                <div className="font-semibold text-primary text-sm truncate">
                  {formValues.logoFileName || 'No logo file registered'}
                </div>
                <small className="text-secondary mt-1 block">
                  PNG, JPG, WebP
                </small>
              </div>
            ) : (
              <Controller
                control={control}
                name="logoFileName"
                render={({ field }) => (
                  <label className="flex-1 w-full border border-neutral-200 hover:border-brand rounded-2xl p-5 flex flex-col justify-center cursor-pointer bg-white hover:bg-neutral-50/50 transition-colors">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        field.onChange(file.name);
                        rememberFile('logoFileName', file);
                        applyLogoPreview(URL.createObjectURL(file));
                      }}
                    />
                    <div className="flex items-center gap-2.5 font-semibold text-primary">
                      <span className="w-7 h-7 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0">
                        <Upload className="w-4 h-4 stroke-[2]" />
                      </span>
                      <span>
                        {field.value
                          ? field.value
                          : 'Upload Logo (PNG, JPG, WebP)'}
                      </span>
                    </div>
                    <small className="text-secondary mt-1 ml-9.5 block">
                      PNG, JPG, WebP • Max file size 2 MB
                    </small>
                  </label>
                )}
              />
            )}
          </div>
        </div>

        {/* Statutory Document Attachments Section */}
        <div className="pt-2">
          <h4 className="font-semibold text-primary mb-4">
            Statutory Document Attachments
          </h4>

          {/* 2-Column Grid for the 8 Documents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {STATUTORY_DOCUMENTS.map((doc) => (
              <Controller
                key={doc.key}
                control={control}
                name={doc.key}
                render={({ field }) => {
                  const matchingDoc = storedDocuments?.find(
                    (d) => d.documentType.toLowerCase() === doc.documentType.toLowerCase()
                  );
                  const effectiveFileName = field.value || matchingDoc?.fileName;
                  const isUploaded = Boolean(effectiveFileName);
                  const docId = matchingDoc?.id || initialData?.documentIds?.[doc.key];

                  return (
                    <div className="rounded-2xl border border-neutral-200/80 p-5 bg-white space-y-3.5 shadow-2xs">
                      {/* Card Header: Title & Pending / Uploaded Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="font-semibold text-primary">
                          {doc.title}
                        </h5>
                        <Badge
                          variant={isUploaded ? 'brand' : 'warning'}
                          size="sm"
                        >
                          {isUploaded ? 'Uploaded' : 'Pending'}
                        </Badge>
                      </div>

                      {/* Subtext info */}
                      <p className="text-xs text-secondary truncate">
                        {effectiveFileName || 'No document file uploaded yet.'}
                      </p>

                      {/* Readonly preview/download OR Upload Box */}
                      {isReadOnly ? (
                        isUploaded ? (
                          docId && fpcId ? (
                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                type="button"
                                variant="secondary"
                                size="xs"
                                onClick={() => handlePreviewDocument(docId)}
                                disabled={isFetchingContent}
                                leadingIcon={<Eye className="w-3.5 h-3.5" />}
                                className="rounded-lg text-xs font-semibold bg-brand-soft text-brand hover:bg-forest-100"
                              >
                                Preview
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                size="xs"
                                onClick={() => handleDownloadDocument(docId, effectiveFileName || `${doc.documentType}.pdf`)}
                                disabled={isFetchingContent}
                                leadingIcon={<Download className="w-3.5 h-3.5" />}
                                className="rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-primary"
                              >
                                Download
                              </Button>
                            </div>
                          ) : (
                            <div className="pt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
                                Attachment unlinked (re-upload required)
                              </span>
                            </div>
                          )
                        ) : null
                      ) : (
                        <label className="w-full rounded-2xl border border-dashed border-neutral-300 hover:border-neutral-400 p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-white hover:bg-neutral-50/50 transition-colors">
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              field.onChange(file.name);
                              rememberFile(doc.key, file);
                            }}
                          />
                          <div className="flex items-center gap-1.5 font-semibold text-primary">
                            <Upload className="w-3.5 h-3.5 text-secondary" />
                            <span>Attach File</span>
                          </div>
                          <small className="text-secondary mt-0.5 block">
                            PDF • Maximum 5 MB
                          </small>
                        </label>
                      )}

                      {/* Expiry Date Field if statutory license has an expiry date */}
                      {doc.expiryKey && (
                        <div className="pt-1 border-t border-neutral-100">
                          <Controller
                            control={control}
                            name={doc.expiryKey}
                            render={({ field: expiryField, fieldState }) => (
                              <DatePicker
                                id={`expiry-${doc.key}`}
                                label={`${doc.expiryLabel ?? 'Expiry Date'}${isUploaded ? ' *' : ''}`}
                                placeholder="DD-MM-YYYY"
                                size="md"
                                disabled={isReadOnly}
                                disablePastDates
                                clearable
                                value={expiryField.value ?? matchingDoc?.expiryDate ?? ''}
                                error={fieldState.error?.message}
                                helperText={isReadOnly ? undefined : 'Must be today or a future date'}
                                onChange={(e) => expiryField.onChange(e.target.value)}
                                onDateChange={(_d, str) => expiryField.onChange(str ?? '')}
                              />
                            )}
                          />
                        </div>
                      )}
                    </div>
                  );
                }}
              />
            ))}
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
        {isReadOnly ? (
          onNextStep && (
            <Button
              type="button"
              variant="primary"
              onClick={onNextStep}
              className="rounded-full bg-[#0F4C36] hover:bg-[#0B3B2A] text-white px-7 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            >
              Next: Address & Location →
            </Button>
          )
        ) : (
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            loadingText="Saving documents..."
            className="rounded-full bg-[#0F4C36] hover:bg-[#0B3B2A] text-white px-7 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
          >
            Save and Continue →
          </Button>
        )}
      </div>
    </form>
  );
};
