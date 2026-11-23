import { useState, type FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Eye, EyeOff, Check, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useValidateResetTokenQuery, useResetPasswordMutation } from '../features/auth/api/authApi';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../features/auth/schemas/passwordReset.schema';
import { Button, Input, Card, Alert, LoginHeader } from '../shared/components';

export const ResetPasswordPage: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawToken = searchParams.get('token') || '';

  const { data: validationResult, isLoading: isValidating, isError: isValidationError } = useValidateResetTokenQuery(
    { token: rawToken },
    { skip: !rawToken }
  );

  const [resetPassword, { isLoading: isSubmitting }] = useResetPasswordMutation();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetSuccess, setIsResetSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const newPassword = watch('newPassword') || '';
  const confirmPassword = watch('confirmPassword') || '';

  // Live password complexity indicators
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasDigit = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const isFormValid =
    hasMinLength &&
    hasUpper &&
    hasLower &&
    hasDigit &&
    hasSpecial &&
    passwordsMatch;

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setSubmitError('');

    try {
      await resetPassword({
        token: rawToken.trim(),
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      }).unwrap();

      setIsResetSuccess(true);
    } catch (err: unknown) {
      const errorObj = err as { data?: { detail?: string; message?: string } | string };
      let detail = 'Unable to reset your password. Please ensure all requirements are satisfied or request a new link.';
      if (typeof errorObj?.data === 'string') {
        detail = errorObj.data;
      } else if (errorObj?.data?.detail) {
        detail = errorObj.data.detail;
      } else if (errorObj?.data?.message) {
        detail = errorObj.data.message;
      }
      setSubmitError(detail);
    }
  };

  const isTokenValid = !isValidating && !isValidationError && validationResult?.data?.isValid;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-between font-sans">
      <LoginHeader />

      <main className="w-full flex items-center justify-center px-4 py-4 sm:py-6 flex-1 my-auto">
        <Card className="w-full max-w-[380px] rounded-login-card card-padding shadow-xs">
          {/* State 1: Missing Token in URL */}
          {!rawToken && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 mx-auto flex items-center justify-center">
                <AlertCircle className="w-7 h-7 stroke-[2]" />
              </div>
              <div className="space-y-1">
                <h2 className="modal-title text-primary">Missing Reset Token</h2>
                <p className="text-xs text-secondary">
                  No password reset token was provided in your link. Please use the link sent to your email or request a new one.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => navigate('/forgot-password')}
                className="w-full h-10 bg-brand text-white font-semibold rounded-control hover:bg-brand-hover"
              >
                Request new link
              </Button>
            </div>
          )}

          {/* State 2: Validating Token */}
          {rawToken && isValidating && (
            <div className="text-center py-8 space-y-3">
              <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto" />
              <p className="text-sm font-medium text-secondary">Verifying password reset link...</p>
            </div>
          )}

          {/* State 3: Invalid or Expired Token */}
          {rawToken && !isValidating && !isTokenValid && !isResetSuccess && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
                <AlertCircle className="w-7 h-7 stroke-[2]" />
              </div>
              <div className="space-y-1">
                <h2 className="modal-title text-primary">Link Expired or Invalid</h2>
                <p className="text-xs text-secondary leading-relaxed">
                  This password reset link is invalid, has expired, or has already been used. Reset links are valid for <strong>30 minutes</strong> and can only be used once.
                </p>
              </div>
              <div className="pt-2 space-y-2">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/forgot-password')}
                  className="w-full h-10 bg-brand text-white font-semibold rounded-control hover:bg-brand-hover"
                >
                  Request a new link
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => navigate('/login')}
                  className="w-full text-secondary hover:text-primary font-normal"
                >
                  Back to sign in
                </Button>
              </div>
            </div>
          )}

          {/* State 4: Reset Password Success Confirmation */}
          {isResetSuccess && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#0F4C36] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 stroke-[2]" />
              </div>
              <div className="space-y-1">
                <h2 className="modal-title text-primary">Password Reset Complete</h2>
                <p className="text-xs text-secondary leading-relaxed">
                  Your password has been successfully updated. All active sessions have been secured, and you can now sign in using your new credentials.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => navigate('/login', { replace: true })}
                className="w-full h-10 bg-brand text-white font-semibold rounded-control hover:bg-brand-hover"
              >
                Proceed to sign in
              </Button>
            </div>
          )}

          {/* State 5: Active Form for Valid Token */}
          {rawToken && isTokenValid && !isResetSuccess && (
            <>
              <div className="text-left mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-[#E8F2EE] text-[#0F4C36]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <h2 className="modal-title text-primary">
                    Create new password
                  </h2>
                </div>
                <p className="text-xs text-secondary">
                  {validationResult?.data?.email ? (
                    <>
                      Updating credentials for <strong className="text-primary">{validationResult.data.email}</strong>.
                    </>
                  ) : (
                    'Set a strong, permanent password for your account.'
                  )}
                </p>
              </div>

              {submitError && (
                <Alert tone="danger" variant="card" className="mb-4">
                  {submitError}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-0 text-left" noValidate>
                {/* New Password */}
                <div className="mb-3">
                  <Input
                    id="reset-new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    label="New password *"
                    placeholder="••••••••••••"
                    size="sm"
                    error={errors.newPassword?.message}
                    className="h-10 text-primary bg-white border border-neutral-200 rounded-control hover:border-neutral-400 focus:ring-2 focus:ring-brand"
                    trailingIcon={
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        iconOnly
                        tabIndex={-1}
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        className="text-brand hover:text-brand-hover hover:bg-transparent p-0 w-5 h-5 min-w-0"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4 stroke-[2]" />
                        ) : (
                          <Eye className="w-4 h-4 stroke-[2]" />
                        )}
                      </Button>
                    }
                    {...register('newPassword')}
                    autoFocus
                  />
                </div>

                {/* Confirm Password */}
                <div className="mb-3.5">
                  <Input
                    id="reset-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm new password *"
                    placeholder="••••••••••••"
                    size="sm"
                    error={errors.confirmPassword?.message}
                    className="h-10 text-primary bg-white border border-neutral-200 rounded-control hover:border-neutral-400 focus:ring-2 focus:ring-brand"
                    trailingIcon={
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        iconOnly
                        tabIndex={-1}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        className="text-brand hover:text-brand-hover hover:bg-transparent p-0 w-5 h-5 min-w-0"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4 stroke-[2]" />
                        ) : (
                          <Eye className="w-4 h-4 stroke-[2]" />
                        )}
                      </Button>
                    }
                    {...register('confirmPassword')}
                  />
                </div>

                {/* Requirements Checklist */}
                <div className="bg-[#F8FAF9] rounded-xl p-3 text-xs space-y-1.5 border border-neutral-200/80 mb-4">
                  <p className="font-semibold text-primary mb-1">Password requirements:</p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <RequirementItem met={hasMinLength} label="At least 8 characters" />
                    <RequirementItem met={hasUpper} label="1+ uppercase letter" />
                    <RequirementItem met={hasLower} label="1+ lowercase letter" />
                    <RequirementItem met={hasDigit} label="1+ numeric digit" />
                    <RequirementItem met={hasSpecial} label="1+ special symbol" />
                    <RequirementItem met={passwordsMatch} label="Passwords match" />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isSubmitting}
                  loadingText="Updating password..."
                  disabled={!isFormValid || isSubmitting}
                  className="w-full h-10 bg-brand text-white font-semibold rounded-control hover:bg-brand-hover active:bg-brand-active shadow-xs"
                >
                  Set permanent password
                </Button>

                <div className="pt-4 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => navigate('/login')}
                    className="p-0 h-auto font-medium text-brand hover:underline hover:bg-transparent inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to sign in
                  </Button>
                </div>
              </form>
            </>
          )}
        </Card>
      </main>

      <footer className="w-full page-header-spacing py-4 text-left">
        <small className="text-secondary font-normal">
          Secure access · TSF FPC Management / v1.0
        </small>
      </footer>
    </div>
  );
};

const RequirementItem: FC<{ met: boolean; label: string }> = ({ met, label }) => (
  <div className={`flex items-center gap-1.5 text-[11px] ${met ? 'text-[#0F4C36] font-medium' : 'text-neutral-400'}`}>
    <div
      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
        met ? 'bg-[#0F4C36] text-white' : 'bg-neutral-200 text-transparent'
      }`}
    >
      <Check className="w-2.5 h-2.5 stroke-[3]" />
    </div>
    <span className="truncate">{label}</span>
  </div>
);

export default ResetPasswordPage;
