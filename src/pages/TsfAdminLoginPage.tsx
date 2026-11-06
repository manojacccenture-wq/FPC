import { useState, type FC, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { authApi } from '../features/auth/api/auth.api';
import { Button, Input, Checkbox, Card, Alert, Modal } from '../shared/components';

interface TsfAdminLoginPageProps {
  isEmbedPreview?: boolean;
  onSuccessLogin?: (role?: string) => void;
  showDemoCredentials?: boolean;
}

export const TsfAdminLoginPage: FC<TsfAdminLoginPageProps> = ({
  isEmbedPreview = false,
  onSuccessLogin,
  showDemoCredentials = false
}) => {
  const navigate = useNavigate();

  // Pure local React state - strictly ZERO useEffect used
  const [email, setEmail] = useState('admin@tsf.org');
  const [password, setPassword] = useState('tsfAdmin@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      // Execute authentication service API
      const user = await authApi.login({ email, password, rememberMe });

      // Store session securely based on remember me selection
      const serialized = JSON.stringify(user);
      if (rememberMe) {
        localStorage.setItem('fpc_auth_user', serialized);
      } else {
        sessionStorage.setItem('fpc_auth_user', serialized);
      }

      setIsLoading(false);
      setLoginSuccess(true);

      if (onSuccessLogin) {
        onSuccessLogin('TSF Admin');
      }

      // Automatically navigate to the persistent TSF Admin Dashboard
      if (navigate) {
        navigate('/admin/onboard');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Authentication failed. Please verify your credentials.');
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@tsf.org');
    setPassword('tsfAdmin@2026');
  };

  return (
    <div className={`min-h-screen w-full bg-neutral-50 text-primary flex flex-col justify-between selection:bg-forest-200 ${isEmbedPreview ? 'rounded-card overflow-hidden' : ''}`}>

      {/* =========================================================================
          1. Top Navigation Bar: White Background & English Pill Button (Right)
          ========================================================================= */}
      <header className="w-full bg-white px-4.5 sm:px-8 md:px-12 lg:px-12 h-16 flex items-center justify-between shrink-0">
        {/* Left Brand Identity */}
        <div className="text-[11px] sm:text-xs font-bold tracking-wider text-brand uppercase">
          <span className="hidden sm:inline">
            TATA STEEL FOUNDATION <span className="text-neutral-400 font-normal mx-0.5">/</span> FPC MANAGEMENT
          </span>
          <span className="inline sm:hidden">
            TSF <span className="text-neutral-400 font-normal">/</span> FPC
          </span>
        </div>

        {/* Right: English Pill Button Reusing Shared Button */}
        <div>
            <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 min-w-[100px] sm:min-w-[125px] px-5 bg-brand-soft hover:bg-forest-100 text-brand text-xs sm:text-[13px] font-semibold rounded-control transition-colors shadow-2xs border-transparent"
          >
            English
        </Button>
    </div>
      </header >

{/* =========================================================================
          2. Hero Section: Anchored Upper-Left (Exactly Matching Image 1 & Mobile)
          ========================================================================= */}
  < div className = "w-full px-4.5 sm:px-8 md:px-12 lg:pl-22 lg:pr-12 pt-2 sm:pt-4 text-left" >
    <div className="max-w-[480px]">
      {/* Eyebrow */}
      <div className="page-eyebrow mb-2">
        CENTRAL ADMINISTRATION
      </div>

      {/* Heading */}
      <h1 className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-primary tracking-tight leading-[1.18] mb-1.5">
        Supporting the people<br className="hidden sm:inline" /> behind stronger FPCs.
      </h1>

      {/* Subtitle */}
      <p className="text-xs sm:text-[13px] text-secondary font-normal">
        A secure workspace for TSF programme administrators.
      </p>
    </div>
      </div >

{/* =========================================================================
          3. Login Card: Horizontally Centered in Viewport Reusing Shared Card
          ========================================================================= */}
  < main className = "w-full flex items-center justify-center px-4 py-4 sm:py-6 flex-1 my-auto" >
      <Card className="w-full max-w-[360px] rounded-login-card p-6 sm:p-7 shadow-xs">

        {/* Title & Subtitle */}
        <div className="text-left mb-5">
          <h2 className="text-xl font-bold text-primary tracking-tight leading-tight mb-1">
            Welcome back
          </h2>
          <p className="text-xs text-secondary">
            Sign in to TSF Central Admin
          </p>
        </div>

        {/* Success Notification: Reusing Shared Alert */}
        {loginSuccess && (
            <Alert tone="success" variant="card" className="mb-4 text-xs">
              Authentication successful! Navigating to dashboard...
            </Alert>
        )}

        {/* Error Notification: Reusing Shared Alert */}
        {errorMessage && (
            <Alert tone="danger" variant="card" className="mb-4 text-xs">
              {errorMessage}
            </Alert>
        )}

        {/* Login Form Reusing Shared Input, Checkbox, and Button */}
        <form onSubmit={handleSignIn} className="space-y-0 text-left">

          {/* Email address field: Reusing Shared Input */}
          <div className="mb-3.5">
              <Input
                id="login-email"
              type="email"
              label="Email address *"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tsf.org"
              size="sm"
              className="h-10 text-xs sm:text-[13px] text-primary bg-white border border-neutral-200 rounded-control hover:border-neutral-400 focus:ring-2 focus:ring-brand"
            />
          </div>

          {/* Password field: Reusing Shared Input with trailingIcon password reveal */}
          <div className="mb-3">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              label="Password *"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              size="sm"
              className="h-10 text-xs sm:text-[13px] text-primary bg-white border border-neutral-200 rounded-control hover:border-neutral-400 focus:ring-2 focus:ring-brand"
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
            />
          </div>

          {/* Remember me & Forgot password row: Reusing Shared Checkbox & Button */}
          <div className="flex items-center justify-between text-xs pt-1.5 pb-4 select-none">
            <Checkbox
              id="login-remember-me"
              size="sm"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              label="REMEMBER ME"
              labelClassName="text-[11px] font-semibold tracking-wider text-brand uppercase"
            />

              <Button
                type="button"
              variant="ghost"
              size="xs"
              onClick={() => setForgotModalOpen(true)}
              className="p-0 h-auto text-[11px] font-semibold tracking-wider text-brand uppercase hover:underline hover:bg-transparent min-w-0"
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
          className="w-full h-10 bg-brand text-white text-xs sm:text-[13px] font-semibold rounded-control hover:bg-brand-hover active:bg-brand-active shadow-xs"
        >
        Sign in
      </Button>
    </form>

{/* Optional Demo mode information box */ }
{
  showDemoCredentials && (
    <div
      onClick={handleFillDemo}
      className="mt-4 p-2.5 rounded-control bg-brand-soft border border-forest-200 flex items-center gap-2 text-xs text-brand cursor-pointer hover:bg-forest-100 transition-colors select-none"
      title="Click to load demo credentials"
    >
      <CheckCircle2 className="w-4 h-4 text-brand shrink-0 stroke-[2.2]" />
      <span className="font-normal text-[12px]">
        Demo mode · Use your demo credentials.
      </span>
    </div>
  )
}

        </Card >
      </main >

{/* =========================================================================
          4. Footer: Edge-to-Edge Left Anchored (Exactly Matching Image 1 & Mobile)
          ========================================================================= */}
  < footer className = "w-full px-4.5 sm:px-8 md:px-12 lg:px-12 py-4 text-left" >
    <span className="text-[11px] text-secondary font-normal">
      Secure access · TSF FPC Management / v1.0
    </span>
      </footer >

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
                className="px-4 py-1.5 bg-brand text-white text-xs font-semibold rounded-xs hover:bg-brand-hover"
              >
                Got it
              </Button>
            </div>
        }
      >
      <p className="text-xs text-secondary leading-relaxed">
        For administrative security, password resets must be authorized by the TSF Super Administrator. Please contact <strong>support@tsf.org</strong>.
      </p>
    </Modal>

    </div >
  );
};
