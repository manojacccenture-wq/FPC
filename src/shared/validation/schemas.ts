import { z } from 'zod';

/**
 * Centralized, reusable validation rules based on Zod.
 * Shared across features to ensure consistent validation patterns and error messages.
 */

export const requiredString = (fieldName: string, minLength = 1) =>
  z.string()
    .trim()
    .min(minLength, `${fieldName} is required`);

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email address is required')
  .email('Please enter a valid email address');

export const optionalEmailSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => {
      if (!val || val === '') return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    },
    { message: 'Please enter a valid email address' }
  );

export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .regex(
    /^(\+91[\s-]?)?[6789]\d{9}$/,
    'Please enter a valid 10-digit mobile number'
  );

/**
 * MCA Corporate Identification Number (CIN) Validation:
 * Exactly 21 alphanumeric characters.
 * Format: [L/U][5 digits][2 state letters][4 year digits][3 letters][6 digits]
 */
export const cinSchema = z
  .string()
  .trim()
  .min(1, 'CIN is required')
  .length(21, 'CIN must be exactly 21 alphanumeric characters')
  .regex(
    /^[LUlu][0-9]{5}[A-Za-z]{2}[0-9]{4}[A-Za-z]{3}[0-9]{6}$/,
    'Invalid CIN format (e.g. U01100OD2026PTC000001)'
  );

/**
 * Director Identification Number (DIN) Validation:
 * Exactly 8 digits (e.g. 12345678)
 */
export const dinSchema = z
  .string()
  .trim()
  .min(1, 'DIN is required')
  .length(8, 'DIN must be exactly 8 digits')
  .regex(
    /^[0-9]{8}$/,
    'DIN must contain only 8 digits'
  );

/**
 * Permanent Account Number (PAN) Validation:
 * Exactly 10 characters: 5 letters, 4 digits, 1 letter (e.g. AABCK6954F)
 */
export const panSchema = z
  .string()
  .trim()
  .min(1, 'Company PAN is required')
  .length(10, 'PAN must be exactly 10 characters')
  .regex(
    /^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/,
    'Invalid PAN format (e.g. AABCK6954F)'
  );

/**
 * Director Personal PAN Validation (with customizable label)
 */
export const directorPanSchema = z
  .string()
  .trim()
  .min(1, 'Director PAN is required')
  .length(10, 'PAN must be exactly 10 characters')
  .regex(
    /^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/,
    'Invalid PAN format (e.g. AABCK6954F)'
  );

/**
 * Tax Deduction and Collection Account Number (TAN) Validation:
 * Exactly 10 characters: 4 letters, 5 digits, 1 letter (e.g. BBSK01234A)
 */
export const tanSchema = z
  .string()
  .trim()
  .min(1, 'Company TAN is required')
  .length(10, 'TAN must be exactly 10 characters')
  .regex(
    /^[A-Za-z]{4}[0-9]{5}[A-Za-z]{1}$/,
    'Invalid TAN format (e.g. BBSK01234A)'
  );

/**
 * Goods and Services Tax Identification Number (GSTIN) Validation:
 * Exactly 15 characters (e.g. 21AABCK6954F1Z5)
 */
export const gstinSchema = z
  .string()
  .trim()
  .min(1, 'GSTIN is required')
  .length(15, 'GSTIN must be exactly 15 characters')
  .regex(
    /^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[1-9A-Za-z]{1}[Zz][0-9A-Za-z]{1}$/,
    'Invalid GSTIN format (e.g. 21AABCK6954F1Z5)'
  );

/**
 * Food Safety and Standards Authority of India (FSSAI) License Number:
 * Exactly 14 digits (e.g. 12026021000123)
 */
export const fssaiSchema = z
  .string()
  .trim()
  .min(1, 'FSSAI license number is required')
  .length(14, 'FSSAI license must be exactly 14 digits')
  .regex(
    /^[0-9]{14}$/,
    'FSSAI license must contain only 14 digits'
  );

/**
 * Indian Financial System Code (IFSC) Validation:
 * Exactly 11 characters: 4 alphabets, '0', 6 alphanumeric characters (e.g. SBIN0001234)
 */
export const ifscSchema = z
  .string()
  .trim()
  .min(1, 'IFSC code is required')
  .length(11, 'IFSC code must be exactly 11 characters')
  .regex(
    /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/,
    'Invalid IFSC code format (e.g. SBIN0001234)'
  );

/**
 * Bank Account Number Validation:
 * Between 9 and 18 digits.
 */
export const bankAccountSchema = z
  .string()
  .trim()
  .min(1, 'Account number is required')
  .regex(
    /^[0-9]{9,18}$/,
    'Account number must be between 9 and 18 digits'
  );

/**
 * Indian PIN Code Validation:
 * Exactly 6 digits (e.g. 755019)
 */
export const pinCodeSchema = z
  .string()
  .trim()
  .min(1, 'PIN code is required')
  .length(6, 'PIN code must be exactly 6 digits')
  .regex(
    /^[1-9][0-9]{5}$/,
    'PIN code must contain 6 digits'
  );

export const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => {
      if (!val || val === '') return true;
      try {
        const url = val.startsWith('http://') || val.startsWith('https://') ? val : `https://${val}`;
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Please enter a valid website URL' }
  );

export const dateStringSchema = (fieldName: string) =>
  z.string()
    .trim()
    .min(1, `${fieldName} is required`);
