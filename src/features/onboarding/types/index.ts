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
  accountType: string;
}

export interface FpcFinancialInformationFormData {
  authorizedCapital: string;
  paidUpCapital: string;
  faceValuePerShare: string;
  annualTurnover: string;
  financialYear: string;
  farmers: string;
  shareholders: string;
  employees: string;
  bankAccounts: FpcBankAccount[];
}

export interface FpcDirector {
  id: string;
  fullName: string;
  din: string;
  designation: string;
  gender: string;
  appointmentDate: string;
  mobileNumber: string;
  email?: string;
  pan: string;
  socialCategory?: string;
  activeStatus: string;
  photographName?: string;
  identityDocName?: string;
}

export interface FpcBoardOfDirectorsFormData {
  directors: FpcDirector[];
}

export interface FpcLogoDocumentsFormData {
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
  latitude?: string;
  longitude?: string;
}

export interface FpcBusinessActivitiesFormData {
  primaryActivity: string[] | string;
  operationalStatus: string;
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
