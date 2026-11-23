import { useState, useCallback, useMemo } from 'react';
import type { PaginationParams } from '../types/pagination.types';

export interface UsePaginationStateOptions {
  initialPage?: number;
  initialPageSize?: number;
  initialSortBy?: string;
  initialSortDescending?: boolean;
}

/**
 * Reusable zero-useEffect pagination state hook.
 * Synchronously resets page to 1 on page size, search, filter, or sort transitions.
 */
export function usePaginationState(options: UsePaginationStateOptions = {}) {
  const [pageNumber, setPageNumber] = useState(options.initialPage || 1);
  const [pageSize, setPageSize] = useState(options.initialPageSize || 10);
  const [sortBy, setSortBy] = useState<string | undefined>(options.initialSortBy);
  const [sortDescending, setSortDescending] = useState(options.initialSortDescending || false);

  const setPage = useCallback((page: number) => {
    setPageNumber(Math.max(1, page));
  }, []);

  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setPageNumber(1);
  }, []);

  const resetPagination = useCallback(() => {
    setPageNumber(1);
  }, []);

  const toggleSort = useCallback((field: string) => {
    setSortBy((prevField) => {
      if (prevField === field) {
        setSortDescending((prev) => !prev);
      } else {
        setSortDescending(false);
      }
      return field;
    });
    setPageNumber(1);
  }, []);

  const paginationParams = useMemo<PaginationParams>(() => ({
    pageNumber,
    pageSize,
    sortBy,
    sortDescending,
  }), [pageNumber, pageSize, sortBy, sortDescending]);

  return {
    pageNumber,
    pageSize,
    sortBy,
    sortDescending,
    setPage,
    changePageSize,
    resetPagination,
    toggleSort,
    paginationParams,
  };
}

