import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useFieldArray, useWatch, Controller } from 'react-hook-form';
import { ChevronRight, Plus, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { Select } from '../../../shared/components/Select';
import { Button } from '../../../shared/components/Button';
import { useFpcForm, applyServerErrors, FormServerError } from '../../../shared/forms';
import {
  financialInformationSchema,
  type FinancialInformationFormValues,
} from '../schemas/financialInformation.schema';
import type { FpcFinancialInformationFormData, StepFormHandle } from '../types';
import { IFSC_LOOKUP_ENABLED } from '../../../shared/config/env';
import { ifscSchema } from '../../../shared/validation/schemas';
import { useLazyLookupIfscQuery, type IfscLookupResult } from '../api/ifscApi';
import {
  financialInformationGuidance,
  bankAccountGuidance,
  otherIncomeGuidance,
} from '../constants/fieldGuidance';
import { getLastCompletedFinancialYears } from '../../../shared/utils/financialYear';

export interface FpcFinancialInformationFormProps {
  initialData?: Partial<FpcFinancialInformationFormData> | null;
  onSubmit: (values: FinancialInformationFormValues) => Promise<void> | void;
  onPreviousStep: () => void;
  isReadOnly?: boolean;
  onNextStep?: () => void;
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

/** Values a lookup wrote itself, so a later IFSC change may clear them. */
interface AutoFilledBankFields {
  ifsc: string;
  branchName: string;
  bankAddress: string;
  bankName: string;
}

interface IfscLookupStatus {
  state: 'idle' | 'loading' | 'success' | 'error';
  message: string;
  matchedIfsc?: string;
}

const normalizeIfsc = (value: string | undefined): string => (value ?? '').trim().toUpperCase();

/** A value may be replaced when it is empty or still holds what the lookup wrote. */
const isAutoReplaceable = (current: string | undefined, previouslyAuto: string | undefined): boolean => {
  const value = (current ?? '').trim();
  return value === '' || (previouslyAuto !== undefined && value === previouslyAuto);
};

/** Provider ADDRESS is a locality/state/PIN string; branch name makes it readable. */
const composeBranchAddress = (branch: string, address: string): string => {
  const cleanAddress = address.replace(/\s*,\s*/g, ', ').trim();
  if (!cleanAddress) return '';

  const cleanBranch = branch.replace(/\s*,\s*/g, ', ').trim();
  if (!cleanBranch || cleanAddress.toUpperCase().startsWith(cleanBranch.toUpperCase())) {
    return cleanAddress;
  }

  return `${cleanBranch}, ${cleanAddress}`;
};

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'Current', label: 'Current' },
  { value: 'Savings', label: 'Savings' },
  { value: 'Cash Credit (CC)', label: 'Cash Credit (CC)' },
  { value: 'Overdraft (OD)', label: 'Overdraft (OD)' },
];

export const FpcFinancialInformationForm = forwardRef<StepFormHandle<FinancialInformationFormValues>, FpcFinancialInformationFormProps>(({
  initialData,
  onSubmit,
  onPreviousStep,
  isReadOnly = false,
  onNextStep,
}, ref) => {
  const completedYears = getLastCompletedFinancialYears(5);

  const defaultBankAccounts = isReadOnly
    ? []
    : [
        {
          id: 'bank-1',
          bankName: '',
          accountNumber: '',
          ifscCode: '',
          branchName: '',
          bankAddress: '',
          accountType: 'Current',
        },
      ];

  const initialTurnoverMap = new Map<string, string>();
  if (initialData?.turnoverHistory && initialData.turnoverHistory.length > 0) {
    for (const record of initialData.turnoverHistory) {
      if (record?.financialYear) {
        initialTurnoverMap.set(record.financialYear, record.turnover ?? '');
      }
    }
  } else if (initialData?.annualTurnover && initialData?.financialYear) {
    initialTurnoverMap.set(initialData.financialYear, initialData.annualTurnover);
  }

  const initialTurnoverHistory = completedYears.map((fy) => ({
    financialYear: fy.key,
    turnover: initialTurnoverMap.get(fy.key) ?? '',
  }));

  const formValues: FinancialInformationFormValues = {
    authorizedCapital: initialData?.authorizedCapital || '',
    paidUpCapital: initialData?.paidUpCapital || '',
    faceValuePerShare: initialData?.faceValuePerShare || '',
    annualTurnover: initialData?.annualTurnover || initialTurnoverHistory[initialTurnoverHistory.length - 1]?.turnover || '',
    financialYear: initialData?.financialYear || initialTurnoverHistory[initialTurnoverHistory.length - 1]?.financialYear || '2025-26',
    turnoverHistory: initialTurnoverHistory,
    shareholders:
      initialData?.shareholders && initialData.shareholders.trim() !== ''
        ? initialData.shareholders
        : '10',
    totalEquitySharesAllotted: initialData?.totalEquitySharesAllotted || '',
    // Legacy drafts predate `bankAddress`; normalising here keeps it a string for
    // validation without forcing the user to touch the field before saving.
    bankAccounts: (initialData?.bankAccounts && initialData.bankAccounts.length > 0
      ? initialData.bankAccounts
      : defaultBankAccounts
    ).map((account) => ({ ...account, bankAddress: account.bankAddress ?? '' })),
    otherIncomeSources: initialData?.otherIncomeSources ?? [],
  };

  // ZERO useEffect: initial values populated directly during component mount
  const {
    register,
    control,
    handleSubmit,
    setError,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useFpcForm<FinancialInformationFormValues>({
    schema: financialInformationSchema,
    defaultValues: formValues,
    values: formValues,
    resetOptions: { keepDirtyValues: true },
  });

  useImperativeHandle(ref, () => ({
    getDraftValues: () => getValues(),
  }), [getValues]);

  const { fields: turnoverFields } = useFieldArray({
    control,
    name: 'turnoverHistory',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'bankAccounts',
  });

  const {
    fields: incomeFields,
    append: appendIncomeSource,
    remove: removeIncomeSource,
  } = useFieldArray({
    control,
    name: 'otherIncomeSources',
  });

  // IFSC lookup state is keyed by the stable row id, never by the array index,
  // so deleting a bank account cannot misattribute a pending lookup.
  const [lookupIfsc] = useLazyLookupIfscQuery();
  const ifscRequestRef = useRef<Record<string, number>>({});
  const autoFilledRef = useRef<Record<string, AutoFilledBankFields>>({});
  const [ifscStatus, setIfscStatus] = useState<Record<string, IfscLookupStatus>>({});

  /** Looks up branch details from the IFSC on blur; never blocks manual entry. */
  const requestIfscLookup = async (index: number, fieldId: string) => {
    if (!IFSC_LOOKUP_ENABLED || isReadOnly) return;

    const currentVal = getValues(`bankAccounts.${index}.ifscCode` as const);
    const parsed = ifscSchema.safeParse(currentVal);
    if (!parsed.success) {
      setIfscStatus((prev) => {
        if (!prev[fieldId] || prev[fieldId].state === 'idle') return prev;
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
      return;
    }

    const ifsc = parsed.data.toUpperCase();

    // Prevent duplicate lookup requests for the same active or completed lookup
    const currentStatus = ifscStatus[fieldId];
    if (currentStatus?.state === 'loading' && currentStatus?.matchedIfsc === ifsc) {
      return;
    }
    if (currentStatus?.state === 'success' && currentStatus?.matchedIfsc === ifsc) {
      return;
    }

    const requestId = (ifscRequestRef.current[fieldId] ?? 0) + 1;
    ifscRequestRef.current[fieldId] = requestId;
    setIfscStatus((prev) => ({
      ...prev,
      [fieldId]: { state: 'loading', message: 'Fetching bank details…', matchedIfsc: ifsc },
    }));

    try {
      const details: IfscLookupResult = await lookupIfsc(ifsc).unwrap();

      // Drop stale responses: a newer lookup started, or the code changed meanwhile.
      if (ifscRequestRef.current[fieldId] !== requestId) return;
      if (normalizeIfsc(getValues(`bankAccounts.${index}.ifscCode` as const)) !== ifsc) return;

      const previous = autoFilledRef.current[fieldId];
      const bankAddress = composeBranchAddress(details.branch, details.address);
      const matchedBank =
        BANK_NAME_OPTIONS.find(
          (option) => option.value.toLowerCase() === details.bank.toLowerCase()
        )?.value ?? '';

      if (
        isAutoReplaceable(
          getValues(`bankAccounts.${index}.branchName` as const),
          previous?.branchName
        )
      ) {
        setValue(`bankAccounts.${index}.branchName` as const, details.branch, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      if (
        bankAddress &&
        isAutoReplaceable(
          getValues(`bankAccounts.${index}.bankAddress` as const),
          previous?.bankAddress
        )
      ) {
        setValue(`bankAccounts.${index}.bankAddress` as const, bankAddress, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      if (
        matchedBank &&
        isAutoReplaceable(
          getValues(`bankAccounts.${index}.bankName` as const),
          previous?.bankName
        )
      ) {
        setValue(`bankAccounts.${index}.bankName` as const, matchedBank, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      autoFilledRef.current[fieldId] = {
        ifsc,
        branchName: details.branch,
        bankAddress,
        bankName: matchedBank,
      };
      setIfscStatus((prev) => ({
        ...prev,
        [fieldId]: { state: 'success', message: 'Details fetched', matchedIfsc: ifsc },
      }));
    } catch {
      if (ifscRequestRef.current[fieldId] !== requestId) return;
      setIfscStatus((prev) => ({
        ...prev,
        [fieldId]: {
          state: 'error',
          message: 'Unable to fetch details. Please enter manually.',
          matchedIfsc: ifsc,
        },
      }));
    }
  };

  /** A different IFSC means a different branch: drop only auto-filled metadata. */
  const handleIfscChange = (index: number, fieldId: string, nextValue: string) => {
    const cleanNext = normalizeIfsc(nextValue);
    const currentStatus = ifscStatus[fieldId];

    // Immediately clear lookup status if the user changes the IFSC
    if (currentStatus && currentStatus.matchedIfsc !== cleanNext) {
      setIfscStatus((prev) => {
        if (!prev[fieldId] || prev[fieldId].state === 'idle') return prev;
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
    }

    const previous = autoFilledRef.current[fieldId];
    if (!previous) return;
    if (cleanNext === previous.ifsc) return;

    if ((getValues(`bankAccounts.${index}.branchName` as const) ?? '').trim() === previous.branchName) {
      setValue(`bankAccounts.${index}.branchName` as const, '', {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    if (
      previous.bankAddress &&
      (getValues(`bankAccounts.${index}.bankAddress` as const) ?? '').trim() === previous.bankAddress
    ) {
      setValue(`bankAccounts.${index}.bankAddress` as const, '', {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    if (previous.bankName && (getValues(`bankAccounts.${index}.bankName` as const) ?? '') === previous.bankName) {
      setValue(`bankAccounts.${index}.bankName` as const, '', {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    delete autoFilledRef.current[fieldId];
  };

  const submit = handleSubmit(async (values) => {
    try {
      const latestRecord =
        values.turnoverHistory && values.turnoverHistory.length > 0
          ? values.turnoverHistory[values.turnoverHistory.length - 1]
          : undefined;
      const enrichedValues: FinancialInformationFormValues = {
        ...values,
        annualTurnover: latestRecord?.turnover ?? values.annualTurnover ?? '',
        financialYear: latestRecord?.financialYear ?? values.financialYear ?? '2025-26',
      };
      await onSubmit(enrichedValues);
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
      bankAddress: '',
      accountType: 'Current',
    });
  };

  // Other income rows are optional, so no blank row is seeded; every added row must be complete.
  const handleAddIncomeSource = () => {
    appendIncomeSource({
      id: crypto.randomUUID(),
      organization: '',
      financialYear: '',
      scheme: '',
      totalAmount: '',
    });
  };

  // Dynamic Total Equity Shares calculation: Paid-up Capital ÷ Face Value
  const watchedPaidUp = useWatch({ control, name: 'paidUpCapital' }) || '';
  const watchedFaceValue = useWatch({ control, name: 'faceValuePerShare' }) || '';
  const paidUpNum = parseFloat(watchedPaidUp.replace(/[^0-9.]/g, '')) || 0;
  const faceValueNum = parseFloat(watchedFaceValue.replace(/[^0-9.]/g, '')) || 0;
  const calculatedShares = faceValueNum > 0 && paidUpNum > 0 ? Math.floor(paidUpNum / faceValueNum) : 0;

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

        {/* Financial Information Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Row 1: Authorized capital & Paid-up capital */}
          <Input
            id="fpc-auth-capital"
            guidance={financialInformationGuidance.authorizedCapital}
            label="Authorized capital *"
            required
            disabled={isReadOnly}
            placeholder="₹10,00,000"
            error={errors.authorizedCapital?.message}
            {...register('authorizedCapital')}
          />
          <Input
            id="fpc-paid-capital"
            guidance={financialInformationGuidance.paidUpCapital}
            label="Paid-up capital *"
            required
            disabled={isReadOnly}
            placeholder="₹6,00,000"
            error={errors.paidUpCapital?.message}
            {...register('paidUpCapital')}
          />

          {/* Row 2: Face value per share & Shareholders */}
          <Input
            id="fpc-face-value"
            guidance={financialInformationGuidance.faceValuePerShare}
            label="Face value per share *"
            required
            disabled={isReadOnly}
            placeholder="₹100"
            error={errors.faceValuePerShare?.message}
            {...register('faceValuePerShare')}
          />
          <Input
            id="fpc-shareholders-count"
            guidance={financialInformationGuidance.shareholders}
            label="Shareholders *"
            required
            disabled={isReadOnly}
            placeholder="10"
            error={errors.shareholders?.message}
            {...register('shareholders')}
          />

          {/* Row 3: Total number of equity shares allotted (full-width) */}
          <div className="col-span-1 md:col-span-2">
            <Input
              id="fpc-total-equity-shares-allotted"
              guidance={financialInformationGuidance.totalEquitySharesAllotted}
              label="Total Number of Equity Shares Allotted"
              required
              disabled={isReadOnly}
              inputMode="numeric"
              autoComplete="off"
              placeholder="Enter total number of equity shares"
              helperText="Enter the total number of equity shares allotted to shareholders."
              error={errors.totalEquitySharesAllotted?.message}
              {...register('totalEquitySharesAllotted')}
            />
          </div>
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

        {/* Annual Turnover History (Last 5 Financial Years) */}
        <div className="space-y-3 pt-2">
          <div>
            <h4 className="font-semibold text-primary">
              Annual turnover (Last 5 financial years)
            </h4>
            <p className="text-xs text-secondary mt-0.5">
              Record annual turnover for each of the last 5 completed financial years. For newly incorporated FPCs or inactive periods, you may enter ₹0 or leave the field blank.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50/70 border-b border-neutral-200/80">
                    <th className="py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider w-1/3 sm:w-48">
                      Financial Year
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Annual Turnover
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/60">
                  {turnoverFields.map((field, index) => {
                    const fyItem = completedYears.find((y) => y.key === field.financialYear) || {
                      label: `FY ${field.financialYear}`,
                    };
                    const fieldError = errors.turnoverHistory?.[index]?.turnover?.message;

                    return (
                      <tr key={field.id} className="hover:bg-neutral-50/40 transition-colors">
                        <td className="py-3 px-4 align-middle">
                          <input
                            type="hidden"
                            {...register(`turnoverHistory.${index}.financialYear` as const)}
                          />
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200/60 tracking-wide">
                            {fyItem.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 align-middle">
                          <Input
                            id={`fpc-turnover-${index}`}
                            disabled={isReadOnly}
                            placeholder="₹0"
                            error={fieldError}
                            className="max-w-md h-9 text-sm"
                            {...register(`turnoverHistory.${index}.turnover` as const)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Primary bank account details section */}
        <div className="space-y-4 pt-2">
          <h4 className="font-semibold text-primary">
            Primary bank account details
          </h4>

          {fields.length === 0 && isReadOnly && (
            <p className="text-xs text-secondary italic">No bank accounts recorded.</p>
          )}

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
                    {!isReadOnly && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => remove(index)}
                        className="h-7 px-4 rounded-lg text-xs font-semibold bg-[#8B2323] hover:bg-[#721C1C] text-white shadow-2xs"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                )}

                {/* Bank Row 1: Bank Name & Account Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <Controller
                    control={control}
                    name={`bankAccounts.${index}.bankName`}
                    render={({ field }) => (
                      <Select
                        id={`bank-name-${index}`}
                        guidance={bankAccountGuidance.bankName}
                        label="Bank name *"
                        required
                        disabled={isReadOnly}
                        options={BANK_NAME_OPTIONS}
                        placeholder="Select bank"
                        trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
                        error={accountErrors?.bankName?.message}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  <Input
                    id={`bank-account-${index}`}
                    guidance={bankAccountGuidance.accountNumber}
                    label="Account number *"
                    required
                    disabled={isReadOnly}
                    placeholder="Enter account number"
                    error={accountErrors?.accountNumber?.message}
                    {...register(`bankAccounts.${index}.accountNumber`)}
                  />
                </div>

                {/* Bank Row 2: IFSC code & Branch name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <Controller
                    control={control}
                    name={`bankAccounts.${index}.ifscCode`}
                    render={({ field: ifscField }) => {
                      const currentIfscStatus = ifscStatus[field.id];
                      let ifscHelperText: React.ReactNode = undefined;
                      let ifscTrailingIcon: React.ReactNode = undefined;

                      if (IFSC_LOOKUP_ENABLED && !isReadOnly) {
                        if (currentIfscStatus?.state === 'loading') {
                          ifscTrailingIcon = <Loader2 className="w-4 h-4 animate-spin text-brand" />;
                          ifscHelperText = (
                            <span className="inline-flex items-center gap-1.5 text-xs text-neutral-600 font-medium">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand shrink-0" />
                              Fetching bank details…
                            </span>
                          );
                        } else if (currentIfscStatus?.state === 'success') {
                          ifscTrailingIcon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
                          ifscHelperText = (
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              Details fetched
                            </span>
                          );
                        } else if (currentIfscStatus?.state === 'error') {
                          ifscTrailingIcon = <AlertCircle className="w-4 h-4 text-amber-600" />;
                          ifscHelperText = (
                            <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-medium">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              {currentIfscStatus.message || 'Unable to fetch details. Please enter manually.'}
                            </span>
                          );
                        } else {
                          ifscHelperText = 'Branch details are filled in automatically when available.';
                        }
                      }

                      return (
                        <Input
                          id={`bank-ifsc-${index}`}
                          guidance={bankAccountGuidance.ifscCode}
                          label="IFSC code *"
                          required
                          disabled={isReadOnly}
                          placeholder="Enter IFSC code"
                          trailingIcon={ifscTrailingIcon}
                          helperText={ifscHelperText}
                          error={accountErrors?.ifscCode?.message}
                          value={ifscField.value}
                          onChange={(event) => {
                            handleIfscChange(index, field.id, event.target.value);
                            ifscField.onChange(event.target.value);
                          }}
                          onBlur={() => {
                            ifscField.onBlur();
                            void requestIfscLookup(index, field.id);
                          }}
                        />
                      );
                    }}
                  />
                  <Input
                    id={`bank-branch-${index}`}
                    guidance={bankAccountGuidance.branchName}
                    label="Branch name *"
                    required
                    disabled={isReadOnly}
                    placeholder="Enter branch name"
                    error={accountErrors?.branchName?.message}
                    {...register(`bankAccounts.${index}.branchName`)}
                  />
                </div>

                {/* Bank Row 3: Bank address (auto-filled from IFSC, always editable) */}
                <div>
                  <Input
                    id={`bank-address-${index}`}
                    guidance={bankAccountGuidance.bankAddress}
                    label="Bank address"
                    disabled={isReadOnly}
                    placeholder="Enter the bank branch address"
                    helperText="Optional. Filled in automatically from the IFSC code when the branch details are available."
                    error={accountErrors?.bankAddress?.message}
                    {...register(`bankAccounts.${index}.bankAddress`)}
                  />
                </div>

                {/* Bank Row 4: Account type (full-width) */}
                <div>
                  <Controller
                    control={control}
                    name={`bankAccounts.${index}.accountType`}
                    render={({ field }) => (
                      <Select
                        id={`bank-type-${index}`}
                        guidance={bankAccountGuidance.accountType}
                        label="Account type *"
                        required
                        disabled={isReadOnly}
                        options={ACCOUNT_TYPE_OPTIONS}
                        trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
                        error={accountErrors?.accountType?.message}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                </div>
              </div>
            );
          })}

          {/* Add Bank Account Dashed Button */}
          {!isReadOnly && (
            <Button
              type="button"
              onClick={handleAddBankAccount}
              className="w-full py-3.5 px-4 rounded-xl border border-dashed border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50/50 text-secondary hover:text-primary text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span> Add Bank Account</span>
            </Button>
          )}
        </div>

        {/* Financial: Other Source of Income section */}
        <div className="space-y-4 pt-2">
          <h4 className="font-semibold text-primary">
            Financial: Other Source of Income
          </h4>

          {incomeFields.length === 0 && (
            <p className="text-xs text-secondary italic">
              {isReadOnly
                ? 'No other sources of income recorded.'
                : 'No other sources of income added yet.'}
            </p>
          )}

          {incomeFields.map((field, index) => {
            const incomeErrors = errors.otherIncomeSources?.[index];

            return (
              <div
                key={field.id}
                className="rounded-2xl border border-neutral-200/80 p-5 sm:p-6 bg-white space-y-4 shadow-2xs"
              >
                <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
                  <span className="text-xs font-semibold text-secondary">
                    Income Source #{index + 1}
                  </span>
                  {!isReadOnly && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeIncomeSource(index)}
                      className="h-7 px-4 rounded-lg text-xs font-semibold bg-[#8B2323] hover:bg-[#721C1C] text-white shadow-2xs"
                    >
                      Delete
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <Input
                    id={`income-organization-${index}`}
                    guidance={otherIncomeGuidance.organization}
                    label="Organization *"
                    required
                    disabled={isReadOnly}
                    placeholder="Enter organization name"
                    error={incomeErrors?.organization?.message}
                    {...register(`otherIncomeSources.${index}.organization`)}
                  />
                  <Controller
                    control={control}
                    name={`otherIncomeSources.${index}.financialYear`}
                    render={({ field }) => (
                      <Select
                        id={`income-fin-year-${index}`}
                        guidance={otherIncomeGuidance.financialYear}
                        label="Financial year *"
                        required
                        disabled={isReadOnly}
                        options={FINANCIAL_YEAR_OPTIONS}
                        placeholder="Select financial year"
                        trailingIcon={<ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />}
                        error={incomeErrors?.financialYear?.message}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  <Input
                    id={`income-scheme-${index}`}
                    guidance={otherIncomeGuidance.scheme}
                    label="Scheme *"
                    required
                    disabled={isReadOnly}
                    placeholder="Enter scheme name"
                    error={incomeErrors?.scheme?.message}
                    {...register(`otherIncomeSources.${index}.scheme`)}
                  />
                  <Input
                    id={`income-total-amount-${index}`}
                    guidance={otherIncomeGuidance.totalAmount}
                    label="Total Amt *"
                    required
                    disabled={isReadOnly}
                    placeholder="₹2,50,000"
                    error={incomeErrors?.totalAmount?.message}
                    {...register(`otherIncomeSources.${index}.totalAmount`)}
                  />
                </div>
              </div>
            );
          })}

          {!isReadOnly && (
            <Button
              type="button"
              onClick={handleAddIncomeSource}
              className="w-full py-3.5 px-4 rounded-xl border border-dashed border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50/50 text-secondary hover:text-primary text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span> Add Income Source</span>
            </Button>
          )}
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
        {isReadOnly ? (
          onNextStep && (
            <Button
              type="button"
              variant="primary"
              onClick={onNextStep}
              className="rounded-full bg-[#0F4C36] hover:bg-[#0B3B2A] text-white px-7 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            >
              Next: Board of Directors →
            </Button>
          )
        ) : (
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            loadingText="Saving records..."
            className="rounded-full bg-[#0F4C36] hover:bg-[#0B3B2A] text-white px-7 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
          >
            Save and Continue →
          </Button>
        )}
      </div>
    </form>
  );
});

FpcFinancialInformationForm.displayName = 'FpcFinancialInformationForm';

