export interface FpcInvitation {
  token: string;
  companyName: string;
  nominatedAdmin: string;
  email: string;
  phoneNumber: string;
  state: string;
  district: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
}

export interface FpcBasicDetailsFormData {
  legalName: string;
  cin: string;
  registrationNumber: string;
  rocOffice: string;
  dateOfIncorporation: string;
  companyCategory: string;
  farmers: string;
  employees: string;
  contactEmail: string;
  contactMobile: string;
  website?: string;
}

export interface FpcOperatingLicense {
  id: string;
  licenseType: string;
  licenseNumber: string;
  issuingAuthority: string;
}

export interface FpcLegalRegistrationFormData {
  companyPan: string;
  companyTan: string;
  gstin: string;
  fssaiLicense: string;
  seedLicense: string;
  fertilizerLicense: string;
  additionalLicenses: FpcOperatingLicense[];
}

export interface FpcBankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  /** Optional: pre-filled from the IFSC lookup when available, always editable. */
  bankAddress: string;
  accountType: string;
}

export interface FpcOtherIncomeSource {
  id: string;
  organization: string;
  financialYear: string;
  scheme: string;
  totalAmount: string;
}

export interface FpcTurnoverRecord {
  financialYear: string;
  turnover?: string;
}

export interface FpcFinancialInformationFormData {
  authorizedCapital: string;
  paidUpCapital: string;
  faceValuePerShare: string;
  /** Legacy single financial year turnover; retained for backwards compatibility */
  annualTurnover?: string;
  /** Legacy single financial year label; retained for backwards compatibility */
  financialYear?: string;
  /** Multi-year turnover history for the last 5 financial years */
  turnoverHistory?: FpcTurnoverRecord[];
  shareholders: string;
  totalEquitySharesAllotted: string;
  bankAccounts: FpcBankAccount[];
  otherIncomeSources: FpcOtherIncomeSource[];
}

export interface FpcDirector {
  id: string;
  /** Stable identity used to associate identity documents with this director. */
  directorKey: string;
  fullName: string;
  din: string;
  designation: string;
  gender: string;
  appointmentDate: string;
  dateOfBirth?: string;
  mobileNumber: string;
  email?: string;
  pan: string;
  socialCategory?: string;
  activeStatus: string;
  photographName?: string;
  /** Legacy single identity document; kept so saved drafts remain readable. */
  identityDocName?: string;
  aadhaarDocName?: string;
  aadhaarDocumentId?: string;
  panDocName?: string;
  panDocumentId?: string;
  voterIdDocName?: string;
  voterIdDocumentId?: string;
}

export interface FpcBoardOfDirectorsFormData {
  directors: FpcDirector[];
}

export interface FpcLogoDocumentsFormData {
  /** Upload endpoint document IDs keyed by step-5 field name. Never stores File objects. */
  documentIds?: Record<string, string>;
  logoFileName?: string;
  incorporationCertName?: string;
  panCertName?: string;
  gstinCertName?: string;
  fssaiLicenseName?: string;
  fssaiExpiryDate?: string;
  seedLicenseName?: string;
  seedLicenseExpiryDate?: string;
  fertilizerLicenseName?: string;
  fertilizerLicenseExpiryDate?: string;
  moaAoaDocName?: string;
  boardResolutionDocName?: string;
}

export interface FpcAddressLocationFormData {
  streetAddress: string;
  state: string;
  district: string;
  block: string;
  gramPanchayat: string;
  village: string;
  pinCode: string;
  officeMobile: string;
  officialEmail: string;
  latitude: string;
  longitude: string;
  /** Which source produced the coordinates: 'gps' | 'geocoding' | 'manual'. */
  coordinateSource?: 'gps' | 'geocoding' | 'manual' | '';
  /** Set when the user confirmed device coordinates are the registered office. */
  coordinatesConfirmed?: boolean;
}

export interface FpcBusinessActivitiesFormData {
  primaryActivity: string[] | string;
  commencementDate: string;
  commoditiesHandled: string[] | string;
  targetFarmers: string;
  villagesCovered: string;
  activityScope: string;
}

export interface OnboardingWizardStep {
  number: number;
  id: string;
  label: string;
  status: 'active' | 'completed' | 'upcoming';
}

export interface StepFormHandle<T = any, F = any> {
  getDraftValues: () => T;
  getDraftFiles?: () => F;
}

export interface ActiveStepDraftData {
  values: any;
  files?: any;
}

