import { useCallback, useEffect, useRef, useState } from 'react';
import { isPreviewableImageFile } from '../utils/filePreview';

export interface FilePreviewsApi {
  /** Object URLs keyed by the upload field they belong to. */
  previews: Record<string, string>;
  /** Creates (and revokes any previous) object URL for a newly selected image. */
  setFile: (key: string, file: File | null) => void;
  /** Revokes and forgets one field's preview. */
  clearFile: (key: string) => void;
}

/**
 * Owns the temporary object URLs used by image upload fields.
 *
 * One hook instance can serve several fields (keyed by upload field), so steps
 * with dynamic rows - e.g. director photographs - do not need a hook per row.
 * Object URLs live outside React state, so updates stay event-driven; the only
 * effect revokes every remaining URL when the form unmounts.
 */
export function useFilePreviews(): FilePreviewsApi {
  const objectUrlsRef = useRef<Record<string, string>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const revoke = useCallback((key: string) => {
    const existing = objectUrlsRef.current[key];
    if (existing) {
      URL.revokeObjectURL(existing);
      delete objectUrlsRef.current[key];
    }
  }, []);

  const setFile = useCallback(
    (key: string, file: File | null) => {
      revoke(key);

      if (!file || !isPreviewableImageFile(file)) {
        setPreviews((previous) => {
          if (!(key in previous)) return previous;
          const next = { ...previous };
          delete next[key];
          return next;
        });
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      objectUrlsRef.current[key] = objectUrl;
      setPreviews((previous) => ({ ...previous, [key]: objectUrl }));
    },
    [revoke]
  );

  const clearFile = useCallback(
    (key: string) => {
      revoke(key);
      setPreviews((previous) => {
        if (!(key in previous)) return previous;
        const next = { ...previous };
        delete next[key];
        return next;
      });
    },
    [revoke]
  );

  useEffect(
    () => () => {
      Object.values(objectUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current = {};
    },
    []
  );

  return { previews, setFile, clearFile };
}
