import type { FieldErrors, FieldValues } from 'react-hook-form';
import { Alert } from '../components/Alert';

export interface FormServerErrorProps<TFieldValues extends FieldValues = FieldValues> {
  /** The form's `formState.errors`; only the `root.server` entry is rendered. */
  errors: FieldErrors<TFieldValues>;
  title?: string;
  className?: string;
}

/**
 * Single form-level error surface.
 *
 * Zod object-level failures and API failures that cannot be attributed to a
 * specific field are written to `root.server` by `applyServerErrors`, then shown
 * here using the existing shared `Alert` — so styling matches the rest of the app.
 * Renders nothing when the form is clean, leaving the layout untouched.
 */
export function FormServerError<TFieldValues extends FieldValues>({
  errors,
  title,
  className,
}: FormServerErrorProps<TFieldValues>) {
  const message = errors.root?.server?.message;
  if (!message) return null;

  return (
    <Alert tone="danger" variant="card" title={title} className={className}>
      {message}
    </Alert>
  );
}
