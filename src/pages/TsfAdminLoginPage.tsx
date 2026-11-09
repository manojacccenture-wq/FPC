import { useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useLoginMutation } from '../features/auth/api/authApi';
import { useAppDispatch } from '../app/store/hooks';
import { setCredentials, setPendingTwoFactor, type CurrentUserProfile } from '../features/auth/slices/authSlice';
import { loginSchema, type LoginFormValues } from '../features/auth/schemas/login.schema';
import { Button, Input, Checkbox, Card, Alert, Modal, LoginHeader } from '../shared/components';

interface TsfAdminLoginPageProps {
  isEmbedPreview?: boolean;
  onSuccessLogin?: (role?: string) => void;
  showDemoCredentials?: boolean;
}

export const TsfAdminLoginPage: FC<TsfAdminLoginPageProps> = ({
  isEmbedPreview = false,
  onSuccessLogin,
  showDemoCredentials = true,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@tsf.org',
      password: 'TsfAdmin@2026!',
      rememberMe: false,
    },
    mode: 'onBlur',
  });

  const rememberMe = watch('rememberMe');

  // Retained non-form UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  const handleSignIn = async (values: LoginFormValues) => {
    setErrorMessage('');

    try {
      const response = await login({
        email: values.email.trim(),
        password: values.password,
      }).unwrap();

      if (response.success && response.data) {
        // Detect 2FA challenge response
        if ('challengeId' in response.data && response.data.challengeId) {
          dispatch(
            setPendingTwoFactor({
              challengeId: response.data.challengeId,
              email: values.email.trim(),
              message: response.data.message || response.message,
            })
          );

          // Do NOT mark authenticated; navigate to the 2FA verification page
          navigate('/verify-2fa');
          return;
        }

        // Direct authentication without 2FA
        const userProfile = response.data as CurrentUserProfile;
        dispatch(
          setCredentials({
            user: userProfile,
            activeFpcId: userProfile.activeFpcId ?? undefined,
            activeRole: userProfile.activeRoleCode ?? undefined,
            memberships: userProfile.memberships,
          })
        );

        setLoginSuccess(true);

        if (onSuccessLogin) {
          onSuccessLogin(userProfile.activeRoleCode || 'TSF Admin');
        }

        // Navigate directly to the TSF Admin onboard page
        navigate('/admin/onboard');
      } else {
        setErrorMessage(response.message || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { detail?: string; message?: string } | string };
      let detail = 'Authentication failed. Please verify your credentials.';

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

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setValue('email', demoEmail, { shouldValidate: true, shouldDirty: true });
    setValue('password', demoPass, { shouldValidate: true, shouldDirty: true });
    setErrorMessage('');
  };

  return (
    <div className={`min-h-screen w-full bg-neutral-50 text-primary flex flex-col justify-between selection:bg-forest-200 ${isEmbedPreview ? 'rounded-card overflow-hidden' : ''}`}>

      {/* =========================================================================
          1. Top Navigation Bar: White Background & English Pill Button (Right)
          ========================================================================= */}
      <LoginHeader />

      {/* =========================================================================
          2. Hero Section: Anchored Upper-Left
          ========================================================================= */}
      <div className="w-full page-header-spacing pt-2 sm:pt-4 text-left">
        <div className="max-w-[480px]">
          {/* Eyebrow */}
          <div className="floating-label font-bold text-brand mb-2">
            CENTRAL ADMINISTRATION
          </div>

          {/* Heading */}
          <h1 className="page-heading text-primary mb-1.5">
            Supporting the people<br className="hidden sm:inline" /> behind stronger FPCs.
          </h1>

          {/* Subtitle */}
          <p className="text-secondary">
            A secure workspace for TSF programme administrators.
          </p>
        </div>
      </div>

      {/* =========================================================================
          3. Login Card: Horizontally Centered in Viewport Reusing Shared Card
          ========================================================================= */}
      <main className="w-full flex items-center justify-center px-4 py-4 sm:py-6 flex-1 my-auto">
        <Card className="w-full max-w-[360px] rounded-login-card card-padding shadow-xs">

          {/* Title & Subtitle */}
          <div className="text-left mb-5">
            <h2 className="modal-title text-primary mb-1">
              Welcome back
            </h2>
            <p className="text-secondary">
              Sign in to TSF Central Admin
            </p>
          </div>

          {/* Success Notification: Reusing Shared Alert */}
          {loginSuccess && (
            <Alert tone="success" variant="card" className="mb-4">
              Authentication successful! Navigating to dashboard...
            </Alert>
          )}

          {/* Error Notification: Reusing Shared Alert */}
          {errorMessage && (
            <Alert tone="danger" variant="card" className="mb-4">
              {errorMessage}
            </Alert>
          )}

          {/* Login Form Reusing Shared Input, Checkbox, and Button */}
          <form onSubmit={handleSubmit(handleSignIn)} className="space-y-0 text-left" noValidate>

            {/* Email address field: Reusing Shared Input */}
            <div className="mb-3.5">
              <Input
                id="login-email"
                type="email"
                label="Email address *"
                placeholder="admin@tsf.org"
                size="sm"
                error={errors.email?.message}
                className="h-10 text-primary bg-white border border-neutral-200 rounded-control hover:border-neutral-400 focus:ring-2 focus:ring-brand"
                {...register('email')}
              />
            </div>

            {/* Password field: Reusing Shared Input with trailingIcon password reveal */}
            <div className="mb-3">
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                label="Password *"
                placeholder="••••••••••••"
                size="sm"
                error={errors.password?.message}
                className="h-10 text-primary bg-white border border-neutral-200 rounded-control hover:border-neutral-400 focus:ring-2 focus:ring-brand"
                trailingIcon={
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    iconOnly
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-brand hover:text-brand-hover hover:bg-transparent p-0 w-5 h-5 min-w-0"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 stroke-[2]" />
                    ) : (
                      <Eye className="w-4 h-4 stroke-[2]" />
                    )}
                  </Button>
                }
                {...register('password')}
              />
            </div>

            {/* Remember me & Forgot password row */}
            <div className="flex items-center justify-between text-xs pt-1.5 pb-4 select-none">
              <Checkbox
                id="login-remember-me"
                size="sm"
                checked={rememberMe}
                label="REMEMBER ME"
                labelClassName="floating-label font-semibold text-brand"
                {...register('rememberMe')}
              />

              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setForgotModalOpen(true)}
                className="p-0 h-auto floating-label font-semibold text-brand hover:underline hover:bg-transparent min-w-0"
              >
                FORGOT PASSWORD?
              </Button>
            </div>

            {/* Sign in Button: Reusing Shared Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isLoading}
              loadingText="Signing in..."
              className="w-full h-10 bg-brand text-white font-semibold rounded-control hover:bg-brand-hover active:bg-brand-active shadow-xs"
            >
              Sign in
            </Button>
          </form>

          {/* Test Credentials Helper Pill */}
          {showDemoCredentials && (
            <div className="mt-4 pt-3 border-t border-neutral-100 text-left space-y-2">
              <div className="floating-label font-semibold text-neutral-500">
                Test Credentials (Click to fill)
              </div>
              <div
                onClick={() => handleFillDemo('manojkr@lhsindia.com', 'TsfAdmin@2026!')}
                className="p-2 rounded-control bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-800 cursor-pointer hover:bg-amber-100 transition-colors select-none"
                title="Click to load manojkr@lhsindia.com credentials (2FA Enforced)"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <small className="font-medium">manojkr@lhsindia.com</small>
                  <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1 py-0.5 rounded font-semibold uppercase">2FA</span>
                </div>
                <code className="floating-label bg-white/80 px-1.5 py-0.5 rounded text-neutral-600">
                  TsfAdmin@2026!
                </code>
              </div>
              <div
                onClick={() => handleFillDemo('admin@tsf.org', 'TsfAdmin@2026!')}
                className="p-2 rounded-control bg-brand-soft border border-forest-200 flex items-center justify-between text-xs text-brand cursor-pointer hover:bg-forest-100 transition-colors select-none"
                title="Click to load admin@tsf.org credentials"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0" />
                  <small className="font-medium">admin@tsf.org</small>
                </div>
                <code className="floating-label bg-white/80 px-1.5 py-0.5 rounded text-neutral-600">
                  TsfAdmin@2026!
                </code>
              </div>
              <div
                onClick={() => handleFillDemo('admin@fpc.gov.in', 'Admin@2026!')}
                className="p-2 rounded-control bg-neutral-100 border border-neutral-200 flex items-center justify-between text-xs text-neutral-700 cursor-pointer hover:bg-neutral-200/70 transition-colors select-none"
                title="Click to load admin@fpc.gov.in credentials"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <small className="font-medium">admin@fpc.gov.in</small>
                </div>
                <code className="floating-label bg-white/80 px-1.5 py-0.5 rounded text-neutral-600">
                  Admin@2026!
                </code>
              </div>
            </div>
          )}

        </Card>
      </main>

      {/* =========================================================================
          4. Footer: Edge-to-Edge Left Anchored
          ========================================================================= */}
      <footer className="w-full page-header-spacing py-4 text-left">
        <small className="text-secondary font-normal">
          Secure access · TSF FPC Management / v1.0
        </small>
      </footer>

      {/* Reset Password: Reusing Shared Modal & Button */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Password"
        size="sm"
        footer={
          <div className="flex justify-end w-full">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setForgotModalOpen(false)}
              className="px-4 py-1.5 bg-brand text-white font-semibold rounded-xs hover:bg-brand-hover"
            >
              Got it
            </Button>
          </div>
        }
      >
        <p className="text-secondary leading-relaxed">
          For administrative security, password resets must be authorized by the TSF Super Administrator. Please contact <strong>support@tsf.org</strong>.
        </p>
      </Modal>

    </div>
  );
};
