import React, { useState } from 'react';
import { Controller, type Control, type Path, type UseFormSetValue } from 'react-hook-form';
import { ChevronDown, Eye, FileText, X } from 'lucide-react';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';
import { FileUpload } from '../../../shared/components/FileUpload';
import { ImagePreview } from '../../../shared/components/ImagePreview';
import { hasImageExtension } from '../../../shared/utils/filePreview';
import {
  DIRECTOR_IDENTITY_DOCUMENTS,
  type DirectorDocumentNameField,
} from '../constants/documentTypes';
import type { BoardOfDirectorsFormValues } from '../schemas/boardOfDirectors.schema';

type DirectorValues = BoardOfDirectorsFormValues['directors'][number];
type DirectorForm = BoardOfDirectorsFormValues;

export interface DirectorIdentityDocumentsProps {
  index: number;
  directorKey: string;
  director: DirectorValues;
  control: Control<DirectorForm>;
  setValue: UseFormSetValue<DirectorForm>;
  errors?: Partial<
    Record<DirectorDocumentNameField, { message?: string } | undefined>
  >;
  isReadOnly?: boolean;
  previews: Record<string, string>;
  onFileSelected: (field: DirectorDocumentNameField, file: File) => void;
  onFileCleared: (field: DirectorDocumentNameField) => void;
  storedDocumentUrl: (documentId?: string) => string | null;
}

/**
 * Identity documents of one director: Aadhaar, PAN and Voter ID.
 *
 * The section collapses to keep multi-director boards readable, but the upload
 * count stays visible in the header. Documents are associated by directorKey,
 * never by the row position.
 */
export const DirectorIdentityDocuments: React.FC<DirectorIdentityDocumentsProps> = ({
  index,
  directorKey,
  director,
  control,
  setValue,
  errors,
  isReadOnly = false,
  previews,
  onFileSelected,
  onFileCleared,
  storedDocumentUrl,
}) => {
  const uploadedCount = DIRECTOR_IDENTITY_DOCUMENTS.filter((doc) =>
    Boolean(director[doc.key]?.trim())
  ).length;

  // Native details state would be lost on re-render here, so the open flag is
  // component state seeded once from the restored director. No effect is needed
  // because the user explicitly toggles it afterwards.
  const [isOpen, setIsOpen] = useState(!isReadOnly && uploadedCount < 3);

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/30">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-primary text-xs sm:text-sm">Identity documents</span>
          <span className="text-xs text-secondary hidden sm:inline">
            Aadhaar, PAN and Voter ID
          </span>
        </span>
        <span className="flex items-center gap-2 shrink-0">
          <Badge variant={uploadedCount === 3 ? 'brand' : 'warning'} size="sm">
            {uploadedCount}/3 uploaded
          </Badge>
          <ChevronDown
            className={`w-4 h-4 text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-neutral-200/70">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-3">
            {DIRECTOR_IDENTITY_DOCUMENTS.map((doc) => {
              const fieldName = `directors.${index}.${doc.key}` as Path<DirectorForm>;
              const fileName = director[doc.key]?.trim();
              const documentId = director[doc.idKey];
              const localPreview = previews[`${directorKey}:${doc.key}`];
              const storedUrl = documentId ? storedDocumentUrl(documentId) : null;
              const imagePreview = localPreview || (fileName && hasImageExtension(fileName) ? storedUrl : null);
              const error = errors?.[doc.key]?.message;

              return (
                <Controller
                  key={doc.key}
                  control={control}
                  name={fieldName}
                  render={({ field, fieldState }) => (
                    <div className="rounded-xl border border-neutral-200/80 bg-white p-4 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-primary text-xs">
                          {doc.label} <span className="text-danger">*</span>
                        </span>
                        <Badge variant={fileName ? 'brand' : 'warning'} size="sm">
                          {fileName ? 'Uploaded' : isReadOnly ? 'Missing' : 'Required'}
                        </Badge>
                      </div>

                      {isReadOnly ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50/60 px-3 py-2">
                            <FileText className="w-4 h-4 text-secondary shrink-0" />
                            <span className="text-xs font-medium text-primary truncate">
                              {fileName || `No ${doc.label.toLowerCase()} uploaded`}
                            </span>
                          </div>
                          {imagePreview && (
                            <ImagePreview src={imagePreview} alt={`${doc.label} preview`} size="md" />
                          )}
                          {storedUrl && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="xs"
                              leadingIcon={<Eye className="w-3.5 h-3.5" />}
                              onClick={() => window.open(storedUrl, '_blank', 'noopener,noreferrer')}
                              className="rounded-lg text-xs font-semibold bg-brand-soft text-brand hover:bg-forest-100"
                            >
                              View {doc.label}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <>
                          <FileUpload
                            id={`director-${directorKey}-${doc.key}`}
                            variant="dashed"
                            accept="application/pdf,image/png,image/jpeg"
                            maxSizeMB={5}
                            fileName={fileName}
                            promptText={fileName ? fileName : doc.uploadPrompt}
                            helperText="PDF, JPG or PNG • Maximum 5 MB"
                            previewUrl={imagePreview}
                            previewAlt={`${doc.label} preview`}
                            errorMessage={error}
                            onFileSelect={(file) => {
                              field.onChange(file.name);
                              onFileSelected(doc.key, file);
                            }}
                          />

                          {(fileName || documentId) && (
                            <div className="flex items-center justify-between gap-2">
                              {storedUrl ? (
                                <button
                                  type="button"
                                  onClick={() => window.open(storedUrl, '_blank', 'noopener,noreferrer')}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View saved file
                                </button>
                              ) : (
                                <span className="text-xs text-secondary">Replace by choosing another file</span>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange('');
                                  setValue(
                                    `directors.${index}.${doc.idKey}` as Path<DirectorForm>,
                                    '',
                                    { shouldDirty: true, shouldValidate: true }
                                  );
                                  onFileCleared(doc.key);
                                }}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-danger hover:underline cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" /> Remove
                              </button>
                            </div>
                          )}

                          {fieldState.error?.message && (
                            <p className="text-xs text-danger">{fieldState.error.message}</p>
                          )}
                        </>
                      )}

                      {!isReadOnly && !fieldState.error?.message && error && (
                        <p className="text-xs text-danger">{error}</p>
                      )}
                    </div>
                  )}
                />
              );
            })}
          </div>

          <p className="text-xs text-secondary mt-3">
            Each of the three documents must belong to this director and is stored securely.
          </p>
        </div>
      )}
    </div>
  );
};
