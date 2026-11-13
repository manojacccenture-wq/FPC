import React, {
  forwardRef,
  useId,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X, Check, Search } from 'lucide-react';
import { cn } from '../utils/cn';
import { FormField } from './FormField';

export type MultiSelectSize = 'sm' | 'md' | 'lg';

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  id?: string;
  name?: string;
  className?: string;
  containerClassName?: string;
  size?: MultiSelectSize;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  options?: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (selectedValues: string[]) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  maxSelected?: number;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const sizeClasses: Record<
  MultiSelectSize,
  {
    container: string;
    icon: string;
  }
> = {
  sm: {
    container: "min-h-9 py-1 px-2.5 text-xs sm:text-sm",
    icon: "w-3.5 h-3.5 right-2.5",
  },
  md: {
    container: "min-h-11 py-1.5 px-3 text-sm",
    icon: "w-4 h-4 right-3.5",
  },
  lg: {
    container: "min-h-[52px] py-2 px-3.5 text-base",
    icon: "w-5 h-5 right-4",
  },
};

export const MultiSelect = forwardRef<HTMLInputElement, MultiSelectProps>(({
  id: explicitId,
  name,
  className,
  containerClassName,
  size = 'md',
  label,
  required,
  error,
  helperText,
  options = [],
  value,
  defaultValue = [],
  onChange,
  onBlur,
  placeholder = 'Select options...',
  disabled = false,
  searchable = true,
  clearable = true,
  maxSelected,
  leadingIcon,
  trailingIcon,
}, ref) => {
  const generatedId = useId();
  const id = explicitId || generatedId;
  const currentSize = sizeClasses[size];

  // Controlled vs uncontrolled state handling
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string[]>(() => {
    return Array.isArray(defaultValue) ? defaultValue : [];
  });

  const selectedValues = useMemo(() => {
    return isControlled ? (Array.isArray(value) ? value : []) : internalValue;
  }, [isControlled, value, internalValue]);

  // Combine provided options and any dynamically selected values not present in options
  const effectiveOptions = useMemo(() => {
    const list = [...options];
    selectedValues.forEach((val) => {
      if (!list.some((opt) => opt.value === val)) {
        list.push({ value: val, label: val });
      }
    });
    return list;
  }, [options, selectedValues]);

  // Dropdown open/close, coordinates & search filter state
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownCoords, setDropdownCoords] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  }>({ top: 0, left: 0, width: 0, maxHeight: 260 });
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const listboxNodeRef = useRef<HTMLDivElement | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listboxCleanupRef = useRef<(() => void) | null>(null);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return effectiveOptions;
    const cleanSearch = searchTerm.trim().toLowerCase();
    return effectiveOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(cleanSearch) ||
        opt.value.toLowerCase().includes(cleanSearch)
    );
  }, [effectiveOptions, searchTerm]);

  // Viewport-relative floating coordinates calculation
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const maxAllowedH = 260;

    // Flip upwards if space below is tight (< 200px) and space above is greater
    const shouldFlipUp = spaceBelow < 200 && spaceAbove > spaceBelow;
    const availableH = shouldFlipUp ? spaceAbove - 16 : spaceBelow - 16;
    const calculatedMaxHeight = Math.min(Math.max(availableH, 140), maxAllowedH);

    const top = shouldFlipUp
      ? rect.top - calculatedMaxHeight - 6
      : rect.bottom + 6;

    setDropdownCoords({
      top: Math.round(top),
      left: Math.round(rect.left),
      width: Math.round(rect.width),
      maxHeight: Math.round(calculatedMaxHeight),
    });
  }, []);

  const toggleDropdown = useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        updatePosition();
        setSearchTerm('');
        setHighlightedIndex(0);
      }
      return next;
    });
  }, [disabled, updatePosition]);

  // Callback ref on the listbox container for strictly local wheel & touch isolation (Zero useEffect)
  const listboxRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (listboxCleanupRef.current) {
      listboxCleanupRef.current();
      listboxCleanupRef.current = null;
    }

    listboxNodeRef.current = node;
    if (!node) return;

    // Desktop/Trackpad wheel event isolation: stops propagation to modal/page and locks boundaries
    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      const { scrollTop, scrollHeight, clientHeight } = node;
      const isScrollable = scrollHeight > clientHeight;

      if (!isScrollable) {
        e.preventDefault();
        return;
      }

      const isAtTop = scrollTop <= 0 && e.deltaY < 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;

      if (isAtTop || isAtBottom) {
        e.preventDefault();
      }
    };

    // Mobile touch isolation (tracks touch delta to prevent background modal dragging)
    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        startY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const currentY = e.touches[0].clientY;
      const deltaY = startY - currentY;
      const { scrollTop, scrollHeight, clientHeight } = node;
      const isScrollable = scrollHeight > clientHeight;

      if (!isScrollable) {
        e.preventDefault();
        return;
      }

      const isAtTop = scrollTop <= 0 && deltaY < 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1 && deltaY > 0;

      if (isAtTop || isAtBottom) {
        e.preventDefault();
      }

      e.stopPropagation();
    };

    node.addEventListener('wheel', handleWheel, { passive: false });
    node.addEventListener('touchstart', handleTouchStart, { passive: true });
    node.addEventListener('touchmove', handleTouchMove, { passive: false });

    listboxCleanupRef.current = () => {
      node.removeEventListener('wheel', handleWheel);
      node.removeEventListener('touchstart', handleTouchStart);
      node.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Direct ref forwarding to hidden input for standard form and React Hook Form integration
  const setCombinedRef = (node: HTMLInputElement | null) => {
    hiddenInputRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    }
    if (node && !isControlled && node.value) {
      try {
        const parsed = JSON.parse(node.value);
        if (Array.isArray(parsed) && JSON.stringify(parsed) !== JSON.stringify(internalValue)) {
          setInternalValue(parsed);
        }
      } catch {
        // Not JSON
      }
    }
  };

  // Sync internal value if defaultValue changes dynamically
  useEffect(() => {
    if (!isControlled && defaultValue !== undefined) {
      setInternalValue(Array.isArray(defaultValue) ? defaultValue : []);
    }
  }, [defaultValue, isControlled]);

  // Outside click & ancestor scroll handlers
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      const clickedTrigger = containerRef.current?.contains(target);
      const clickedListbox = listboxNodeRef.current?.contains(target);

      if (!clickedTrigger && !clickedListbox) {
        setIsOpen(false);
        if (onBlur && hiddenInputRef.current) {
          const blurEvent = new FocusEvent('blur', { bubbles: false });
          hiddenInputRef.current.dispatchEvent(blurEvent);
        }
      }
    };

    const handleScrollOrResize = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setIsOpen(false);
        return;
      }
      updatePosition();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, onBlur, updatePosition]);

  // Focus search input when popover opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  // Emit value change to parent and dispatch native event
  const emitChange = useCallback(
    (nextValues: string[]) => {
      if (!isControlled) {
        setInternalValue(nextValues);
      }

      if (onChange) {
        onChange(nextValues);
      }

      const input = hiddenInputRef.current;
      if (input) {
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )?.set;
        if (setter) {
          setter.call(input, JSON.stringify(nextValues));
        } else {
          input.value = JSON.stringify(nextValues);
        }
        const changeEvent = new Event('change', { bubbles: true });
        input.dispatchEvent(changeEvent);
      }
    },
    [isControlled, onChange]
  );

  // Toggle single option
  const handleToggleOption = (val: string) => {
    if (disabled) return;

    const alreadySelected = selectedValues.includes(val);
    let next: string[];

    if (alreadySelected) {
      next = selectedValues.filter((v) => v !== val);
    } else {
      if (maxSelected && selectedValues.length >= maxSelected) return;
      next = [...selectedValues, val];
    }

    emitChange(next);
  };

  // Remove specific selected option chip
  const handleRemoveChip = (e: React.MouseEvent, val: string) => {
    e.stopPropagation();
    if (disabled) return;
    const next = selectedValues.filter((v) => v !== val);
    emitChange(next);
  };

  // Clear all selections
  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    emitChange([]);
  };

  // Select all filtered options
  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    const allValues = Array.from(
      new Set([...selectedValues, ...filteredOptions.map((o) => o.value)])
    );
    emitChange(allValues);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDropdown();
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        let next = prev + 1;
        while (next < filteredOptions.length && filteredOptions[next].disabled) {
          next++;
        }
        return next < filteredOptions.length ? next : prev;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        let next = prev - 1;
        while (next >= 0 && filteredOptions[next].disabled) {
          next--;
        }
        return next >= 0 ? next : prev;
      });
    } else if (e.key === 'Enter' || e.key === ' ') {
      // Toggle highlighted option
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        e.preventDefault();
        const opt = filteredOptions[highlightedIndex];
        if (!opt.disabled) {
          handleToggleOption(opt.value);
        }
      }
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  // Resolve selected option objects for chips
  const selectedOptions = useMemo(() => {
    return selectedValues.map((val) => {
      const found = effectiveOptions.find((opt) => opt.value === val);
      return found || { value: val, label: val };
    });
  }, [selectedValues, effectiveOptions]);

  const multiSelectElement = (
    <div ref={containerRef} className={cn("relative w-full", isOpen ? "z-30" : "z-0")}>
      {/* Hidden input to pass value into standard HTML forms & React Hook Form */}
      <input
        ref={setCombinedRef}
        id={id ? `${id}-hidden` : undefined}
        name={name}
        type="hidden"
        value={JSON.stringify(selectedValues)}
        disabled={disabled}
      />

      {/* Visual Trigger Box matching Select.tsx & reference image media_1794546557981_a2ee0978.png */}
      <div
        ref={triggerRef}
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? `${id}-listbox` : undefined}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-desc` : undefined}
        tabIndex={disabled ? -1 : 0}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        className={cn(
          // Base trigger styling matching Select.tsx
          "w-full rounded-control border bg-white font-normal transition-colors cursor-pointer select-none text-left flex items-center justify-between",
          "outline-none relative pr-10",
          currentSize.container,
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
      >
        {/* Leading Icon (e.g. Search icon in Business Activities) */}
        {leadingIcon && (
          <span className="shrink-0 text-secondary mr-2 flex items-center justify-center">
            {leadingIcon}
          </span>
        )}

        {/* Selected Values Pills Container matching reference image media_1794546557981_a2ee0978.png */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0 py-0.5">
          {selectedOptions.length === 0 ? (
            <span className="text-neutral-400 text-sm font-normal truncate">
              {placeholder}
            </span>
          ) : (
            selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className={cn(
                  // Pill styling matching exact visual reference: soft sage pill with deep forest green text
                  "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#E8F5EF] text-[#0F4C36] text-xs sm:text-sm font-medium select-none shadow-2xs transition-colors"
                )}
              >
                <span className="truncate max-w-[200px]">{opt.label}</span>
                <button
                  type="button"
                  aria-label={`Remove ${opt.label}`}
                  disabled={disabled}
                  onClick={(e) => handleRemoveChip(e, opt.value)}
                  className="text-[#0F4C36]/70 hover:text-[#0F4C36] transition-colors p-0.5 rounded cursor-pointer flex items-center justify-center shrink-0"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.2]" />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Trailing Icon Actions: Clear All button & ChevronDown */}
        <div className="absolute right-3.5 flex items-center gap-1.5 pointer-events-auto">
          {clearable && selectedValues.length > 0 && !disabled && (
            <button
              type="button"
              aria-label="Clear all selections"
              onClick={handleClearAll}
              className="text-neutral-400 hover:text-neutral-600 transition-colors p-0.5 rounded cursor-pointer flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          )}

          <span
            className={cn(
              "text-secondary pointer-events-none flex items-center justify-center shrink-0 transition-transform duration-200",
              currentSize.icon,
              isOpen && "rotate-180"
            )}
          >
            {trailingIcon || <ChevronDown className="w-full h-full stroke-[2]" />}
          </span>
        </div>
      </div>

      {/* Floating Dropdown Options Popover matching Select.tsx rendered via React Portal */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={listboxRefCallback}
          id={`${id}-listbox`}
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={label ? `${id}-label` : id}
          style={{
            position: 'fixed',
            top: dropdownCoords.top,
            left: dropdownCoords.left,
            width: dropdownCoords.width,
            maxHeight: dropdownCoords.maxHeight,
            zIndex: 60,
          }}
          className={cn(
            "bg-white border border-neutral-200/90 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08),0_8px_10px_-6px_rgba(0,0,0,0.04)] p-2 space-y-1 overflow-y-auto overscroll-contain touch-pan-y animate-in fade-in-50 duration-100 flex flex-col",
            "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-200 [&::-webkit-scrollbar-thumb]:rounded-full"
          )}
        >
          {/* Optional Search Input & Quick Actions Bar */}
          {searchable && (
            <div className="px-2 pt-1 pb-2 border-b border-neutral-100 flex items-center gap-2 shrink-0">
              <div className="relative flex-1 flex items-center">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  placeholder="Search options..."
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 bg-[#F8FAF9] focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand text-primary placeholder:text-neutral-400"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Select All / Clear All Action */}
              <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[#0F4C36] hover:underline cursor-pointer"
                >
                  All
                </button>
                <span className="text-neutral-300">|</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-neutral-500 hover:text-neutral-700 cursor-pointer"
                >
                  None
                </button>
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="space-y-1 flex-1 overflow-y-auto pt-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-4 text-xs text-neutral-400 text-center font-medium">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = selectedValues.includes(opt.value);
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={opt.value}
                    ref={(el) => { optionRefs.current[index] = el; }}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    onClick={() => handleToggleOption(opt.value)}
                    onMouseEnter={() => !opt.disabled && setHighlightedIndex(index)}
                    className={cn(
                      "w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 flex items-center justify-between select-none min-h-[42px] cursor-pointer",
                      // Selected state pill matching Select.tsx (#EFF2F0 and #0F4C36)
                      isSelected && "bg-[#EFF2F0] text-[#0F4C36]",
                      // Unselected state
                      !isSelected && !opt.disabled && "bg-transparent text-[#0F4C36] hover:bg-[#F4F6F5]",
                      // Highlighted index
                      !isSelected && isHighlighted && !opt.disabled && "bg-[#F4F6F5]",
                      // Disabled state
                      opt.disabled && "text-neutral-400 bg-transparent cursor-not-allowed opacity-50"
                    )}
                  >
                    <span className="truncate pr-2">{opt.label}</span>

                    {/* Checkbox indicator */}
                    <div
                      className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors",
                        isSelected
                          ? "bg-[#0F4C36] border-[#0F4C36] text-white"
                          : "border-neutral-300 bg-white"
                      )}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body
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
        {multiSelectElement}
      </FormField>
    );
  }

  return multiSelectElement;
});

MultiSelect.displayName = "MultiSelect";

