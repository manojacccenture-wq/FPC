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
        "relative w-full rounded-[12px] border p-4 sm:p-5 transition-all duration-150 flex flex-col justify-center min-h-[96px]",
        // Default border & bg
        !isFailed && !highlightMint && !isDisabled && "bg-white border-[#E1E8E6] hover:border-[#166B4B]",
        // Highlighted / Mint state
        highlightMint && !isFailed && !isDisabled && "bg-[#EDF8F3] border-[#BCE5D3] hover:border-[#166B4B]",
        // Drag over / Focus
        isDragOver && "border-[#166B4B] bg-[#EDF8F3]",
        // Failed state
        isFailed && "bg-white border-[#A61A24]",
        // Disabled state
        isDisabled && "bg-[#F5F8F7] border-[#E1E8E6] opacity-70 cursor-not-allowed",
        !isDisabled && "cursor-pointer",
        className
      )}
    >
      <input
        type="file"
        id={inputId}
        ref={(el) => {
          localInputRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        onChange={handleChange}
        disabled={isDisabled}
        className="sr-only"
      />

      <div className="flex items-start gap-3">
        {/* Upload Icon */}
        <div className="shrink-0 mt-0.5">
          <Upload
            className={cn(
              "w-4 h-4 stroke-[2.2]",
              isFailed ? "text-[#A61A24]" : isDisabled ? "text-[#9AA7A3]" : "text-[#166B4B]"
            )}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Title Row */}
          <div className="text-sm font-semibold mb-1">
            {isFailed ? (
              <span className="text-[#A61A24]">Upload failed · Try again</span>
            ) : isReady && fileName ? (
              <span className="text-[#0E1B16]">{fileName} · Ready to upload</span>
            ) : isUploading ? (
              <span className="text-[#0E1B16]">Uploading... {progress}%</span>
            ) : isDisabled ? (
              <span className="text-[#9AA7A3]">Uploads are unavailable</span>
            ) : (
              <span className="text-[#0E1B16]">Drop files here or browse</span>
            )}
          </div>

          {/* Progress Bar (when uploading) */}
          {isUploading && (
            <div className="w-full h-1.5 bg-[#E1E8E6] rounded-full overflow-hidden my-2">
              <div
                className="h-full bg-[#166B4B] transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Subtitle / Policy / Error Description */}
          <div className="text-xs text-[#5B6B65] leading-normal">
            {isFailed ? (
              <span className="text-[#A61A24]">{errorMessage}</span>
            ) : (
              <span>{accept} · Maximum {maxSizeMB} MB to assured privacy</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

FileUpload.displayName = "FileUpload";

