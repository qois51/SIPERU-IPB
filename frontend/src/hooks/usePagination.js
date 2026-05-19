/**
 * usePagination.js — Custom hook for client-side pagination control
 * Works with the paginated API responses from backend
 */
import { useState, useCallback } from 'react';

const usePagination = (initialPage = 1, initialPerPage = 10) => {
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  /**
   * Update pagination state from API response
   */
  const updateFromResponse = useCallback((paginationData) => {
    if (paginationData) {
      setTotalPages(paginationData.total_pages || 1);
      setTotal(paginationData.total || 0);
    }
  }, []);

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  const goToPage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  // Generate page numbers for pagination display
  const pageNumbers = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }
    return pages;
  };

  return {
    page,
    perPage,
    totalPages,
    total,
    hasNext,
    hasPrev,
    pageNumbers,
    nextPage,
    prevPage,
    goToPage,
    resetPage,
    setPerPage,
    updateFromResponse,
  };
};

export default usePagination;
