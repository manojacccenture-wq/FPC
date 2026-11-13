import React, {
  forwardRef,
  useId,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { parseDateString, getStartOfToday } from '../utils/date';
import { FormField } from './FormField';

export type DatePickerSize = 'sm' | 'md' | 'lg';

export interface DatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: DatePickerSize;
  label?: string;
  error?: string;
  helperText?: string;
  onDateChange?: (date: Date | null, dateString?: string) => void;
  minDate?: string | Date;
  maxDate?: string | Date;
  disablePastDates?: boolean;
  clearable?: boolean;
  trailingIcon?: React.ReactNode;
  containerClassName?: string;
}

const sizeClasses: Record<
  DatePickerSize,
  {
    input: string;
    icon: string;
    trailingPadding: string;
  }
> = {
  sm: {
    input: "h-9 min-h-9 px-3 text-xs sm:text-sm",
    icon: "w-3.5 h-3.5 right-2.5",
    trailingPadding: "pr-9",
  },
  md: {
    input: "h-11 min-h-11 px-3.5 text-sm",
    icon: "w-4 h-4 right-3.5",
    trailingPadding: "pr-10",
  },
  lg: {
    input: "h-[52px] min-h-[52px] px-4 text-base",
    icon: "w-5 h-5 right-4",
    trailingPadding: "pr-12",
  },
};

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/**
 * Pure date to DD-MM-YYYY string formatter
 */
function formatDateToDMY(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Check if two dates represent the exact same calendar day
 */
function isSameDay(d1: Date | null, d2: Date | null): boolean {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(({
  id: explicitId,
  name,
  className,
  containerClassName,
  size = 'md',
  label,
  required,
  error,
  helperText,
  placeholder = 'dd-mm-yyyy',
  disabled,
  value,
  defaultValue,
  onChange,
  onDateChange,
  minDate,
  maxDate,
  disablePastDates = false,
  clearable = false,
  trailingIcon,
  onBlur,
  ...props
}, ref) => {
  const generatedId = useId();
  const id = explicitId || generatedId;
  const currentSize = sizeClasses[size];

  // Resolve controlled vs uncontrolled value
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(() => {
    if (defaultValue !== undefined) return String(defaultValue);
    return '';
  });

  const displayValue = isControlled ? String(value ?? '') : internalValue;

  // Selected date object derived from display string
  const selectedDate = useMemo(() => parseDateString(displayValue), [displayValue]);

  // Today reference
  const today = useMemo(() => new Date(), []);

  // Calendar view year & month state
  const [viewYear, setViewYear] = useState<number>(() => {
    return selectedDate ? selectedDate.getFullYear() : today.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    return selectedDate ? selectedDate.getMonth() : today.getMonth();
  });

  // Calendar popup open state
  const [isOpen, setIsOpen] = useState(false);

  // Parse minDate and maxDate
  const parsedMinDate = useMemo(() => {
    const explicitMin = minDate ? (minDate instanceof Date ? minDate : parseDateString(minDate)) : null;
    if (disablePastDates) {
      const todayStart = getStartOfToday();
      if (!explicitMin) return todayStart;
      return explicitMin > todayStart ? explicitMin : todayStart;
    }
    return explicitMin;
  }, [minDate, disablePastDates]);

  const parsedMaxDate = useMemo(() => {
    if (!maxDate) return null;
    return maxDate instanceof Date ? maxDate : parseDateString(maxDate);
  }, [maxDate]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Sync combined ref for React Hook Form without Proxy
  const setCombinedRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      }
      if (node && !isControlled && node.value && node.value !== internalValue) {
        setInternalValue(node.value);
      }
    },
    [ref, isControlled, internalValue]
  );

  // Sync internal value if defaultValue changes dynamically
  useEffect(() => {
    if (!isControlled && defaultValue !== undefined) {
      setInternalValue(String(defaultValue));
    }
  }, [defaultValue, isControlled]);

  // Synchronize calendar view if selected date changes externally
  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [selectedDate]);

  // Close popup on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen]);

  // Dispatch change event to React Hook Form and parent handlers
  const emitValueChange = useCallback(
    (nextVal: string, dateObj: Date | null) => {
      if (!isControlled) {
        setInternalValue(nextVal);
      }

      const input = inputRef.current;
      if (input) {
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )?.set;
        if (setter) {
          setter.call(input, nextVal);
        } else {
          input.value = nextVal;
        }

        const changeEvent = new Event('change', { bubbles: true });
        input.dispatchEvent(changeEvent);
      }

      if (typeof onDateChange === 'function') {
        onDateChange(dateObj, nextVal);
      }
    },
    [isControlled, onDateChange]
  );

  // Handle selecting a date cell
  const handleSelectDate = (date: Date) => {
    if (disabled) return;

    // Check bounds
    if (parsedMinDate && date < parsedMinDate) return;
    if (parsedMaxDate && date > parsedMaxDate) return;

    const formatted = formatDateToDMY(date);
    emitValueChange(formatted, date);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Month navigation
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewMonth((prev) => {
      if (prev === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewMonth((prev) => {
      if (prev === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  // Clear date
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    emitValueChange('', null);
  };

  // Build calendar matrix (Monday-first, 42 cells total)
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    // (getDay() + 6) % 7 gives: Mon = 0, Tue = 1, ..., Sun = 6
    const startColIndex = (firstDayOfMonth.getDay() + 6) % 7;

    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: {
      date: Date;
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isSelected: boolean;
      isToday: boolean;
      isDisabled: boolean;
    }[] = [];

    // 1. Leading days from previous month
    for (let i = startColIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const cellDate = new Date(viewYear, viewMonth - 1, dayNum);
      const isSelected = isSameDay(cellDate, selectedDate);
      const isTodayCell = isSameDay(cellDate, today);
      const isDisabled =
        (parsedMinDate ? cellDate < parsedMinDate : false) ||
        (parsedMaxDate ? cellDate > parsedMaxDate : false);

      cells.push({
        date: cellDate,
        dateString: formatDateToDMY(cellDate),
        dayNumber: dayNum,
        isCurrentMonth: false,
        isSelected,
        isToday: isTodayCell,
        isDisabled,
      });
    }

    // 2. Days of current month
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const cellDate = new Date(viewYear, viewMonth, dayNum);
      const isSelected = isSameDay(cellDate, selectedDate);
      const isTodayCell = isSameDay(cellDate, today);
      const isDisabled =
        (parsedMinDate ? cellDate < parsedMinDate : false) ||
        (parsedMaxDate ? cellDate > parsedMaxDate : false);

      cells.push({
        date: cellDate,
        dateString: formatDateToDMY(cellDate),
        dayNumber: dayNum,
        isCurrentMonth: true,
        isSelected,
        isToday: isTodayCell,
        isDisabled,
      });
    }

    // 3. Trailing days from next month to complete 42 cells (6 rows)
    const remainingCells = 42 - cells.length;
    for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
      const cellDate = new Date(viewYear, viewMonth + 1, dayNum);
      const isSelected = isSameDay(cellDate, selectedDate);
      const isTodayCell = isSameDay(cellDate, today);
      const isDisabled =
        (parsedMinDate ? cellDate < parsedMinDate : false) ||
        (parsedMaxDate ? cellDate > parsedMaxDate : false);

      cells.push({
        date: cellDate,
        dateString: formatDateToDMY(cellDate),
        dayNumber: dayNum,
        isCurrentMonth: false,
        isSelected,
        isToday: isTodayCell,
        isDisabled,
      });
    }

    return cells;
  }, [viewYear, viewMonth, selectedDate, today, parsedMinDate, parsedMaxDate]);

  // Handle direct manual typing in the input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!isControlled) {
      setInternalValue(val);
    }
    const parsed = parseDateString(val);
    if (parsed) {
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
    if (typeof onDateChange === 'function') {
      onDateChange(parsed, val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const datePickerElement = (
    <div ref={containerRef} className={cn("relative w-full", isOpen ? "z-30" : "z-0")}>
      <div className="relative w-full flex items-center">
        <input
          ref={setCombinedRef}
          id={id}
          name={name}
          type="text"
          disabled={disabled}
          required={required}
          value={isControlled ? displayValue : undefined}
          defaultValue={!isControlled ? (defaultValue ?? internalValue ?? '') : undefined}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-desc` : undefined}
          onChange={(e) => {
            handleInputChange(e);
            onChange?.(e);
          }}
          onClick={() => !disabled && setIsOpen(true)}
          onFocus={() => !disabled && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          className={cn(
            // Base input styling
            "w-full rounded-control border bg-white text-primary font-normal placeholder:text-neutral-400 transition-colors cursor-pointer",
            "outline-none appearance-none",
            currentSize.input,
            currentSize.trailingPadding,
            // Border & focus
            "border-neutral-200 hover:border-neutral-400",
            "focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:border-transparent",
            isOpen && "border-brand ring-2 ring-brand ring-offset-2",
            // Error tokens
            error && "border-danger focus:ring-danger text-danger",
            // Disabled tokens
            disabled && "bg-neutral-50 text-neutral-400 border-default cursor-not-allowed",
            className
          )}
          {...props}
        />

        {/* Trailing Icon (Clear button or Calendar icon) */}
        <div className="absolute right-3.5 flex items-center gap-1.5">
          {clearable && displayValue && !disabled && (
            <button
              type="button"
              aria-label="Clear date"
              onClick={handleClear}
              className="text-neutral-400 hover:text-neutral-600 transition-colors p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            aria-label="Toggle calendar"
            disabled={disabled}
            onClick={() => !disabled && setIsOpen((prev) => !prev)}
            className="text-neutral-400 hover:text-neutral-600 transition-colors flex items-center justify-center cursor-pointer"
          >
            {trailingIcon || <CalendarIcon className="w-4 h-4 text-neutral-400 stroke-[2]" />}
          </button>
        </div>
      </div>

      {/* Calendar Popup Popover matching reference image media_1794495583294_9153e73c.jpg */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Calendar"
          className="absolute left-0 top-full mt-2 z-50 bg-white rounded-3xl border border-neutral-200/90 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)] p-5 w-[320px] max-w-full select-none animate-in fade-in-50 duration-150"
        >
          {/* Header Row: Prev Month Button, Month & Year Title, Next Month Button */}
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              aria-label="Previous month"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-full hover:bg-[#F4F6F5] text-[#0F4C36] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
            </button>

            <span className="text-base font-semibold text-[#0E1B16] tracking-tight">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              aria-label="Next month"
              onClick={handleNextMonth}
              className="p-1.5 rounded-full hover:bg-[#F4F6F5] text-[#0F4C36] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>

          {/* Weekday Row: Mo, Tu, We, Th, Fr, Sa, Su (Monday-first) */}
          <div className="grid grid-cols-7 text-center mb-3 text-xs font-normal text-neutral-400">
            {WEEKDAY_NAMES.map((dayName) => (
              <div key={dayName} className="w-9 h-6 flex items-center justify-center">
                {dayName}
              </div>
            ))}
          </div>

          {/* Days Grid: 7 columns, 6 rows (42 cells total) */}
          <div className="grid grid-cols-7 gap-y-2 text-center place-items-center">
            {calendarCells.map((cell) => (
              <button
                key={cell.dateString}
                type="button"
                disabled={cell.isDisabled}
                onClick={() => handleSelectDate(cell.date)}
                className={cn(
                  "w-9 h-9 flex items-center justify-center text-sm transition-colors cursor-pointer select-none font-normal",
                  // Selected state pill matching reference image (rounded-2xl)
                  cell.isSelected ? "rounded-2xl" : "rounded-xl",
                  // Selected: soft sage pill with deep forest green text (as shown on 19 in reference image!)
                  cell.isSelected && "bg-[#EFF2F0] text-[#0F4C36] font-medium shadow-2xs",
                  // Current month unselected dates
                  !cell.isSelected && cell.isCurrentMonth && !cell.isDisabled && "text-neutral-800 hover:bg-[#F4F6F5]",
                  // Adjacent month dates (muted gray)
                  !cell.isSelected && !cell.isCurrentMonth && !cell.isDisabled && "text-neutral-400 hover:bg-[#F4F6F5]",
                  // Current date indicator (if not selected)
                  !cell.isSelected && cell.isToday && "ring-1 ring-neutral-300 font-medium",
                  // Disabled date
                  cell.isDisabled && "text-neutral-300 opacity-40 cursor-not-allowed pointer-events-none"
                )}
              >
                {cell.dayNumber}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (label || error || helperText) {
    return (
      <FormField
        id={id}
        label={label}
        required={required}
        error={error}
        helperText={helperText}
        className={containerClassName}
      >
        {datePickerElement}
      </FormField>
    );
  }

  return datePickerElement;
});

DatePicker.displayName = 'DatePicker';
