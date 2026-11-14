import React, { useState } from 'react';
import { KeyRound, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Modal, Input, Button, Alert } from '../../../shared/components';
import { useChangePasswordMutation } from '../api/authApi';
import { useAppDispatch } from '../../../app/store/hooks';
import { passwordChanged } from '../slices/authSlice';

interface ChangePasswordModalProps {
  isOpen: boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen }) => {
  const dispatch = useAppDispatch();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Complexity rules
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasDigit = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const notSameAsCurrent = newPassword.length > 0 && newPassword !== currentPassword;

  const isFormValid =
    currentPassword.length > 0 &&
    hasMinLength &&
    hasUpper &&
    hasLower &&
    hasDigit &&
    hasSpecial &&
    passwordsMatch &&
    notSameAsCurrent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isFormValid) {
      setErrorMessage('Please ensure all password requirements are satisfied.');
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
      }).unwrap();

      dispatch(passwordChanged());
    } catch (err: unknown) {
      const apiErr = err as { data?: { detail?: string; message?: string } };
      setErrorMessage(
        apiErr?.data?.detail || apiErr?.data?.message || 'Failed to change password. Please verify your current password.'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      title={
        <div className="flex items-center gap-2 text-[#0E1B16]">
          <div className="p-2 rounded-lg bg-[#E8F2EE] text-[#0F4C36]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Update Temporary Password</h2>
            <p className="text-xs font-normal text-[#5b6b63]">
              A permanent secure password is required before accessing your account
            </p>
          </div>
        </div>
      }
      size="md"
      showCloseButton={false}
      closeOnBackdropClick={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {errorMessage && (
          <Alert tone="danger">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          </Alert>
        )}

        <Input
          label="Current (Temporary) Password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter the password from your invitation email"
          required
          autoFocus
        />

        <Input
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter your new permanent password"
          required
        />

        <Input
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-type your new permanent password"
          required
        />

        {/* Requirements checklist */}
        <div className="bg-[#F5F8F7] rounded-lg p-3 text-xs space-y-1.5 border border-[#E1E8E6]">
          <p className="font-semibold text-[#0E1B16] mb-1">Password Requirements:</p>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <RequirementItem met={hasMinLength} label="At least 8 characters" />
            <RequirementItem met={hasUpper} label="1+ uppercase letter" />
            <RequirementItem met={hasLower} label="1+ lowercase letter" />
            <RequirementItem met={hasDigit} label="1+ numeric digit" />
            <RequirementItem met={hasSpecial} label="1+ special character" />
            <RequirementItem met={passwordsMatch} label="Passwords match" />
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            className="w-full flex items-center justify-center gap-2"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Set Permanent Password & Continue</span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const RequirementItem: React.FC<{ met: boolean; label: string }> = ({ met, label }) => (
  <div className={`flex items-center gap-1.5 ${met ? 'text-[#0F4C36] font-medium' : 'text-[#7D8A85]'}`}>
    <div
      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
        met ? 'bg-[#0F4C36] text-white' : 'bg-[#D1DCD6] text-transparent'
      }`}
    >
      <Check className="w-2.5 h-2.5" />
    </div>
    <span>{label}</span>
  </div>
);
