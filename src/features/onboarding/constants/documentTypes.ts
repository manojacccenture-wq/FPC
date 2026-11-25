import type { LogoDocumentsFormValues } from '../schemas/logoDocuments.schema';
import type { BoardOfDirectorsFormValues } from '../schemas/boardOfDirectors.schema';

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
  MinutesOfMeeting: 'MinutesOfMeeting',
  ArticlesOfAssociation: 'ArticlesOfAssociation',
  MemorandumOfAssociation: 'MemorandumOfAssociation',
  RocStatutoryFiling: 'RocStatutoryFiling',
} as const;

export type CanonicalDocumentType =
  (typeof CANONICAL_DOCUMENT_TYPES)[keyof typeof CANONICAL_DOCUMENT_TYPES];

/**
 * Builds a deterministic document slot key for versioned statutory and director documents.
 * Exactly matches backend FpcDocumentTypes.BuildSlotKey.
 */
export function buildSlotKey(
  documentType: string,
  directorKey?: string | null,
  groupRef?: string | null
): string {
  const normType = documentType.trim();
  if (directorKey && directorKey.trim().length > 0) {
    return `dir:${directorKey.trim().toLowerCase()}:${normType}`;
  }
  if (groupRef && groupRef.trim().length > 0) {
    return `${normType}:${groupRef.trim().toLowerCase()}`;
  }
  return normType;
}

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
export const FIELD_BY_DOCUMENT_TYPE: Partial<Record<CanonicalDocumentType, keyof LogoDocumentsFormValues>> = {
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

/** Canonical backend types for the three identity documents every director provides. */
export const DIRECTOR_DOCUMENT_TYPES = {
  AadhaarCard: 'DirectorAadhaarCard',
  PanCard: 'DirectorPanCard',
  VoterId: 'DirectorVoterId',
} as const;

export type DirectorDocumentType =
  (typeof DIRECTOR_DOCUMENT_TYPES)[keyof typeof DIRECTOR_DOCUMENT_TYPES];

/** Form field keys that hold a director's document filename. */
export type DirectorDocumentNameField =
  | 'aadhaarDocName'
  | 'panDocName'
  | 'voterIdDocName';

/** Form field keys that hold the uploaded document identifier. */
export type DirectorDocumentIdField =
  | 'aadhaarDocumentId'
  | 'panDocumentId'
  | 'voterIdDocumentId';

export type DirectorFieldKey = keyof BoardOfDirectorsFormValues['directors'][number];

export interface DirectorIdentityDocumentConfig {
  key: DirectorDocumentNameField;
  idKey: DirectorDocumentIdField;
  documentType: DirectorDocumentType;
  label: string;
  uploadPrompt: string;
}

/** The three mandatory identity documents, rendered through one reusable slot component. */
export const DIRECTOR_IDENTITY_DOCUMENTS: readonly DirectorIdentityDocumentConfig[] = [
  {
    key: 'aadhaarDocName',
    idKey: 'aadhaarDocumentId',
    documentType: DIRECTOR_DOCUMENT_TYPES.AadhaarCard,
    label: 'Aadhaar Card',
    uploadPrompt: 'Upload Aadhaar Card',
  },
  {
    key: 'panDocName',
    idKey: 'panDocumentId',
    documentType: DIRECTOR_DOCUMENT_TYPES.PanCard,
    label: 'PAN Card',
    uploadPrompt: 'Upload PAN Card',
  },
  {
    key: 'voterIdDocName',
    idKey: 'voterIdDocumentId',
    documentType: DIRECTOR_DOCUMENT_TYPES.VoterId,
    label: 'Voter ID',
    uploadPrompt: 'Upload Voter ID',
  },
];

/** A file selected for one director identity-document slot. */
export interface DirectorDocumentUpload {
  directorKey: string;
  field: DirectorDocumentNameField;
  documentType: DirectorDocumentType;
  file: File;
}

/** Selected director files keyed by `${directorKey}:${field}`; never persisted. */
export type DirectorDocumentsFileMap = Record<string, DirectorDocumentUpload>;

export const directorUploadKey = (
  directorKey: string,
  field: DirectorDocumentNameField
): string => `${directorKey}:${field}`;

/** License fields whose document requires a statutory expiry date */
export const EXPIRY_FIELD_BY_FIELD: Partial<Record<keyof LogoDocumentsFormValues, keyof LogoDocumentsFormValues>> = {
  fssaiLicenseName: 'fssaiExpiryDate',
  seedLicenseName: 'seedLicenseExpiryDate',
  fertilizerLicenseName: 'fertilizerLicenseExpiryDate',
};

