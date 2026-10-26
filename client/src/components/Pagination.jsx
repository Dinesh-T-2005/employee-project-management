
import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}) {
  const start = total
    ? (page - 1) * limit + 1
    : 0;

  const end = Math.min(page * limit, total);

  return (
    <div className="pagination">
      <span>
        Showing <strong>{start}–{end}</strong> of{' '}
        <strong>{total}</strong>
      </span>

      <div className="pagination-actions">
        <button
          className="page-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={17} />
        </button>

        <span className="page-indicator">
          {page} / {totalPages}
        </span>

        <button
          className="page-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}

