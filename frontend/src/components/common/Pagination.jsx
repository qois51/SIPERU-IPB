import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  page,
  totalPages,
  hasNext,
  hasPrev,
  pageNumbers = [],
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages = typeof pageNumbers === 'function' ? pageNumbers() : pageNumbers;

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      {/* Previous */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrev}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Previous
      </button>

      {/* Page Numbers */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`
            w-9 h-9 flex items-center justify-center text-sm font-semibold rounded-lg transition-colors
            ${p === page
              ? 'bg-[#1e3a8a] text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }
          `}
        >
          {p}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
