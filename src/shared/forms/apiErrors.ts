import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

/**
 * RFC 7807 payload returned by the FPC API for every handled failure
 * (`Fpc.Api/Middleware/GlobalExceptionMiddleware.cs`).
 *
 * Note: the backend writes dictionary keys verbatim, so `errors` is keyed with
 * PascalCase property names (e.g. `CompanyName`) even though the envelope itself
 * is camelCase. Mapping into React Hook Form therefore has to be case-insensitive.
 */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  correlationId?: string;
  errorCode?: string | null;
  errors?: Record<string, string[]> | null;
  timestampUtc?: string;
}

type ServerStatus = number | 'FETCH_ERROR' | 'PARSING_ERROR' | 'TIMEOUT_ERROR' | 'CUSTOM_ERROR';

interface ExtractedError {
  problem: ProblemDetails | null;
  status: ServerStatus | null;
  /** Message carried by a plain thrown `Error`, when the rejection is not an API response. */
  thrownMessage: string | null;
}

const NETWORK_MESSAGE = 'We could not reach the server. Check your connection and try again.';
const SESSION_MESSAGE = 'Your session has expired. Please sign in again.';
const RATE_LIMIT_MESSAGE = 'Too many attempts. Please wait a moment and try again.';
const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function toStringArray(value: unknown): string[] {
  if (typeof value === 'string') return value ? [value] : [];
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
  return [];
}

/** Normalizes an RTK Query rejection (or thrown value) into a problem-details shape. */
export function extractProblemDetails(error: unknown): ExtractedError {
  if (isRecord(error) && 'status' in error) {
    const status = error.status as ServerStatus;
    const data = error.data;

    if (isRecord(data)) {
      const problem: ProblemDetails = {
        type: typeof data.type === 'string' ? data.type : undefined,
        title: typeof data.title === 'string' ? data.title : undefined,
        status:
          typeof data.status === 'number'
            ? data.status
            : typeof status === 'number'
              ? status
              : undefined,
        detail: typeof data.detail === 'string' ? data.detail : undefined,
        instance: typeof data.instance === 'string' ? data.instance : undefined,
        correlationId: typeof data.correlationId === 'string' ? data.correlationId : undefined,
        errorCode: typeof data.errorCode === 'string' ? data.errorCode : null,
        timestampUtc: typeof data.timestampUtc === 'string' ? data.timestampUtc : undefined,
        errors: null,
      };

      if (isRecord(data.errors)) {
        const fieldErrors: Record<string, string[]> = {};
        for (const [name, value] of Object.entries(data.errors)) {
          const messages = toStringArray(value);
          if (messages.length > 0) fieldErrors[name] = messages;
        }
        problem.errors = fieldErrors;
      }

      return { problem, status, thrownMessage: null };
    }

    // Network/timeout failures carry a string in `data.error`.
    return {
      problem: null,
      status,
      thrownMessage: typeof data === 'string' && data.length > 0 ? data : null,
    };
  }

  if (error instanceof Error) {
    return { problem: null, status: null, thrownMessage: error.message || null };
  }

  if (typeof error === 'string') {
    return { problem: null, status: null, thrownMessage: error || null };
  }

  return { problem: null, status: null, thrownMessage: null };
}

/**
 * Converts a backend field key into the camelCase path React Hook Form uses.
 * `CompanyName` → `companyName`, `Directors[0].FullName` → `directors.0.fullName`.
 */
export function normalizeFieldName(rawName: string): string {
  return rawName
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter((segment) => segment.length > 0)
    .map((segment) => (/^\d+$/.test(segment) ? segment : segment.charAt(0).toLowerCase() + segment.slice(1)))
    .join('.');
}

/** Human-readable, safe message for any rejection. Never includes request payloads. */
export function resolveErrorMessage(error: unknown, fallback: string = GENERIC_MESSAGE): string {
  const { problem, status, thrownMessage } = extractProblemDetails(error);

  if (status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR') return NETWORK_MESSAGE;
  if (status === 401) return SESSION_MESSAGE;
  if (status === 429) return RATE_LIMIT_MESSAGE;

  const detail = problem?.detail?.trim();
  const title = problem?.title?.trim();

  if (typeof status === 'number' && status >= 500) {
    const base = detail && detail.length > 0 ? detail : GENERIC_MESSAGE;
    return problem?.correlationId ? `${base} (Reference: ${problem.correlationId})` : base;
  }

  return detail || title || thrownMessage || fallback;
}

export interface ApplyServerErrorsOptions<TFieldValues extends FieldValues> {
  /**
   * Fields the form actually renders. Backend keys that do not resolve to one of
   * these are promoted to a form-level message instead of being silently dropped.
   */
  knownFields?: readonly Path<TFieldValues>[];
  fallbackMessage?: string;
}

export interface AppliedServerErrors {
  fieldErrors: Array<{ field: string; message: string }>;
  message: string | null;
}

/**
 * Maps backend validation failures into React Hook Form.
 *
 * Field errors are registered with `setError(..., { type: 'server' })` so they
 * render through the exact same `FormField` path as Zod errors. Anything that
 * cannot be attributed to a rendered field is returned and set on `root.server`,
 * which `FormServerError` displays. No `useState` is required for API messages.
 */
export function applyServerErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  options: ApplyServerErrorsOptions<TFieldValues> = {}
): AppliedServerErrors {
  const { knownFields = [], fallbackMessage } = options;
  const { problem } = extractProblemDetails(error);

  const fieldErrors: Array<{ field: string; message: string }> = [];
  const unmatched: string[] = [];

  if (problem?.errors) {
    const canonicalFields = new Map<string, Path<TFieldValues>>();
    for (const field of knownFields) {
      canonicalFields.set(String(field).toLowerCase(), field);
    }

    for (const [rawName, messages] of Object.entries(problem.errors)) {
      const message = messages[0];
      if (!message) continue;

      const normalized = normalizeFieldName(rawName);

      if (knownFields.length > 0) {
        const canonical = canonicalFields.get(normalized.toLowerCase());
        if (!canonical) {
          unmatched.push(message);
          continue;
        }
        fieldErrors.push({ field: String(canonical), message });
        continue;
      }

      fieldErrors.push({ field: normalized, message });
    }

    fieldErrors.forEach((entry, index) => {
      setError(entry.field as Path<TFieldValues>, { type: 'server', message: entry.message }, {
        shouldFocus: index === 0,
      });
    });
  }

  let message: string | null = null;
  if (unmatched.length > 0) {
    message = unmatched[0];
  } else if (fieldErrors.length === 0) {
    message = resolveErrorMessage(error, fallbackMessage);
  }

  if (message) {
    setError('root.server', { type: 'server', message }, { shouldFocus: false });
  }

  return { fieldErrors, message };
}
