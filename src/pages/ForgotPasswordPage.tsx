import { useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { useForgotPasswordMutation } from '../features/auth/api/authApi';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../features/auth/schemas/passwordReset.schema';
import { Button, Input, Card, Alert, LoginHeader } from '../shared/components';

export const ForgotPasswordPage: FC = () => {
  const navigate = useNavigate();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setErrorMessage('');
    const email = values.email.trim();

    try {
      await forgotPassword({ email }).unwrap();
      setSubmittedEmail(email);
      setIsSubmitted(true);
    } catch (err: unknown) {
      const errorObj = err as { data?: { detail?: string; message?: string } | string };
      let detail = 'Unable to process your request. Please try again.';
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

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-between font-sans">
      <LoginHeader />

      <main className="w-full flex items-center justify-center px-4 py-4 sm:py-6 flex-1 my-auto">
        <Card className="w-full max-w-[360px] rounded-login-card card-padding shadow-xs">
          {!isSubmitted ? (
            <>
              <div className="text-left mb-5">
                <h2 className="modal-title text-primary mb-1">
                  Forgot password
                </h2>
                <p className="text-secondary">
                  Enter your registered email address to receive a secure password reset link.
                </p>
              </div>

              {errorMessage && (
                <Alert tone="danger" variant="card" className="mb-4">
                  {errorMessage}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-0 text-left" noValidate>
                <div className="mb-4">
                  <Input
                    id="forgot-email"
                    type="email"
                    label="Email address *"
                    placeholder="admin@tsf.org"
                    size="sm"
                    error={errors.email?.message}
                    className="h-10 text-primary bg-white border border-neutral-200 rounded-control hover:border-neutral-400 focus:ring-2 focus:ring-brand"
                    {...register('email')}
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isLoading}
                  loadingText="Sending link..."
                  className="w-full h-10 bg-brand text-white font-semibold rounded-control hover:bg-brand-hover active:bg-brand-active shadow-xs"
                >
                  Send reset link
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
          ) : (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#0F4C36] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 stroke-[2]" />
              </div>

              <div className="space-y-1.5">
                <h2 className="modal-title text-primary">
                  Check your email
                </h2>
                <p className="text-xs text-secondary leading-relaxed">
                  If an account exists for <strong className="text-primary">{submittedEmail}</strong>, instructions to reset your password have been dispatched.
                </p>
              </div>

              <div className="bg-[#F8FAF9] rounded-xl p-3 text-xs text-secondary border border-neutral-200/80 text-left space-y-1">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-[#0F4C36] shrink-0 mt-0.5" />
                  <span>The reset link will expire in <strong>30 minutes</strong> for your security. Check your spam folder if it doesn&apos;t arrive shortly.</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/login')}
                  className="w-full h-10 bg-brand text-white font-semibold rounded-control hover:bg-brand-hover"
                >
                  Return to sign in
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    setIsSubmitted(false);
                    setErrorMessage('');
                  }}
                  className="text-secondary hover:text-primary font-normal"
                >
                  Didn&apos;t get an email? Try again
                </Button>
              </div>
            </div>
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

export default ForgotPasswordPage;
