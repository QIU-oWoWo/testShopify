import React from 'react';

interface Props {
  current: number;
  total: number;
  pageSize?: number;
  onChange: (page: number) => void;
}

export default function Pagination({ current, total, pageSize = 20, onChange }: Props) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        disabled={current <= 1}
        onClick={() => onChange(current - 1)}
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} style={{ padding: '0 4px', color: '#8c8c8c' }}>
            ...
          </span>
        ) : (
          <button
            key={p}
            className={`pagination-btn ${current === p ? 'active' : ''}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button
        className="pagination-btn"
        disabled={current >= totalPages}
        onClick={() => onChange(current + 1)}
      >
        ›
      </button>
    </div>
  );
}
