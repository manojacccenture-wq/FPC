import React, { useState } from 'react';
import {
  FileText,
  Clock,
  Eye,
  Download,
  Trash2,
  Upload,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { DatePicker } from '../../../shared/components/DatePicker';
import { useAppSelector } from '../../../app/store/hooks';
import {
  useGetFpcDocumentHistoryQuery,
  useLazyGetFpcDocumentContentQuery,
  useUploadFpcDocumentVersionMutation,
  useDeleteFpcDocumentVersionMutation,
} from '../../fpc/api/fpcApi';

export interface DocumentVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  fpcId: string;
  slotKey: string;
  documentType: string;
  slotTitle: string;
  directorKey?: string | null;
  canAmend?: boolean;
  onVersionUploaded?: () => void;
}

export const DocumentVersionHistoryModal: React.FC<DocumentVersionHistoryModalProps> = ({
  isOpen,
  onClose,
  fpcId,
  slotKey,
  documentType,
  slotTitle,
  directorKey,
  canAmend = true,
  onVersionUploaded,
}) => {
  const activeRole = useAppSelector((state) => state.auth.activeRole);
  const isTsfAdmin = activeRole === 'TSF_ADMIN' || activeRole === 'SUPER_ADMIN';

  // API Query for history
  const {
    data: history,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
    error: historyError,
  } = useGetFpcDocumentHistoryQuery(
    { fpcId, documentSlotKey: slotKey },
    { skip: !isOpen || !fpcId || !slotKey }
  );

  const [triggerGetContent, { isLoading: isFetchingContent }] = useLazyGetFpcDocumentContentQuery();
  const [uploadVersion, { isLoading: isUploading }] = useUploadFpcDocumentVersionMutation();
  const [deleteVersion, { isLoading: isDeleting }] = useDeleteFpcDocumentVersionMutation();

  // Amendment Upload Form State
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [amendmentNotes, setAmendmentNotes] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  // Soft Deletion Confirmation State
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [deletionReason, setDeletionReason] = useState('');
  const [deletionError, setDeletionError] = useState<string | null>(null);

  // Document preview handler (opens blank tab synchronously to prevent popup blocker)
  const handlePreviewDocument = async (documentId: string) => {
    if (!fpcId) return;
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

  // Document download handler
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

  // Upload amendment handler
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccessMessage(null);

    if (!selectedFile) {
      setUploadError('Please select a PDF document file to upload.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10 MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('File', selectedFile);
    formData.append('DocumentType', documentType);
    if (directorKey) {
      formData.append('DirectorKey', directorKey);
    }
    if (amendmentNotes.trim()) {
      formData.append('AmendmentNotes', amendmentNotes.trim());
    }
    if (effectiveDate.trim()) {
      formData.append('EffectiveDate', effectiveDate.trim());
    }
    if (expiryDate.trim()) {
      formData.append('ExpiryDate', expiryDate.trim());
    }

    const idempotencyKey = crypto.randomUUID();

    try {
      const res = await uploadVersion({
        fpcId,
        formData,
        idempotencyKey,
      }).unwrap();

      setSelectedFile(null);
      setAmendmentNotes('');
      setEffectiveDate('');
      setExpiryDate('');
      setShowUploadForm(false);
      setUploadSuccessMessage(
        res.data
          ? `${res.data.documentType} Version uploaded successfully.`
          : 'Document version uploaded successfully.'
      );

      refetchHistory();
      if (onVersionUploaded) {
        onVersionUploaded();
      }
    } catch (err: unknown) {
      console.error('Failed to upload document version', err);
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        'Failed to upload new document version. Please try again.';
      setUploadError(msg);
    }
  };

  // Soft delete confirmation handler (Atomic predecessor promotion)
  const handleConfirmSoftDelete = async (documentId: string) => {
    setDeletionError(null);
    if (!deletionReason.trim()) {
      setDeletionError('Please provide a mandatory reason for administrative deletion.');
      return;
    }

    try {
      await deleteVersion({
        fpcId,
        documentId,
        reason: deletionReason.trim(),
      }).unwrap();

      setDeletingDocId(null);
      setDeletionReason('');
      refetchHistory();
      if (onVersionUploaded) {
        onVersionUploaded();
      }
    } catch (err: unknown) {
      console.error('Failed to soft delete version', err);
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        'Failed to delete document version. Ensure you have administrator permissions.';
      setDeletionError(msg);
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes || bytes <= 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      showCloseButton
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-primary text-lg font-bold">{slotTitle}</h3>
            <p className="text-secondary text-xs mt-0.5 font-normal">
              Slot: <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-700 font-mono">{slotKey}</code>
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-secondary">
            {history?.totalVersions
              ? `${history.totalVersions} version${history.totalVersions === 1 ? '' : 's'} recorded`
              : 'No versioned amendments yet'}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="rounded-full px-5 py-2 text-xs font-semibold"
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6 py-2">
        {/* Success Alert */}
        {uploadSuccessMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">{uploadSuccessMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setUploadSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-800 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoadingHistory && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-secondary">Loading version history...</p>
          </div>
        )}

        {/* History Error Alert */}
        {historyError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to load document history</p>
              <p className="text-red-700 mt-0.5">Please check your permissions or network connection.</p>
            </div>
          </div>
        )}

        {/* History Content */}
        {!isLoadingHistory && history && (
          <>
            {/* Status Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <span className="text-[11px] font-medium text-secondary block">Active Version</span>
                <span className="text-sm font-bold text-primary mt-0.5 block">
                  {history.latestActiveVersionNumber
                    ? `v${history.latestActiveVersionNumber}`
                    : history.hasLegacyDocument
                    ? 'Legacy Baseline'
                    : 'None'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <span className="text-[11px] font-medium text-secondary block">Total Versions</span>
                <span className="text-sm font-bold text-primary mt-0.5 block">
                  {history.totalVersions}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <span className="text-[11px] font-medium text-secondary block">Legacy Baseline</span>
                <span className="text-sm font-bold text-primary mt-0.5 block">
                  {history.hasLegacyDocument ? 'Preserved' : 'None'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <span className="text-[11px] font-medium text-secondary block">Management Mode</span>
                <span className="text-sm font-bold text-brand mt-0.5 block">
                  Future-Only
                </span>
              </div>
            </div>

            {/* Preserved Legacy Document Card (Untouched Baseline) */}
            {history.hasLegacyDocument && history.legacyDocument && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold">
                      LB
                    </span>
                    <h5 className="font-semibold text-xs sm:text-sm text-amber-900">
                      Pre-Versioning Historical Document (Preserved Baseline)
                    </h5>
                  </div>
                  <Badge variant="warning" size="sm">
                    Legacy Original (Untouched)
                  </Badge>
                </div>

                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {history.legacyDocument.notice}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 text-xs">
                  <div className="truncate max-w-[260px] sm:max-w-md font-medium text-amber-950">
                    📄 {history.legacyDocument.fileName}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      type="button"
                      variant="secondary"
                      size="xs"
                      onClick={() => handlePreviewDocument(history.legacyDocument!.id)}
                      disabled={isFetchingContent}
                      leadingIcon={<Eye className="w-3.5 h-3.5" />}
                      className="rounded-lg text-xs bg-white text-amber-900 hover:bg-amber-100 border border-amber-300"
                    >
                      Preview
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="xs"
                      onClick={() =>
                        handleDownloadDocument(
                          history.legacyDocument!.id,
                          history.legacyDocument!.fileName
                        )
                      }
                      disabled={isFetchingContent}
                      leadingIcon={<Download className="w-3.5 h-3.5" />}
                      className="rounded-lg text-xs bg-white text-amber-900 hover:bg-amber-100 border border-amber-300"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Versioned History Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-secondary">
                  Version History ({history.versions.length})
                </h4>
                {canAmend && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="xs"
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    trailingIcon={
                      showUploadForm ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )
                    }
                    className="rounded-full text-xs font-semibold bg-brand-soft text-brand hover:bg-forest-100"
                  >
                    {showUploadForm ? 'Cancel Upload' : '+ Upload Amendment / Version'}
                  </Button>
                )}
              </div>

              {/* Upload Form Accordion */}
              {showUploadForm && (
                <form
                  onSubmit={handleUploadSubmit}
                  className="p-5 rounded-2xl border-2 border-dashed border-forest-200 bg-forest-50/30 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-sm text-primary flex items-center gap-2">
                      <Upload className="w-4 h-4 text-brand" />
                      Upload New Version / Amendment
                    </h5>
                    <span className="text-xs text-brand font-medium">
                      Next: v{(history.latestActiveVersionNumber ?? 0) + 1}
                    </span>
                  </div>

                  {uploadError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* File Picker */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-primary block">
                      Select Document File (PDF only, max 10 MB) *
                    </label>
                    <label className="w-full rounded-xl border border-neutral-300 hover:border-brand p-3 flex items-center justify-between cursor-pointer bg-white transition-colors">
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setSelectedFile(file);
                        }}
                      />
                      <span className="text-xs font-medium text-primary truncate">
                        {selectedFile ? selectedFile.name : 'Choose PDF file...'}
                      </span>
                      <span className="text-xs text-brand font-semibold px-2.5 py-1 rounded bg-brand-soft">
                        Browse
                      </span>
                    </label>
                    {selectedFile && (
                      <span className="text-[11px] text-secondary">
                        Size: {formatFileSize(selectedFile.size)}
                      </span>
                    )}
                  </div>

                  {/* Amendment Notes Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-primary block">
                      Amendment Reason / ROC Resolution Notes *
                    </label>
                    <textarea
                      rows={2}
                      value={amendmentNotes}
                      onChange={(e) => setAmendmentNotes(e.target.value)}
                      placeholder="e.g. Revised Articles of Association approved pursuant to EGM Resolution dated 15-Nov-2026..."
                      className="w-full text-xs rounded-xl border border-neutral-300 p-2.5 focus:border-brand focus:ring-1 focus:ring-brand outline-none bg-white"
                      required
                    />
                  </div>

                  {/* Date Pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <DatePicker
                      id="amendment-effective-date"
                      label="Effective Date"
                      placeholder="DD-MM-YYYY"
                      size="sm"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      onDateChange={(_d, str) => setEffectiveDate(str ?? '')}
                      helperText="Official effective date of the amended document"
                    />
                    <DatePicker
                      id="amendment-expiry-date"
                      label="Expiry Date (if applicable)"
                      placeholder="DD-MM-YYYY"
                      size="sm"
                      disablePastDates
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      onDateChange={(_d, str) => setExpiryDate(str ?? '')}
                      helperText="Statutory license validity expiry date"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="xs"
                      onClick={() => setShowUploadForm(false)}
                      className="rounded-full px-4 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="xs"
                      isLoading={isUploading}
                      loadingText="Uploading version..."
                      className="rounded-full bg-[#0F4C36] hover:bg-[#0B3B2A] text-white px-5 py-2 text-xs font-semibold"
                    >
                      Submit Amendment
                    </Button>
                  </div>
                </form>
              )}

              {/* Version History List */}
              {history.versions.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-neutral-200 text-center text-secondary text-xs">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-neutral-400 stroke-[1.5]" />
                  No versioned amendments registered yet.
                  {history.hasLegacyDocument
                    ? ' The preserved baseline above is currently in effect.'
                    : ' Upload the initial version using the button above.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {history.versions.map((ver) => {
                    const isLatest = ver.isLatest;
                    const isSoftDeleted = ver.uploadStatus === 'SoftDeleted';
                    const isSuperseded = ver.uploadStatus === 'Superseded';

                    return (
                      <div
                        key={ver.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isLatest
                            ? 'border-forest-300 bg-forest-50/40 shadow-2xs'
                            : isSoftDeleted
                            ? 'border-red-200 bg-red-50/30 opacity-70'
                            : 'border-neutral-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-primary">
                                Version {ver.versionNumber}
                              </span>
                              {isLatest && (
                                <Badge variant="brand" size="sm">
                                  Active Latest
                                </Badge>
                              )}
                              {isSuperseded && (
                                <Badge variant="neutral" size="sm">
                                  Superseded
                                </Badge>
                              )}
                              {isSoftDeleted && (
                                <Badge variant="danger" size="sm">
                                  Soft-Deleted
                                </Badge>
                              )}
                              <span className="text-[11px] text-secondary font-mono">
                                {formatFileSize(ver.fileSizeBytes)}
                              </span>
                            </div>

                            <div className="font-medium text-xs text-primary truncate max-w-sm sm:max-w-md">
                              📄 {ver.fileName}
                            </div>

                            {ver.amendmentNotes && (
                              <p className="text-xs text-neutral-600 bg-neutral-100/70 p-2 rounded-lg mt-1 italic">
                                &ldquo;{ver.amendmentNotes}&rdquo;
                              </p>
                            )}

                            <div className="flex items-center gap-3 text-[11px] text-secondary flex-wrap pt-1">
                              <span>Uploaded: {formatDate(ver.uploadedAtUtc)}</span>
                              {ver.uploaderName && <span>By: {ver.uploaderName}</span>}
                              {ver.effectiveDate && (
                                <span>Effective: {formatDate(ver.effectiveDate)}</span>
                              )}
                              {ver.expiryDate && <span>Expires: {formatDate(ver.expiryDate)}</span>}
                              {ver.supersededAtUtc && (
                                <span>Superseded: {formatDate(ver.supersededAtUtc)}</span>
                              )}
                            </div>
                          </div>

                          {/* Version Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                              type="button"
                              variant="secondary"
                              size="xs"
                              onClick={() => handlePreviewDocument(ver.id)}
                              disabled={isFetchingContent}
                              leadingIcon={<Eye className="w-3.5 h-3.5" />}
                              className="rounded-lg text-xs bg-brand-soft text-brand hover:bg-forest-100"
                            >
                              Preview
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="xs"
                              onClick={() => handleDownloadDocument(ver.id, ver.fileName)}
                              disabled={isFetchingContent}
                              leadingIcon={<Download className="w-3.5 h-3.5" />}
                              className="rounded-lg text-xs bg-neutral-100 hover:bg-neutral-200 text-primary"
                            >
                              Download
                            </Button>
                            {isTsfAdmin && !isSoftDeleted && (
                              <Button
                                type="button"
                                variant="secondary"
                                size="xs"
                                onClick={() => {
                                  setDeletingDocId(ver.id);
                                  setDeletionReason('');
                                  setDeletionError(null);
                                }}
                                leadingIcon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
                                className="rounded-lg text-xs hover:bg-red-50 text-red-600 border border-red-200"
                                title="Soft Delete Version"
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Soft Deletion Prompt for TSF Admin */}
                        {deletingDocId === ver.id && (
                          <div className="mt-3 p-3.5 rounded-xl bg-red-50/80 border border-red-300 space-y-2 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-red-900">
                              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                              Confirm Administrative Soft-Deletion of Version {ver.versionNumber}
                            </div>
                            <p className="text-red-800 text-[11px]">
                              {isLatest
                                ? 'Notice: Since this is the active latest version, soft-deleting it will automatically promote the highest preceding valid version to active.'
                                : 'This action marks the record as soft-deleted while retaining audit compliance.'}
                            </p>
                            {deletionError && (
                              <div className="text-red-700 font-semibold">{deletionError}</div>
                            )}
                            <input
                              type="text"
                              value={deletionReason}
                              onChange={(e) => setDeletionReason(e.target.value)}
                              placeholder="Reason for deletion (mandatory)..."
                              className="w-full text-xs rounded-lg border border-red-300 p-2 bg-white outline-none focus:ring-1 focus:ring-red-500"
                              required
                            />
                            <div className="flex justify-end gap-2 pt-1">
                              <Button
                                type="button"
                                variant="secondary"
                                size="xs"
                                onClick={() => setDeletingDocId(null)}
                                className="rounded-lg text-xs"
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="xs"
                                isLoading={isDeleting}
                                loadingText="Deleting..."
                                onClick={() => handleConfirmSoftDelete(ver.id)}
                                className="rounded-lg text-xs font-semibold"
                              >
                                Confirm Soft-Delete
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
