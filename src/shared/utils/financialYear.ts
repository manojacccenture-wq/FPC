/**
 * Indian Financial Year utilities (April 1 to March 31).
 *
 * In India, a financial year runs from 1st April of year Y to 31st March of year Y+1.
 * For example:
 * - 1st April 2025 to 31st March 2026 is FY 2025–26.
 * - In November 2026, the ongoing FY is 2026–27.
 * - The last 5 completed financial years are:
 *   FY 2021–22, FY 2022–23, FY 2023–24, FY 2024–25, FY 2025–26.
 */

export interface FinancialYearItem {
  key: string;       // e.g. "2021-22"
  label: string;     // e.g. "FY 2021–22"
  startYear: number; // 2021
  endYear: number;   // 2022
  isCurrent: boolean;
}

/**
 * Returns the start year of the current Indian financial year based on reference date (default: now).
 * In India, if current month is April or later (month index >= 3), current FY start year is current year.
 * If current month is January-March (month index < 3), current FY start year is current year - 1.
 */
export function getCurrentFinancialYearStart(refDate: Date = new Date()): number {
  const month = refDate.getMonth(); // 0-indexed: 0 = Jan, 3 = Apr, 11 = Dec
  const year = refDate.getFullYear();
  return month >= 3 ? year : year - 1;
}

/**
 * Formats a start year into Indian FY notation.
 * e.g. 2021 -> "2021-22", or with prefix: "FY 2021–22"
 */
export function formatFinancialYear(startYear: number, includePrefix = false): string {
  const endYearShort = String((startYear + 1) % 100).padStart(2, '0');
  const dash = includePrefix ? '–' : '-';
  const text = `${startYear}${dash}${endYearShort}`;
  return includePrefix ? `FY ${text}` : text;
}

/**
 * Generates the last N completed financial years in strict chronological order (oldest to newest).
 * For November 2026 (current ongoing FY is 2026–27), the last 5 completed FYs are:
 * 2021-22, 2022-23, 2023-24, 2024-25, 2025-26.
 */
export function getLastCompletedFinancialYears(count = 5, refDate: Date = new Date()): FinancialYearItem[] {
  const currentStart = getCurrentFinancialYearStart(refDate);
  const mostRecentCompleted = currentStart - 1;
  const oldest = mostRecentCompleted - count + 1;

  const result: FinancialYearItem[] = [];
  for (let y = oldest; y <= mostRecentCompleted; y++) {
    result.push({
      key: formatFinancialYear(y, false),
      label: formatFinancialYear(y, true),
      startYear: y,
      endYear: y + 1,
      isCurrent: false,
    });
  }
  return result;
}

/**
 * Creates default turnover records for the last N completed financial years.
 */
export function getDefaultTurnoverHistory(count = 5, refDate: Date = new Date()): Array<{ financialYear: string; turnover: string }> {
  return getLastCompletedFinancialYears(count, refDate).map((fy) => ({
    financialYear: fy.key,
    turnover: '',
  }));
}
