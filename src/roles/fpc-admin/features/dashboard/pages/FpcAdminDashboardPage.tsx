import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  FileText,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Landmark,
} from 'lucide-react';
import { useAppSelector } from '../../../../../app/store/hooks';
import { useGetFpcDetailsQuery } from '../../../../../features/fpc/api/fpcApi';
import { Button, Card, Badge } from '../../../../../shared/components';

export const FpcAdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeFpcId, currentUser } = useAppSelector((state) => state.auth);

  const { data: fpc, isLoading } = useGetFpcDetailsQuery(activeFpcId || '', {
    skip: !activeFpcId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F4C36]" />
      </div>
    );
  }

  const isApproved = fpc?.status === 'Active' || fpc?.statusLabel === 'Active';
  const isSubmitted = fpc?.statusLabel === 'Pending Review';
  const progress = fpc?.registrationProgressPercentage ?? 0;
  const completedSteps = fpc?.completedStepsCount ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0E1B16]">
            {fpc?.name || currentUser?.activeFpcName || 'FPC Admin Portal'}
          </h1>
          <p className="text-sm text-[#5b6b63]">
            {fpc?.district && fpc?.state ? `${fpc.district}, ${fpc.state}` : 'Farmer Producer Company Management'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isApproved ? (
            <Badge variant="success" className="px-3 py-1 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" /> Approved Enterprise
            </Badge>
          ) : isSubmitted ? (
            <Badge variant="info" className="px-3 py-1 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 mr-1 inline" /> Under TSF Review
            </Badge>
          ) : (
            <Badge variant="warning" className="px-3 py-1 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 mr-1 inline" /> Registration Draft ({progress}%)
            </Badge>
          )}
        </div>
      </div>

      {/* Onboarding Banner for Incomplete Registration */}
      {!isApproved && (
        <div className="bg-gradient-to-r from-[#0F4C36] to-[#1E6B52] rounded-xl text-white p-6 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-block bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
                {isSubmitted ? 'Dossier Under Review' : 'Deferred Registration'}
              </span>
              <h2 className="text-xl font-bold">
                {isSubmitted
                  ? 'Your Registration Dossier Has Been Submitted'
                  : 'Complete Your 8-Step Company Registration'}
              </h2>
              <p className="text-sm text-white/80">
                {isSubmitted
                  ? 'Your statutory details and documents are being reviewed by Tata Steel Foundation Administrators. You will be notified once approved.'
                  : 'You have temporary access to the portal. Please complete statutory details, board of directors, and licenses to submit your company for approval.'}
              </p>

              {/* Progress bar */}
              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1 text-white/90">
                  <span>Registration Progress</span>
                  <span>{progress}% ({completedSteps} of 8 steps)</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-[#52D19D] h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(progress, 5)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button
                variant="secondary"
                className="bg-white text-[#0F4C36] hover:bg-white/90 font-semibold flex items-center justify-center gap-2"
                onClick={() => navigate('/fpc/register')}
              >
                <span>{isSubmitted ? 'View Submitted Dossier' : 'Resume Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4 border border-[#E1E8E6]">
          <div className="p-3 rounded-xl bg-[#E8F2EE] text-[#0F4C36]">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#5b6b63]">Enterprise Status</p>
            <p className="text-lg font-bold text-[#0E1B16]">{fpc?.statusLabel || 'Draft'}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border border-[#E1E8E6]">
          <div className="p-3 rounded-xl bg-[#EBF3FF] text-[#1D63ED]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#5b6b63]">Farmers Registered</p>
            <p className="text-lg font-bold text-[#0E1B16]">{fpc?.farmersCount ?? 0}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border border-[#E1E8E6]">
          <div className="p-3 rounded-xl bg-[#F0FDF4] text-[#16A34A]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#5b6b63]">Documents Uploaded</p>
            <p className="text-lg font-bold text-[#0E1B16]">{fpc?.documents?.length ?? 0}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border border-[#E1E8E6]">
          <div className="p-3 rounded-xl bg-[#FEF3F2] text-[#D92D20]">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#5b6b63]">Bank Account</p>
            <p className="text-sm font-bold text-[#0E1B16] truncate max-w-[150px]">
              {fpc?.bankName ? fpc.bankName : 'Pending Details'}
            </p>
          </div>
        </Card>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Statutory Details */}
        <Card className="lg:col-span-2 p-6 border border-[#E1E8E6] space-y-5">
          <div className="flex items-center justify-between border-b border-[#E1E8E6] pb-4">
            <div className="flex items-center gap-2 text-[#0E1B16]">
              <ShieldCheck className="w-5 h-5 text-[#0F4C36]" />
              <h3 className="font-bold text-base">Company Statutory Overview</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/fpc/register')}
            >
              {isSubmitted ? 'View Details' : 'Edit Details'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-[#5b6b63] block">Legal Company Name</span>
              <span className="font-semibold text-[#0E1B16]">{fpc?.name || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-xs text-[#5b6b63] block">Corporate Identification Number (CIN)</span>
              <span className="font-mono text-xs font-semibold text-[#0E1B16]">
                {fpc?.cin || 'Pending completion'}
              </span>
            </div>
            <div>
              <span className="text-xs text-[#5b6b63] block">Permanent Account Number (PAN)</span>
              <span className="font-mono text-xs font-semibold text-[#0E1B16]">
                {fpc?.pan || 'Pending completion'}
              </span>
            </div>
            <div>
              <span className="text-xs text-[#5b6b63] block">Date of Incorporation</span>
              <span className="font-semibold text-[#0E1B16]">
                {fpc?.registrationDate || 'Pending completion'}
              </span>
            </div>
            <div>
              <span className="text-xs text-[#5b6b63] block">Registered State & District</span>
              <span className="font-semibold text-[#0E1B16]">
                {fpc?.district && fpc?.state ? `${fpc.district}, ${fpc.state}` : 'Pending completion'}
              </span>
            </div>
            <div>
              <span className="text-xs text-[#5b6b63] block">Primary Contact Mobile</span>
              <span className="font-semibold text-[#0E1B16]">
                {fpc?.primaryMobile || 'Pending completion'}
              </span>
            </div>
          </div>

          <div className="border-t border-[#E1E8E6] pt-4">
            <span className="text-xs text-[#5b6b63] block mb-1">Registered Office Address</span>
            <p className="text-sm text-[#0E1B16]">
              {fpc?.addressLine1
                ? `${fpc.addressLine1}${fpc.addressLine2 ? `, ${fpc.addressLine2}` : ''}, ${fpc.district}, ${fpc.state} - ${fpc.pincode || ''}`
                : 'Registered address will be populated from your 8-step registration submission.'}
            </p>
          </div>
        </Card>

        {/* Quick Operations Guide */}
        <Card className="p-6 border border-[#E1E8E6] space-y-4">
          <h3 className="font-bold text-base text-[#0E1B16]">Onboarding Checklist</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <div className={`mt-0.5 rounded-full p-0.5 ${completedSteps >= 1 ? 'bg-[#0F4C36] text-white' : 'bg-[#E1E8E6] text-[#7D8A85]'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className={completedSteps >= 1 ? 'text-[#0E1B16]' : 'text-[#7D8A85]'}>
                Step 1: Company Profile & CIN
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className={`mt-0.5 rounded-full p-0.5 ${completedSteps >= 2 ? 'bg-[#0F4C36] text-white' : 'bg-[#E1E8E6] text-[#7D8A85]'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className={completedSteps >= 2 ? 'text-[#0E1B16]' : 'text-[#7D8A85]'}>
                Step 2: Legal & Tax Identifiers
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className={`mt-0.5 rounded-full p-0.5 ${completedSteps >= 3 ? 'bg-[#0F4C36] text-white' : 'bg-[#E1E8E6] text-[#7D8A85]'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className={completedSteps >= 3 ? 'text-[#0E1B16]' : 'text-[#7D8A85]'}>
                Step 3: Bank Accounts & Capital
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className={`mt-0.5 rounded-full p-0.5 ${completedSteps >= 4 ? 'bg-[#0F4C36] text-white' : 'bg-[#E1E8E6] text-[#7D8A85]'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className={completedSteps >= 4 ? 'text-[#0E1B16]' : 'text-[#7D8A85]'}>
                Step 4: Board of Directors
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className={`mt-0.5 rounded-full p-0.5 ${completedSteps >= 5 ? 'bg-[#0F4C36] text-white' : 'bg-[#E1E8E6] text-[#7D8A85]'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className={completedSteps >= 5 ? 'text-[#0E1B16]' : 'text-[#7D8A85]'}>
                Step 5: Statutory Documents Upload
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className={`mt-0.5 rounded-full p-0.5 ${completedSteps >= 6 ? 'bg-[#0F4C36] text-white' : 'bg-[#E1E8E6] text-[#7D8A85]'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className={completedSteps >= 6 ? 'text-[#0E1B16]' : 'text-[#7D8A85]'}>
                Step 6: Registered Address & Location
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className={`mt-0.5 rounded-full p-0.5 ${completedSteps >= 7 ? 'bg-[#0F4C36] text-white' : 'bg-[#E1E8E6] text-[#7D8A85]'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className={completedSteps >= 7 ? 'text-[#0E1B16]' : 'text-[#7D8A85]'}>
                Step 7: Business Activities & Produce
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className={`mt-0.5 rounded-full p-0.5 ${isSubmitted || isApproved ? 'bg-[#0F4C36] text-white' : 'bg-[#E1E8E6] text-[#7D8A85]'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className={isSubmitted || isApproved ? 'text-[#0F4C36] font-semibold' : 'text-[#7D8A85]'}>
                Step 8: Submission & Verification
              </span>
            </li>
          </ul>

          <div className="pt-2">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => navigate('/fpc/register')}
            >
              {isSubmitted ? 'View Registration' : 'Open Registration Form'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
