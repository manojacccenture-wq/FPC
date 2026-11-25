import { z } from 'zod';
import {
  requiredString,
  ifscSchema,
  bankAccountSchema,
  positiveIntegerStringSchema,
} from '../../../shared/validation/schemas';

export const bankAccountItemSchema = z.object({
  id: z.string(),
  bankName: requiredString('Bank name'),
  accountNumber: bankAccountSchema,
  ifscCode: ifscSchema,
  branchName: requiredString('Branch name'),
  // Optional by design: it may be unavailable from the IFSC lookup, and manual
  // entry must never be blocked. Filled automatically when the lookup succeeds.
  bankAddress: z.string().trim().max(200, 'Bank address cannot exceed 200 characters'),
  accountType: requiredString('Account type'),
});

export const otherIncomeSourceItemSchema = z.object({
  id: z.string(),
  organization: requiredString('Organization'),
  financialYear: requiredString('Financial year'),
  scheme: requiredString('Scheme'),
  totalAmount: requiredString('Total amount'),
});

export const turnoverRecordSchema = z.object({
  financialYear: requiredString('Financial year'),
  turnover: z.string().trim().optional(),
});

export const financialInformationSchema = z.object({
  authorizedCapital: requiredString('Authorized capital'),
  paidUpCapital: requiredString('Paid-up capital'),
  faceValuePerShare: requiredString('Face value per share'),
  annualTurnover: z.string().trim().optional(),
  financialYear: z.string().trim().optional(),
  turnoverHistory: z.array(turnoverRecordSchema).optional(),
  shareholders: requiredString('Shareholders'),
  totalEquitySharesAllotted: positiveIntegerStringSchema(
    'Total Number of Equity Shares Allotted'
  ),
  bankAccounts: z.array(bankAccountItemSchema).min(1, 'At least one bank account is required'),
  otherIncomeSources: z.array(otherIncomeSourceItemSchema),
});

export type FinancialInformationFormValues = z.infer<typeof financialInformationSchema>;
export type OtherIncomeSourceFormValues = z.infer<typeof otherIncomeSourceItemSchema>;
export type TurnoverRecordFormValues = z.infer<typeof turnoverRecordSchema>;

