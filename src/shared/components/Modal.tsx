import React from 'react';
import { X } from 'lucide-react';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/40 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        className={`bg-white rounded-[24px] sm:rounded-[28px] border border-[#E1E8E6] shadow-2xl w-full ${SIZE_MAP[size]} overflow-hidden my-auto flex flex-col text-left transition-all ${className}`}
      >
        {/* Modal Header */}
        {(title || description || showCloseButton) && (
          <div className={`px-6 sm:px-10 pt-6 sm:pt-8 pb-3 sm:pb-4 flex items-start justify-between ${headerClassName}`}>
            <div>
              {title && (
                <h2 className="text-xl sm:text-2xl font-bold text-[#0E1B16] tracking-tight leading-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs sm:text-[13px] text-[#5B6B65] mt-1 font-normal">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-[#5B6B65] hover:text-[#0E1B16] hover:bg-[#F5F8F7] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Modal Content Body */}
        <div className={`px-6 sm:px-10 py-4 flex-1 overflow-y-auto ${bodyClassName}`}>
          {children}
        </div>

        {/* Modal Footer Actions */}
        {footer && (
          <div className={`px-6 sm:px-10 pb-6 sm:pb-8 pt-4 flex items-center justify-end gap-3.5 ${footerClassName}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

