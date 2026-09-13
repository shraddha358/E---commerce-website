import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;
  const getPages = () => {
    const arr = [];
    const range = 2;
    for (let i = Math.max(1, page - range); i <= Math.min(pages, page + range); i++) arr.push(i);
    return arr;
  };
  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
        <FiChevronLeft size={16} />
      </button>
      {getPages()[0] > 1 && (
        <>
          <button className="page-btn" onClick={() => onPageChange(1)}>1</button>
          {getPages()[0] > 2 && <span style={{ color: 'var(--gray-400)' }}>…</span>}
        </>
      )}
      {getPages().map((p) => (
        <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
      ))}
      {getPages().slice(-1)[0] < pages && (
        <>
          {getPages().slice(-1)[0] < pages - 1 && <span style={{ color: 'var(--gray-400)' }}>…</span>}
          <button className="page-btn" onClick={() => onPageChange(pages)}>{pages}</button>
        </>
      )}
      <button className="page-btn" onClick={() => onPageChange(page + 1)} disabled={page === pages}>
        <FiChevronRight size={16} />
      </button>
    </div>
  );
};

export const Loader = ({ text = 'Loading...' }) => (
  <div className="loader-wrapper">
    <div style={{ textAlign: 'center' }}>
      <div className="spinner" />
      {text && <p style={{ marginTop: 12, color: 'var(--gray-500)', fontSize: '0.875rem' }}>{text}</p>}
    </div>
  </div>
);

export const PageLoader = () => (
  <div className="flex-center" style={{ minHeight: '60vh' }}>
    <div className="spinner" />
  </div>
);

export const EmptyState = ({ icon = '📦', title, description, action }) => (
  <div className="empty-state fade-in">
    <div className="empty-state-icon">{icon}</div>
    <h3>{title}</h3>
    {description && <p>{description}</p>}
    {action}
  </div>
);
