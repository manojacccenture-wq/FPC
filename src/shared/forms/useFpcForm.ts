import { useForm, type FieldValues, type Resolver, type UseFormProps, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType } from 'zod';
import { useValidationMode } from './validationModeContext';
import { createPassThroughResolver, getEmptyFieldErrors } from '../validation/passThroughResolver';

/**
 * Centralized React Hook Form configuration for the FPC frontend.
 *
 * Every form in the application goes through this hook so that the resolver,
 * validation timing and focus behaviour stay identical across modules. It wraps
 * `useForm` — it does not reimplement or shadow any React Hook Form behaviour.
 *
 * Deliberate defaults:
 * - `mode: 'onBlur'` — matches the behaviour every existing form already used.
 * - `reValidateMode: 'onChange'` — once a field is invalid, it clears as soon as
 *   the user fixes it instead of waiting for the next blur.
 * - `criteriaMode` stays at React Hook Form's default (`firstError`), because all
 *   call sites read `errors.<field>?.message` as a single string.
 *
 * Demo validation switch (see `ValidationModeProvider`): when the wizard's
 * toggle is OFF, a pass-through resolver is used instead of `zodResolver`. The
 * schema itself, its rules, its messages and every field definition are
 * untouched — only whether their verdict blocks the user changes. Outside a
 * provider the context defaults to `true`, so nothing else is affected.
 */
export type UseFpcFormOptions<TFieldValues extends FieldValues> = Omit<
  UseFormProps<TFieldValues>,
  'resolver' | 'mode' | 'reValidateMode'
> & {
  /** Zod schema describing the form; drives all client-side validation. */
  schema: ZodType<TFieldValues, TFieldValues>;
};

export function useFpcForm<TFieldValues extends FieldValues>({
  schema,
  ...options
}: UseFpcFormOptions<TFieldValues>): UseFormReturn<TFieldValues> {
  const { validationEnabled } = useValidationMode();

  const resolver: Resolver<TFieldValues> = validationEnabled
    ? zodResolver(schema)
    : createPassThroughResolver<TFieldValues>();

  return useForm<TFieldValues>({
    ...options,
    resolver,
    // While enforcement is OFF, the stable empty error object tells React Hook
    // Form to drop the errors already on screen (its own supported mechanism).
    ...(validationEnabled ? {} : { errors: getEmptyFieldErrors<TFieldValues>() }),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  });
}
