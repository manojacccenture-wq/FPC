import type {
  FpcBasicDetailsFormData,
  FpcLegalRegistrationFormData,
  FpcFinancialInformationFormData,
  FpcBoardOfDirectorsFormData,
  FpcLogoDocumentsFormData,
  FpcAddressLocationFormData,
  FpcBusinessActivitiesFormData,
} from '../types';
import { offlineDb } from '../../../shared/offline/db';

export interface DraftIdentifier {
  tokenOrId?: string | null;
  companyName?: string | null;
  email?: string | null;
}

export type DraftIdentifierInput = string | DraftIdentifier;

export interface AllOnboardingDrafts {
  step1: Partial<FpcBasicDetailsFormData> | null;
  step2: Partial<FpcLegalRegistrationFormData> | null;
  step3: Partial<FpcFinancialInformationFormData> | null;
  step4: Partial<FpcBoardOfDirectorsFormData> | null;
  step5: Partial<FpcLogoDocumentsFormData> | null;
  step6: Partial<FpcAddressLocationFormData> | null;
  step7: Partial<FpcBusinessActivitiesFormData> | null;
}

/**
 * Asynchronously persists draft form data into Dexie.js IndexedDB (FpcOfflineDb -> formDrafts table)
 * as the primary persistent database.
 */
async function persistDexieDraft(token: string, step: number, data: unknown): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.indexedDB) {
      await offlineDb.formDrafts.put({
        id: `${token}_step${step}`,
        fpcId: token,
        userId: 'anonymous',
        formKey: `onboard_step${step}`,
        dataJson: JSON.stringify(data),
        lastSavedAtUtc: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn(`Dexie persistence warning for step ${step}:`, err);
  }
}

class InvitationApi {
  /**
   * Intelligently resolves the active draft token key from either:
   * 1. A direct raw security token string
   * 2. An invitation database UUID (via token mapping or localStorage draft scan)
   * 3. A company name or contact email matching a locally stored draft
   */
  public resolveDraftKey(identifier?: DraftIdentifierInput | null): string {
    if (!identifier) return '';
    if (typeof window === 'undefined') {
      return typeof identifier === 'string' ? identifier : identifier.tokenOrId || '';
    }

    let tokenOrId: string | undefined;
    let companyName: string | undefined;
    let email: string | undefined;

    if (typeof identifier === 'string') {
      tokenOrId = identifier.trim();
    } else {
      tokenOrId = identifier.tokenOrId?.trim();
      companyName = identifier.companyName?.trim();
      email = identifier.email?.trim();
    }

    // 1. Direct hit on localStorage fpc_step1_<tokenOrId>
    if (tokenOrId && localStorage.getItem(`fpc_step1_${tokenOrId}`)) {
      return tokenOrId;
    }

    // 2. Check cached token map in localStorage
    if (tokenOrId) {
      const mappedToken = localStorage.getItem(`fpc_token_map_${tokenOrId}`);
      if (mappedToken && localStorage.getItem(`fpc_step1_${mappedToken}`)) {
        return mappedToken;
      }
    }

    // 3. Scan localStorage for fpc_step1_* keys where companyName or email matches
    if (companyName || email || tokenOrId) {
      const normCompany = companyName?.toLowerCase();
      const normEmail = email?.toLowerCase();
      const normId = tokenOrId?.toLowerCase();

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('fpc_step1_')) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              const draftCompany = parsed.legalName?.trim().toLowerCase();
              const draftEmail = parsed.contactEmail?.trim().toLowerCase();

              const isCompanyMatch =
                normCompany &&
                draftCompany &&
                (draftCompany === normCompany ||
                  draftCompany.includes(normCompany) ||
                  normCompany.includes(draftCompany));
              const isEmailMatch = normEmail && draftEmail && draftEmail === normEmail;
              const isIdMatch = normId && draftCompany && draftCompany.includes(normId);

              if (isCompanyMatch || isEmailMatch || isIdMatch) {
                const matchedToken = key.substring('fpc_step1_'.length);
                if (tokenOrId) {
                  try {
                    localStorage.setItem(`fpc_token_map_${tokenOrId}`, matchedToken);
                  } catch {
                    // Storage quota exceeded or disabled
                  }
                }
                return matchedToken;
              }
            }
          } catch {
            // Ignore unparseable values
          }
        }
      }
    }

    return tokenOrId || '';
  }

  /**
   * Reads stored Step 1 details synchronously for zero useEffect render.
   */
  public getStepOneData(identifier: DraftIdentifierInput): Partial<FpcBasicDetailsFormData> | null {
    const token = this.resolveDraftKey(identifier);
    try {
      const raw = localStorage.getItem(`fpc_step1_${token}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Submits Step 1 Basic Details and progresses the onboarding state.
   * Persists primarily into Dexie.js IndexedDB and dual-writes to localStorage for sync reads.
   */
  public async submitStepOne(
    token: string,
    details: FpcBasicDetailsFormData
  ): Promise<{ success: boolean; nextStep: number; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    try {
      localStorage.setItem(`fpc_step1_${token}`, JSON.stringify(details));
      persistDexieDraft(token, 1, details);
    } catch {
      // Storage unavailable
    }

    return {
      success: true,
      nextStep: 2,
      message: 'Basic company details saved successfully.',
    };
  }

  /**
   * Reads stored Step 2 details synchronously for zero useEffect render.
   */
  public getStepTwoData(identifier: DraftIdentifierInput): Partial<FpcLegalRegistrationFormData> | null {
    const token = this.resolveDraftKey(identifier);
    try {
      const raw = localStorage.getItem(`fpc_step2_${token}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Submits Step 2 Legal & Registration details and progresses to Step 3.
   */
  public async submitStepTwo(
    token: string,
    details: FpcLegalRegistrationFormData
  ): Promise<{ success: boolean; nextStep: number; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    try {
      localStorage.setItem(`fpc_step2_${token}`, JSON.stringify(details));
      persistDexieDraft(token, 2, details);
    } catch {
      // Storage unavailable
    }

    return {
      success: true,
      nextStep: 3,
      message: 'Legal and registration records saved successfully.',
    };
  }

  /**
   * Reads stored Step 3 details synchronously for zero useEffect render.
   */
  public getStepThreeData(identifier: DraftIdentifierInput): Partial<FpcFinancialInformationFormData> | null {
    const token = this.resolveDraftKey(identifier);
    try {
      const raw = localStorage.getItem(`fpc_step3_${token}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Submits Step 3 Financial Information details and progresses to Step 4.
   */
  public async submitStepThree(
    token: string,
    details: FpcFinancialInformationFormData
  ): Promise<{ success: boolean; nextStep: number; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    try {
      localStorage.setItem(`fpc_step3_${token}`, JSON.stringify(details));
      persistDexieDraft(token, 3, details);
    } catch {
      // Storage unavailable
    }

    return {
      success: true,
      nextStep: 4,
      message: 'Financial information saved successfully.',
    };
  }

  /**
   * Reads stored Step 4 details synchronously for zero useEffect render.
   */
  public getStepFourData(identifier: DraftIdentifierInput): Partial<FpcBoardOfDirectorsFormData> | null {
    const token = this.resolveDraftKey(identifier);
    try {
      const raw = localStorage.getItem(`fpc_step4_${token}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Submits Step 4 Board of Directors details and progresses to Step 5.
   */
  public async submitStepFour(
    token: string,
    details: FpcBoardOfDirectorsFormData
  ): Promise<{ success: boolean; nextStep: number; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    try {
      localStorage.setItem(`fpc_step4_${token}`, JSON.stringify(details));
      persistDexieDraft(token, 4, details);
    } catch {
      // Storage unavailable
    }

    return {
      success: true,
      nextStep: 5,
      message: 'Board of directors saved successfully.',
    };
  }

  /**
   * Reads stored Step 5 details synchronously for zero useEffect render.
   */
  public getStepFiveData(identifier: DraftIdentifierInput): Partial<FpcLogoDocumentsFormData> | null {
    const token = this.resolveDraftKey(identifier);
    try {
      const raw = localStorage.getItem(`fpc_step5_${token}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Submits Step 5 Logo & Documents details and progresses to Step 6.
   */
  public async submitStepFive(
    token: string,
    details: FpcLogoDocumentsFormData
  ): Promise<{ success: boolean; nextStep: number; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    try {
      localStorage.setItem(`fpc_step5_${token}`, JSON.stringify(details));
      persistDexieDraft(token, 5, details);
    } catch {
      // Storage unavailable
    }

    return {
      success: true,
      nextStep: 6,
      message: 'Logo and documents saved successfully.',
    };
  }

  /**
   * Reads stored Step 6 details synchronously for zero useEffect render.
   */
  public getStepSixData(identifier: DraftIdentifierInput): Partial<FpcAddressLocationFormData> | null {
    const token = this.resolveDraftKey(identifier);
    try {
      const raw = localStorage.getItem(`fpc_step6_${token}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Submits Step 6 Address & Location details and progresses to Step 7.
   */
  public async submitStepSix(
    token: string,
    details: FpcAddressLocationFormData
  ): Promise<{ success: boolean; nextStep: number; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    try {
      localStorage.setItem(`fpc_step6_${token}`, JSON.stringify(details));
      persistDexieDraft(token, 6, details);
    } catch {
      // Storage unavailable
    }

    return {
      success: true,
      nextStep: 7,
      message: 'Address and location details saved successfully.',
    };
  }

  /**
   * Reads stored Step 7 details synchronously for zero useEffect render.
   */
  public getStepSevenData(identifier: DraftIdentifierInput): Partial<FpcBusinessActivitiesFormData> | null {
    const token = this.resolveDraftKey(identifier);
    try {
      const raw = localStorage.getItem(`fpc_step7_${token}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Submits Step 7 Business Activities details and progresses to Step 8 (Final Review).
   */
  public async submitStepSeven(
    token: string,
    details: FpcBusinessActivitiesFormData
  ): Promise<{ success: boolean; nextStep: number; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    try {
      localStorage.setItem(`fpc_step7_${token}`, JSON.stringify(details));
      persistDexieDraft(token, 7, details);
    } catch {
      // Storage unavailable
    }

    return {
      success: true,
      nextStep: 8,
      message: 'Business activities saved successfully.',
    };
  }

  /**
   * Finalizes the onboarding wizard submission and sets status to 'completed'.
   */
  public async submitFinalReview(
    token: string
  ): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      localStorage.setItem(`fpc_completed_${token}`, 'true');
    } catch {
      // Storage unavailable
    }

    return {
      success: true,
      message: 'Onboarding application successfully submitted for administrative review and verification.',
    };
  }

  /**
   * Asynchronously loads all 7 onboarding step drafts from Dexie.js IndexedDB.
   * Resolves the draft key, queries compound indexes and primary keys, safely parses
   * dataJson, syncs to localStorage for synchronous reads, and returns all steps.
   */
  public async loadAllDraftsFromDexie(
    identifier: DraftIdentifierInput
  ): Promise<AllOnboardingDrafts> {
    const result: AllOnboardingDrafts = {
      step1: null,
      step2: null,
      step3: null,
      step4: null,
      step5: null,
      step6: null,
      step7: null,
    };

    if (typeof window === 'undefined' || !window.indexedDB) {
      return result;
    }

    let token = this.resolveDraftKey(identifier);

    try {
      await offlineDb.initialize();

      // If token wasn't resolved via localStorage, attempt to match directly in Dexie
      if (!token) {
        let tokenOrId: string | undefined;
        let companyName: string | undefined;
        let email: string | undefined;

        if (typeof identifier === 'string') {
          tokenOrId = identifier.trim();
        } else if (identifier) {
          tokenOrId = identifier.tokenOrId?.trim() || undefined;
          companyName = identifier.companyName?.trim() || undefined;
          email = identifier.email?.trim() || undefined;
        }

        if (tokenOrId) {
          token = tokenOrId;
        } else if (companyName || email) {
          const allStep1 = await offlineDb.formDrafts
            .where('formKey')
            .equals('onboard_step1')
            .toArray();

          const normComp = companyName?.toLowerCase();
          const normMail = email?.toLowerCase();

          for (const d of allStep1) {
            try {
              const p = JSON.parse(d.dataJson);
              const draftComp = p.legalName?.trim().toLowerCase();
              const draftMail = p.contactEmail?.trim().toLowerCase();
              if (
                (normComp && draftComp && (draftComp === normComp || draftComp.includes(normComp) || normComp.includes(draftComp))) ||
                (normMail && draftMail && draftMail === normMail)
              ) {
                token = d.fpcId;
                break;
              }
            } catch {
              // Ignore invalid JSON
            }
          }
        }
      }

      if (!token) return result;

      // 1. Query all drafts indexed by fpcId
      const drafts = await offlineDb.formDrafts
        .where('fpcId')
        .equals(token)
        .toArray();

      const draftMap = new Map<number, unknown>();

      for (const draft of drafts) {
        const stepMatch = draft.formKey?.match(/onboard_step(\d+)/);
        if (stepMatch && draft.dataJson) {
          try {
            const stepNum = parseInt(stepMatch[1], 10);
            const parsed = JSON.parse(draft.dataJson);
            draftMap.set(stepNum, parsed);
          } catch {
            // Ignore unparseable
          }
        }
      }

      // 2. Fallback check by primary key and compound index for any missing steps
      for (let s = 1; s <= 7; s++) {
        if (!draftMap.has(s)) {
          try {
            let record = await offlineDb.formDrafts.get(`${token}_step${s}`);
            if (!record) {
              record = await offlineDb.formDrafts
                .where('[fpcId+userId+formKey]')
                .equals([token, 'anonymous', `onboard_step${s}`])
                .first();
            }
            if (record?.dataJson) {
              const parsed = JSON.parse(record.dataJson);
              draftMap.set(s, parsed);
            }
          } catch {
            // Ignored
          }
        }
      }

      // 3. Populate return object and sync to localStorage
      if (draftMap.has(1)) {
        result.step1 = draftMap.get(1) as Partial<FpcBasicDetailsFormData>;
        localStorage.setItem(`fpc_step1_${token}`, JSON.stringify(result.step1));
      }
      if (draftMap.has(2)) {
        result.step2 = draftMap.get(2) as Partial<FpcLegalRegistrationFormData>;
        localStorage.setItem(`fpc_step2_${token}`, JSON.stringify(result.step2));
      }
      if (draftMap.has(3)) {
        result.step3 = draftMap.get(3) as Partial<FpcFinancialInformationFormData>;
        localStorage.setItem(`fpc_step3_${token}`, JSON.stringify(result.step3));
      }
      if (draftMap.has(4)) {
        result.step4 = draftMap.get(4) as Partial<FpcBoardOfDirectorsFormData>;
        localStorage.setItem(`fpc_step4_${token}`, JSON.stringify(result.step4));
      }
      if (draftMap.has(5)) {
        result.step5 = draftMap.get(5) as Partial<FpcLogoDocumentsFormData>;
        localStorage.setItem(`fpc_step5_${token}`, JSON.stringify(result.step5));
      }
      if (draftMap.has(6)) {
        result.step6 = draftMap.get(6) as Partial<FpcAddressLocationFormData>;
        localStorage.setItem(`fpc_step6_${token}`, JSON.stringify(result.step6));
      }
      if (draftMap.has(7)) {
        result.step7 = draftMap.get(7) as Partial<FpcBusinessActivitiesFormData>;
        localStorage.setItem(`fpc_step7_${token}`, JSON.stringify(result.step7));
      }
    } catch (err) {
      console.warn('Failed to load drafts from Dexie:', err);
    }

    return result;
  }

  /**
   * Loads a specific step draft directly from Dexie.js IndexedDB.
   */
  public async getStepDraftFromDexie<T>(
    identifier: DraftIdentifierInput,
    step: number
  ): Promise<Partial<T> | null> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return null;
    }

    const token = this.resolveDraftKey(identifier);
    if (!token) return null;

    try {
      await offlineDb.initialize();

      let record = await offlineDb.formDrafts.get(`${token}_step${step}`);
      if (!record) {
        record = await offlineDb.formDrafts
          .where('[fpcId+userId+formKey]')
          .equals([token, 'anonymous', `onboard_step${step}`])
          .first();
      }

      if (record?.dataJson) {
        const parsed = JSON.parse(record.dataJson);
        localStorage.setItem(`fpc_step${step}_${token}`, record.dataJson);
        return parsed as Partial<T>;
      }
    } catch (err) {
      console.warn(`Failed to get step ${step} draft from Dexie:`, err);
    }

    return null;
  }

  /**
   * Cleans up local draft storage upon successful registration completion to protect sensitive information.
   */
  public async clearOnboardingDraft(token: string): Promise<void> {
    try {
      for (let step = 1; step <= 7; step++) {
        localStorage.removeItem(`fpc_step${step}_${token}`);
      }
      localStorage.removeItem(`fpc_completed_${token}`);

      if (typeof window !== 'undefined' && window.indexedDB) {
        await offlineDb.formDrafts.where('fpcId').equals(token).delete();
      }
    } catch (err) {
      console.warn('Draft cleanup warning:', err);
    }
  }
}

export const invitationApi = new InvitationApi();
