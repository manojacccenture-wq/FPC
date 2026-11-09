import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Modal, Input, Select, Button } from '../../../../../shared/components';
import { useFpcForm, applyServerErrors, FormServerError } from '../../../../../shared/forms';
import {
  inviteFpcSchema,
  type InviteFpcFormValues,
} from '../../../../../features/onboarding/schemas/invitation.schema';

/** Kept as an alias so existing consumers keep importing the same type name. */
export type InviteFpcFormData = InviteFpcFormValues;

export interface InviteFpcModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitInvite?: (data: InviteFpcFormData) => Promise<void> | void;
}

const INITIAL_FORM: InviteFpcFormValues = {
  companyName: '',
  nominatedAdmin: '',
  email: '',
  phoneNumber: '',
  state: 'Odisha',
  district: 'Jajpur',
};

/** Fields rendered by this form; used to resolve backend PascalCase error keys. */
const INVITE_FIELDS = [
  'companyName',
  'nominatedAdmin',
  'email',
  'phoneNumber',
  'state',
  'district',
] as const;

const STATE_OPTIONS = [
  { value: 'Odisha', label: 'Odisha' },
  { value: 'Jharkhand', label: 'Jharkhand' },
  { value: 'West Bengal', label: 'West Bengal' },
  { value: 'Bihar', label: 'Bihar' },
];

const DISTRICT_OPTIONS = [
  { value: 'Jajpur', label: 'Jajpur' },
  { value: 'Keonjhar', label: 'Keonjhar' },
  { value: 'West Singhbhum', label: 'West Singhbhum' },
  { value: 'Seraikela-Kharsawan', label: 'Seraikela-Kharsawan' },
];

export const InviteFpcModal: React.FC<InviteFpcModalProps> = ({
  isOpen,
  onClose,
  onSubmitInvite,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useFpcForm<InviteFpcFormValues>({
    schema: inviteFpcSchema,
    defaultValues: INITIAL_FORM,
  });

  const handleClose = () => {
    reset(INITIAL_FORM);
    onClose();
  };

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmitInvite?.(values);
      reset(INITIAL_FORM);
      onClose();
    } catch (err: unknown) {
      applyServerErrors(err, setError, { knownFields: INVITE_FIELDS });
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registration invitation"
      description="Company and administrator details"
      size="xl"
      className="max-w-[720px] sm:max-w-[760px]"
      footer={
        <div className="flex items-center justify-end gap-3.5 w-full sm:w-auto">
          {/* Reusing shared Button with variant="secondary" */}
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-11 sm:h-12 min-h-11 sm:min-h-12 px-7 rounded-xl bg-brand-soft hover:bg-forest-100 text-brand border-none shadow-2xs"
          >
            Cancel
          </Button>

          {/* Reusing shared Button with variant="primary" */}
          <Button
            type="submit"
            form="invite-fpc-form"
            variant="primary"
            size="md"
            loading={isSubmitting}
            loadingText="Sending..."
            className="h-11 sm:h-12 min-h-11 sm:min-h-12 px-7 rounded-xl bg-brand hover:bg-brand-hover text-white shadow-xs"
          >
            Send invitation
          </Button>
        </div>
      }
    >
      <form id="invite-fpc-form" onSubmit={submit} className="form-flow-spacing text-left py-1" noValidate>
        {/* Form-level errors: Zod object-level failures and unattributable API failures */}
        <FormServerError errors={errors} className="mb-4" />

        {/* Row 1: Company name & Nominated admin reusing shared Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 form-grid-spacing">
          <Input
            id="modal-company-name"
            label="Company name"
            required
            placeholder="e.g. Kalinganagar Farmer Producer Company Ltd."
            error={errors.companyName?.message}
            className="h-12 min-h-12 px-4 rounded-xl"
            {...register('companyName')}
          />

          <Input
            id="modal-nominated-admin"
            label="Nominated admin"
            required
            placeholder="e.g. Subhashree Jena"
            error={errors.nominatedAdmin?.message}
            className="h-12 min-h-12 px-4 rounded-xl"
            {...register('nominatedAdmin')}
          />
        </div>

        {/* Row 2: Email address & Phone number reusing shared Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 form-grid-spacing">
          <Input
            id="modal-email"
            type="email"
            label="Email address"
            required
            placeholder="admin@kalinganagarfpc.in"
            error={errors.email?.message}
            className="h-12 min-h-12 px-4 rounded-xl"
            {...register('email')}
          />

          <Input
            id="modal-phone"
            type="tel"
            label="Phone number"
            required
            placeholder="+91 9437890123"
            error={errors.phoneNumber?.message}
            className="h-12 min-h-12 px-4 rounded-xl"
            {...register('phoneNumber')}
          />
        </div>

        {/* Row 3: State & District reusing shared Select */}
        <div className="grid grid-cols-1 sm:grid-cols-2 form-grid-spacing">
          <Select
            id="modal-state"
            label="State"
            required
            options={STATE_OPTIONS}
            trailingIcon={<ChevronDown className="w-4 h-4 stroke-[2]" />}
            error={errors.state?.message}
            className="h-12 min-h-12 px-4 rounded-xl"
            {...register('state')}
          />

          <Select
            id="modal-district"
            label="District"
            required
            options={DISTRICT_OPTIONS}
            trailingIcon={<ChevronDown className="w-4 h-4 stroke-[2]" />}
            error={errors.district?.message}
            className="h-12 min-h-12 px-4 rounded-xl"
            {...register('district')}
          />
        </div>
      </form>
    </Modal>
  );
};
