import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiFilter, FiGrid, FiList, FiX } from 'react-icons/fi';
import { productAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import FilterSidebar from '../components/product/FilterSidebar';
import { Pagination, Loader, EmptyState } from '../components/ui/UI';
import './Products.css';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const page = parseInt(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams.entries());
      const { data } = await productAPI.getAll(params);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => { fetchProducts(); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [fetchProducts]);

  const handlePageChange = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', p);
    setSearchParams(params);
  };

  const getPageTitle = () => {
    if (search) return `Search: "${search}"`;
    if (category) return category.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
    return 'All Products';
  };

  return (
    <div className="products-page">
      {/* Filter overlay for mobile */}
      {filterOpen && <div className="filter-overlay" onClick={() => setFilterOpen(false)} />}

      <div className="container products-layout">
        <FilterSidebar mobileOpen={filterOpen} onClose={() => setFilterOpen(false)} />

        <div className="products-main">
          <div className="products-header">
            <div>
              <h1 className="products-title">{getPageTitle()}</h1>
              <p className="products-count">{total} product{total !== 1 ? 's' : ''} found</p>
            </div>
            <button className="btn btn-outline btn-sm filter-toggle-btn" onClick={() => setFilterOpen(true)}>
              <FiFilter size={15} /> Filters
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : products.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No products found"
              description="Try adjusting your filters or search query"
              action={<button className="btn btn-primary" onClick={() => setSearchParams({})}>Clear Filters</button>}
            />
          ) : (
            <>
              <div className="grid-products fade-in">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              <Pagination page={page} pages={pages} onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
