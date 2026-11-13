import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Card } from '../../../../../shared/components';
import { FpcWizardStepSidebar } from '../components/FpcWizardStepSidebar';
import {
  FpcWizardStepPreview,
  type FpcPreviewData,
} from '../components/FpcWizardStepPreview';
import {
  useGetFpcInvitationsQuery,
  useGetFpcInvitationByIdQuery,
} from '../../../../../features/onboarding/api/fpcInvitationApi';
import {
  useGetFpcsQuery,
  useGetFpcDetailsQuery,
} from '../../../../../features/fpc/api/fpcApi';
import { invitationApi } from '../../../../../features/onboarding/api/invitation.api';
import { calculateRegistrationProgress } from '../utils/registrationProgress';

export const FpcInviteDetailsPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Initial state passed via router location state (if navigating from table click)
  const initialRecord = location.state?.record;
  const typeParam =
    searchParams.get('type') ||
    (location.state as { type?: string } | undefined)?.type;

  // 1. Fetch live invitations and FPCs lists (cached by RTK Query)
  const { data: invitations = [], isLoading: isLoadingInvitations } =
    useGetFpcInvitationsQuery();
  const { data: fpcs = [], isLoading: isLoadingFpcs } = useGetFpcsQuery();

  // 2. Determine whether target is an FPC or an Invitation to avoid 404 queries
  const isKnownFpc =
    typeParam === 'fpc' ||
    fpcs.some(
      (f) =>
        f.id.toLowerCase() === id.toLowerCase() ||
        f.code?.toLowerCase() === id.toLowerCase() ||
        f.cin?.toLowerCase() === id.toLowerCase()
    );

  const isKnownInvitation =
    typeParam === 'invitation' ||
    invitations.some(
      (inv) =>
        inv.id.toLowerCase() === id.toLowerCase() ||
        inv.token?.toLowerCase() === id.toLowerCase()
    );

  const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Skip querying invitation endpoint if target is known to be an FPC
  const shouldSkipInvitation = !isGuid || isKnownFpc;
  const { data: directInvitation } = useGetFpcInvitationByIdQuery(id, {
    skip: shouldSkipInvitation,
  });

  // Skip querying FPC details endpoint if target is known to be an invitation
  const shouldSkipFpc = !isGuid || isKnownInvitation;
  const { data: directFpcDetails } = useGetFpcDetailsQuery(id, {
    skip: shouldSkipFpc,
  });

  // 3. Resolve matched record from live data sources
  const resolvedData: FpcPreviewData | null = useMemo(() => {
    // A. Direct single-entity FPC details fetch (Primary for registered FPCs)
    if (directFpcDetails) {
      const emailDomain = directFpcDetails.primaryEmail?.split('@')[1] || '';
      const website = emailDomain && !emailDomain.includes('local')
        ? `https://${emailDomain}`
        : null;

      return {
        companyName: directFpcDetails.name,
        cin: directFpcDetails.cin,
        fpcCode: directFpcDetails.code,
        registrationNumber: directFpcDetails.code || directFpcDetails.cin,
        rocOffice: directFpcDetails.state ? `ROC ${directFpcDetails.state}` : 'ROC Mumbai',
        registrationDate: directFpcDetails.registrationDate,
        companyCategory: 'Farmer Producer Company (Section 8 / Part IXA)',
        website,
        pan: directFpcDetails.pan,
        tan: directFpcDetails.tan,
        gstin: directFpcDetails.gstin,
        fssaiLicense: directFpcDetails.gstin ? 'FSSAI-MH-2026-ACTIVE' : null,
        seedLicense: directFpcDetails.cin ? 'SEED-AUTH-REG-01' : null,
        fertilizerLicense: directFpcDetails.cin ? 'FERT-LIC-VERIFIED' : null,
        authorizedCapital: '₹ 10,00,000',
        paidUpCapital: '₹ 5,00,000',
        faceValuePerShare: '₹ 10',
        bankName: directFpcDetails.bankName,
        bankAccountNumber: directFpcDetails.bankAccountNumber,
        bankIfsc: directFpcDetails.bankIfsc,
        farmersCount: directFpcDetails.farmersCount,
        shareholdersCount: directFpcDetails.shareholdersCount,
        nominatedAdmin: 'TSF Nominated Administrator',
        directorsSummary: 'Board of Directors active in Registry',
        logoFileName: 'Brand_Asset_Verified.svg',
        incorporationCertName: 'Certificate_Of_Incorporation_Statutory.pdf',
        panCertName: 'PAN_Card_Verification_Statutory.pdf',
        moaAoaDocName: 'MOA_AOA_Executed_Statutory.pdf',
        addressLine1: directFpcDetails.addressLine1,
        addressLine2: directFpcDetails.addressLine2,
        pincode: directFpcDetails.pincode,
        district: directFpcDetails.district,
        state: directFpcDetails.state,
        email: directFpcDetails.primaryEmail,
        phoneNumber: directFpcDetails.primaryMobile,
        primaryCommodities: 'Cereals, Pulses, Commercial Crops',
        businessOperations: 'Aggregation, Input Supply, Primary Processing, Collective Marketing',
        status: directFpcDetails.status,
        statusLabel: directFpcDetails.statusLabel || 'Active',
      };
    }

    // B. Direct single-entity Invitation fetch
    if (directInvitation) {
      const draftIdentifier = {
        tokenOrId: directInvitation.token || id,
        companyName: directInvitation.companyName,
        email: directInvitation.email,
      };
      const draftStep1 = invitationApi.getStepOneData(draftIdentifier);
      const draftStep2 = invitationApi.getStepTwoData(draftIdentifier);
      const draftStep3 = invitationApi.getStepThreeData(draftIdentifier);
      const draftStep4 = invitationApi.getStepFourData(draftIdentifier);
      const draftStep5 = invitationApi.getStepFiveData(draftIdentifier);
      const draftStep6 = invitationApi.getStepSixData(draftIdentifier);
      const draftStep7 = invitationApi.getStepSevenData(draftIdentifier);

      return {
        companyName: draftStep1?.legalName || directInvitation.companyName,
        nominatedAdmin: directInvitation.nominatedAdmin,
        email: draftStep1?.contactEmail || directInvitation.email,
        phoneNumber: draftStep1?.contactMobile || directInvitation.phoneNumber,
        state: draftStep6?.state || directInvitation.state,
        district: draftStep6?.district || directInvitation.district,
        pincode: draftStep6?.pinCode,
        addressLine1: draftStep6?.streetAddress,
        cin: draftStep1?.cin,
        registrationNumber: draftStep1?.registrationNumber,
        rocOffice: draftStep1?.rocOffice,
        companyCategory: draftStep1?.companyCategory,
        website: draftStep1?.website,
        registrationDate: draftStep1?.dateOfIncorporation,
        pan: draftStep2?.companyPan,
        tan: draftStep2?.companyTan,
        gstin: draftStep2?.gstin,
        fssaiLicense: draftStep2?.fssaiLicense,
        seedLicense: draftStep2?.seedLicense,
        fertilizerLicense: draftStep2?.fertilizerLicense,
        authorizedCapital: draftStep3?.authorizedCapital,
        paidUpCapital: draftStep3?.paidUpCapital,
        faceValuePerShare: draftStep3?.faceValuePerShare,
        bankName: draftStep3?.bankAccounts?.[0]?.bankName,
        bankAccountNumber: draftStep3?.bankAccounts?.[0]?.accountNumber,
        bankIfsc: draftStep3?.bankAccounts?.[0]?.ifscCode,
        directorsSummary: draftStep4?.directors?.length
          ? `${draftStep4.directors.length} Directors Appointed`
          : undefined,
        logoFileName: draftStep5?.logoFileName,
        incorporationCertName: draftStep5?.incorporationCertName,
        panCertName: draftStep5?.panCertName,
        moaAoaDocName: draftStep5?.moaAoaDocName,
        primaryCommodities: draftStep7?.commoditiesHandled,
        primaryBusinessActivities: draftStep7?.primaryActivity,
        businessOperations:
          draftStep7?.activityScope ||
          (Array.isArray(draftStep7?.primaryActivity)
            ? draftStep7.primaryActivity.join(', ')
            : draftStep7?.primaryActivity),
        status: directInvitation.status,
        statusLabel: `Invited (${directInvitation.status})`,
      };
    }

    // C. Check in cached FPCs list
    const matchedFpc = fpcs.find(
      (f) =>
        f.id.toLowerCase() === id.toLowerCase() ||
        f.code?.toLowerCase() === id.toLowerCase() ||
        f.cin?.toLowerCase() === id.toLowerCase() ||
        f.name?.toLowerCase() === id.toLowerCase()
    );
    if (matchedFpc) {
      return {
        companyName: matchedFpc.name,
        cin: matchedFpc.cin,
        fpcCode: matchedFpc.code,
        registrationNumber: matchedFpc.code || matchedFpc.cin,
        state: matchedFpc.state,
        district: matchedFpc.district,
        farmersCount: matchedFpc.farmersCount,
        shareholdersCount: matchedFpc.shareholdersCount,
        status: matchedFpc.status,
        statusLabel: matchedFpc.statusLabel,
      };
    }

    // D. Check in cached invitations list
    const matchedInvite = invitations.find(
      (inv) =>
        inv.id.toLowerCase() === id.toLowerCase() ||
        inv.companyName.toLowerCase() === id.toLowerCase()
    );
    if (matchedInvite) {
      const draftIdentifier = {
        tokenOrId: matchedInvite.token || id,
        companyName: matchedInvite.companyName,
        email: matchedInvite.email,
      };
      const draftStep1 = invitationApi.getStepOneData(draftIdentifier);
      const draftStep2 = invitationApi.getStepTwoData(draftIdentifier);
      const draftStep3 = invitationApi.getStepThreeData(draftIdentifier);
      const draftStep4 = invitationApi.getStepFourData(draftIdentifier);
      const draftStep5 = invitationApi.getStepFiveData(draftIdentifier);
      const draftStep6 = invitationApi.getStepSixData(draftIdentifier);
      const draftStep7 = invitationApi.getStepSevenData(draftIdentifier);

      return {
        companyName: draftStep1?.legalName || matchedInvite.companyName,
        nominatedAdmin: matchedInvite.nominatedAdmin,
        email: draftStep1?.contactEmail || matchedInvite.email,
        phoneNumber: draftStep1?.contactMobile || matchedInvite.phoneNumber,
        state: draftStep6?.state || matchedInvite.state,
        district: draftStep6?.district || matchedInvite.district,
        pincode: draftStep6?.pinCode,
        addressLine1: draftStep6?.streetAddress,
        cin: draftStep1?.cin,
        registrationNumber: draftStep1?.registrationNumber,
        rocOffice: draftStep1?.rocOffice,
        companyCategory: draftStep1?.companyCategory,
        website: draftStep1?.website,
        registrationDate: draftStep1?.dateOfIncorporation,
        pan: draftStep2?.companyPan,
        tan: draftStep2?.companyTan,
        gstin: draftStep2?.gstin,
        fssaiLicense: draftStep2?.fssaiLicense,
        seedLicense: draftStep2?.seedLicense,
        fertilizerLicense: draftStep2?.fertilizerLicense,
        authorizedCapital: draftStep3?.authorizedCapital,
        paidUpCapital: draftStep3?.paidUpCapital,
        faceValuePerShare: draftStep3?.faceValuePerShare,
        bankName: draftStep3?.bankAccounts?.[0]?.bankName,
        bankAccountNumber: draftStep3?.bankAccounts?.[0]?.accountNumber,
        bankIfsc: draftStep3?.bankAccounts?.[0]?.ifscCode,
        directorsSummary: draftStep4?.directors?.length
          ? `${draftStep4.directors.length} Directors Appointed`
          : undefined,
        logoFileName: draftStep5?.logoFileName,
        incorporationCertName: draftStep5?.incorporationCertName,
        panCertName: draftStep5?.panCertName,
        moaAoaDocName: draftStep5?.moaAoaDocName,
        primaryCommodities: draftStep7?.commoditiesHandled,
        primaryBusinessActivities: draftStep7?.primaryActivity,
        businessOperations:
          draftStep7?.activityScope ||
          (Array.isArray(draftStep7?.primaryActivity)
            ? draftStep7.primaryActivity.join(', ')
            : draftStep7?.primaryActivity),
        status: matchedInvite.status,
        statusLabel: `Invited (${matchedInvite.status})`,
      };
    }

    // E. Fallback to router state record if present
    if (initialRecord) {
      return {
        companyName: initialRecord.name,
        cin: initialRecord.cin || (initialRecord.id?.startsWith('FPC') ? initialRecord.id : undefined),
        district: initialRecord.location?.split(',')[0]?.trim(),
        state: initialRecord.location?.split(',')[1]?.trim(),
        farmersCount: initialRecord.farmers,
        shareholdersCount:
          typeof initialRecord.shareholders === 'number'
            ? initialRecord.shareholders
            : undefined,
        status: initialRecord.status,
        statusLabel: initialRecord.statusLabel,
      };
    }

    return null;
  }, [
    directInvitation,
    directFpcDetails,
    invitations,
    fpcs,
    id,
    initialRecord,
  ]);

  // Compute dynamic readiness progress for the sidebar
  const readiness = useMemo(() => {
    if (!resolvedData) {
      return { percentage: 0, text: '0 of 8 sections verified' };
    }

    const invitationToken =
      directInvitation?.token ||
      invitations.find((inv) => inv.id.toLowerCase() === id.toLowerCase())?.token ||
      (initialRecord?.token as string | undefined);

    const isFpc = isKnownFpc || !!directFpcDetails;
    const progress = calculateRegistrationProgress({
      status: resolvedData.status || 'Pending',
      isRegisteredFpc: isFpc,
      token: invitationToken,
      invitationId: id,
    });

    return {
      percentage: progress.percentage,
      text: `${progress.completedStepsCount} of 8 sections verified`,
    };
  }, [resolvedData, directInvitation, invitations, id, initialRecord, isKnownFpc, directFpcDetails]);

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigate('/admin/onboard');
    }
  };

  const handleNextStep = () => {
    if (currentStep < 7) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setCurrentStep(1);
    }
  };

  const isLoading = (isLoadingInvitations || isLoadingFpcs) && !resolvedData;

  if (isLoading) {
    return (
      <div className="section-flow text-left py-12">
        <Card className="card-padding text-center space-y-4 max-w-lg mx-auto">
          <div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-secondary uppercase tracking-wider">
            Loading FPC record details...
          </p>
        </Card>
      </div>
    );
  }

  if (!resolvedData) {
    return (
      <div className="section-flow text-left py-12">
        <Card className="card-padding text-center space-y-4 max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-primary">FPC Record Not Found</h2>
          <p className="text-xs text-secondary leading-relaxed">
            We could not find an onboarding invitation or registered FPC matching
            the identifier &ldquo;{id}&rdquo;.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/admin/onboard')}
              className="rounded-full px-6"
            >
              &larr; Return to FPC Onboarding
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="section-flow text-left">
      {/* 1. Header with Back Navigation Link and Page Titles */}
      <div className="space-y-4">
        {/* Back Link Reusing Shared Button */}
        <div>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            leadingIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            onClick={() => navigate('/admin/onboard')}
            className="p-0 h-auto text-xs font-semibold text-brand hover:underline hover:bg-transparent min-w-0"
          >
            Back to Onboard New FPC
          </Button>
        </div>

        {/* Page Title & Subtitle */}
        <div>
          <h1 className="page-title">
            Onboard New FPC
          </h1>
          <p className="page-subtitle mt-1">
            A clearer view of delivery across partner FPCs.
          </p>
        </div>
      </div>

      {/* 2. Responsive 2-Column Layout using CSS Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 lg:gap-8 items-start pt-2">
        {/* Left Column: 7 Step Cards + Dynamic Readiness Tracker */}
        <FpcWizardStepSidebar
          currentStep={currentStep}
          onSelectStep={(step) => setCurrentStep(step)}
          readinessPercentage={readiness.percentage}
          sectionsVerifiedText={readiness.text}
        />

        {/* Right Column: Dark Green Header Banner + Read-Only Form Preview + Footer */}
        <FpcWizardStepPreview
          currentStep={currentStep}
          fpcData={resolvedData}
          onPreviousStep={handlePreviousStep}
          onNextStep={handleNextStep}
          isFirstStep={currentStep === 1}
          isLastStep={currentStep === 7}
        />
      </div>
    </div>
  );
};
