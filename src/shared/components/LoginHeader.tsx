import React from 'react';
import { cn } from '../utils/cn';
import { Button } from './Button';

export interface LoginHeaderProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  languageText?: string;
  onLanguageClick?: () => void;
}

/**
 * Reusable top header for authentication and landing screens.
 * Displays Tata Steel Foundation / FPC Management branding and language action.
 */
export const LoginHeader: React.FC<LoginHeaderProps> = ({
  className,
  languageText = 'English',
  onLanguageClick,
  ...props
}) => {
  return (
    <header
      className={cn(
        "w-full bg-white page-header-spacing h-16 flex items-center justify-between shrink-0",
        className
      )}
      {...props}
    >
      {/* Left Brand Identity */}
      <div className="floating-label font-bold text-brand">
        <span className="hidden sm:inline">
          TATA STEEL FOUNDATION <span className="text-neutral-400 font-normal mx-0.5">/</span> FPC MANAGEMENT
        </span>
        <span className="inline sm:hidden">
          TSF <span className="text-neutral-400 font-normal">/</span> FPC
        </span>
      </div>

      {/* Right: English Pill Button Reusing Shared Button */}
      <div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onLanguageClick}
          className="h-8 min-w-[100px] sm:min-w-[125px] px-5 bg-brand-soft hover:bg-forest-100 text-brand rounded-control transition-colors shadow-2xs border-transparent"
        >
          {languageText}
        </Button>
      </div>
    </header>
  );
};

export const TsfLoginHeader = LoginHeader;

