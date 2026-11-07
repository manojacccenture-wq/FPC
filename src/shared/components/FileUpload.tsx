import React, { forwardRef, useRef, useState, useId } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '../utils/cn';

export type FileUploadState = 'idle' | 'ready' | 'uploading' | 'failed' | 'disabled';

export interface FileUploadProps {
  id?: string;
  className?: string;
  state?: FileUploadState;
  fileName?: string;
  progress?: number; // 0 to 100
  errorMessage?: string;
  accept?: string;
  maxSizeMB?: number;
  highlightMint?: boolean;
  onFileSelect?: (file: File) => void;
  onRetry?: () => void;
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(({
  id,
  className,
  state = 'idle',
  fileName,
  progress = 64,
  errorMessage = "The upload could not be completed. Check your connection and retry.",
  accept = "PDF, PNG or JPG",
  maxSizeMB = 15,
  highlightMint = false,
  onFileSelect,
  onRetry,
}, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const localInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const isDisabled = state === 'disabled';
  const isFailed = state === 'failed';
  const isUploading = state === 'uploading';
  const isReady = state === 'ready';

  const handleClick = () => {
    if (isFailed && onRetry) {
      onRetry();
      return;
    }
    if (!isDisabled && !isUploading) {
      localInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDisabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!isDisabled && !isUploading && e.dataTransfer.files?.[0]) {
      onFileSelect?.(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onFileSelect?.(e.target.files[0]);
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative w-full rounded-card border p-4 sm:p-5 transition-all duration-150 flex flex-col justify-center min-h-[96px]",
        // Default border & bg
        !isFailed && !highlightMint && !isDisabled && "bg-white border-default hover:border-brand",
        // Highlighted / Mint state
        highlightMint && !isFailed && !isDisabled && "bg-brand-soft border-forest-200 hover:border-brand",
        // Drag over / Focus
        isDragOver && "border-brand bg-brand-soft",
        // Failed state
        isFailed && "bg-white border-danger",
        // Disabled state
        isDisabled && "bg-neutral-50 border-default opacity-70 cursor-not-allowed",
        !isDisabled && "cursor-pointer",
        className
      )}
    >
      <input
        id={inputId}
        ref={(el) => {
          localInputRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
        }}
        type="file"
        disabled={isDisabled || isUploading}
        onChange={handleChange}
        className="hidden"
        aria-label="Upload document"
      />

      {/* 1. Idle State: Upload Icon, Drag prompt, spec label */}
      {state === 'idle' && (
        <div className="flex items-center gap-3.5 select-none">
          <div className="w-9 h-9 rounded-full bg-brand-soft flex items-center justify-center shrink-0 text-brand">
            <Upload className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <div className="text-xs sm:text-[13px] font-semibold text-primary truncate">
              Drag file here or <span className="text-brand underline font-semibold">browse</span>
            </div>
            <div className="text-[11px] text-secondary mt-0.5">
              {accept} up to {maxSizeMB}MB
            </div>
          </div>
        </div>
      )}

      {/* 2. Ready to upload state */}
      {isReady && (
        <div className="flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-brand-soft flex items-center justify-center text-brand shrink-0">
              <Upload className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-[13px] font-semibold text-primary truncate">
                {fileName || "Document_Verified.pdf"}
              </div>
              <div className="text-[11px] text-secondary mt-0.5">
                Ready to upload
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Uploading state with progress bar */}
      {isUploading && (
        <div className="space-y-2 select-none text-left">
          <div className="flex items-center justify-between text-xs font-semibold text-primary">
            <span className="truncate">{fileName || "Uploading..."}</span>
            <span className="text-brand tabular-nums">{progress}%</span>
          </div>
          <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-brand h-full transition-all duration-200 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 4. Failed state with error and retry action */}
      {isFailed && (
        <div className="flex items-center justify-between gap-3 text-left">
          <div className="min-w-0">
            <div className="text-xs sm:text-[13px] font-semibold text-danger">
              Upload failed
            </div>
            <div className="text-[11px] text-secondary mt-0.5">
              {errorMessage}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRetry?.();
            }}
            className="text-xs font-semibold text-brand hover:underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* 5. Disabled state */}
      {isDisabled && (
        <div className="flex items-center gap-3.5 select-none opacity-60">
          <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center shrink-0 text-neutral-400">
            <Upload className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold text-neutral-400">
              Upload disabled
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">
              Action currently unavailable
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

FileUpload.displayName = "FileUpload";
