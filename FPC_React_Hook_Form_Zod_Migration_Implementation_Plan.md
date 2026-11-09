# FPC Frontend — Form Handling Audit and React Hook Form + Zod Migration Plan

**Project audited:** `D:\Manoj_Space\projects\FPC`
**Date:** 9 November 2026
**Status:** Audit complete — **plan only, no source modified**
**Branch:** `main`

> This document is a plan. No source file, schema, package, or API integration was changed during this audit.
> Implementation begins only after explicit approval.

---

## 0. Audit Method and Baseline

| Item | Detail |
|---|---|
| Files inspected | All 130 files under `src/` (full tree read; every file containing `useState`, `onChange`, `<form`, `onSubmit`, or shared control usage was opened in full) |
| Search performed | Project-wide grep for `react-hook-form`, `useForm`, `zodResolver`, `FormProvider`, `useFormContext`, `useFieldArray`, `<Controller`, `useState`, `onChange`, `<form`, `onSubmit`, `errors.`, `register(`, `setError`, `reset(` |
| Typecheck baseline | `npx tsc -p tsconfig.app.json --noEmit` → **exit 0, no diagnostics** |
| Test baseline | **No test runner and no test files exist.** `package.json` contains no `vitest`, `jest`, `@testing-library/*`, `playwright`, or `cypress`. No `*.test.*` / `*.spec.*` file under `src/`. |
| Working tree | Pre-existing uncommitted changes on `main` (e.g. `index.html`, `package.json`, `src/app/*`, `src/features/onboarding/**`). Migrations must be committed in isolation from this existing work. |

**Deliverable location:** `D:\Manoj_Space\projects\FPC\FPC_React_Hook_Form_Zod_Migration_Implementation_Plan.md`

---

## 1. Executive Summary

The codebase is **further along than expected** and **further from consistent than it looks**.

**What already exists and works**

- React Hook Form + Zod are wired correctly in **8 of 10 real forms** (login + 7 onboarding steps).
- `@hookform/resolvers` `zodResolver` is used everywhere a form uses RHF — no hand-rolled resolvers.
- A genuine shared Zod rule library exists at `src/shared/validation/schemas.ts` (PAN, TAN, GSTIN, CIN, DIN, FSSAI, IFSC, PIN, phone, email, URL).
- The shared control library (`Input`, `Select`, `Textarea`, `Checkbox`, `Radio`, `Switch`, `FileUpload`, `FormField`) is `forwardRef`-based and **already `register()`-compatible by prop spreading**.
- Field errors already render through one path: `error={errors.x?.message}` → `FormField` → `<small id="{id}-error">` with `aria-invalid` + `aria-describedby`.

**The four real gaps**

1. **No centralized RHF handler exists.** Every form calls `useForm` + `zodResolver` + `mode: 'onBlur'` independently — the same configuration block is pasted **8 times**, and nothing central owns default form behaviour.
2. **Backend validation errors are never mapped into RHF.** `setError`, `clearErrors`, `setFocus`, `trigger`, and `reset` are called **zero times in the entire codebase**. Backend failures land in a separate `useState` string and are shown as a floating `Alert`, so a server-side "CompanyName is required" never highlights the Company name field.
3. **One production form is entirely manual:** `InviteFpcModal` holds all six fields in a single `useState` object with ad-hoc validation (`if (!companyName.trim() || !email.trim())`).
4. **Error handling is silently inconsistent.** The onboarding wizard swallows every exception in `catch {}` (7 handlers + final submit), so a failed step shows the user nothing. The final submit marks the application as *submitted* even when it throws.

**Headline counts**

| Metric | Count |
|---|---|
| `useForm(` call sites | 8 |
| `zodResolver(` call sites | 8 |
| `register(` call sites | 71 |
| `errors.` references | 46 |
| `useFieldArray` users | 3 |
| `<Controller>` usages | **0** |
| `FormProvider` / `useFormContext` usages | **0** |
| `setError` / `reset` / `trigger` / `setFocus` usages | **0** |
| `useState` declarations in `src/` | 55 (across 16 files) |
| `useState` declarations that hold **form field data** | 9 (8 in one unrouted showcase, 1 in `InviteFpcModal`) |

**Recommendation:** do **not** rewrite. Build a thin shared form layer (`useFpcForm` + `applyServerErrors` + one server-error surface), migrate `InviteFpcModal`, fix the swallowed backend errors, and normalise the 8 existing RHF forms onto the shared layer. Estimated surface: ~4 new files, ~12 edited files, 0 new packages.

---

## 2. Installed Package Versions (verified from `node_modules`, not just `package.json`)

| Package | `package.json` range | **Installed version** |
|---|---|---|
| `react-hook-form` | `^7.91.0` | **7.91.0** |
| `zod` | `^4.6.7` | **4.6.7** |
| `@hookform/resolvers` | `^7.0.3` | **7.0.3** |
| `react` | `^19.3.1` | 19.3.1 |
| `react-dom` | `^19.3.1` | 19.3.1 |
| `typescript` (dev) | `~6.0.3` | 6.0.3 |
| `vite` (dev) | `^8.3.6` | 8.3.6 |

Also present and relevant: `@reduxjs/toolkit` 2.14.0 + `react-redux` 9.3.1 (RTK Query owns all API calls), `tailwindcss` 4.3.4, `lucide-react`, `clsx` + `tailwind-merge` (`cn` helper).

**No additional package is required for this migration.** Everything below uses `react-hook-form` 7.91, `zod` 4.6, `@hookform/resolvers` 7.0, and the existing shared controls.

---

## 3. Existing Form Infrastructure Analysis

### 3.1 Does a centralized React Hook Form handler exist?

**No.**

There is no `useFpcForm`, no `useFormHandler`, no `FormProvider` wrapper, no `Form` component, and no shared submit hook. Each of the 8 RHF forms independently declares:

```ts
const { register, handleSubmit, formState: { errors } } = useForm<T>({
  resolver: zodResolver(schema),
  defaultValues: { ... },
  mode: 'onBlur',
});
```

The `resolver` + `mode: 'onBlur'` pair is duplicated in all 8. This is the main structural duplication to eliminate — not the RHF usage itself, which is sound.

### 3.2 Shared form components (all reusable, all already present)

| Component | Path | `forwardRef` | `register()` spread works? | Notes |
|---|---|---|---|---|
| `FormField` | `src/shared/components/FormField.tsx` | n/a (wrapper) | n/a | Renders label, required marker, error `<small id="{id}-error">`, helper `<small id="{id}-desc">`. Single error-rendering path for the whole app. |
| `Input` | `src/shared/components/Input.tsx` | ✅ | ✅ | Sets `aria-invalid`, `aria-describedby`. Sizes sm/md/lg. Renders through `FormField` when `label`/`error`/`helperText` present. |
| `Select` | `src/shared/components/Select.tsx` | ✅ | ✅ | Native `<select>`; `placeholder` renders `<option value="" disabled hidden>`. |
| `Textarea` | `src/shared/components/Textarea.tsx` | ✅ | ✅ | Supports `showCount` + `maxLength`. **Not used by any production form** (showcase only). |
| `Checkbox` | `src/shared/components/Checkbox.tsx` | ✅ | ⚠️ works only when paired with `watch()` | `checked` is an explicit controlled prop (`boolean \| 'mixed'`); it is not derived from RHF. Used in login only. |
| `Radio` | `src/shared/components/Radio.tsx` | ✅ | ❌ **not register-compatible** | `checked` defaults to `false` and is always applied, so a `register`-driven radio group would render permanently unchecked. **Not used in production yet.** Requires `Controller` when adopted. |
| `Switch` | `src/shared/components/Switch.tsx` | ✅ | ⚠️ same as Checkbox | Controlled `checked`; must use `Controller`. Not used in production. |
| `FileUpload` | `src/shared/components/FileUpload.tsx` | ✅ (file input) | ❌ **not register-compatible** | Uses `onFileSelect(file)` instead of an `onChange`/`name` passthrough; owns `isDragOver` state. Requires a `Controller`-based wrapper or a dedicated field component. |
| `Alert` | `src/shared/components/Alert.tsx` | ✅ | n/a | The existing surface for form-level/API errors. Tones: info/success/warning/danger/demo. |
| `Button` | `src/shared/components/Button.tsx` | ✅ | n/a | Already supports `loading`, `isLoading`, `loadingText`, `disabled` — the loading-state primitive to keep using. |
| `Modal` | `src/shared/components/Modal.tsx` | — | n/a | Accepts `footer`; `InviteFpcModal` submits via `form="invite-fpc-form"` from the footer button. Keep. |

Barrel: `src/shared/components/index.ts` re-exports all of the above.

### 3.3 Centralized Zod schemas / validation utilities

**Yes — a shared rule layer exists and should be extended, not duplicated.**

`src/shared/validation/schemas.ts` exports:

`requiredString`, `emailSchema`, `optionalEmailSchema`, `phoneSchema`, `cinSchema`, `dinSchema`, `panSchema`, `directorPanSchema`, `tanSchema`, `gstinSchema`, `fssaiSchema`, `ifscSchema`, `bankAccountSchema`, `pinCodeSchema`, `optionalUrlSchema`, `dateStringSchema`.

Feature schemas (one per form / step):

| Schema file | Exports | Used by |
|---|---|---|
| `src/features/auth/schemas/login.schema.ts` | `loginSchema`, `LoginFormValues` | `TsfAdminLoginPage` |
| `src/features/onboarding/schemas/basicDetails.schema.ts` | `basicDetailsSchema` | `FpcBasicDetailsForm` |
| `src/features/onboarding/schemas/legalRegistration.schema.ts` | `legalRegistrationSchema`, `operatingLicenseSchema` | `FpcLegalRegistrationForm` |
| `src/features/onboarding/schemas/financialInformation.schema.ts` | `financialInformationSchema`, `bankAccountItemSchema` | `FpcFinancialInformationForm` |
| `src/features/onboarding/schemas/boardOfDirectors.schema.ts` | `boardOfDirectorsSchema`, `directorItemSchema` | `FpcBoardOfDirectorsForm` |
| `src/features/onboarding/schemas/logoDocuments.schema.ts` | `logoDocumentsSchema` | `FpcLogoDocumentsForm` |
| `src/features/onboarding/schemas/addressLocation.schema.ts` | `addressLocationSchema` | `FpcAddressLocationForm` |
| `src/features/onboarding/schemas/businessActivities.schema.ts` | `businessActivitiesSchema` | `FpcBusinessActivitiesForm` |

**No schema exists for `InviteFpcModal`** — this is the only production form with no Zod schema.

**Observed gaps in validation coverage** (not bugs to fix now; backlog for Phase 6):

- `dateStringSchema(field)` only checks *non-empty*. It does **not** validate `dd-mm-yyyy`, a real date, or a sane range — yet the UI advertises `placeholder="dd-mm-yyyy"`.
- `latitude` / `longitude` in `addressLocation.schema.ts` are unvalidated optional strings.
- Numeric-looking fields (`farmers`, `shareholders`, `employees`, `targetFarmers`, `villagesCovered`, `acreage`) are plain `requiredString` — letters are accepted.
- `emailSchema` uses `z.string().email()`, which is deprecated in Zod 4 (`z.email()` is the current form). It still typechecks and behaves correctly; changing it is cosmetic and would alter nothing user-visible. **Leave it alone unless approved.**

### 3.4 How forms currently register fields

Uniform pattern, applied 71 times:

```tsx
<Input
  id="fpc-cin"
  label="CIN *"
  required
  error={errors.cin?.message}
  {...register('cin')}
/>
```

- Text/select/textarea fields: `{...register(name)}` prop spread. Correct.
- Dynamic arrays: `useFieldArray({ control, name })` then `{...register(`directors.${index}.fullName`)}`. Correct.
- `useWatch` is used for live derived UI: `FpcFinancialInformationForm` (share calculation), `FpcBoardOfDirectorsForm` (initials/header preview), `FpcLogoDocumentsForm` (uploaded-file badges).
- `FpcLogoDocumentsForm` additionally renders **9 hidden inputs** purely to guarantee registration of names it otherwise sets with `setValue` — a workaround worth retiring.
- `FpcBoardOfDirectorsForm` calls `setValue('directors.N.photographName', …)` for **unregistered** hidden fields — fragile (see Risks).

### 3.5 How validation errors are displayed

One consistent path, and it is good:

```
zodResolver → errors.<field>.message → error={...} → FormField
  → <small id="{id}-error" class="text-danger">
  → Input/Select/Textarea set aria-invalid + aria-describedby="{id}-error"
```

- Field-level: ✅ inline, consistent, accessible-by-attribute.
- Form-level (Zod `refine` on the object, or `root`): ❌ **never used**. No form renders `errors.root`.
- Error summary / scroll-to-first-error / focus management: ❌ absent.
- Live announcement: `FormField`'s error `<small>` has no `role="alert"` / `aria-live`, so errors are not announced when they appear. (Accessibility gap, not a correctness bug.)

### 3.6 How API errors are handled — and the actual backend envelope

The backend (**this same solution**) returns RFC 7807 `application/problem+json` from `src/Fpc.Api/Middleware/GlobalExceptionMiddleware.cs`, shaped by `src/Fpc.Application/Common/Models/ProblemDetailsResponse.cs`:

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Validation Failed",
  "status": 400,
  "detail": "One or more validation errors occurred.",
  "instance": "/api/v1/fpc-invitations",
  "correlationId": "6f1c…",
  "errorCode": "VALIDATION_FAILED",
  "errors": { "CompanyName": ["Company name is required."], "Email": ["Email address is required."] },
  "timestampUtc": "2026-11-09T09:28:31Z"
}
```

Two details that matter for mapping:

1. **`errors` keys are PascalCase** (`CompanyName`, `Email`, `PhoneNumber`, `Token`, `ToEmail`, …) because `System.Text.Json`'s `PropertyNamingPolicy` does not rename dictionary keys. RHF field names are camelCase. Mapping **must be case-insensitive**.
2. The envelope has **`title` and `detail` — not `message`**. Existing catch blocks read `err.data.message` as a fallback, which never matches an error response.

Current handling per form:

| Form | How API errors surface | Field mapping |
|---|---|---|
| `TsfAdminLoginPage` | `errorMessage` `useState` → `<Alert tone="danger">` above the form. Unwraps `err.data.detail` → `err.data.message` → string. | ❌ none |
| `InviteFpcModal` | `errorMessage` `useState` → `<Alert>` inside the form. Unwraps `err.data.detail` → `err.data.message` → `err.message`. | ❌ none |
| `FpcRegistrationPage` (steps 1–7) | **Nothing.** Seven identical `catch { /* Graceful error handling */ }` blocks. | ❌ none |
| `FpcRegistrationPage` (final) | **Nothing**, and `setIsSubmitted(true)` runs in the catch → success screen on failure. | ❌ none |
| `OnboardNewFpcPage` (revoke) | `console.error` only. | ❌ none |
| `AllFpcsPage`, `OnboardNewFpcPage` (search) | n/a (no submit) | n/a |

**Conclusion:** backend field errors are currently discarded app-wide. This is the single highest-value thing the migration fixes.

### 3.7 How loading and submission states are managed

| Form | Submitting state | Duplicate-submit protection |
|---|---|---|
| `TsfAdminLoginPage` | RTK `const [login, { isLoading }] = useLoginMutation()` → `<Button loading={isLoading}>` | Button disabled while loading only; handler has no re-entry guard |
| `InviteFpcModal` | local `isSubmitting` `useState` | Button `disabled` + `loading` |
| Onboarding steps 1–7 | **single lifted `isSubmitting` prop** owned by `FpcRegistrationPage` | Button `loading`; all 7 steps share one boolean |
| Step 8 (final) | same lifted `isSubmitting` | Button `loading`; `onClick` (not a form submit) |
| `FpcRegistrationPage` success screen | `isSubmitted` `useState` | n/a |

`FpcRegistrationPage` also owns success/notification state: `stepSuccessMessage`.

### 3.8 Do different modules follow different patterns?

Yes — three patterns coexist:

| Pattern | Where | Verdict |
|---|---|---|
| **P1 — RHF + zodResolver + shared controls** | `TsfAdminLoginPage`, all 7 onboarding step forms | ✅ Keep. Normalise configuration only. |
| **P2 — single `useState` object + manual checks** | `InviteFpcModal` | ❌ Replace with RHF + Zod. |
| **P3 — uncontrolled filter inputs via `useState`** | `OnboardNewFpcPage`, `AllFpcsPage`, `TsfAdminSidebar` | ✅ Keep. These are search/filter UI, not submittable forms. |
| **P4 — design-system showcase demos** | `src/components/*` (unrouted) | ⚪ Out of scope. |

---

## 4. Complete Component Inventory

> Every component below was opened and read. "Form Handling" describes what the component actually does today, not what its filename suggests.

| S.No | Component Name | File Path | Module | Current Form Handling | useState Usage | Validation Method | Migration Required |
|---|---|---|---|---|---|---|---|
| 1 | `TsfAdminLoginPage` | `src/pages/TsfAdminLoginPage.tsx` | auth (public route `/` and `/login`) | RHF + `zodResolver(loginSchema)`, `mode: 'onBlur'`; `<form noValidate>`; footer buttons | `showPassword` (UI), `loginSuccess` (C), `errorMessage` (B/API), `forgotModalOpen` (UI) | Zod `loginSchema` | **Yes (partial)** — API error → RHF root error |
| 2 | `FpcRegistrationPage` | `src/features/onboarding/pages/FpcRegistrationPage.tsx` | onboarding (`/onboard/register`, `/invite/register`) | Wizard orchestrator; renders 8 steps; owns submit handlers for steps 1–7 + final | `currentStep` (D), `isSubmitting` (C), `isSubmitted` (C), `stepSuccessMessage` (C) | None directly (delegates to step schemas) | **Yes** — error handling, submission state ownership |
| 3 | `FpcBasicDetailsForm` | `src/features/onboarding/components/FpcBasicDetailsForm.tsx` | onboarding step 1 | RHF + Zod; 9 fields; `defaultValues` seeded from invitation | none | `basicDetailsSchema` | **Yes (consistency)** — adopt `useFpcForm`, `noValidate` |
| 4 | `FpcLegalRegistrationForm` | `src/features/onboarding/components/FpcLegalRegistrationForm.tsx` | onboarding step 2 | RHF + Zod + `useFieldArray('additionalLicenses')`; 6 static fields + N license rows | none | `legalRegistrationSchema` | **Yes (consistency)** |
| 5 | `FpcFinancialInformationForm` | `src/features/onboarding/components/FpcFinancialInformationForm.tsx` | onboarding step 3 | RHF + Zod + `useFieldArray('bankAccounts')` + `useWatch` for derived share count | none | `financialInformationSchema` | **Yes (consistency)** |
| 6 | `FpcBoardOfDirectorsForm` | `src/features/onboarding/components/FpcBoardOfDirectorsForm.tsx` | onboarding step 4 | RHF + Zod + `useFieldArray('directors')` + `useWatch` + `setValue` for 2 file names; 2 raw `<input type="file">` | none | `boardOfDirectorsSchema` | **Yes** — Controller for file fields |
| 7 | `FpcLogoDocumentsForm` | `src/features/onboarding/components/FpcLogoDocumentsForm.tsx` | onboarding step 5 | RHF + Zod + `useWatch({ control })` + `setValue`; 9 hidden inputs; logo preview | `logoPreview` (D — object URL) | `logoDocumentsSchema` | **Yes** — retire hidden inputs; Controller |
| 8 | `FpcAddressLocationForm` | `src/features/onboarding/components/FpcAddressLocationForm.tsx` | onboarding step 6 | RHF + Zod; 11 fields (9 selects/inputs + 2 optional) | none | `addressLocationSchema` | **Yes (consistency)** |
| 9 | `FpcBusinessActivitiesForm` | `src/features/onboarding/components/FpcBusinessActivitiesForm.tsx` | onboarding step 7 | RHF + Zod; 7 fields | none | `businessActivitiesSchema` | **Yes (consistency)** |
| 10 | `FpcFinalReviewForm` | `src/features/onboarding/components/FpcFinalReviewForm.tsx` | onboarding step 8 | Read-only summary cards; **not a `<form>`**; `onClick={onSubmit}` | none | none | **Minimal** — keep as-is; submit state only |
| 11 | `OnboardingStepper` | `src/features/onboarding/components/OnboardingStepper.tsx` | onboarding | Step navigation only; no fields | none | none | **No** |
| 12 | `InviteFpcModal` | `src/roles/tsf-admin/features/fpc-management/components/InviteFpcModal.tsx` | fpc-management | **Manual** `useState` object, manual `onChange` per field, manual `FormEvent` submit, manual trim check | `formData` (**A**), `isSubmitting` (C), `errorMessage` (B/API) | Ad-hoc: `if (!companyName.trim() \|\| !email.trim())` | **YES — highest priority** |
| 13 | `OnboardNewFpcPage` | `src/roles/tsf-admin/features/fpc-management/pages/OnboardNewFpcPage.tsx` | fpc-management (`/admin/onboard`) | Page shell + table + filter + hosts `InviteFpcModal`; no submit form of its own | `records` (data), `searchQuery` (D), `selectedFilter` (D), `isInviteModalOpen` (D), `invitationSuccess` (C), `invitationLink` (D), `copied` (D) | none | **No** (only its mutation error handling) |
| 14 | `AllFpcsPage` | `src/roles/tsf-admin/features/fpc-management/pages/AllFpcsPage.tsx` | fpc-management | Filter-only directory; `<Input>` is a search box, not a form field | `searchQuery` (D), `selectedState` (D) | none | **No** |
| 15 | `TsfAdminSidebar` | `src/roles/tsf-admin/layout/TsfAdminSidebar.tsx` | layout | Sidebar nav; search box filters nav items | `fpcManagementOpen` (D), `oneGroupActive` (D), `allSyncedActive` (D), `searchQuery` (D) | none | **No** |
| 16 | `TsfAdminLayout` | `src/roles/tsf-admin/layout/TsfAdminLayout.tsx` | layout | Shell; mobile drawer | `mobileMenuOpen` (D) | none | **No** |
| 17 | `FileUpload` | `src/shared/components/FileUpload.tsx` | shared primitive | Primitive; drag/drop UI; `onFileSelect` callback | `isDragOver` (D) | none | **Adapter** — add `Controller` wrapper (Phase 6) |
| 18 | `FormControlsView` | `src/components/FormControlsView.tsx` | design showcase (**unrouted — zero imports**) | Full demo "Farmer Registration" form built entirely on `useState` + manual `onChange` | 8 field states (A) + `showErrorDemo` (B) + `isSubmitted` (C) | Manual (`showErrorDemo && !farmerName`, `showErrorDemo`) | **No** (excluded — dead gallery code) |
| 19 | `ButtonShowcaseView` | `src/components/ButtonShowcaseView.tsx` | showcase (unrouted) | Button playground | 7 demo states (D) | none | **No** |
| 20 | `FeedbackStatusView` | `src/components/FeedbackStatusView.tsx` | showcase (unrouted) | Alert playground w/ 2 demo `<select>`/`<input>` | 5 demo states (D/A-demo) | none | **No** |
| 21 | `SelectionUploadView` | `src/components/SelectionUploadView.tsx` | showcase (unrouted) | Static checkbox/radio/switch/upload demos; `checked` hard-coded | none | none | **No** |
| 22 | `TsfAdminLoginShowcaseView` | `src/components/TsfAdminLoginShowcaseView.tsx` | showcase (unrouted) | Wraps login in preview frames | `viewMode` (D) | none | **No** |
| 23 | `ColorSwatch` | `src/components/ColorSwatch.tsx` | showcase (unrouted) | Colour copier | `copied` (D) | none | **No** |

**Unrouted-code confirmation:** a project-wide import search for `FormControlsView`, `ButtonShowcaseView`, `FeedbackStatusView`, `SelectionUploadView`, `TsfAdminLoginShowcaseView` returned **no imports**. `src/app/router/index.tsx` mounts only `TsfAdminLoginPage`, `FpcRegistrationPage`, and `tsfAdminRoutes`.

### 4.1 Per-component detail — the ten that matter

#### 1. `TsfAdminLoginPage`
- **Form:** TSF Central Admin sign-in.
- **Fields:** `email`, `password`, `rememberMe` (checkbox).
- **Storage:** RHF (`defaultValues` pre-filled with demo credentials); `rememberMe` mirrored through `watch('rememberMe')` into `Checkbox.checked`.
- **Validation:** `loginSchema` = `emailSchema` + `z.string().min(1)` + `z.boolean()`. `<form noValidate>` ✅.
- **Error display:** `errors.email?.message` / `errors.password?.message` → `Input` → `FormField`.
- **API errors:** `errorMessage` state → `<Alert tone="danger" variant="card">` above the submit button. Reads `detail` → `message` → hard-coded fallback.
- **Submission/loading:** RTK `isLoading` → `Button loading`. `setLoginSuccess(true)` before `navigate('/admin/onboard')`.
- **Migrate?** Yes, partially: replace `errorMessage` with `setError('root.server', …)` so the message lives in `formState`, keep `loginSuccess` only if the success `Alert` is still desired before navigation. `showPassword` and `forgotModalOpen` stay `useState`.
- **Note:** demo credentials are baked into `defaultValues` and rendered by `showDemoCredentials` (default `true`). Flagged as a security/UX observation, **not** changed under this migration.

#### 2. `FpcRegistrationPage`
- **Form:** 8-step FPC onboarding wizard (steps 1–7 are real forms; 8 is review + submit).
- **Fields:** none of its own.
- **Storage:** `currentStep` (also mirrored to `?step=` query param); per-step data persisted by `invitationApi` to `localStorage` and re-read **synchronously** at render (deliberately zero `useEffect`).
- **Validation:** delegated to each step's schema.
- **Error display:** `stepSuccessMessage` → success `Alert`. **No failure path at all.**
- **API errors:** `catch { /* Graceful error handling */ }` ×7, plus final submit which sets `isSubmitted(true)` inside `catch`.
- **Submission/loading:** one `isSubmitting` boolean shared by all steps via prop.
- **Migrate?** Yes: delete `isSubmitting` pass-through for steps 1–7 (each form's `formState.isSubmitting` takes over), add per-step failure messaging, fix the false-success final submit. `currentStep` / `isSubmitted` / `stepSuccessMessage` remain legitimate page state.

#### 3–9. Onboarding step forms
- All are genuine RHF + Zod forms and **should not be rewritten**.
- Required changes are uniform: adopt `useFpcForm`, add `noValidate`, add `onInvalid` focus handling, surface `errors.root`, and (steps 4 & 5) replace `setValue`-on-unregistered-field + hidden inputs with `Controller`.
- `FpcLogoDocumentsForm.logoPreview` is an object URL — **independent UI state**, stays `useState`. Add `URL.revokeObjectURL` cleanup.
- `FpcBoardOfDirectorsForm` seeds two *hard-coded directors* (`Subhashree Jena`, `Chairperson`) as defaults. This is demo data inside a production form; flagged, not changed.

#### 10. `FpcFinalReviewForm`
- Read-only summary; the "Submit Onboarding" button calls `onSubmit` directly rather than submitting a form.
- No fields, no schema, nothing to migrate. Only its loading state is affected by the parent change.

#### 12. `InviteFpcModal`
- **Form:** TSF-admin → FPC registration invitation.
- **Fields:** `companyName`, `nominatedAdmin`, `email`, `phoneNumber`, `state` (select, default `Odisha`), `district` (select, default `Jajpur`).
- **Storage:** one `useState<InviteFpcFormData>` object; every field uses `value={formData.x}` + `onChange={(e) => setFormData({ ...formData, x: e.target.value })}` — 6 manual handlers.
- **Validation:** two fields only. `nominatedAdmin`, `phoneNumber`, `state`, `district` are unchecked. No format validation (email/phone) despite the shared schemas existing.
- **Error display:** single `Alert` for both validation and API failure; no per-field errors.
- **API errors:** `err.data.detail || err.data.message || err.message || fallback`.
- **Submission/loading:** local `isSubmitting`; `onSubmitInvite` awaited; form reset by assigning `setFormData(INITIAL_FORM)`; closes on success.
- **Migrate?** **Yes — full.** New `inviteFpcSchema` reusing `requiredString`, `emailSchema`, `phoneSchema`; `useFpcForm`; footer submit keeps `form="invite-fpc-form"`; `reset()` on close; `applyServerErrors` for backend `errors`.

---

## 5. Classified Form-Related `useState` Occurrences

### Category A — Form field state (must move to RHF)

| # | File | Line | State | Fields held |
|---|---|---|---|---|
| A1 | `src/roles/tsf-admin/features/fpc-management/components/InviteFpcModal.tsx` | 48 | `formData` | `companyName`, `nominatedAdmin`, `email`, `phoneNumber`, `state`, `district` |
| A2 | `src/components/FormControlsView.tsx` | 23–30 | `farmerName`, `aadhaar`, `phone`, `district`, `crop`, `acreage`, `remarks`, `confirmed` | 8 showcase demo fields |

> **Production Category A total: 6 fields, in one component (`InviteFpcModal`).** Everything else already lives in RHF.

### Category B — Validation / error state

| # | File | Line | State | Disposition |
|---|---|---|---|---|
| B1 | `InviteFpcModal.tsx` | 50 | `errorMessage` | Becomes Zod field errors + `setError('root.server')` + `errors.root` |
| B2 | `TsfAdminLoginPage.tsx` | 49 | `errorMessage` | Becomes `setError('root.server')` |
| B3 | `FormControlsView.tsx` | 33 | `showErrorDemo` | Excluded (showcase toggle) |

**No component uses `useState` per validation message.** The problem is not message sprinkling — it is that API errors are held outside RHF, and 7+ handlers drop them entirely.

### Category C — Submission state

| # | File | Line | State | Disposition |
|---|---|---|---|---|
| C1 | `InviteFpcModal.tsx` | 49 | `isSubmitting` | → `formState.isSubmitting` |
| C2 | `FpcRegistrationPage.tsx` | 43 | `isSubmitting` | Steps 1–7 → each form's `formState.isSubmitting`; retain one for step 8 |
| C3 | `FpcRegistrationPage.tsx` | 44 | `isSubmitted` | Legitimate page state (terminal success screen) — keep |
| C4 | `FpcRegistrationPage.tsx` | 45 | `stepSuccessMessage` | Legitimate page state — keep, but pair with a new failure counterpart |
| C5 | `TsfAdminLoginPage.tsx` | 48 | `loginSuccess` | Keep or replace with `useNotification()`; not form data |
| C6 | `OnboardNewFpcPage.tsx` | 103 | `invitationSuccess` | Page notification state — keep |

### Category D — Independent UI state (keep `useState`; do not touch)

| File | State |
|---|---|
| `TsfAdminLoginPage.tsx` | `showPassword` (47), `forgotModalOpen` (50) |
| `FpcRegistrationPage.tsx` | `currentStep` (40) |
| `FpcLogoDocumentsForm.tsx` | `logoPreview` (43) |
| `OnboardNewFpcPage.tsx` | `records` (99, data), `searchQuery` (100), `selectedFilter` (101), `isInviteModalOpen` (102), `invitationLink` (104), `copied` (105) |
| `AllFpcsPage.tsx` | `searchQuery` (70), `selectedState` (71) |
| `TsfAdminSidebar.tsx` | `fpcManagementOpen` (32), `oneGroupActive` (33), `allSyncedActive` (34), `searchQuery` (35) |
| `TsfAdminLayout.tsx` | `mobileMenuOpen` (15) |
| `shared/components/FileUpload.tsx` | `isDragOver` (37) |
| `shared/hooks/usePagination.ts` | `currentPage` (14) |
| `shared/notifications/NotificationProvider.tsx` | `notifications` (20) |
| `components/ButtonShowcaseView.tsx` | 7 playground states |
| `components/FeedbackStatusView.tsx` | 5 playground states |
| `components/TsfAdminLoginShowcaseView.tsx` | `viewMode` |
| `components/ColorSwatch.tsx` | `copied` |

**Total `useState` in `src/`: 55. Form-data `useState` that must be removed: 6 (Category A1).** The other 49 are legitimate UI, data, or demo state. The migration is therefore far smaller than the raw `useState` count suggests — and this is why "remove every `useState`" would be wrong.

---

## 6. Current Validation and Error-Handling Patterns (matrix)

| Concern | Login | Invite modal | Onboarding steps | Final submit |
|---|---|---|---|---|
| Schema | `loginSchema` | ❌ none | 7 feature schemas | n/a |
| Resolver | `zodResolver` | ❌ | `zodResolver` | n/a |
| Trigger mode | `onBlur` | on submit | `onBlur` | n/a |
| Field error rendering | `FormField` | ❌ none | `FormField` | n/a |
| Form-level error rendering | ❌ (`Alert` outside RHF) | ❌ (`Alert` outside RHF) | ❌ none | ❌ none |
| Backend field errors | ❌ discarded | ❌ discarded | ❌ discarded | ❌ discarded |
| Backend message | `Alert` | `Alert` | ❌ swallowed | ❌ swallowed |
| Network failure | generic message | generic message | ❌ silent | ❌ silent + false success |
| Loading | RTK `isLoading` | local `useState` | lifted prop | lifted prop |
| Double submit | Button disabled | Button disabled | Button disabled | Button disabled |
| Reset | ❌ none | manual `setFormData(INITIAL_FORM)` | ❌ none | n/a |
| Focus first invalid | ❌ | ❌ | ❌ | ❌ |
| Native browser validation | suppressed (`noValidate`) | **active** | **active** | n/a |

> **Native-validation finding:** every onboarding `<form>` and the invite `<form>` omit `noValidate`, while `Input` sets the HTML `required` attribute. Browsers therefore show their own tooltip and can block submission before Zod runs — so the *presentation* of a required-field error is inconsistent between login and every other form. Standardising on `noValidate` + inline Zod errors is required to meet the "Zod validation errors / required-field errors" standard below.

---

## 7. Proposed Centralized Form Architecture

### 7.1 Design principles

1. **Wrap, don't reimplement.** `useFpcForm` returns the real `UseFormReturn<T>` from `useForm`. No custom state machine, no shadow validation.
2. **One schema per form, one shared rule library.** Feature schemas compose `src/shared/validation/schemas.ts`. No duplicate regexes.
3. **One error surface.** Zod errors and backend errors both end up inside `formState.errors`, rendered by `FormField`. Backend mapping uses RHF's own `setError`.
4. **No new dependencies, no new UI primitives.** Reuse `Alert`, `Button`, `Input`, `Select`, `FormField`, `Modal`.
5. **UI state stays UI state.** `showPassword`, `currentStep`, `logoPreview`, modal open/close, search filters remain `useState`.

### 7.2 New folder: `src/shared/forms/`

```
src/shared/forms/
├── useFpcForm.ts          # centralized useForm wrapper (defaults + root/API error helpers)
├── apiErrors.ts           # ProblemDetails parsing + RHF setError mapping + field-name normalisation
├── FormServerError.tsx    # form-level error surface (renders existing Alert from errors.root)
└── index.ts               # barrel
```

Plus one new schema:

```
src/features/onboarding/schemas/invitation.schema.ts   # InviteFpcModal
```

### 7.3 `useFpcForm` — centralized RHF configuration

Single source of truth for the configuration currently duplicated 8×.

```ts
// src/shared/forms/useFpcForm.ts  (proposed)
import { useForm, type UseFormProps, type FieldValues, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType } from 'zod';

export interface UseFpcFormOptions<T extends FieldValues>
  extends Omit<UseFormProps<T>, 'resolver' | 'mode' | 'reValidateMode'> {
  schema: ZodType<T, T>;
}

export function useFpcForm<T extends FieldValues>({
  schema,
  ...options
}: UseFpcFormOptions<T>): UseFormReturn<T> {
  return useForm<T>({
    ...options,
    resolver: zodResolver(schema),
    mode: 'onBlur',          // matches today's behaviour on all 8 forms
    reValidateMode: 'onChange',
    shouldFocusError: true,  // focuses first invalid field — new, non-visual improvement
  });
}
```

**Deliberately NOT changed:**

- `criteriaMode` stays `'firstError'` (default). Switching to `'all'` would make `errors.x` an array and break all 46 `errors.x?.message` call sites.
- `defaultValues` stay per-form (they are form-specific and must not be centralised).
- No `FormProvider` is introduced globally. Only `FpcBoardOfDirectorsForm`, `FpcLegalRegistrationForm`, and `FpcFinancialInformationForm` use nested arrays, and each is a single component — `FormProvider` would add indirection without benefit. It is documented as the extension point *only if* a step is later split into sub-components.

### 7.4 `applyServerErrors` — the missing backend → RHF bridge

```ts
// src/shared/forms/apiErrors.ts  (proposed)
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
```

Responsibilities:

1. **Extract** the problem from an RTK Query rejection: `{ status, data }` where `data` is the problem JSON, plus `FETCH_ERROR` / `TIMEOUT_ERROR` shapes.
2. **Normalise field names** — backend sends `CompanyName`, RHF expects `companyName`. Normalise by: lower-casing the first character of each path segment, matching case-insensitively against the form's known field names (passed in, or auto-derived from `schema.shape`), and preserving dotted/indexed paths (`Data.field`, `directors.0.fullName`).
3. **`setError` per field** with `{ type: 'server' }`, so `FormField` renders it exactly like a Zod error and `shouldFocusError`/`setFocus` can reveal it.
4. **Return unresolved messages** so the caller can surface them at form level via `setError('root.server', …)`.
5. **Never throw**, never log payloads.

Mapping table (encoded in the helper):

| Failure | Detection | Destination |
|---|---|---|
| Zod field error | `zodResolver` | `errors.<field>` — inline |
| Zod object-level (`refine`) | `zodResolver` | `errors.root` — form Alert |
| Backend 400 `VALIDATION_FAILED` | `status === 400` + `errors` object | `setError(<mapped field>)`; unmatched → root |
| Backend 400/409 with no `errors` | `detail`/`title` | `root.server` |
| Backend 401 | `status === 401` | `root.server` ("Your session expired. Please sign in again.") — `baseQueryWithReauth` already handles refresh |
| Backend 403 | `status === 403` | `root.server` (use `detail`, which the backend sanitises for tenant violations) |
| Backend 404 | `status === 404` | `root.server` |
| Backend 429 | `status === 429` | `root.server` ("Too many attempts…") — rate-limit policies exist server-side |
| Backend 5xx | `status >= 500` | `root.server` + append `correlationId` when present |
| Network / offline | `status === 'FETCH_ERROR'` | `root.server` ("Network unavailable…") |
| Timeout | `status === 'TIMEOUT_ERROR'` | `root.server` |
| Unknown | anything else | generic `root.server` |

`root.server` (a reserved RHF root key) means **no new `useState` is needed for API error messages** — requirement satisfied without a `useState` per message.

### 7.5 `FormServerError` — one form-level surface

```tsx
// src/shared/forms/FormServerError.tsx  (proposed)
// Reads errors.root?.server?.message and errors.root?.message,
// renders the existing shared <Alert tone="danger" variant="card">, returns null when clean.
```

This replaces the bespoke `errorMessage` + `<Alert>` duplication in login and the invite modal, and gives onboarding steps their first failure UI. No new visual style is introduced — it is the same `Alert` already used in both places today, so **layout and UX are preserved**.

### 7.6 Field integration matrix (what to use for each control)

| Control | Integration | Why |
|---|---|---|
| `Input` | `{...register('field')}` + `error={errors.field?.message}` | Already correct (71 call sites) |
| `Select` | `{...register('field')}` + `error=…` | Already correct |
| `Textarea` | `{...register('field')}` + `error=…` | Already correct (unused today) |
| `Checkbox` | `Controller` (recommended) — or keep `checked={watch(x)}` + `register(x)` | `checked` is an explicit controlled prop; `Controller` makes intent explicit and removes the `watch` coupling |
| `Radio` | **`Controller` required** | Component always applies `checked={false}` by default → register-driven groups render unchecked |
| `Switch` | **`Controller` required** | Same controlled-prop shape as `Checkbox` |
| `FileUpload` | **`Controller` + thin `FileField` adapter** (Phase 6) | Custom `onFileSelect` API; no `name`/`onChange` passthrough |
| Native `<input type="file">` (directors) | `Controller` | Currently `setValue` on unregistered names |

### 7.7 Support for the 15 required capabilities

| # | Capability | How the architecture delivers it |
|---|---|---|
| 1 | Centralized RHF configuration | `useFpcForm` (§7.3) |
| 2 | Zod validation schemas | Existing feature schemas + one shared rule library; new `inviteFpcSchema` |
| 3 | Reusable field registration | `{...register(name)}` over `forwardRef` controls (**already exists**) |
| 4 | Reusable `Input` integration | `Input` + `FormField` (**already exists**) |
| 5 | Select & checkbox integration | `Select` via register; `Checkbox` via `Controller` |
| 6 | Textarea integration | `Textarea` via register (already supported) |
| 7 | Field-level error display | `FormField` `<small id="{id}-error">` (**already exists**) |
| 8 | Form-level error display | `FormServerError` → `errors.root.server` |
| 9 | Backend API validation errors | `applyServerErrors` → `setError(field, { type: 'server' })` |
| 10 | Submission & loading states | `formState.isSubmitting` (+ `Button loading`) |
| 11 | Form reset | `reset()` from `useForm` (modal close, wizard step reset) |
| 12 | Default values | Per-form `defaultValues` passed to `useFpcForm` |
| 13 | Dynamic form fields | Existing `useFieldArray` (licenses, bank accounts, directors) |
| 14 | Multi-step forms | Per-step `useFpcForm` + page-owned `currentStep` + `invitationApi` draft persistence (**already the design**) |
| 15 | Conditional validation | Zod `superRefine` / `.refine` at object level; field-level via `deps` — no new mechanism needed |

### 7.8 What will NOT change

- No `useEffect` will be added. Draft persistence stays synchronous via `invitationApi.getStepXData()`.
- No API endpoint, request body, response type, or `localStorage` key changes.
- No visual/layout changes: all errors render through the existing `FormField`/`Alert` components with existing tokens.
- No creation of a second form library, duplicate validation helpers, or parallel `Input` components.
- No migration of search/filter inputs, modal open state, tabs, or password visibility.

---

## 8. Module-Wise Migration Plan

### 8.1 Module: `shared` (foundation — no UI)

| Item | Detail |
|---|---|
| Components | `src/shared/forms/*` (new), `src/shared/validation/schemas.ts` (additive only) |
| Current implementation | No centralized handler; 16 shared Zod rules; no API-error mapper |
| Required changes | Create `useFpcForm`, `apiErrors`, `FormServerError`, `index.ts`. Additive schema helpers only if a migrated form needs them (`optionalString`, numeric string, `mustAccept`) |
| Reuse | `Alert`, `FormField`, `Input`, `Select`, `Checkbox`, `Textarea` |
| Schema requirements | None new at this layer |
| API considerations | None — must stay framework-agnostic (accept unknown error, return mapping) |
| Priority | **P0 — blocking dependency for everything else** |

### 8.2 Module: `auth` (`src/pages/TsfAdminLoginPage.tsx`, `src/features/auth/**`)

| Item | Detail |
|---|---|
| Components | `TsfAdminLoginPage` |
| Current | RHF + `loginSchema`; `errorMessage` `useState`; `Alert` above submit |
| Required changes | `useFpcForm`; delete `errorMessage`; on `catch` call `applyServerErrors` with `setError`; render `<FormServerError control={control} />` where the `Alert` sits today; keep `showPassword`/`forgotModalOpen`/`loginSuccess` |
| Reuse | `Input`, `Checkbox`, `Button`, `Card`, `Alert`, `Modal`, `LoginHeader` |
| Schema | `loginSchema` unchanged |
| API | `useLoginMutation` unchanged; still unwrap `response.success`/`response.data`; **stop reading `err.data.message`** (not in envelope) |
| Priority | **P1** |

### 8.3 Module: `onboarding` — wizard shell (`FpcRegistrationPage`)

| Item | Detail |
|---|---|
| Components | `FpcRegistrationPage` |
| Current | 7 identical submit handlers; swallowed errors; shared `isSubmitting`; false success on final failure |
| Required changes | Replace 7 handlers with one generic `submitStep(step, submitFn, values)`; on failure set a new `stepErrorMessage` (or use `useNotification()`) and **stay on the step**; `goToStep` unchanged; move `isSubmitting` ownership: steps 1–7 use `formState.isSubmitting` (drop the prop), step 8 keeps a page-level flag; fix `handleFinalSubmit` to not set `isSubmitted` in `catch` |
| Reuse | `Alert`, `Card`, `Button`, `OnboardingStepper` |
| Schema | Unchanged |
| API | `invitationApi` signatures unchanged; `completeFpcInvitation` unchanged |
| Priority | **P2** |

### 8.4 Module: `onboarding` — step forms

| Component | Path | Required changes | Schema work | Priority |
|---|---|---|---|---|
| `FpcBasicDetailsForm` | `src/features/onboarding/components/FpcBasicDetailsForm.tsx` | `useFpcForm`; `noValidate`; `FormServerError`; drop `isSubmitting` prop | none | P2 |
| `FpcLegalRegistrationForm` | `…/FpcLegalRegistrationForm.tsx` | Same; `useFieldArray` retained; add `formState.isSubmitting` to `Button` | none | P2 |
| `FpcFinancialInformationForm` | `…/FpcFinancialInformationForm.tsx` | Same; `useWatch` derived shares retained | none | P2 |
| `FpcBoardOfDirectorsForm` | `…/FpcBoardOfDirectorsForm.tsx` | Same + `Controller` for `photographName` / `identityDocName` (replaces unregistered `setValue`) | schema unchanged (optional strings stay) | P3 |
| `FpcLogoDocumentsForm` | `…/FpcLogoDocumentsForm.tsx` | Same + `Controller` for 9 document names; **remove 9 hidden inputs**; keep `logoPreview` `useState`; add `revokeObjectURL` cleanup | none | P3 |
| `FpcAddressLocationForm` | `…/FpcAddressLocationForm.tsx` | `useFpcForm`; `noValidate`; `FormServerError` | optional: numeric lat/long | P2 |
| `FpcBusinessActivitiesForm` | `…/FpcBusinessActivitiesForm.tsx` | `useFpcForm`; `noValidate`; `FormServerError` | optional: numeric counts/date | P2 |
| `FpcFinalReviewForm` | `…/FpcFinalReviewForm.tsx` | No form migration; keep `onClick` submit | none | — |

**Reuse across all:** `Card`, `Input`, `Select`, `Button`, `FormField`, `Badge`.

### 8.5 Module: `fpc-management`

| Component | Path | Required changes | Schema | Priority |
|---|---|---|---|---|
| `InviteFpcModal` | `src/roles/tsf-admin/features/fpc-management/components/InviteFpcModal.tsx` | Full migration: `useFpcForm(inviteFpcSchema)`; `register` on 4 inputs + 2 selects; `formState.isSubmitting`; `FormServerError`; `reset()` on close/success; `applyServerErrors`; footer `form="invite-fpc-form"` unchanged | **new** `inviteFpcSchema` | **P1** |
| `OnboardNewFpcPage` | `…/pages/OnboardNewFpcPage.tsx` | Only the `handleDelete`/`handleInviteSubmit` error paths: replace `console.error` with `useNotification()`; `InviteFpcModal` API stays identical | none | P2 |
| `AllFpcsPage` | `…/pages/AllFpcsPage.tsx` | **No change** — filter UI, not a form | none | — |

### 8.6 Module: `layout` / `showcase`

**No changes.** `TsfAdminSidebar`, `TsfAdminLayout`, and all `src/components/*` showcase views are out of scope (`FormControlsView` is unrouted dead demo code; migrating it would add risk with zero user-visible benefit — `E` category, explicitly preserved).

---

## 9. Exact Files to Create or Modify

### 9.1 Create (5 files)

| Path | Purpose |
|---|---|
| `src/shared/forms/useFpcForm.ts` | Centralized `useForm` + `zodResolver` + defaults |
| `src/shared/forms/apiErrors.ts` | `ProblemDetails` type, `extractProblemDetails`, `normalizeFieldName`, `applyServerErrors` |
| `src/shared/forms/FormServerError.tsx` | `errors.root` → shared `Alert` |
| `src/shared/forms/index.ts` | Barrel |
| `src/features/onboarding/schemas/invitation.schema.ts` | `inviteFpcSchema` + `InviteFpcFormValues` |

> `InviteFpcFormValues` will be derived with `z.infer`. `InviteFpcFormData` in `InviteFpcModal.tsx` can then be re-exported as an alias so `OnboardNewFpcPage`'s import of `type InviteFpcFormData` keeps compiling — **no API contract change**.

### 9.2 Modify (11 files)

| Path | Change |
|---|---|
| `src/pages/TsfAdminLoginPage.tsx` | `useFpcForm`; remove `errorMessage`; add `FormServerError`; `applyServerErrors` in catch |
| `src/features/onboarding/pages/FpcRegistrationPage.tsx` | Unified step submit; per-step failure message; fix final-submit false success; drop `isSubmitting` for steps 1–7 |
| `src/features/onboarding/components/FpcBasicDetailsForm.tsx` | `useFpcForm`, `noValidate`, `FormServerError`, drop `isSubmitting` prop |
| `src/features/onboarding/components/FpcLegalRegistrationForm.tsx` | Same |
| `src/features/onboarding/components/FpcFinancialInformationForm.tsx` | Same |
| `src/features/onboarding/components/FpcBoardOfDirectorsForm.tsx` | Same + `Controller` for 2 file fields |
| `src/features/onboarding/components/FpcLogoDocumentsForm.tsx` | Same + `Controller` for 9 names + remove hidden inputs |
| `src/features/onboarding/components/FpcAddressLocationForm.tsx` | Same |
| `src/features/onboarding/components/FpcBusinessActivitiesForm.tsx` | Same |
| `src/roles/tsf-admin/features/fpc-management/components/InviteFpcModal.tsx` | Full RHF + Zod migration |
| `src/roles/tsf-admin/features/fpc-management/pages/OnboardNewFpcPage.tsx` | `useNotification()` instead of `console.error` |

### 9.3 Explicitly **not** modified

`src/shared/validation/schemas.ts` (unless an additive helper is required), `src/shared/components/*` (no primitive changes required), `src/app/**`, `src/features/*/api/**`, `src/features/onboarding/api/invitation.api.ts`, `src/roles/tsf-admin/layout/**`, `src/roles/tsf-admin/features/fpc-management/pages/AllFpcsPage.tsx`, `src/components/**`, `package.json`.

---

## 10. Implementation Strategy — Phases, Dependencies, Priorities

| Phase | Scope | Depends on | Risk | Exit criteria |
|---|---|---|---|---|
| **P0 — Foundation** | Create `src/shared/forms/*` (4 files). No consumers yet. | — | **Low** (additive, zero behavioural change) | `tsc --noEmit` clean; `npm run lint` clean |
| **P1 — API-error bridge** | Migrate `TsfAdminLoginPage` + `InviteFpcModal` (with new `inviteFpcSchema`) | P0 | **Medium** (2 user-facing flows) | Login shows field-level + root errors; invite modal blocks invalid email/phone client-side; backend `errors` highlight the right field |
| **P2 — Wizard consistency** | `FpcRegistrationPage` + 6 step forms (`Basic`, `Legal`, `Financial`, `Address`, `Business`, and `Final` submit behaviour) | P0 (P1 desirable for `applyServerErrors`) | **Medium** (8-step flow is the product's core) | Every step uses `useFpcForm`; failures visible and message-bearing; `isSubmitting` removed from steps 1–7; no regression in draft-save/navigation |
| **P3 — File fields** | `FpcBoardOfDirectorsForm` + `FpcLogoDocumentsForm` `Controller` migration; remove 9 hidden inputs | P2 | **Medium** (object URLs, uncontrolled inputs) | Uploaded file names persist across remount and appear in submitted values |
| **P4 — Residual hardening** | Focus-first-invalid verification; `noValidate` audit; optional schema gaps (date format, numeric fields, lat/long) — **only if approved separately** | P2 | **Low** | Each tightened rule has an approval note; no message churn without sign-off |
| **P5 — Optional cleanup** | `Radio`/`Switch` docs comment; `FileField` adapter for `FileUpload` | P2 | **Low** | Documented, not necessarily implemented |

### Recommended order (safe, incremental, always shippable)

```
P0 → P1 → P2 → P3 → (P4) → (P5)
```

**Dependency notes**

- P1 and P2 are independent of each other and can ship separately.
- P3 must follow P2 because both edit the same two step files.
- P4's schema tightening must **not** be bundled with P2: tightening validation rules silently changes which submissions are accepted — that is a product decision, not a refactor.
- Do **not** touch `src/shared/validation/schemas.ts` rules in P0–P3. Adding a shared helper is fine; changing an existing rule is not.

### Priority summary

| Priority | Components | Rationale |
|---|---|---|
| **P0** | `shared/forms/*` | Blocks everything; zero risk |
| **P1** | `InviteFpcModal`, `TsfAdminLoginPage` | Only manual form + only pre-auth entry point |
| **P2** | `FpcRegistrationPage`, 6 step forms, `OnboardNewFpcPage` error path | Removes silent failures on the core flow |
| **P3** | `FpcBoardOfDirectorsForm`, `FpcLogoDocumentsForm` | File-field correctness |
| **none** | `FpcFinalReviewForm` (structure), `AllFpcsPage`, layouts, showcases | Already appropriate |

---

## 11. Testing and Regression Strategy

### 11.1 Hard constraint

`package.json` has **no test runner**, and constraint #12 forbids installing packages. Therefore:

- **Automated unit/component tests are out of scope** for this migration unless the "no new packages" rule is lifted.
- Available automated gates: `npx tsc -p tsconfig.app.json --noEmit`, `npm run lint`, `npm run build`.
- Everything else is a **documented manual regression matrix** (below), executed per phase.

> If automated coverage is wanted later, the minimum addition would be `vitest` + `@testing-library/react` + `jsdom`. That is a separate approval.

### 11.2 Automated gates per phase

| Gate | Command | Expected |
|---|---|---|
| Type safety | `npx tsc -p tsconfig.app.json --noEmit` | exit 0 (baseline is currently 0) |
| Lint | `npm run lint` | no new errors vs. baseline |
| Production build | `npm run build` | succeeds; bundle not meaningfully larger |
| No dead imports | `grep -rn "isSubmitting" src/features/onboarding/components` | only step-8 usage remains |

### 11.3 Manual regression matrix

| # | Case | Login | Invite modal | Steps 1–7 | Step 8 |
|---|---|---|---|---|---|
| 1 | Submit empty → required-field errors on every required field | ✔ | ✔ | ✔ | — |
| 2 | Invalid formats (email, phone, CIN, PAN, GSTIN, IFSC, PIN, DIN) → field message | ✔ | ✔ | ✔ | — |
| 3 | Valid submit → success path, correct payload shape | ✔ | ✔ | ✔ | ✔ |
| 4 | Backend 400 `VALIDATION_FAILED` with `errors` → correct field highlighted | ✔ | ✔ | ✔ | — |
| 5 | Backend 400 with only `detail` → form-level `Alert` | ✔ | ✔ | ✔ | ✔ |
| 6 | Backend 401 → session message, no redirect loop | ✔ | ✔ | ✔ | ✔ |
| 7 | Backend 403 / 404 / 409 → meaningful form-level message | ✔ | ✔ | ✔ | ✔ |
| 8 | Backend 500 → generic message; `correlationId` shown when provided | ✔ | ✔ | ✔ | ✔ |
| 9 | Network offline / `FETCH_ERROR` → offline message, form still editable | ✔ | ✔ | ✔ | ✔ |
| 10 | Loading state on submit button; no double submission on rapid double-click | ✔ | ✔ | ✔ | ✔ |
| 11 | Reset: modal reopened after success/failure is empty with correct defaults (`Odisha` / `Jajpur`) | — | ✔ | — | — |
| 12 | Default values: invitation-seeded fields on step 1; hard-coded defaults on steps 3–7 preserved | ✔ (demo creds) | — | ✔ | — |
| 13 | Select values submitted correctly (state, district, ROC, financial year, bank, designation, gender, status) | — | ✔ | ✔ | — |
| 14 | Checkbox `rememberMe` toggles and submits as boolean | ✔ | — | — | — |
| 15 | Dynamic rows: add/remove additional licence, bank account, director; values survive add/remove | — | — | ✔ | — |
| 16 | Multi-step navigation: forward on success, back preserves data, `?step=` deep link works | — | — | ✔ | ✔ |
| 17 | Step-8 submit failure shows an error and **stays** on the review screen | — | — | — | ✔ |
| 18 | Existing API integration unchanged: `/auth/login`, `/fpc-invitations` (GET/POST/DELETE/complete/validate) | ✔ | ✔ | ✔ | ✔ |
| 19 | `localStorage` draft keys unchanged: `fpc_step{1..7}_<token>`, `fpc_completed_<token>` | — | — | ✔ | ✔ |
| 20 | Desktop (≥1280), tablet (768–1279), mobile (≤640): layout, spacing, error placement unchanged | ✔ | ✔ | ✔ | ✔ |
| 21 | Keyboard: tab order, focus first invalid field after failed submit | ✔ | ✔ | ✔ | ✔ |
| 22 | Screen-reader labels intact: `aria-invalid`, `aria-describedby="{id}-error"` present on error | ✔ | ✔ | ✔ | — |
| 23 | File uploads (steps 4 & 5) still show file names and appear in submitted values | — | — | ✔ | — |
| 24 | No OTP/password/token values appear in console or error text | ✔ | ✔ | ✔ | ✔ |

### 11.4 Per-phase smoke order

1. P0: compile + lint only (no runtime surface).
2. P1: cases 1–2, 4–5, 9–11, 14, 18, 20, 22 for login + invite.
3. P2: cases 1–3, 12–13, 15–17, 19–21 across the wizard.
4. P3: cases 15, 23 plus remount/refresh on steps 4–5.

---

## 12. Risks and Compatibility Considerations

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **Pre-existing uncommitted work on `main`** gets tangled with migration edits | High | High | Commit or stash the current tree before P0; ship each phase as its own commit |
| R2 | Changing `criteriaMode` would break 46 `errors.x?.message` usages | Immediate if attempted | High | `useFpcForm` keeps `criteriaMode` at default `firstError` |
| R3 | Adding `noValidate` changes *how* required-field errors appear (native tooltip → inline Zod) | Certain | Medium | This is the intended standardisation; verify case 1/22 on every form; no CSS/layout change |
| R4 | `FormField`'s error `<small>` has no `role="alert"`, so errors aren't announced | Certain (pre-existing) | Medium (a11y) | Optional P4: add `role="alert"` to the error `<small>` — additive, no visual change; requires approval to touch a shared primitive |
| R5 | `Radio` is not `register`-compatible (always renders `checked={false}`) | Latent | Medium when adopted | Do not use `register` with `Radio`; use `Controller`. `Radio` has no production usage today, so no current defect |
| R6 | `FileUpload` cannot receive `register` | Certain | Low (unused in production) | Phase P5 adapter; production file inputs are native `<input type="file">` wrapped by labels |
| R7 | `FpcBoardOfDirectorsForm` writes `photographName` / `identityDocName` via `setValue` on **unregistered** fields | Live | Medium | P3: convert to `Controller`. Until then, hidden-field persistence may be dropped by future `shouldUnregister` changes |
| R8 | `FpcLogoDocumentsForm` creates object URLs without `revokeObjectURL` | Live | Low (memory) | Add cleanup in P3 |
| R9 | Backend `errors` keys are PascalCase; naive mapping would silently miss every field | High if unhandled | High | `normalizeFieldName` + case-insensitive matching in `applyServerErrors`; test with real `VALIDATION_FAILED` responses (case 4) |
| R10 | Existing catches read `err.data.message`, which the problem envelope never contains | Certain | Medium | `applyServerErrors` reads `detail`/`title`/`errors` only; remove `message` fallbacks in migrated files |
| R11 | Removing the `isSubmitting` prop from steps 1–7 is a **prop-contract change** | Certain | Medium | All 7 call sites are in `FpcRegistrationPage` (already enumerated); TypeScript flags any missed site |
| R12 | `InviteFpcFormData` is imported by `OnboardNewFpcPage`; a new inferred type could break it | Medium | Medium | Re-export `InviteFpcFormData` as an alias of `InviteFpcFormValues`, or keep the interface and derive the schema to match it exactly |
| R13 | Tightening schemas (dates, numeric fields) silently rejects previously accepted input | Medium if bundled | High | Explicitly deferred to P4 and gated on separate approval |
| R14 | `FpcFinalReviewForm` submit is a bare `onClick`; double-click could double-submit before `isSubmitting` propagates | Low | Medium | Keep the page-level flag for step 8; add an early return guard in `handleFinalSubmit` |
| R15 | Hard-coded demo defaults ship in production forms (login credentials; two seeded directors in step 4) | Certain (pre-existing) | Medium (security/UX) | **Out of scope** — flagged for a separate decision; the migration must not silently change them (would alter behaviour) |
| R16 | `src/components/*` showcase code is dead but still typechecked; migrating it adds risk without benefit | — | Low | Excluded, documented in §8.6 |
| R17 | `InviteFpcModal` currently allows blank `nominatedAdmin` / `phoneNumber`; adding validation changes behaviour | Certain | Medium | Intended fix; call out in review. Backend already rejects these fields (`ValidationException` per field), so the client change merely surfaces existing rules earlier |
| R18 | Two different `ApiResponse<T>` shapes exist (`authApi` vs `fpcInvitationApi`) | Certain | Low | Preserve both; migration touches error paths only, never success contracts |

### Compatibility guarantees

- **API contracts:** unchanged. No URL, method, body, header, or success-type edits.
- **Persistence contracts:** `localStorage` keys and value shapes unchanged.
- **Visual contracts:** no Tailwind class, spacing, token, or component-structure changes; errors reuse `FormField`/`Alert`.
- **Business logic:** invitation flow, draft saving, step ordering, and completion semantics unchanged — except the two intentional defect fixes (silent step failures, false success on final failure), which must be called out in review.
- **Dependencies:** none added, none removed, none upgraded.

---

## 13. Approval Checklist

Please confirm before implementation begins:

1. **Approve the `src/shared/forms/` layer** (`useFpcForm`, `apiErrors`, `FormServerError`, barrel) as the single centralized handler — no parallel utilities.
2. **Approve `InviteFpcModal` full migration**, including new client-side validation for `nominatedAdmin`, `phoneNumber`, `state`, `district` (currently unchecked).
3. **Approve the two intentional behaviour fixes:** (a) onboarding steps now surface failures instead of `catch {}`; (b) final submit no longer shows success when the API fails.
4. **Approve `noValidate` on all forms**, accepting inline Zod errors in place of native browser tooltips.
5. **Approve that steps 1–7 stop receiving an `isSubmitting` prop** and use `formState.isSubmitting`.
6. **Confirm schema tightening (dates, numeric fields, lat/long) stays out of scope** for this migration (deferred to a separately approved P4).
7. **Confirm `src/components/*` showcase views and search/filter `useState` remain untouched.**
8. **Confirm the working tree will be committed/stashed first**, so the migration lands in clean, isolated commits.

---

### Appendix A — Evidence index (file:line)

- Duplicated form config: `src/pages/TsfAdminLoginPage.tsx:34`, `src/features/onboarding/components/FpcBasicDetailsForm.tsx:57`, `FpcLegalRegistrationForm.tsx:45`, `FpcFinancialInformationForm.tsx:62`, `FpcBoardOfDirectorsForm.tsx:64`, `FpcLogoDocumentsForm.tsx:51`, `FpcAddressLocationForm.tsx:70`, `FpcBusinessActivitiesForm.tsx:50`.
- No `Controller`/`FormProvider`/`setError`/`reset`: project-wide search returned zero matches.
- Manual form: `InviteFpcModal.tsx:48-50` (state), `:57-82` (manual `FormEvent` submit + ad-hoc validation), `:132-195` (six `value`/`onChange` pairs).
- Swallowed errors: `FpcRegistrationPage.tsx` empty `catch {` blocks at lines **75, 91, 107, 123, 139, 155, 171**; false success at `:187-189` (`setIsSubmitted(true)` inside `catch`).
- Backend envelope: `src/Fpc.Api/Middleware/GlobalExceptionMiddleware.cs:53-60` (validation branch), `src/Fpc.Application/Common/Models/ProblemDetailsResponse.cs:5-16`.
- PascalCase field keys: `src/Fpc.Infrastructure/Services/FpcInvitationService.cs:47-62`.
- Error rendering path: `src/shared/components/FormField.tsx:40-46` (`<small id="{id}-error">`), `src/shared/components/Input.tsx` (`aria-invalid` / `aria-describedby`).
- Loading primitive: `src/shared/components/Button.tsx` (`loading` / `isLoading` / `loadingText`).
- Toast facility available app-wide: `src/app/providers.tsx:15-17` + `src/shared/notifications/NotificationProvider.tsx:47-52`.

### Appendix B — `InviteFpcModal` target shape (illustrative, not applied)

```tsx
const { register, handleSubmit, control, reset, setError, formState: { errors, isSubmitting } } =
  useFpcForm<InviteFpcFormValues>({
    schema: inviteFpcSchema,
    defaultValues: { companyName: '', nominatedAdmin: '', email: '', phoneNumber: '', state: 'Odisha', district: 'Jajpur' },
  });

const onSubmit = handleSubmit(async (values) => {
  try {
    await onSubmitInvite?.(values);
    reset();
    onClose();
  } catch (error) {
    applyServerErrors(error, setError, { knownFields: INVITE_FIELDS });
  }
});
```

`InviteFpcModal` keeps its exact markup, `Modal` footer, `form="invite-fpc-form"` submit button, and `Cancel` behaviour; only the state source and the error surface change.
