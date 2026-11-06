import { useState, useMemo } from 'react';

export interface UsePaginationProps {
  totalItems: number;
  initialPage?: number;
  pageSize?: number;
}

export const usePagination = ({
  totalItems,
  initialPage = 1,
  pageSize = 10,
}: UsePaginationProps) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }, [totalItems, pageSize]);

  const goToPage = (page: number) => {
    const validPage = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(validPage);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
};

