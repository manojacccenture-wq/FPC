import React, { useState, type FormEvent } from 'react';
import { ChevronRight } from 'lucide-react';
import { Modal, Input, Select, Button } from '../../../../../shared/components';

export interface InviteFpcFormData {
  companyName: string;
  nominatedAdmin: string;
  email: string;
  phoneNumber: string;
  state: string;
  district: string;
}

export interface InviteFpcModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitInvite?: (data: InviteFpcFormData) => void;
}

const DEFAULT_FORM: InviteFpcFormData = {
  companyName: 'Kalinganagar Farmer Producer Company Ltd.',
  nominatedAdmin: 'Subhashree Jena',
  email: 'admin@kalinganagarfpc.in',
  phoneNumber: '+91 9437890123',
  state: 'Odisha',
  district: 'Jajpur',
};

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
  const [formData, setFormData] = useState<InviteFpcFormData>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.email) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onSubmitInvite) {
        onSubmitInvite(formData);
      }
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
            onClick={onClose}
            disabled={isSubmitting}
            className="h-11 sm:h-12 min-h-11 sm:min-h-12 px-7 rounded-xl bg-brand-soft hover:bg-forest-100 text-brand text-sm font-semibold border-none shadow-2xs"
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
            className="h-11 sm:h-12 min-h-11 sm:min-h-12 px-7 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-semibold shadow-xs"
          >
            Send invitation
          </Button>
        </div>
      }
    >
      <form id="invite-fpc-form" onSubmit={handleSubmit} className="form-flow-spacing text-left py-1">
        {/* Row 1: Company name & Nominated admin reusing shared Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 form-grid-spacing">
          <Input
            id="modal-company-name"
            label="Company name"
            required
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder="e.g. Kalinganagar Farmer Producer Company Ltd."
            className="h-12 min-h-12 px-4 rounded-xl text-sm"
          />

          <Input
            id="modal-nominated-admin"
            label="Nominated admin"
            required
            value={formData.nominatedAdmin}
            onChange={(e) => setFormData({ ...formData, nominatedAdmin: e.target.value })}
            placeholder="e.g. Subhashree Jena"
            className="h-12 min-h-12 px-4 rounded-xl text-sm"
          />
        </div>

        {/* Row 2: Email address & Phone number reusing shared Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 form-grid-spacing">
          <Input
            id="modal-email"
            type="email"
            label="Email address"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="admin@kalinganagarfpc.in"
            className="h-12 min-h-12 px-4 rounded-xl text-sm"
          />

          <Input
            id="modal-phone"
            type="tel"
            label="Phone number"
            required
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="+91 9437890123"
            className="h-12 min-h-12 px-4 rounded-xl text-sm"
          />
        </div>

        {/* Row 3: State & District reusing shared Select */}
        <div className="grid grid-cols-1 sm:grid-cols-2 form-grid-spacing">
          <Select
            id="modal-state"
            label="State"
            required
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            options={STATE_OPTIONS}
            trailingIcon={<ChevronRight className="w-4 h-4 stroke-[2]" />}
            className="h-12 min-h-12 px-4 rounded-xl text-sm"
          />

          <Select
            id="modal-district"
            label="District"
            required
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            options={DISTRICT_OPTIONS}
            trailingIcon={<ChevronRight className="w-4 h-4 stroke-[2]" />}
            className="h-12 min-h-12 px-4 rounded-xl text-sm"
          />
        </div>
      </form>
    </Modal>
  );
};
