import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'muted';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    const baseStyles = 'bg-white rounded-card transition-shadow';
    
    const variantStyles = {
      default: 'border border-default shadow-xs',
      flat: 'border border-default shadow-none',
      muted: 'bg-neutral-50 border border-default shadow-none',
    }[variant];

    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    }[padding];

    return (
      <div
        ref={ref}
        className={twMerge(clsx(baseStyles, variantStyles, paddingStyles, className))}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(clsx('flex items-start justify-between gap-4 mb-4', className))}
        {...props}
      >
        <div className="space-y-1 flex-1">{children}</div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    );
  }
);
CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={twMerge(clsx('text-base font-semibold text-primary tracking-tight', className))}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={twMerge(clsx('text-xs text-secondary font-normal mt-0.5', className))}
        {...props}
      >
        {children}
      </p>
    );
  }
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={twMerge(clsx('', className))} {...props}>
        {children}
      </div>
    );
  }
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(clsx('mt-6 pt-4 border-t border-default flex items-center justify-between gap-3', className))}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardFooter.displayName = 'CardFooter';

