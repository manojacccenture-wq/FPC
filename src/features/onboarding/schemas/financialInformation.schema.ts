import { z } from 'zod';
import {
  requiredString,
  ifscSchema,
  bankAccountSchema,
} from '../../../shared/validation/schemas';

export const bankAccountItemSchema = z.object({
  id: z.string(),
  bankName: requiredString('Bank name'),
  accountNumber: bankAccountSchema,
  ifscCode: ifscSchema,
  branchName: requiredString('Branch name'),
  accountType: requiredString('Account type'),
});

export const financialInformationSchema = z.object({
  authorizedCapital: requiredString('Authorized capital'),
  paidUpCapital: requiredString('Paid-up capital'),
  faceValuePerShare: requiredString('Face value per share'),
  annualTurnover: requiredString('Annual turnover'),
  financialYear: requiredString('Financial year'),
  farmers: requiredString('Farmers'),
  shareholders: requiredString('Shareholders'),
  employees: requiredString('Employees'),
  bankAccounts: z.array(bankAccountItemSchema).min(1, 'At least one bank account is required'),
});

export type FinancialInformationFormValues = z.infer<typeof financialInformationSchema>;

