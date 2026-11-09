import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react';
import { useVerifyTwoFactorMutation, useResendTwoFactorMutation } from '../features/auth/api/authApi';
import { useAppDispatch, useAppSelector } from '../app/store/hooks';
import { setCredentials, clearPendingTwoFactor, setPendingTwoFactor } from '../features/auth/slices/authSlice';
import { twoFactorSchema, type TwoFactorFormValues } from '../features/auth/schemas/twoFactor.schema';
import { Button, Input, Card, Alert, LoginHeader } from '../shared/components';

const RESEND_COOLDOWN_SECONDS = 60;

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  return `${local[0]}${'*'.repeat(Math.max(1, local.length - 2))}${local[local.length - 1]}@${domain}`;
}

export const TwoFactorVerificationPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { pendingTwoFactor, isAuthenticated } = useAppSelector((state) => state.auth);

  const [verifyTwoFactor, { isLoading: isVerifying }] = useVerifyTwoFactorMutation();
  const [resendTwoFactor, { isLoading: isResending }] = useResendTwoFactorMutation();

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(
    pendingTwoFactor?.message || 'A 6-digit verification code has been dispatched. Enter it to complete authentication.'
  );
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/onboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Redirect to login if no pending 2FA challenge is present
  useEffect(() => {
    if (!pendingTwoFactor) {
      navigate('/login', { replace: true });
    }
  }, [pendingTwoFactor, navigate]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TwoFactorFormValues>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: '',
    },
    mode: 'onBlur',
  });

  const handleVerify = async (values: TwoFactorFormValues) => {
    if (!pendingTwoFactor) return;

    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await verifyTwoFactor({
        email: pendingTwoFactor.email,
        code: values.code.trim(),
        challengeId: pendingTwoFactor.challengeId,
      }).unwrap();

      if (response.success && response.data) {
        // Full authentication completed: set credentials and clear pending challenge
        dispatch(
          setCredentials({
            user: response.data,
            activeFpcId: response.data.activeFpcId ?? undefined,
            activeRole: response.data.activeRoleCode ?? undefined,
            memberships: response.data.memberships,
          })
        );

        dispatch(clearPendingTwoFactor());

        // Redirect to admin landing page
        navigate('/admin/onboard', { replace: true });
      } else {
        setErrorMessage(response.message || 'Verification failed. Please check the code and try again.');
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { detail?: string; message?: string } | string };
      let detail = 'Verification code is invalid or has expired. Please try again.';

      if (typeof errorObj?.data === 'string') {
        detail = errorObj.data;
      } else if (errorObj?.data?.detail) {
        detail = errorObj.data.detail;
      } else if (errorObj?.data?.message) {
        detail = errorObj.data.message;
      }

      setErrorMessage(detail);
      setValue('code', '');
    }
  };

  const handleResendOtp = async () => {
    if (!pendingTwoFactor || cooldown > 0 || isResending) return;

    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await resendTwoFactor({
        email: pendingTwoFactor.email,
        challengeId: pendingTwoFactor.challengeId,
      }).unwrap();

      if (response.success && response.data) {
        // Update challengeId with new challenge if returned
        dispatch(
          setPendingTwoFactor({
            ...pendingTwoFactor,
            challengeId: response.data.challengeId || pendingTwoFactor.challengeId,
            message: response.data.message || response.message,
          })
        );

        setSuccessMessage(response.data.message || 'A new 6-digit verification code has been dispatched.');
        setCooldown(RESEND_COOLDOWN_SECONDS);
        setValue('code', '');
      } else {
        setErrorMessage(response.message || 'Unable to resend verification code. Please try again later.');
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { detail?: string; message?: string } | string };
      let detail = 'Failed to resend verification code. Please try again.';

      if (typeof errorObj?.data === 'string') {
        detail = errorObj.data;
      } else if (errorObj?.data?.detail) {
        detail = errorObj.data.detail;
      } else if (errorObj?.data?.message) {
        detail = errorObj.data.message;
      }

      setErrorMessage(detail);
    }
  };

  const handleBackToLogin = () => {
    dispatch(clearPendingTwoFactor());
    navigate('/login', { replace: true });
  };

  if (!pendingTwoFactor) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-neutral-50 text-primary flex flex-col justify-between selection:bg-forest-200">
      {/* Top Navigation Header */}
      <LoginHeader />

      {/* Hero Section */}
      <div className="w-full page-header-spacing pt-2 sm:pt-4 text-left">
        <div className="max-w-[480px]">
          <div className="floating-label font-bold text-brand mb-2">
            CENTRAL ADMINISTRATION
          </div>
          <h1 className="page-heading text-primary mb-1.5">
            Two-Factor Verification
          </h1>
          <p className="text-secondary">
            Protecting your administrator workspace with enhanced multi-factor security.
          </p>
        </div>
      </div>

      {/* Centered Verification Card */}
      <main className="w-full flex items-center justify-center px-4 py-4 sm:py-6 flex-1 my-auto">
        <Card className="w-full max-w-[380px] rounded-login-card card-padding shadow-xs">
          {/* Card Header */}
          <div className="text-left mb-5">
            <div className="w-10 h-10 rounded-full bg-brand-soft border border-forest-200 flex items-center justify-center text-brand mb-3">
              <ShieldCheck className="w-5 h-5 text-brand" />
            </div>
            <h2 className="modal-title text-primary mb-1">
              Enter Verification Code
            </h2>
            <p className="text-secondary text-sm">
              We sent a 6-digit code to{' '}
              <strong className="text-primary font-medium">
                {maskEmail(pendingTwoFactor.email)}
              </strong>
            </p>
          </div>

          {/* Feedback Alerts */}
          {successMessage && (
            <Alert tone="success" variant="card" className="mb-4">
              {successMessage}
            </Alert>
          )}

          {errorMessage && (
            <Alert tone="danger" variant="card" className="mb-4">
              {errorMessage}
            </Alert>
          )}

          {/* 2FA Form */}
          <form onSubmit={handleSubmit(handleVerify)} className="space-y-4 text-left" noValidate>
            <div>
              <Input
                id="two-factor-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
                label="6-Digit Verification Code *"
                placeholder="123456"
                size="md"
                error={errors.code?.message}
                leadingIcon={<KeyRound className="w-4 h-4 text-neutral-400" />}
                className="h-11 text-center font-mono text-lg tracking-[0.3em] font-semibold text-primary bg-white border border-neutral-200 rounded-control hover:border-neutral-400 focus:ring-2 focus:ring-brand"
                {...register('code', {
                  onChange: (e) => {
                    // Allow only digits
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setValue('code', val, { shouldValidate: true });
                  },
                })}
              />
            </div>

            {/* Resend Action with Countdown */}
            <div className="flex items-center justify-between text-xs pt-1 select-none">
              <span className="text-neutral-500">
                Didn't receive the email?
              </span>

              {cooldown > 0 ? (
                <span className="floating-label font-medium text-neutral-400">
                  Resend in {cooldown}s
                </span>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="p-0 h-auto floating-label font-semibold text-brand hover:underline hover:bg-transparent min-w-0 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                  {isResending ? 'Sending...' : 'RESEND CODE'}
                </Button>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isVerifying}
              loadingText="Verifying code..."
              className="w-full h-10 bg-brand text-white font-semibold rounded-control hover:bg-brand-hover active:bg-brand-active shadow-xs"
            >
              Verify and sign in
            </Button>

            {/* Back to Login Action */}
            <div className="pt-2 text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBackToLogin}
                className="text-neutral-500 hover:text-primary hover:bg-transparent font-medium text-xs flex items-center justify-center gap-1.5 w-full"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Sign in with a different account
              </Button>
            </div>
          </form>
        </Card>
      </main>

      {/* Footer */}
      <footer className="w-full page-header-spacing py-4 text-left">
        <small className="text-secondary font-normal">
          Secure access · TSF FPC Management / v1.0
        </small>
      </footer>
    </div>
  );
};

