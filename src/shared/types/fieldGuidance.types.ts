/**
 * Shared contract for field-level guidance rendered by `InfoTooltip`.
 *
 * Content is intentionally declarative: a guidance entry explains what the field is
 * for, what the user should type, and (for uploads only) which document is expected.
 * It carries no validation logic — the owning form schema stays the single source of truth.
 */
export interface FieldGuidance {
  /** Optional heading; falls back to the field label when omitted. */
  title?: string;
  /** What the field captures. */
  description: string;
  /** Why the platform collects it. */
  purpose?: string;
  /** Expected shape of the value (format, character counts, allowed range). */
  expectedFormat?: string;
  /** A concrete, copyable example value. */
  example?: string;
  /** Which document to attach. Only meaningful for upload fields. */
  documentRequirement?: string;
  /** Accepted file formats / size limits. Only meaningful for upload fields. */
  acceptedFormats?: string[];
  /** Whether the owning schema requires the field. */
  isRequired?: boolean;
}
