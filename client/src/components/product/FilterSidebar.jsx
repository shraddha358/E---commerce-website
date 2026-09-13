import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import './FilterSidebar.css';

const CATEGORIES = [
  { label: 'Electronics', value: 'electronics' },
  { label: 'Clothing', value: 'clothing' },
  { label: 'Books', value: 'books' },
  { label: 'Home & Kitchen', value: 'home-kitchen' },
  { label: 'Sports', value: 'sports' },
  { label: 'Beauty', value: 'beauty' },
];

const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹2,000', min: 500, max: 2000 },
  { label: '₹2,000 – ₹10,000', min: 2000, max: 10000 },
  { label: '₹10,000 – ₹50,000', min: 10000, max: 50000 },
  { label: 'Over ₹50,000', min: 50000, max: '' },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
];

const FilterSidebar = ({ mobileOpen, onClose }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  const applyFilters = (updated) => {
    const f = { ...filters, ...updated };
    setFilters(f);
    const params = new URLSearchParams();
    if (f.category) params.set('category', f.category);
    if (f.minPrice) params.set('minPrice', f.minPrice);
    if (f.maxPrice) params.set('maxPrice', f.maxPrice);
    if (f.sort) params.set('sort', f.sort);
    if (searchParams.get('search')) params.set('search', searchParams.get('search'));
    params.set('page', '1');
    navigate(`/products?${params.toString()}`);
    if (onClose) onClose();
  };

  const clearAll = () => {
    setFilters({ category: '', minPrice: '', maxPrice: '', sort: 'newest' });
    navigate('/products');
    if (onClose) onClose();
  };

  const hasFilters = filters.category || filters.minPrice || filters.maxPrice;

  return (
    <aside className={`filter-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="filter-header">
        <h3><FiFilter size={16} /> Filters</h3>
        <div className="filter-header-actions">
          {hasFilters && <button className="clear-btn" onClick={clearAll}>Clear All</button>}
          <button className="close-filter-btn hide-desktop" onClick={onClose}><FiX size={18} /></button>
        </div>
      </div>

      {/* Sort */}
      <div className="filter-section">
        <h4>Sort By</h4>
        <div className="filter-options">
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.value} className="filter-radio">
              <input type="radio" name="sort" value={opt.value} checked={filters.sort === opt.value} onChange={() => applyFilters({ sort: opt.value })} />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="filter-section">
        <h4>Category</h4>
        <div className="filter-options">
          {CATEGORIES.map((cat) => (
            <label key={cat.value} className="filter-radio">
              <input type="radio" name="category" value={cat.value} checked={filters.category === cat.value} onChange={() => applyFilters({ category: filters.category === cat.value ? '' : cat.value })} />
              <span>{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <h4>Price Range</h4>
        <div className="filter-options">
          {PRICE_RANGES.map((r) => (
            <label key={r.label} className="filter-radio">
              <input
                type="radio" name="price"
                checked={filters.minPrice == r.min && filters.maxPrice == r.max}
                onChange={() => applyFilters({ minPrice: r.min, maxPrice: r.max })}
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
        <div className="custom-price">
          <input type="number" placeholder="Min ₹" value={filters.minPrice} onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))} className="form-input" min="0" />
          <span>–</span>
          <input type="number" placeholder="Max ₹" value={filters.maxPrice} onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))} className="form-input" min="0" />
          <button className="btn btn-primary btn-sm" onClick={() => applyFilters({})}>Go</button>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
