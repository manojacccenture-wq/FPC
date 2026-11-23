/**
 * Build-time environment configuration.
 *
 * Vite inlines VITE_* variables at build time, so one build belongs to exactly
 * one environment. Unknown environment names fail loudly instead of falling back
 * to a default that could point a QA build at the wrong backend.
 */

export type AppEnvironment = 'development' | 'qa' | 'production';

const ALLOWED_ENVIRONMENTS: readonly AppEnvironment[] = ['development', 'qa', 'production'];

const rawEnvironment = (import.meta.env.VITE_APP_ENV ?? 'development').trim().toLowerCase();

if (!ALLOWED_ENVIRONMENTS.includes(rawEnvironment as AppEnvironment)) {
  throw new Error(
    `Unknown VITE_APP_ENV "${rawEnvironment}". Allowed values: ${ALLOWED_ENVIRONMENTS.join(', ')}.`
  );
}

export const APP_ENV = rawEnvironment as AppEnvironment;

/**
 * Kept relative by design: the SPA and the API share one origin per environment,
 * which keeps the auth cookies first-party and removes CORS from the picture.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api/v1').trim() || '/api/v1';

/** True only for the Vite dev server; false in every built artifact. */
export const IS_DEV_BUILD = import.meta.env.DEV;

/**
 * Address-based geocoding is opt-in: the browser must not call a lookup endpoint
 * that a given backend does not expose yet. Turn it on only after
 * `GET /api/v1/geocoding/address` is deployed.
 */
export const ADDRESS_GEOCODING_ENABLED =
  (import.meta.env.VITE_ENABLE_ADDRESS_GEOCODING ?? 'false').trim().toLowerCase() === 'true';

/**
 * Demo-only switch that lets the onboarding wizard run with client-side
 * validation enforcement OFF. Enabled on the dev server by default; a built
 * artifact exposes it only when the build sets `VITE_DEMO_VALIDATION_TOGGLE=true`.
 *
 * This is presentation gating, not a security boundary: the bundle is public.
 * The backend stays authoritative either way — the switch never changes a
 * request payload or disables a server-side rule.
 */
export const VALIDATION_TOGGLE_ENABLED =
  (import.meta.env.VITE_DEMO_VALIDATION_TOGGLE ?? String(IS_DEV_BUILD)).trim().toLowerCase() === 'true';
