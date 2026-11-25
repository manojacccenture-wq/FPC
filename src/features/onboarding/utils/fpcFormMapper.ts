import type { FpcDetailsDto } from '../../fpc/api/fpcApi';
import type { FpcLogoDocumentsFormData } from '../types';
import type { BasicDetailsFormValues } from '../schemas/basicDetails.schema';
import type { LegalRegistrationFormValues } from '../schemas/legalRegistration.schema';
import type { FinancialInformationFormValues } from '../schemas/financialInformation.schema';
import type { BoardOfDirectorsFormValues } from '../schemas/boardOfDirectors.schema';
import type { AddressLocationFormValues } from '../schemas/addressLocation.schema';
import type { BusinessActivitiesFormValues } from '../schemas/businessActivities.schema';
import { getLastCompletedFinancialYears } from '../../../shared/utils/financialYear';

export interface RegistrationStepDrafts {
  step1: Partial<BasicDetailsFormValues> | null;
  step2: Partial<LegalRegistrationFormValues> | null;
  step3: Partial<FinancialInformationFormValues> | null;
  step4: Partial<BoardOfDirectorsFormValues> | null;
  step5: Partial<FpcLogoDocumentsFormData> | null;
  step6: Partial<AddressLocationFormValues> | null;
  step7: Partial<BusinessActivitiesFormValues> | null;
}

/** Headcount values as persisted by Step 3 drafts created before the Step 1 relocation. */
export interface LegacyHeadcountDraft {
  farmers?: string;
  employees?: string;
}

function readHeadcounts(source: object | null | undefined): Required<LegacyHeadcountDraft> {
  const legacy = (source ?? {}) as Partial<LegacyHeadcountDraft>;
  return {
    farmers: typeof legacy.farmers === 'string' ? legacy.farmers : '',
    employees: typeof legacy.employees === 'string' ? legacy.employees : '',
  };
}

/**
 * Carries headcount values saved by pre-relocation Step 3 drafts into Step 1.
 * A value already captured in Step 1 always wins, so nothing is overwritten.
 */
export function withLegacyHeadcounts(
  step1: Partial<BasicDetailsFormValues> | null | undefined,
  step3: object | null | undefined
): Partial<BasicDetailsFormValues> {
  const legacy = readHeadcounts(step3);
  return {
    ...(step1 ?? {}),
    farmers: step1?.farmers || legacy.farmers,
    employees: step1?.employees || legacy.employees,
  };
}

export interface InvitationLike {
  companyName?: string;
  email?: string;
  phoneNumber?: string;
  state?: string;
  district?: string;
}

/**
 * Safely parses the stored JSONB registration data or maps relational database fields
 * into all 8 step forms with zero loss of fields or fidelity.
 */
export function mapFpcToRegistrationDrafts(
  fpcDetails?: FpcDetailsDto | null,
  invitation?: InvitationLike | null,
  localDrafts?: Partial<RegistrationStepDrafts> | null
): RegistrationStepDrafts {
  // 1. If raw registration_data JSONB was persisted on the FPC master record, parse it
  let parsedJsonb: Partial<RegistrationStepDrafts> | null = null;
  if (fpcDetails?.registrationDataJson) {
    try {
      parsedJsonb = typeof fpcDetails.registrationDataJson === 'string'
        ? JSON.parse(fpcDetails.registrationDataJson)
        : fpcDetails.registrationDataJson;
    } catch (err) {
      console.warn('Failed to parse registrationDataJson', err);
    }
  }

  // 2. Map Step 1: Basic Company Details
  const step1: Partial<BasicDetailsFormValues> = {
    legalName:
      parsedJsonb?.step1?.legalName ||
      localDrafts?.step1?.legalName ||
      fpcDetails?.name ||
      invitation?.companyName ||
      '',
    cin:
      parsedJsonb?.step1?.cin ||
      localDrafts?.step1?.cin ||
      fpcDetails?.cin ||
      '',
    registrationNumber:
      parsedJsonb?.step1?.registrationNumber ||
      localDrafts?.step1?.registrationNumber ||
      fpcDetails?.code ||
      fpcDetails?.cin ||
      '',
    rocOffice:
      parsedJsonb?.step1?.rocOffice ||
      localDrafts?.step1?.rocOffice ||
      (fpcDetails?.state === 'Odisha' ? 'ROC Cuttack' : fpcDetails?.state ? `ROC ${fpcDetails.state}` : 'ROC Cuttack'),
    dateOfIncorporation:
      parsedJsonb?.step1?.dateOfIncorporation ||
      localDrafts?.step1?.dateOfIncorporation ||
      fpcDetails?.registrationDate ||
      '',
    companyCategory:
      parsedJsonb?.step1?.companyCategory ||
      localDrafts?.step1?.companyCategory ||
      'Producer Company under Section 378A of CA 2013',
    farmers:
      parsedJsonb?.step1?.farmers ||
      localDrafts?.step1?.farmers ||
      readHeadcounts(parsedJsonb?.step3).farmers ||
      readHeadcounts(localDrafts?.step3).farmers ||
      (fpcDetails?.farmersCount ? String(fpcDetails.farmersCount) : ''),
    employees:
      parsedJsonb?.step1?.employees ||
      localDrafts?.step1?.employees ||
      readHeadcounts(parsedJsonb?.step3).employees ||
      readHeadcounts(localDrafts?.step3).employees ||
      '',
    contactEmail:
      parsedJsonb?.step1?.contactEmail ||
      localDrafts?.step1?.contactEmail ||
      fpcDetails?.primaryEmail ||
      invitation?.email ||
      '',
    contactMobile:
      parsedJsonb?.step1?.contactMobile ||
      localDrafts?.step1?.contactMobile ||
      fpcDetails?.primaryMobile ||
      invitation?.phoneNumber ||
      '',
    website:
      parsedJsonb?.step1?.website ||
      localDrafts?.step1?.website ||
      '',
  };

  // 3. Map Step 2: Legal & Registration
  const step2: Partial<LegalRegistrationFormValues> = {
    companyPan:
      parsedJsonb?.step2?.companyPan ||
      localDrafts?.step2?.companyPan ||
      fpcDetails?.pan ||
      '',
    companyTan:
      parsedJsonb?.step2?.companyTan ||
      localDrafts?.step2?.companyTan ||
      fpcDetails?.tan ||
      '',
    gstin:
      parsedJsonb?.step2?.gstin ||
      localDrafts?.step2?.gstin ||
      fpcDetails?.gstin ||
      '',
    fssaiLicense:
      parsedJsonb?.step2?.fssaiLicense ||
      localDrafts?.step2?.fssaiLicense ||
      '',
    seedLicense:
      parsedJsonb?.step2?.seedLicense ||
      localDrafts?.step2?.seedLicense ||
      '',
    fertilizerLicense:
      parsedJsonb?.step2?.fertilizerLicense ||
      localDrafts?.step2?.fertilizerLicense ||
      '',
    additionalLicenses:
      (parsedJsonb?.step2?.additionalLicenses && parsedJsonb.step2.additionalLicenses.length > 0
        ? parsedJsonb.step2.additionalLicenses
        : undefined) ||
      (localDrafts?.step2?.additionalLicenses && localDrafts.step2.additionalLicenses.length > 0
        ? localDrafts.step2.additionalLicenses
        : undefined) ||
      [],
  };

  // 4. Map Step 3: Financial Information
  const defaultBankAccounts = fpcDetails?.bankAccountNumber
    ? [
        {
          id: 'bank-1',
          bankName: fpcDetails.bankName || '',
          accountNumber: fpcDetails.bankAccountNumber || '',
          ifscCode: fpcDetails.bankIfsc || '',
          branchName: '',
          bankAddress: '',
          accountType: 'Current' as const,
        },
      ]
    : [];

  const completedYears = getLastCompletedFinancialYears(5);
  const savedTurnoverList =
    parsedJsonb?.step3?.turnoverHistory ||
    localDrafts?.step3?.turnoverHistory;

  let mappedTurnoverHistory: Array<{ financialYear: string; turnover: string }>;
  if (Array.isArray(savedTurnoverList) && savedTurnoverList.length > 0) {
    const map = new Map<string, string>();
    for (const item of savedTurnoverList) {
      if (item?.financialYear) {
        map.set(item.financialYear, item.turnover ?? '');
      }
    }
    mappedTurnoverHistory = completedYears.map((fy) => ({
      financialYear: fy.key,
      turnover: map.get(fy.key) ?? '',
    }));
  } else {
    // Legacy migration from single annualTurnover & financialYear
    const legacyTurnover =
      parsedJsonb?.step3?.annualTurnover ||
      localDrafts?.step3?.annualTurnover ||
      '';
    const legacyYear =
      parsedJsonb?.step3?.financialYear ||
      localDrafts?.step3?.financialYear ||
      '';

    mappedTurnoverHistory = completedYears.map((fy) => ({
      financialYear: fy.key,
      turnover: legacyYear === fy.key ? legacyTurnover : '',
    }));
  }

  const step3: Partial<FinancialInformationFormValues> = {
    authorizedCapital:
      parsedJsonb?.step3?.authorizedCapital ||
      localDrafts?.step3?.authorizedCapital ||
      '',
    paidUpCapital:
      parsedJsonb?.step3?.paidUpCapital ||
      localDrafts?.step3?.paidUpCapital ||
      '',
    faceValuePerShare:
      parsedJsonb?.step3?.faceValuePerShare ||
      localDrafts?.step3?.faceValuePerShare ||
      '',
    annualTurnover:
      parsedJsonb?.step3?.annualTurnover ||
      localDrafts?.step3?.annualTurnover ||
      mappedTurnoverHistory[mappedTurnoverHistory.length - 1]?.turnover ||
      '',
    financialYear:
      parsedJsonb?.step3?.financialYear ||
      localDrafts?.step3?.financialYear ||
      mappedTurnoverHistory[mappedTurnoverHistory.length - 1]?.financialYear ||
      '2025-26',
    turnoverHistory: mappedTurnoverHistory,
    shareholders:
      (parsedJsonb?.step3?.shareholders && parsedJsonb.step3.shareholders.trim() !== ''
        ? parsedJsonb.step3.shareholders
        : undefined) ||
      (localDrafts?.step3?.shareholders && localDrafts.step3.shareholders.trim() !== ''
        ? localDrafts.step3.shareholders
        : undefined) ||
      (fpcDetails?.shareholdersCount ? String(fpcDetails.shareholdersCount) : '10'),
    totalEquitySharesAllotted:
      parsedJsonb?.step3?.totalEquitySharesAllotted ||
      localDrafts?.step3?.totalEquitySharesAllotted ||
      (fpcDetails?.totalEquitySharesAllotted != null
        ? String(fpcDetails.totalEquitySharesAllotted)
        : ''),
    bankAccounts:
      (parsedJsonb?.step3?.bankAccounts && parsedJsonb.step3.bankAccounts.length > 0
        ? parsedJsonb.step3.bankAccounts
        : undefined) ||
      (localDrafts?.step3?.bankAccounts && localDrafts.step3.bankAccounts.length > 0
        ? localDrafts.step3.bankAccounts
        : undefined) ||
      defaultBankAccounts,
    otherIncomeSources:
      (parsedJsonb?.step3?.otherIncomeSources && parsedJsonb.step3.otherIncomeSources.length > 0
        ? parsedJsonb.step3.otherIncomeSources
        : undefined) ||
      (localDrafts?.step3?.otherIncomeSources && localDrafts.step3.otherIncomeSources.length > 0
        ? localDrafts.step3.otherIncomeSources
        : undefined) ||
      [],
  };

  // 5. Map Step 4: Board of Directors
  const rawDirectors =
    (parsedJsonb?.step4?.directors && parsedJsonb.step4.directors.length > 0
      ? parsedJsonb.step4.directors
      : undefined) ||
    (localDrafts?.step4?.directors && localDrafts.step4.directors.length > 0
      ? localDrafts.step4.directors
      : undefined) ||
    [];

  // Identity-document metadata lives in fpc_documents and is associated by directorKey.
  const storedDirectorDocuments = (fpcDetails?.documents ?? []).filter(
    (doc) => doc.documentType?.toLowerCase().startsWith('director') && doc.directorKey
  );

  const findDirectorDocument = (directorKey: string, documentType: string) =>
    storedDirectorDocuments.find(
      (doc) =>
        doc.directorKey?.toLowerCase() === directorKey.toLowerCase() &&
        doc.documentType.toLowerCase() === documentType.toLowerCase()
    );

  const step4: Partial<BoardOfDirectorsFormValues> = {
    directors: rawDirectors.map((director) => {
      const directorKey = director.directorKey || director.id || '';
      const aadhaarDoc = directorKey
        ? findDirectorDocument(directorKey, 'DirectorAadhaarCard')
        : undefined;
      const panDoc = directorKey ? findDirectorDocument(directorKey, 'DirectorPanCard') : undefined;
      const voterIdDoc = directorKey
        ? findDirectorDocument(directorKey, 'DirectorVoterId')
        : undefined;

      return {
        ...director,
        directorKey,
        dateOfBirth: director.dateOfBirth || '',
        aadhaarDocName: director.aadhaarDocName || aadhaarDoc?.fileName || '',
        aadhaarDocumentId: director.aadhaarDocumentId || aadhaarDoc?.id || '',
        panDocName: director.panDocName || panDoc?.fileName || '',
        panDocumentId: director.panDocumentId || panDoc?.id || '',
        voterIdDocName: director.voterIdDocName || voterIdDoc?.fileName || '',
        voterIdDocumentId: director.voterIdDocumentId || voterIdDoc?.id || '',
      };
    }),
  };

  // 6. Map Step 5: Logo & Documents
  const step5DocumentIds: Record<string, string> = {
    ...(parsedJsonb?.step5?.documentIds ?? {}),
    ...(localDrafts?.step5?.documentIds ?? {}),
  };

  if (fpcDetails?.documents) {
    for (const doc of fpcDetails.documents) {
      const docTypeLower = doc.documentType?.toLowerCase() || '';
      if (docTypeLower === 'companylogo' || docTypeLower === 'logo') step5DocumentIds.logoFileName = doc.id;
      else if (docTypeLower === 'certificateofincorporation' || docTypeLower === 'incorporationcertificate') step5DocumentIds.incorporationCertName = doc.id;
      else if (docTypeLower === 'pancard' || docTypeLower === 'companypan') step5DocumentIds.panCertName = doc.id;
      else if (docTypeLower === 'gstincertificate' || docTypeLower === 'gstincert') step5DocumentIds.gstinCertName = doc.id;
      else if (docTypeLower === 'fssailicense' || docTypeLower === 'fssai') step5DocumentIds.fssaiLicenseName = doc.id;
      else if (docTypeLower === 'seedlicense') step5DocumentIds.seedLicenseName = doc.id;
      else if (docTypeLower === 'fertilizerlicense') step5DocumentIds.fertilizerLicenseName = doc.id;
      else if (docTypeLower === 'moaaoa' || docTypeLower === 'moaandaoa') step5DocumentIds.moaAoaDocName = doc.id;
      else if (docTypeLower === 'boardresolution') step5DocumentIds.boardResolutionDocName = doc.id;
    }
  }

  const findDocFileName = (type: string): string => {
    return fpcDetails?.documents?.find((d) => d.documentType.toLowerCase() === type.toLowerCase())?.fileName || '';
  };

  const findDocExpiry = (type: string): string => {
    return fpcDetails?.documents?.find((d) => d.documentType.toLowerCase() === type.toLowerCase())?.expiryDate || '';
  };

  const step5: Partial<FpcLogoDocumentsFormData> = {
    logoFileName:
      parsedJsonb?.step5?.logoFileName ||
      localDrafts?.step5?.logoFileName ||
      findDocFileName('CompanyLogo'),
    incorporationCertName:
      parsedJsonb?.step5?.incorporationCertName ||
      localDrafts?.step5?.incorporationCertName ||
      findDocFileName('CertificateOfIncorporation'),
    panCertName:
      parsedJsonb?.step5?.panCertName ||
      localDrafts?.step5?.panCertName ||
      findDocFileName('PanCard'),
    gstinCertName:
      parsedJsonb?.step5?.gstinCertName ||
      localDrafts?.step5?.gstinCertName ||
      findDocFileName('GstinCertificate'),
    fssaiLicenseName:
      parsedJsonb?.step5?.fssaiLicenseName ||
      localDrafts?.step5?.fssaiLicenseName ||
      findDocFileName('FssaiLicense'),
    fssaiExpiryDate:
      parsedJsonb?.step5?.fssaiExpiryDate ||
      localDrafts?.step5?.fssaiExpiryDate ||
      findDocExpiry('FssaiLicense'),
    seedLicenseName:
      parsedJsonb?.step5?.seedLicenseName ||
      localDrafts?.step5?.seedLicenseName ||
      findDocFileName('SeedLicense'),
    seedLicenseExpiryDate:
      parsedJsonb?.step5?.seedLicenseExpiryDate ||
      localDrafts?.step5?.seedLicenseExpiryDate ||
      findDocExpiry('SeedLicense'),
    fertilizerLicenseName:
      parsedJsonb?.step5?.fertilizerLicenseName ||
      localDrafts?.step5?.fertilizerLicenseName ||
      findDocFileName('FertilizerLicense'),
    fertilizerLicenseExpiryDate:
      parsedJsonb?.step5?.fertilizerLicenseExpiryDate ||
      localDrafts?.step5?.fertilizerLicenseExpiryDate ||
      findDocExpiry('FertilizerLicense'),
    moaAoaDocName:
      parsedJsonb?.step5?.moaAoaDocName ||
      localDrafts?.step5?.moaAoaDocName ||
      findDocFileName('MoaAoa'),
    boardResolutionDocName:
      parsedJsonb?.step5?.boardResolutionDocName ||
      localDrafts?.step5?.boardResolutionDocName ||
      findDocFileName('BoardResolution'),
    documentIds: step5DocumentIds,
  };

  // 7. Map Step 6: Address & Location
  const step6: Partial<AddressLocationFormValues> = {
    streetAddress:
      parsedJsonb?.step6?.streetAddress ||
      localDrafts?.step6?.streetAddress ||
      fpcDetails?.addressLine1 ||
      '',
    state:
      parsedJsonb?.step6?.state ||
      localDrafts?.step6?.state ||
      fpcDetails?.state ||
      invitation?.state ||
      'Odisha',
    district:
      parsedJsonb?.step6?.district ||
      localDrafts?.step6?.district ||
      fpcDetails?.district ||
      invitation?.district ||
      'Jajpur',
    block:
      parsedJsonb?.step6?.block ||
      localDrafts?.step6?.block ||
      fpcDetails?.addressLine2 ||
      'Jajpur Sadar',
    gramPanchayat:
      parsedJsonb?.step6?.gramPanchayat ||
      localDrafts?.step6?.gramPanchayat ||
      '',
    village:
      parsedJsonb?.step6?.village ||
      localDrafts?.step6?.village ||
      '',
    pinCode:
      parsedJsonb?.step6?.pinCode ||
      localDrafts?.step6?.pinCode ||
      fpcDetails?.pincode ||
      '',
    officeMobile:
      parsedJsonb?.step6?.officeMobile ||
      localDrafts?.step6?.officeMobile ||
      fpcDetails?.primaryMobile ||
      invitation?.phoneNumber ||
      '',
    officialEmail:
      parsedJsonb?.step6?.officialEmail ||
      localDrafts?.step6?.officialEmail ||
      fpcDetails?.primaryEmail ||
      invitation?.email ||
      '',
    latitude:
      parsedJsonb?.step6?.latitude ||
      localDrafts?.step6?.latitude ||
      '',
    longitude:
      parsedJsonb?.step6?.longitude ||
      localDrafts?.step6?.longitude ||
      '',
  };

  // 8. Map Step 7: Business Activities
  const step7: Partial<BusinessActivitiesFormValues> = {
    primaryActivity:
      (parsedJsonb?.step7?.primaryActivity && parsedJsonb.step7.primaryActivity.length > 0
        ? parsedJsonb.step7.primaryActivity
        : undefined) ||
      (localDrafts?.step7?.primaryActivity && localDrafts.step7.primaryActivity.length > 0
        ? localDrafts.step7.primaryActivity
        : undefined) ||
      [],
    commencementDate:
      parsedJsonb?.step7?.commencementDate ||
      localDrafts?.step7?.commencementDate ||
      '',
    commoditiesHandled:
      (parsedJsonb?.step7?.commoditiesHandled && parsedJsonb.step7.commoditiesHandled.length > 0
        ? parsedJsonb.step7.commoditiesHandled
        : undefined) ||
      (localDrafts?.step7?.commoditiesHandled && localDrafts.step7.commoditiesHandled.length > 0
        ? localDrafts.step7.commoditiesHandled
        : undefined) ||
      [],
    targetFarmers:
      parsedJsonb?.step7?.targetFarmers ||
      localDrafts?.step7?.targetFarmers ||
      (fpcDetails?.farmersCount ? String(fpcDetails.farmersCount) : ''),
    villagesCovered:
      parsedJsonb?.step7?.villagesCovered ||
      localDrafts?.step7?.villagesCovered ||
      '',
    activityScope:
      parsedJsonb?.step7?.activityScope ||
      localDrafts?.step7?.activityScope ||
      '',
  };

  return {
    step1,
    step2,
    step3,
    step4,
    step5,
    step6,
    step7,
  };
}
