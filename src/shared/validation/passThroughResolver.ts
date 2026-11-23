import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form';

/**
 * A React Hook Form resolver that reports every value as valid.
 *
 * Used only when the demo validation toggle is OFF. It is a *separate*
 * resolver, not a modified Zod resolver: the schema, its rules and its
 * messages are still exactly what the forms pass in.
 */
const NO_ERRORS: Record<string, never> = {};

export const passThroughResolver: Resolver<FieldValues> = (values) => ({
  values,
  errors: NO_ERRORS,
});

/**
 * Same resolver, narrowed to a concrete form shape.
 * The empty error object is shared and stable on purpose: React Hook Form
 * watches `errors` by identity, so a fresh `{}` per render would re-run its
 * error-sync effect on every render.
 */
export function createPassThroughResolver<TFieldValues extends FieldValues>(): Resolver<TFieldValues> {
  return passThroughResolver as unknown as Resolver<TFieldValues>;
}

/** Stable empty error object handed to React Hook Form's `errors` option. */
export function getEmptyFieldErrors<TFieldValues extends FieldValues>(): FieldErrors<TFieldValues> {
  return NO_ERRORS as unknown as FieldErrors<TFieldValues>;
}
