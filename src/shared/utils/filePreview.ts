/**
 * Image detection for upload previews.
 *
 * The backend only stores raster images for logo-class uploads (PNG/JPG/WebP);
 * every other document type is PDF. These helpers decide whether a file (or a
 * stored document) can be rendered as a thumbnail at all, so no caller has to
 * duplicate extension checks.
 */

const PREVIEWABLE_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.avif'];

export function hasImageExtension(fileName?: string | null): boolean {
  if (!fileName) return false;
  const lower = fileName.trim().toLowerCase();
  return PREVIEWABLE_IMAGE_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

/** True when a selected File is a supported image (by MIME type, falling back to extension). */
export function isPreviewableImageFile(file?: File | null): boolean {
  if (!file) return false;
  if (file.type) return file.type.startsWith('image/');
  return hasImageExtension(file.name);
}

/** True when a stored document can be previewed as an image. */
export function isPreviewableImageDocument(
  fileName?: string | null,
  contentType?: string | null
): boolean {
  if (contentType) return contentType.trim().toLowerCase().startsWith('image/');
  return hasImageExtension(fileName);
}
