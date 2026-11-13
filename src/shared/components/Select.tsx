import React, { forwardRef, useId, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn';
import { FormField } from './FormField';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: SelectSize;
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
  trailingIcon?: React.ReactNode;
}

const sizeClasses: Record<SelectSize, {
  select: string;
  icon: string;
}> = {
  sm: {
    select: "h-9 min-h-9 pl-3 pr-8 text-xs sm:text-sm",
    icon: "w-3.5 h-3.5 right-2.5",
  },
  md: {
    select: "h-11 min-h-11 pl-3.5 pr-10 text-sm",
    icon: "w-4 h-4 right-3.5",
  },
  lg: {
    select: "h-[52px] min-h-[52px] pl-4 pr-12 text-base",
    icon: "w-5 h-5 right-4",
  },
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
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
  placeholder,
  disabled,
  children,
  trailingIcon,
  value,
  defaultValue,
  onChange,
  onBlur,
  ...props
}, ref) => {
  const generatedId = useId();
  const id = explicitId || generatedId;
  const currentSize = sizeClasses[size];

  // Merge options and parsed children (if any)
  const effectiveOptions = useMemo(() => {
    if (options && options.length > 0) return options;
    const parsed: SelectOption[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && (child.type === 'option' || (child.props && typeof child.props === 'object' && 'value' in child.props))) {
        const p = child.props as { value?: string | number; children?: React.ReactNode; disabled?: boolean };
        if (p.value !== undefined) {
          parsed.push({
            value: p.value,
            label: String(p.children ?? p.value),
            disabled: !!p.disabled,
          });
        }
      }
    });
    return parsed;
  }, [options, children]);

  // Handle controlled vs uncontrolled state
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | number>(() => {
    if (defaultValue !== undefined) return defaultValue as string | number;
    return '';
  });

  const selectedValue = isControlled ? value : internalValue;

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return effectiveOptions.find(opt => String(opt.value) === String(selectedValue));
  }, [effectiveOptions, selectedValue]);

  // Dropdown open/close, coordinates & keyboard navigation state
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownCoords, setDropdownCoords] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  }>({ top: 0, left: 0, width: 0, maxHeight: 240 });
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxNodeRef = useRef<HTMLDivElement | null>(null);
  const nativeSelectRef = useRef<HTMLSelectElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listboxCleanupRef = useRef<(() => void) | null>(null);

  // Measure and calculate exact floating coordinates relative to viewport
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const maxAllowedH = 240;

    // Flip upwards if space below is tight (< 200px) and space above is greater
    const shouldFlipUp = spaceBelow < 200 && spaceAbove > spaceBelow;
    const availableH = shouldFlipUp ? spaceAbove - 16 : spaceBelow - 16;
    const calculatedMaxHeight = Math.min(Math.max(availableH, 120), maxAllowedH);

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
        const curIdx = effectiveOptions.findIndex(opt => String(opt.value) === String(selectedValue));
        setHighlightedIndex(curIdx >= 0 ? curIdx : 0);
      }
      return next;
    });
  }, [disabled, effectiveOptions, selectedValue, updatePosition]);

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

    // Dedicated mobile touch isolation (tracks touch delta to prevent background modal dragging)
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

  // Direct ref forwarding to native select element without Proxy (avoids DOM illegal invocation)
  const setCombinedRef = (node: HTMLSelectElement | null) => {
    nativeSelectRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLSelectElement | null>).current = node;
    }
    if (node && !isControlled && node.value && node.value !== internalValue) {
      setInternalValue(node.value);
    }
  };

  // Sync internal value if defaultValue changes dynamically
  useEffect(() => {
    if (!isControlled && defaultValue !== undefined) {
      setInternalValue(defaultValue as string | number);
    }
  }, [defaultValue, isControlled]);

  // Click outside to close & scroll/resize reposition handlers
  useEffect(() => {
    if (!isOpen) return;

    // 1. Outside click / pointerdown
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      const clickedTrigger = containerRef.current?.contains(target);
      const clickedListbox = listboxNodeRef.current?.contains(target);

      if (!clickedTrigger && !clickedListbox) {
        setIsOpen(false);
        if (onBlur && nativeSelectRef.current) {
          const blurEvent = new FocusEvent('blur', { bubbles: false });
          nativeSelectRef.current.dispatchEvent(blurEvent);
        }
      }
    };

    // 2. Ancestor scroll or window resize re-anchoring
    const handleScrollOrResize = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      // If trigger has scrolled out of view, close dropdown
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setIsOpen(false);
        return;
      }
      updatePosition();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true); // capture = true catches modal scroll

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, onBlur, updatePosition]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  // Handle option selection
  const handleSelect = (optValue: string | number) => {
    if (disabled) return;

    if (!isControlled) {
      setInternalValue(optValue);
    }
    setIsOpen(false);

    const native = nativeSelectRef.current;
    if (native) {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        'value'
      )?.set;
      if (setter) {
        setter.call(native, String(optValue));
      } else {
        native.value = String(optValue);
      }
      const changeEvent = new Event('change', { bubbles: true });
      native.dispatchEvent(changeEvent);
    }

    triggerRef.current?.focus();
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
      setHighlightedIndex(prev => {
        let next = prev + 1;
        while (next < effectiveOptions.length && effectiveOptions[next].disabled) {
          next++;
        }
        return next < effectiveOptions.length ? next : prev;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => {
        let next = prev - 1;
        while (next >= 0 && effectiveOptions[next].disabled) {
          next--;
        }
        return next >= 0 ? next : prev;
      });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < effectiveOptions.length) {
        const opt = effectiveOptions[highlightedIndex];
        if (!opt.disabled) {
          handleSelect(opt.value);
        }
      }
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  const selectElement = (
    <div ref={containerRef} className={cn("relative w-full", isOpen ? "z-30" : "z-0")}>
      {/* Hidden native select to preserve React Hook Form & standard form bindings */}
      <select
        ref={setCombinedRef}
        id={id ? `${id}-native` : undefined}
        name={name}
        value={isControlled ? (value ?? '') : undefined}
        defaultValue={!isControlled ? (defaultValue ?? internalValue ?? '') : undefined}
        disabled={disabled}
        required={required}
        aria-hidden="true"
        tabIndex={-1}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={() => triggerRef.current?.focus()}
        className="sr-only pointer-events-none absolute"
        {...props}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {effectiveOptions.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Visual Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? `${id}-listbox` : undefined}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-desc` : undefined}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        className={cn(
          // Base trigger styling
          "w-full rounded-control border bg-white font-normal appearance-none transition-colors cursor-pointer select-none text-left flex items-center justify-between",
          "outline-none",
          currentSize.select,
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
        <span
          className={cn(
            "truncate block pr-2",
            !selectedOption && placeholder ? "text-neutral-400 font-normal" : "text-primary font-normal"
          )}
        >
          {selectedOption ? selectedOption.label : (placeholder || '\u00A0')}
        </span>

        <span
          className={cn(
            "absolute text-secondary pointer-events-none flex items-center justify-center shrink-0 transition-transform duration-200",
            currentSize.icon,
            isOpen && "rotate-180"
          )}
        >
          {trailingIcon || <ChevronDown className="w-full h-full stroke-[2]" />}
        </span>
      </button>

      {/* Redesigned Inner Dropdown Options Popover rendered via React Portal overlay */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={listboxRefCallback}
          id={`${id}-listbox`}
          role="listbox"
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
            "bg-white border border-neutral-200/90 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08),0_8px_10px_-6px_rgba(0,0,0,0.04)] p-2 space-y-1 overflow-y-auto overscroll-contain touch-pan-y animate-in fade-in-50 duration-100",
            "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-200 [&::-webkit-scrollbar-thumb]:rounded-full"
          )}
        >
          {effectiveOptions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-neutral-400 text-center font-medium">
              No options available
            </div>
          ) : (
            effectiveOptions.map((opt, index) => {
              const isSelected = String(opt.value) === String(selectedValue);
              const isHighlighted = index === highlightedIndex;

              return (
                <button
                  key={String(opt.value)}
                  ref={(el) => { optionRefs.current[index] = el; }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => !opt.disabled && setHighlightedIndex(index)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 flex items-center justify-between select-none min-h-[42px]",
                    // Selected state: soft sage pill with deep forest green text (matching reference image)
                    isSelected && "bg-[#EFF2F0] text-[#0F4C36]",
                    // Default unselected state: transparent with deep forest green text, soft hover tint
                    !isSelected && !opt.disabled && "bg-transparent text-[#0F4C36] hover:bg-[#F4F6F5]",
                    // Keyboard navigation highlight when not selected
                    !isSelected && isHighlighted && !opt.disabled && "bg-[#F4F6F5]",
                    // Disabled option state
                    opt.disabled && "text-neutral-400 bg-transparent cursor-not-allowed opacity-50"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })
          )}
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
        {selectElement}
      </FormField>
    );
  }

  return selectElement;
});

Select.displayName = "Select";
