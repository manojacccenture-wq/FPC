import React from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from './Button';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

const SIZE_MAP: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  '2xl': 'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)] min-h-[calc(100vh-2rem)]',
};

/**
 * Centralized, fully reusable Modal component for the FPC application.
 * Independent of specific feature logic and styled using design tokens.
 * Guaranteed rock-solid responsive behavior with non-clipping header & footer.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'xl',
  showCloseButton = false,
  closeOnBackdropClick = true,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/40 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        className={twMerge(clsx(
          "bg-white rounded-[24px] sm:rounded-[28px] border border-default shadow-2xl w-full flex flex-col text-left transition-all my-auto",
          "max-h-[calc(100vh-2rem)] sm:max-h-[min(90vh,720px)]",
          SIZE_MAP[size],
          className
        ))}
      >
        {/* Modal Header (Fixed, non-shrinking) */}
        {(title || description || showCloseButton) && (
          <div className={twMerge(clsx("modal-header-padding shrink-0 flex items-start justify-between", headerClassName))}>
            <div>
              {title && (
                <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight leading-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs sm:text-[13px] text-secondary mt-1 font-normal">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                iconOnly
                onClick={onClose}
                className="p-1.5 rounded-full text-secondary hover:text-primary hover:bg-neutral-50 transition-colors w-8 h-8"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}

        {/* Modal Content Body (Independently scrollable) */}
        <div className={twMerge(clsx("modal-body-padding flex-1 overflow-y-auto overscroll-contain scrollbar-thin", bodyClassName))}>
          {children}
        </div>

        {/* Modal Footer Actions (Fixed, non-shrinking, always visible) */}
        {footer && (
          <div className={twMerge(clsx("modal-footer-padding shrink-0 flex items-center justify-end gap-3.5 border-t border-transparent", footerClassName))}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

