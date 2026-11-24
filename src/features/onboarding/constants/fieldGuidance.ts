import type { FieldGuidance } from '../../../shared/types/fieldGuidance.types';
import type { BasicDetailsFormValues } from '../schemas/basicDetails.schema';
import type { LegalRegistrationFormValues } from '../schemas/legalRegistration.schema';
import type { FinancialInformationFormValues } from '../schemas/financialInformation.schema';
import type { BoardOfDirectorsFormValues } from '../schemas/boardOfDirectors.schema';
import type { LogoDocumentsFormValues } from '../schemas/logoDocuments.schema';
import type { AddressLocationFormValues } from '../schemas/addressLocation.schema';
import type { BusinessActivitiesFormValues } from '../schemas/businessActivities.schema';

/**
 * Centralized guidance for every data-entry field in the FPC onboarding wizard.
 *
 * Rules followed when writing this content:
 * - Format and length statements mirror `src/shared/validation/schemas.ts` exactly.
 * - Document formats and size ceilings mirror the backend upload policy
 *   (`FileUploadPolicy`: PDF documents up to 5 MB, images up to 2 MB).
 * - Nothing here is invented: when the codebase does not enforce a rule, the text
 *   describes what to enter rather than claiming a requirement.
 *
 * Component code only passes a lookup (`basicDetailsGuidance.cin`); no guidance prose
 * lives inside a form component.
 */

type DirectorGuidanceKey = Exclude<keyof BoardOfDirectorsFormValues['directors'][number], 'id'>;
type BankAccountGuidanceKey = Exclude<
  keyof FinancialInformationFormValues['bankAccounts'][number],
  'id'
>;
type AdditionalLicenseGuidanceKey = Exclude<
  keyof LegalRegistrationFormValues['additionalLicenses'][number],
  'id'
>;

/** Step 1 — Basic company details */
export const basicDetailsGuidance: Record<keyof BasicDetailsFormValues, FieldGuidance> = {
  legalName: {
    description: 'The full registered name of the Farmer Producer Company.',
    purpose:
      'Identifies the FPC on every membership, procurement and payment record held by Tata Steel Foundation.',
    expectedFormat:
      'At least 3 characters, exactly as printed on the Certificate of Incorporation, including the “Producer Company Limited” suffix.',
    example: 'Sundargarh Farmers Producer Company Limited',
  },
  cin: {
    description: 'The Corporate Identity Number (CIN) allotted by the Registrar of Companies.',
    purpose:
      'Verifies the company against MCA records and links this onboarding to the correct ROC registration.',
    expectedFormat:
      'Exactly 21 characters: L or U, then 5 digits, 2 state letters, the 4-digit year of incorporation, 3 letters and 6 digits.',
    example: 'U01100OD2026PTC000001',
  },
  registrationNumber: {
    description: 'The registration number printed on the incorporation certificate.',
    purpose: 'The reference the TSF review team matches against the incorporation certificate.',
    expectedFormat: 'Exactly as printed on the certificate, including any letter prefixes.',
    example: 'PTC-000001',
  },
  rocOffice: {
    description: 'The Registrar of Companies office that registered the FPC.',
    purpose: 'Identifies the jurisdictional ROC that maintains the company’s statutory filings.',
    expectedFormat: 'Select the ROC shown on the Certificate of Incorporation.',
    example: 'ROC Cuttack',
  },
  dateOfIncorporation: {
    description: 'The date the Registrar of Companies issued the certificate of incorporation.',
    purpose: 'Establishes the legal age of the company for statutory and eligibility records.',
    expectedFormat: 'DD-MM-YYYY, and it cannot be a future date.',
    example: '12-08-2021',
  },
  companyCategory: {
    description: 'The company category recorded in the Memorandum of Association.',
    purpose: 'Determines which producer-company rules apply to the FPC.',
    expectedFormat: 'Select the category stated in the MOA / AOA.',
    example: 'Producer Company Limited',
  },
  contactEmail: {
    description: 'The official email address registered with the FPC.',
    purpose:
      'All onboarding correspondence and approval notifications are sent here, so it is pre-filled from your TSF invitation.',
    expectedFormat: 'A valid email address. Read-only — contact your TSF administrator to change it.',
    example: 'info@sundargarhfpc.co.in',
  },
  contactMobile: {
    description: 'The official mobile number of the FPC.',
    purpose:
      'Used for onboarding follow-ups and OTP-based verification, so it is pre-filled from your TSF invitation.',
    expectedFormat:
      '10 digits starting with 6, 7, 8 or 9. A +91 prefix is accepted. Read-only — contact your TSF administrator to change it.',
    example: '+919876543210',
  },
  website: {
    description: 'The public website of the FPC, if one exists.',
    purpose: 'Shared with buyers and shown on the FPC profile.',
    expectedFormat:
      'Optional. A valid http:// or https:// address; the scheme is added automatically when omitted.',
    example: 'https://sundargarhfpc.co.in',
  },
};

/** Step 2 — Legal & registration identifiers */
export const legalRegistrationGuidance: Record<
  Exclude<keyof LegalRegistrationFormValues, 'additionalLicenses'>,
  FieldGuidance
> = {
  companyPan: {
    description: 'The Permanent Account Number issued to the company.',
    purpose: 'Income-tax identity used on invoices, TDS records and statutory reporting.',
    expectedFormat: '10 characters: 5 letters, 4 digits and 1 letter. Use the company PAN, not a director’s PAN.',
    example: 'AAACS1234F',
  },
  companyTan: {
    description: 'The Tax Deduction and Collection Account Number issued to the FPC.',
    purpose: 'Required wherever the FPC deducts or reports TDS on procurement payments.',
    expectedFormat: '10 characters: 4 letters, 5 digits and 1 letter.',
    example: 'JSRC12345B',
  },
  gstin: {
    description: 'The Goods and Services Tax Identification Number of the FPC.',
    purpose: 'Used to raise GST-compliant invoices and reconcile procurement transactions.',
    expectedFormat:
      'Exactly 15 characters: 2-digit state code, 10-character PAN, entity code, the letter Z and a checksum character.',
    example: '21AAACS1234F1Z5',
  },
  fssaiLicense: {
    description: 'The 14-digit FSSAI licence number held by the FPC.',
    purpose: 'Confirms the FPC is authorised to handle the food commodities it trades.',
    expectedFormat: 'Exactly 14 digits, without spaces or hyphens.',
    example: '12123456789012',
  },
  seedLicense: {
    description: 'The seed licence number issued to the FPC.',
    purpose: 'Records the FPC’s authorisation to produce or distribute seed.',
    expectedFormat: 'The licence number exactly as printed on the licence.',
    example: 'SL/OD/2021/00123',
  },
  fertilizerLicense: {
    description: 'The fertilizer licence number issued to the FPC.',
    purpose: 'Records the FPC’s authorisation to retail or wholesale fertilizer.',
    expectedFormat: 'The licence number exactly as printed on the licence.',
    example: 'FL/OD/2021/00456',
  },
};

/** Step 2 — Repeatable additional licence rows */
export const additionalLicenseGuidance: Record<AdditionalLicenseGuidanceKey, FieldGuidance> = {
  licenseType: {
    description: 'The type of operating licence being recorded.',
    purpose: 'Groups additional permits so reviewers can see the full compliance profile.',
    expectedFormat: 'Select the listed type that matches the licence; use “Other Operating License” when none applies.',
  },
  licenseNumber: {
    description: 'The number of this additional licence.',
    purpose: 'Lets the reviewer trace the permit back to the issuing authority.',
    expectedFormat: 'Exactly as printed on the licence, including slashes and prefixes.',
    example: 'APMC/OD/2022/789',
  },
  issuingAuthority: {
    description: 'The department or board that issued this licence.',
    purpose: 'Identifies who can verify the licence when TSF reviews it.',
    expectedFormat: 'The authority named on the licence document.',
    example: 'Odisha State Agricultural Marketing Board',
  },
};

/** Step 3 — Financial information */
export const financialInformationGuidance: Record<
  Exclude<keyof FinancialInformationFormValues, 'bankAccounts'>,
  FieldGuidance
> = {
  authorizedCapital: {
    description: 'The maximum share capital the company is authorised to issue.',
    purpose: 'Compared against the MOA to confirm the capital structure of the FPC.',
    expectedFormat: 'The amount in Indian rupees as stated in the MOA.',
    example: '10,00,000',
  },
  paidUpCapital: {
    description: 'The share capital actually subscribed and paid by the members.',
    purpose: 'Drives the equity share count shown below and confirms member contribution.',
    expectedFormat: 'The amount in Indian rupees as per the latest audited records.',
    example: '6,00,000',
  },
  faceValuePerShare: {
    description: 'The nominal value of one equity share.',
    purpose: 'The equity share count is calculated by dividing paid-up capital by this value.',
    expectedFormat: 'The per-share value in Indian rupees.',
    example: '100',
  },
  annualTurnover: {
    description: 'The annual turnover of the FPC for the selected financial year.',
    purpose: 'Indicates the scale of operations for review and reporting.',
    expectedFormat: 'The turnover in Indian rupees for the financial year selected alongside.',
    example: '42,50,000',
  },
  financialYear: {
    description: 'The financial year the turnover figure belongs to.',
    purpose: 'Ensures turnover is compared against the correct reporting period.',
    expectedFormat: 'Select the completed financial year being reported.',
    example: '2024-25',
  },
  farmers: {
    description: 'The number of farmer members associated with the FPC.',
    purpose: 'Measures farmer participation, which is central to the producer-company model.',
    expectedFormat: 'A whole number.',
    example: '250',
  },
  shareholders: {
    description: 'The number of shareholders of the company.',
    purpose: 'Used to reconcile membership against the paid-up capital recorded above.',
    expectedFormat: 'A whole number.',
    example: '250',
  },
  employees: {
    description: 'The number of people employed by the FPC.',
    purpose: 'Records the operating capacity of the company.',
    expectedFormat: 'A whole number, including field and office staff.',
    example: '12',
  },
  totalEquitySharesAllotted: {
    description: 'The total number of equity shares allotted to shareholders.',
    purpose:
      'Records the issued share capital in shares, alongside the paid-up capital and face value entered above.',
    expectedFormat: 'A whole number greater than zero, as shown in the share allotment records.',
    example: '6000',
  },
};

/** Step 3 — Repeatable bank account rows */
export const bankAccountGuidance: Record<BankAccountGuidanceKey, FieldGuidance> = {
  bankName: {
    description: 'The bank where the FPC holds this account.',
    purpose: 'The first account listed is used as the primary account for procurement settlements.',
    expectedFormat: 'Select the bank from the list.',
    example: 'State Bank of India',
  },
  accountNumber: {
    description: 'The bank account number of the FPC.',
    purpose: 'Where TSF disburses payments, so it must match the passbook exactly.',
    expectedFormat: 'Between 9 and 18 digits. These are digits only, without spaces or hyphens.',
    example: '30214567890',
  },
  ifscCode: {
    description: 'The IFSC code of the branch holding the account.',
    purpose: 'Used to route electronic payments to the correct branch.',
    expectedFormat: 'Exactly 11 characters: 4 letters, a 0 and 6 letters or digits.',
    example: 'SBIN0001234',
  },
  branchName: {
    description: 'The branch where the account is maintained.',
    purpose: 'Helps verify the account when a payment fails.',
    expectedFormat: 'The branch name as printed in the passbook.',
    example: 'Rourkela Main Branch',
  },
  accountType: {
    description: 'The type of bank account.',
    purpose: 'Records how the account is held, which affects settlement processing.',
    expectedFormat: 'Select the type shown in the passbook or statement.',
    example: 'Current Account',
  },
};

/** Step 4 — Board of directors (applies to every director row) */
export const directorGuidance: Record<DirectorGuidanceKey, FieldGuidance> = {
  fullName: {
    description: 'The director’s full name.',
    purpose: 'Identifies the person authorised to act for the FPC.',
    expectedFormat: 'Name exactly as it appears on the PAN and DIN records.',
    example: 'Ramesh Kumar Mohanty',
  },
  din: {
    description: 'The Director Identification Number issued by the MCA.',
    purpose: 'Confirms the director is registered with the Ministry of Corporate Affairs.',
    expectedFormat: 'Exactly 8 digits.',
    example: '01234567',
  },
  designation: {
    description: 'The director’s role on the board.',
    purpose: 'Structures the board and identifies who may sign on behalf of the FPC.',
    expectedFormat: 'Select the designation recorded in the board resolution.',
    example: 'Managing Director',
  },
  gender: {
    description: 'The director’s gender.',
    purpose: 'Recorded for statutory board-composition reporting.',
    expectedFormat: 'Select from the list.',
    example: 'Female',
  },
  appointmentDate: {
    description: 'The date the director was appointed to the board.',
    purpose: 'Records tenure for governance and compliance checks.',
    expectedFormat: 'DD-MM-YYYY, the date of the board or shareholder resolution appointing the director.',
    example: '15-06-2022',
  },
  mobileNumber: {
    description: 'The director’s mobile number.',
    purpose: 'Used to contact the director during verification.',
    expectedFormat: '10 digits starting with 6, 7, 8 or 9. A +91 prefix is accepted.',
    example: '+919876543210',
  },
  email: {
    description: 'The director’s email address.',
    purpose: 'Optional contact channel for board communication.',
    expectedFormat: 'Optional. A valid email address.',
    example: 'ramesh.mohanty@example.com',
  },
  pan: {
    description: 'The director’s personal Permanent Account Number.',
    purpose: 'Links the director to their DIN and tax records.',
    expectedFormat: '10 characters: 5 letters, 4 digits and 1 letter. Use the personal PAN, not the company PAN.',
    example: 'ABCPM1234K',
  },
  socialCategory: {
    description: 'The director’s social category.',
    purpose: 'Optional; supports inclusion reporting for the board.',
    expectedFormat: 'Optional. Select the applicable category, or leave blank if not provided.',
  },
  activeStatus: {
    description: 'Whether the director is currently active on the board.',
    purpose: 'Distinguishes current directors from those who have left the board.',
    expectedFormat: 'Select Active for serving directors.',
    example: 'Active',
  },
  photographName: {
    description: 'A recent photograph of the director.',
    purpose: 'Used on the FPC’s board records for identification.',
    expectedFormat: 'A clear passport-style photograph. Images up to 2 MB, or a PDF up to 5 MB.',
    documentRequirement: 'Attach the director’s recent photograph.',
    acceptedFormats: ['PNG up to 2 MB', 'JPG up to 2 MB', 'WebP up to 2 MB', 'PDF up to 5 MB'],
  },
  identityDocName: {
    description: 'Proof of the director’s identity.',
    purpose: 'Verifies the identity of every person recorded on the board.',
    expectedFormat: 'An Aadhaar or PAN copy. Images up to 2 MB, or a PDF up to 5 MB.',
    documentRequirement: 'Attach a copy of the director’s Aadhaar or PAN.',
    acceptedFormats: ['PNG up to 2 MB', 'JPG up to 2 MB', 'WebP up to 2 MB', 'PDF up to 5 MB'],
  },
};

/** Step 5 — Logo and statutory documents */
export const logoDocumentsGuidance: Record<keyof LogoDocumentsFormValues, FieldGuidance> = {
  logoFileName: {
    description: 'The FPC’s official logo.',
    purpose: 'Displayed on the FPC profile and shared reports.',
    documentRequirement: 'Attach the official company logo. This upload is optional.',
    acceptedFormats: ['PNG up to 2 MB', 'JPG up to 2 MB', 'WebP up to 2 MB'],
  },
  incorporationCertName: {
    description: 'The Certificate of Incorporation issued by the Registrar of Companies.',
    purpose: 'Proves the company is legally registered; it is checked against the CIN in Step 1.',
    documentRequirement: 'Attach the ROC incorporation certificate. Upload it if you have it.',
    acceptedFormats: ['PDF up to 5 MB'],
  },
  panCertName: {
    description: 'The company PAN certificate or PAN card.',
    purpose: 'Confirms the company PAN entered in Step 2.',
    documentRequirement: 'Attach the company PAN document.',
    acceptedFormats: ['PDF up to 5 MB'],
  },
  gstinCertName: {
    description: 'The GST registration certificate.',
    purpose: 'Confirms the GSTIN entered in Step 2.',
    documentRequirement: 'Attach the GST registration certificate.',
    acceptedFormats: ['PDF up to 5 MB'],
  },
  fssaiLicenseName: {
    description: 'The FSSAI food safety licence.',
    purpose: 'Confirms the FSSAI number entered in Step 2 and its validity.',
    documentRequirement: 'Attach the FSSAI licence, then enter its expiry date below.',
    acceptedFormats: ['PDF up to 5 MB'],
  },
  fssaiExpiryDate: {
    description: 'The expiry date printed on the FSSAI licence.',
    purpose: 'Required whenever an FSSAI licence is attached, so reviewers can see it is current.',
    expectedFormat: 'DD-MM-YYYY, today or later.',
    example: '31-03-2027',
  },
  seedLicenseName: {
    description: 'The seed production or distribution licence.',
    purpose: 'Confirms the seed licence number entered in Step 2.',
    documentRequirement: 'Attach the seed licence, then enter its expiry date below.',
    acceptedFormats: ['PDF up to 5 MB'],
  },
  seedLicenseExpiryDate: {
    description: 'The expiry date printed on the seed licence.',
    purpose: 'Required whenever a seed licence is attached.',
    expectedFormat: 'DD-MM-YYYY, today or later.',
    example: '31-03-2027',
  },
  fertilizerLicenseName: {
    description: 'The fertilizer retail or wholesale licence.',
    purpose: 'Confirms the fertilizer licence number entered in Step 2.',
    documentRequirement: 'Attach the fertilizer licence, then enter its expiry date below.',
    acceptedFormats: ['PDF up to 5 MB'],
  },
  fertilizerLicenseExpiryDate: {
    description: 'The expiry date printed on the fertilizer licence.',
    purpose: 'Required whenever a fertilizer licence is attached.',
    expectedFormat: 'DD-MM-YYYY, today or later.',
    example: '31-03-2027',
  },
  moaAoaDocName: {
    description: 'The Memorandum and Articles of Association filed with the ROC.',
    purpose: 'Defines the FPC’s objects and internal rules, including its capital structure.',
    documentRequirement: 'Attach the MOA and AOA documents.',
    acceptedFormats: ['PDF up to 5 MB'],
  },
  boardResolutionDocName: {
    description: 'The board resolution authorising this onboarding.',
    purpose: 'Shows that the person completing the registration is authorised by the board.',
    documentRequirement: 'Attach the board resolution or supporting authorisation document.',
    acceptedFormats: ['PDF up to 5 MB'],
  },
};

/** Step 6 — Registered office and location */
export const addressLocationGuidance: Record<
  Exclude<keyof AddressLocationFormValues, 'coordinateSource' | 'coordinatesConfirmed'>,
  FieldGuidance
> = {
  streetAddress: {
    description: 'The street address of the FPC’s registered office.',
    purpose: 'The official address of record, used for correspondence and compliance.',
    expectedFormat: 'Building or plot, street, area and landmark, as in the incorporation documents.',
    example: 'Plot 14, Civil Township Road, Near Bus Stand',
  },
  state: {
    description: 'The state where the registered office is located.',
    purpose: 'Determines the district and block options and the applicable state reporting.',
    expectedFormat: 'Select the state of the registered office.',
    example: 'Odisha',
  },
  district: {
    description: 'The district of the registered office.',
    purpose: 'Places the FPC within the correct administrative district.',
    expectedFormat: 'Select the district; options depend on the state chosen above.',
    example: 'Sundargarh',
  },
  block: {
    description: 'The administrative block of the registered office.',
    purpose: 'Narrows the location for field-level coordination.',
    expectedFormat: 'Select the block; options depend on the district chosen above.',
    example: 'Tangarpali',
  },
  gramPanchayat: {
    description: 'The Gram Panchayat covering the registered office.',
    purpose: 'Identifies the local governance unit the FPC operates under.',
    expectedFormat: 'Select the Gram Panchayat; options depend on the block chosen above.',
    example: 'Balisankara',
  },
  village: {
    description: 'The village where the registered office is located.',
    purpose: 'Pinpoints the operating location for field teams.',
    expectedFormat: 'Select the village; options depend on the Gram Panchayat chosen above.',
    example: 'Balisankara',
  },
  pinCode: {
    description: 'The postal PIN code of the registered office.',
    purpose: 'Used for postal correspondence and location validation.',
    expectedFormat: 'Exactly 6 digits; the first digit cannot be 0.',
    example: '770001',
  },
  officeMobile: {
    description: 'The mobile number of the FPC office.',
    purpose: 'Operational contact for day-to-day coordination.',
    expectedFormat: '10 digits starting with 6, 7, 8 or 9. A +91 prefix is accepted.',
    example: '+919876543211',
  },
  officialEmail: {
    description: 'The official email address of the FPC office.',
    purpose: 'Operational contact used for onboarding and procurement communication.',
    expectedFormat: 'A valid email address.',
    example: 'office@sundargarhfpc.co.in',
  },
  latitude: {
    description: 'The latitude of the registered office.',
    purpose: 'Optional; helps field teams locate the office precisely.',
    expectedFormat:
      'Optional. Decimal degrees between -90 and 90. Can be filled from your device location or the entered address; device coordinates are your current position, so confirm they match the registered office.',
    example: '22.2604',
  },
  longitude: {
    description: 'The longitude of the registered office.',
    purpose: 'Optional; helps field teams locate the office precisely.',
    expectedFormat:
      'Optional. Decimal degrees between -180 and 180. Enter both latitude and longitude, or leave both blank.',
    example: '84.8536',
  },
};

/** Step 7 — Business activities */
export const businessActivitiesGuidance: Record<keyof BusinessActivitiesFormValues, FieldGuidance> = {
  primaryActivity: {
    description: 'The main business activities of the FPC.',
    purpose: 'Defines how the FPC operates and which procurement categories it can be mapped to.',
    expectedFormat: 'Select at least one activity; select every activity the FPC actually performs.',
    example: 'Input Supply, Procurement & Aggregation',
  },
  operationalStatus: {
    description: 'The current operating stage of the FPC.',
    purpose: 'Tells reviewers whether the FPC is already trading or still being set up.',
    expectedFormat: 'Select the stage that matches the FPC today.',
    example: 'Operational',
  },
  commencementDate: {
    description: 'The date the FPC began business operations.',
    purpose: 'Records the start of operations for eligibility and reporting.',
    expectedFormat: 'DD-MM-YYYY, on or before today for an operating FPC.',
    example: '01-04-2022',
  },
  commoditiesHandled: {
    description: 'The commodities the FPC procures, processes or markets.',
    purpose: 'Drives aggregation planning and commodity-level reporting.',
    expectedFormat: 'Select at least one commodity; use the search box to find them quickly.',
    example: 'Paddy, Maize, Turmeric',
  },
  targetFarmers: {
    description: 'The number of farmers the FPC plans to enrol.',
    purpose: 'Used to plan farmer outreach and aggregation capacity.',
    expectedFormat: 'A whole number.',
    example: '500',
  },
  villagesCovered: {
    description: 'The number of villages in the FPC’s operational area.',
    purpose: 'Shows the geographic reach of the FPC.',
    expectedFormat: 'A whole number.',
    example: '25',
  },
  activityScope: {
    description: 'A short description of the FPC’s operational scope.',
    purpose: 'Gives reviewers context that the structured fields cannot capture.',
    expectedFormat: 'One or two sentences covering procurement, processing and marketing scope.',
    example:
      'Procurement of paddy and maize from member farmers, primary processing, and bulk marketing to institutional buyers.',
  },
};

/**
 * Stable, step-scoped index. Step components import only the slice they need, and
 * every entry keeps a stable identity for `InfoTooltip` memoization.
 */
export const FPC_FIELD_GUIDANCE = {
  step1: basicDetailsGuidance,
  step2: legalRegistrationGuidance,
  step3: financialInformationGuidance,
  step4: directorGuidance,
  step5: logoDocumentsGuidance,
  step6: addressLocationGuidance,
  step7: businessActivitiesGuidance,
} as const;

export const ADDITIONAL_LICENSE_GUIDANCE = additionalLicenseGuidance;
export const BANK_ACCOUNT_GUIDANCE = bankAccountGuidance;

export type FpcGuidanceStep = keyof typeof FPC_FIELD_GUIDANCE;

/** Flattened `step.field` index, useful for tests or generic consumers. */
export const FPC_FIELD_GUIDANCE_BY_ID: Record<string, FieldGuidance> = Object.entries(
  FPC_FIELD_GUIDANCE
).reduce<Record<string, FieldGuidance>>((acc, [step, fields]) => {
  Object.entries(fields).forEach(([field, guidance]) => {
    acc[`${step}.${field}`] = guidance;
  });
  return acc;
}, {});
