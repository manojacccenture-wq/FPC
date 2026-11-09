import React from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { ChevronRight, Plus } from 'lucide-react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { Select } from '../../../shared/components/Select';
import { Button } from '../../../shared/components/Button';
import { useFpcForm, applyServerErrors, FormServerError } from '../../../shared/forms';
import {
  financialInformationSchema,
  type FinancialInformationFormValues,
} from '../schemas/financialInformation.schema';
import type { FpcFinancialInformationFormData } from '../types';

export interface FpcFinancialInformationFormProps {
  initialData?: Partial<FpcFinancialInformationFormData> | null;
  onSubmit: (values: FinancialInformationFormValues) => Promise<void> | void;
  onPreviousStep: () => void;
}

const FINANCIAL_YEAR_OPTIONS = [
  { value: '2025-26', label: '2025-26' },
  { value: '2024-25', label: '2024-25' },
  { value: '2023-24', label: '2023-24' },
  { value: '2022-23', label: '2022-23' },
  { value: '2026-27', label: '2026-27' },
];

const BANK_NAME_OPTIONS = [
  { value: 'State Bank of India', label: 'State Bank of India' },
  { value: 'Punjab National Bank', label: 'Punjab National Bank' },
  { value: 'Bank of Baroda', label: 'Bank of Baroda' },
  { value: 'HDFC Bank', label: 'HDFC Bank' },
  { value: 'ICICI Bank', label: 'ICICI Bank' },
  { value: 'Axis Bank', label: 'Axis Bank' },
  { value: 'Canara Bank', label: 'Canara Bank' },
  { value: 'Union Bank of India', label: 'Union Bank of India' },
  { value: 'Odisha Gramya Bank', label: 'Odisha Gramya Bank' },
  { value: 'Jharkhand Rajya Gramin Bank', label: 'Jharkhand Rajya Gramin Bank' },
];

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'Current', label: 'Current' },
  { value: 'Savings', label: 'Savings' },
  { value: 'Cash Credit (CC)', label: 'Cash Credit (CC)' },
  { value: 'Overdraft (OD)', label: 'Overdraft (OD)' },
];

export const FpcFinancialInformationForm: React.FC<FpcFinancialInformationFormProps> = ({
  initialData,
  onSubmit,
  onPreviousStep,
}) => {
  // ZERO useEffect: initial values populated directly during component mount
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useFpcForm<FinancialInformationFormValues>({
    schema: financialInformationSchema,
    defaultValues: {
      authorizedCapital: initialData?.authorizedCapital || '₹10,00,000',
      paidUpCapital: initialData?.paidUpCapital || '₹6,00,000',
      faceValuePerShare: initialData?.faceValuePerShare || '₹100',
      annualTurnover: initialData?.annualTurnover || '₹15,00,000',
      financialYear: initialData?.financialYear || '2025-26',
      farmers: initialData?.farmers || '120',
      shareholders: initialData?.shareholders || '60',
      employees: initialData?.employees || '6',
      bankAccounts: initialData?.bankAccounts && initialData.bankAccounts.length > 0
        ? initialData.bankAccounts
        : [
            {
              id: 'bank-1',
              bankName: '',
              accountNumber: '',
              ifscCode: '',
              branchName: '',
              accountType: 'Current',
            },
          ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'bankAccounts',
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (err: unknown) {
      applyServerErrors(err, setError);
    }
  });

  const handleAddBankAccount = () => {
    append({
      id: `bank-${Date.now()}`,
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branchName: '',
      accountType: 'Current',
    });
  };

  // Dynamic Total Equity Shares calculation: Paid-up Capital ÷ Face Value
  const watchedPaidUp = useWatch({ control, name: 'paidUpCapital' }) || '';
  const watchedFaceValue = useWatch({ control, name: 'faceValuePerShare' }) || '';
  const paidUpNum = parseFloat(watchedPaidUp.replace(/[^0-9.]/g, '')) || 600000;
  const faceValueNum = parseFloat(watchedFaceValue.replace(/[^0-9.]/g, '')) || 100;
  const calculatedShares = faceValueNum > 0 ? Math.floor(paidUpNum / faceValueNum) : 6000;

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <FormServerError errors={errors} />

      {/* Main Card */}
      <Card
        variant="default"
        padding="none"
        className="p-6 sm:p-8 rounded-2xl border-neutral-200/80 shadow-2xs space-y-6"
      >
        {/* Header with Step 03 Badge */}
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-bold text-sm shrink-0">
            03
          </div>
          <div>
            <h3 className="text-primary">
              Financial information
            </h3>
            <p className="text-secondary mt-0.5">
              Use the details on your official company documents.
            </p>
          </div>
        </div>

        {/* Financial Information Inputs Grid: Rows 1-4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Row 1: Authorized capital & Paid-up capital */}
          <Input
            id="fpc-auth-capital"
            label="Authorized capital *"
            required
            placeholder="₹10,00,000"
            error={errors.authorizedCapital?.message}
            {...register('authorizedCapital')}
          />
          <Input
            id="fpc-paid-capital"
            label="Paid-up capital *"
            required
            placeholder="₹6,00,000"
            error={errors.paidUpCapital?.message}
            {...register('paidUpCapital')}
          />

          {/* Row 2: Face value per share & Annual turnover */}
          <Input
            id="fpc-face-value"
            label="Face value per share *"
            required
            placeholder="₹100"
            error={errors.faceValuePerShare?.message}
            {...register('faceValuePerShare')}
          />
          <Input
            id="fpc-annual-turnover"
            label="Annual turnover *"
            required
            placeholder="₹15,00,000"
            error={errors.annualTurnover?.message}
            {...register('annualTurnover')}
          />

          {/* Row 3: Financial year & Farmers */}
          <Select
            id="fpc-fin-year"
            label="Financial year *"
            required
            options={FINANCIAL_YEAR_OPTIONS}
            trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
            error={errors.financialYear?.message}
            {...register('financialYear')}
          />
          <Input
            id="fpc-farmers-count"
            label="Farmers *"
            required
            placeholder="120"
            error={errors.farmers?.message}
            {...register('farmers')}
          />

          {/* Row 4: Shareholders & Employees */}
          <Input
            id="fpc-shareholders-count"
            label="Shareholders *"
            required
            placeholder="60"
            error={errors.shareholders?.message}
            {...register('shareholders')}
          />
          <Input
            id="fpc-employees-count"
            label="Employees *"
            required
            placeholder="6"
            error={errors.employees?.message}
            {...register('employees')}
          />
        </div>

        {/* Dynamic Total Equity Shares Card */}
        <div className="rounded-2xl border border-neutral-200/80 p-5 sm:p-6 bg-white space-y-1 shadow-2xs">
          <p className="text-xs text-secondary font-medium">
            Total Equity Shares
          </p>
          <div className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
            {calculatedShares.toLocaleString()}{' '}
            <span className="text-sm sm:text-base font-semibold text-secondary">
              (Paid-up Capital ÷ Face Value)
            </span>
          </div>
        </div>

        {/* Primary bank account details section */}
        <div className="space-y-4 pt-2">
          <h4 className="font-semibold text-primary">
            Primary bank account details
          </h4>

          {fields.map((field, index) => {
            const accountErrors = errors.bankAccounts?.[index];

            return (
              <div
                key={field.id}
                className="rounded-2xl border border-neutral-200/80 p-5 sm:p-6 bg-white space-y-4 shadow-2xs"
              >
                {fields.length > 1 && (
                  <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
                    <span className="text-xs font-semibold text-secondary">
                      Bank Account #{index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                      className="h-7 px-4 rounded-lg text-xs font-semibold bg-[#8B2323] hover:bg-[#721C1C] text-white shadow-2xs"
                    >
                      Delete
                    </Button>
                  </div>
                )}

                {/* Bank Row 1: Bank Name & Account Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <Select
                    id={`bank-name-${index}`}
                    label="Bank name *"
                    required
                    options={BANK_NAME_OPTIONS}
                    placeholder="Select bank"
                    trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
                    error={accountErrors?.bankName?.message}
                    {...register(`bankAccounts.${index}.bankName`)}
                  />
                  <Input
                    id={`bank-account-${index}`}
                    label="Account number *"
                    required
                    placeholder="Enter account number"
                    error={accountErrors?.accountNumber?.message}
                    {...register(`bankAccounts.${index}.accountNumber`)}
                  />
                </div>

                {/* Bank Row 2: IFSC code & Branch name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <Input
                    id={`bank-ifsc-${index}`}
                    label="IFSC code *"
                    required
                    placeholder="Enter IFSC code"
                    error={accountErrors?.ifscCode?.message}
                    {...register(`bankAccounts.${index}.ifscCode`)}
                  />
                  <Input
                    id={`bank-branch-${index}`}
                    label="Branch name *"
                    required
                    placeholder="Enter branch name"
                    error={accountErrors?.branchName?.message}
                    {...register(`bankAccounts.${index}.branchName`)}
                  />
                </div>

                {/* Bank Row 3: Account type (full-width) */}
                <div>
                  <Select
                    id={`bank-type-${index}`}
                    label="Account type *"
                    required
                    options={ACCOUNT_TYPE_OPTIONS}
                    trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
                    error={accountErrors?.accountType?.message}
                    {...register(`bankAccounts.${index}.accountType`)}
                  />
                </div>
              </div>
            );
          })}

          {/* Add Bank Account Dashed Button */}
          <button
            type="button"
            onClick={handleAddBankAccount}
            className="w-full py-3.5 px-4 rounded-xl border border-dashed border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50/50 text-secondary hover:text-primary text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Bank Account</span>
          </button>
        </div>
      </Card>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onPreviousStep}
          className="rounded-full bg-brand-soft text-brand hover:bg-forest-100 px-6 py-2.5 text-xs font-semibold"
        >
          ← Previous Step
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          loadingText="Saving records..."
          className="rounded-full bg-[#0F4C36] hover:bg-[#0B3B2A] text-white px-7 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
        >
          Save and Continue →
        </Button>
      </div>
    </form>
  );
};
