import type { LogoDocumentsFormValues } from '../schemas/logoDocuments.schema';

/** Canonical document type strings accepted by backend FpcDocumentTypes */
export const CANONICAL_DOCUMENT_TYPES = {
  CompanyLogo: 'CompanyLogo',
  CertificateOfIncorporation: 'CertificateOfIncorporation',
  PanCard: 'PanCard',
  GstinCertificate: 'GstinCertificate',
  FssaiLicense: 'FssaiLicense',
  SeedLicense: 'SeedLicense',
  FertilizerLicense: 'FertilizerLicense',
  MoaAoa: 'MoaAoa',
  BoardResolution: 'BoardResolution',
} as const;

export type CanonicalDocumentType =
  (typeof CANONICAL_DOCUMENT_TYPES)[keyof typeof CANONICAL_DOCUMENT_TYPES];

/** Step-5 form field to backend canonical document type mapping */
export const DOCUMENT_TYPE_BY_FIELD: Record<keyof LogoDocumentsFormValues, CanonicalDocumentType | null> = {
  logoFileName: CANONICAL_DOCUMENT_TYPES.CompanyLogo,
  incorporationCertName: CANONICAL_DOCUMENT_TYPES.CertificateOfIncorporation,
  panCertName: CANONICAL_DOCUMENT_TYPES.PanCard,
  gstinCertName: CANONICAL_DOCUMENT_TYPES.GstinCertificate,
  fssaiLicenseName: CANONICAL_DOCUMENT_TYPES.FssaiLicense,
  fssaiExpiryDate: null,
  seedLicenseName: CANONICAL_DOCUMENT_TYPES.SeedLicense,
  seedLicenseExpiryDate: null,
  fertilizerLicenseName: CANONICAL_DOCUMENT_TYPES.FertilizerLicense,
  fertilizerLicenseExpiryDate: null,
  moaAoaDocName: CANONICAL_DOCUMENT_TYPES.MoaAoa,
  boardResolutionDocName: CANONICAL_DOCUMENT_TYPES.BoardResolution,
};

/** Reverse lookup: Canonical document type to form field key */
export const FIELD_BY_DOCUMENT_TYPE: Record<CanonicalDocumentType, keyof LogoDocumentsFormValues> = {
  CompanyLogo: 'logoFileName',
  CertificateOfIncorporation: 'incorporationCertName',
  PanCard: 'panCertName',
  GstinCertificate: 'gstinCertName',
  FssaiLicense: 'fssaiLicenseName',
  SeedLicense: 'seedLicenseName',
  FertilizerLicense: 'fertilizerLicenseName',
  MoaAoa: 'moaAoaDocName',
  BoardResolution: 'boardResolutionDocName',
};

/** License fields whose document requires a statutory expiry date */
export const EXPIRY_FIELD_BY_FIELD: Partial<Record<keyof LogoDocumentsFormValues, keyof LogoDocumentsFormValues>> = {
  fssaiLicenseName: 'fssaiExpiryDate',
  seedLicenseName: 'seedLicenseExpiryDate',
  fertilizerLicenseName: 'fertilizerLicenseExpiryDate',
};

