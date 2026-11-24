import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '../utils/cn';

export type ImagePreviewSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ImagePreviewProps {
  /** Image URL: a temporary object URL or an authenticated document-content URL. */
  src?: string | null;
  alt?: string;
  size?: ImagePreviewSize;
  className?: string;
  /** Shown when there is no image, or when the image fails to load. */
  fallbackText?: string;
}

const sizeClasses: Record<ImagePreviewSize, string> = {
  xs: 'w-8 h-8 rounded-full',
  sm: 'w-10 h-10 rounded-lg',
  md: 'w-14 h-14 rounded-xl',
  lg: 'w-24 h-24 rounded-2xl',
};

/**
 * Single thumbnail renderer for every image upload field.
 *
 * Callers pass either a local object URL (freshly selected file) or the
 * existing document-content URL (previously saved file), so previews look and
 * behave identically in both cases. A broken or unreachable image falls back to
 * the placeholder instead of showing a browser broken-image glyph.
 */
export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt = 'Uploaded image preview',
  size = 'md',
  className,
  fallbackText,
}) => {
  // Tracking the failing URL (instead of a boolean) resets the fallback
  // automatically when the caller swaps the image, without an effect.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasImage = Boolean(src) && failedSrc !== src;

  return (
    <div
      className={cn(
        'bg-neutral-100 flex items-center justify-center text-secondary font-medium select-none shrink-0 border border-neutral-200/60 overflow-hidden',
        sizeClasses[size],
        className
      )}
    >
      {hasImage ? (
        <img
          src={src ?? undefined}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain p-1"
          onError={() => setFailedSrc(src ?? null)}
        />
      ) : fallbackText ? (
        <span className="text-xs text-center px-1 leading-tight">{fallbackText}</span>
      ) : (
        <ImageOff className="w-4 h-4 text-neutral-400" aria-hidden="true" />
      )}
    </div>
  );
};

ImagePreview.displayName = 'ImagePreview';
