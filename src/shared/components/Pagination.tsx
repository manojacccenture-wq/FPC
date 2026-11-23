import React, { useMemo } from 'react';
import { Button } from './Button';
import { Select } from './Select';
import { cn } from '../utils/cn';

export interface PaginationProps {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  className?: string;
  showPageSizeSelector?: boolean;
  showTotalRecords?: boolean;
}

/**
 * Shared FPC Pagination Component.
 * Visually matches existing FPC application styling across all tables and grids.
 */
export const Pagination: React.FC<PaginationProps> = ({
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  isLoading = false,
  className,
  showPageSizeSelector = true,
  showTotalRecords = true,
}) => {
  const safeTotalPages = Math.max(1, totalPages);
  const hasPreviousPage = pageNumber > 1;
  const hasNextPage = pageNumber < safeTotalPages;

  const firstItemIndex = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const lastItemIndex = totalCount === 0 ? 0 : Math.min(pageNumber * pageSize, totalCount);

  // Generate page numbers with smart windowing
  const getPageNumbers = (): (number | 'ellipsis-left' | 'ellipsis-right')[] => {
    if (safeTotalPages <= 5) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis-left' | 'ellipsis-right')[] = [];
    const showLeftEllipsis = pageNumber > 3;
    const showRightEllipsis = pageNumber < safeTotalPages - 2;

    pages.push(1);

    if (showLeftEllipsis) {
      pages.push('ellipsis-left');
    }

    const start = Math.max(2, pageNumber - 1);
    const end = Math.min(safeTotalPages - 1, pageNumber + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (showRightEllipsis) {
      pages.push('ellipsis-right');
    }

    pages.push(safeTotalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const selectOptions = useMemo(() => {
    return pageSizeOptions.map((opt) => ({
      value: opt,
      label: String(opt),
    }));
  }, [pageSizeOptions]);

  return (
    <nav
      aria-label="Pagination Navigation"
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-secondary pt-2 px-1 text-xs sm:text-sm',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        {showTotalRecords && (
          <span className="select-none">
            {totalCount === 0
              ? 'Showing 0 of 0 records'
              : `Showing ${firstItemIndex}–${lastItemIndex} of ${totalCount} records`}
          </span>
        )}

        {showPageSizeSelector && onPageSizeChange && totalCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-secondary">
            <span className="select-none font-normal">Per page:</span>
            <div className="w-[74px]">
              <Select
                size="xs"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                disabled={isLoading}
                options={selectOptions}
                aria-label="Records per page"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 select-none self-end sm:self-auto">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={!hasPreviousPage || isLoading}
          className="font-medium h-auto p-1 text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Go to previous page"
        >
          &larr; Previous
        </Button>

        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis-left' || page === 'ellipsis-right') {
            return (
              <span
                key={`${page}-${index}`}
                className="w-7 h-7 flex items-center justify-center text-xs text-secondary select-none"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const isActive = page === pageNumber;

          if (isActive) {
            return (
              <Button
                key={page}
                type="button"
                variant="secondary"
                size="xs"
                iconOnly
                aria-current="page"
                className="w-7 h-7 rounded-lg bg-brand-soft text-brand font-bold text-xs cursor-default border-0 shadow-2xs"
              >
                {page}
              </Button>
            );
          }

          return (
            <Button
              key={page}
              type="button"
              variant="ghost"
              size="xs"
              iconOnly
              onClick={() => onPageChange(page)}
              disabled={isLoading}
              className="w-7 h-7 rounded-lg text-secondary hover:text-primary hover:bg-neutral-100 font-semibold text-xs border-0"
              aria-label={`Page ${page}`}
            >
              {page}
            </Button>
          );
        })}

        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={!hasNextPage || isLoading}
          className="font-medium h-auto p-1 text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Go to next page"
        >
          Next &rarr;
        </Button>
      </div>
    </nav>
  );
};

