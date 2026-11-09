import type {
  FpcBasicDetailsFormData,
  FpcLegalRegistrationFormData,
  FpcFinancialInformationFormData,
  FpcBoardOfDirectorsFormData,
  FpcLogoDocumentsFormData,
  FpcAddressLocationFormData,
  FpcBusinessActivitiesFormData,
} from '../types';

class InvitationApi {
  /**
   * Reads stored Step 1 details synchronously for zero useEffect render.
   */
  public getStepOneData(token: string): Partial<FpcBasicDetailsFormData> | null {
    try {
      const raw = localStorage.getItem(`fpc_step1_${token}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Submits Step 1 Basic Details and progresses the onboarding state.
   */
  public async submitStepOne(
    token: string,
    details: FpcBasicDetailsFormData
  ): Promise<{ success: boolean; nextStep: number; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    try {
      localStorage.setItem(`fpc_step1_${token}`, JSON.stringify(details));
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
  public getStepTwoData(token: string): Partial<FpcLegalRegistrationFormData> | null {
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
  public getStepThreeData(token: string): Partial<FpcFinancialInformationFormData> | null {
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
  public getStepFourData(token: string): Partial<FpcBoardOfDirectorsFormData> | null {
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
  public getStepFiveData(token: string): Partial<FpcLogoDocumentsFormData> | null {
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
  public getStepSixData(token: string): Partial<FpcAddressLocationFormData> | null {
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
  public getStepSevenData(token: string): Partial<FpcBusinessActivitiesFormData> | null {
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
}

export const invitationApi = new InvitationApi();
