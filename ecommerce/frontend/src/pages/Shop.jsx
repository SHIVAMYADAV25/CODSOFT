import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import styles from './Shop.module.css';

const SORT_OPTIONS = [
  { label: 'Newest', value: '-createdAt' },
  { label: 'Price: Low–High', value: 'price' },
  { label: 'Price: High–Low', value: '-price' },
  { label: 'Best Rated', value: '-rating.average' },
];

const CATEGORIES = ['lighting', 'kitchen', 'textiles', 'home-decor', 'stationery', 'furniture'];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = Number(searchParams.get('page')) || 1;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (sort) params.set('sort', sort);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      params.set('page', page);
      params.set('limit', 12);

      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, minPrice, maxPrice, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = search || category || minPrice || maxPrice;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              {category ? category.replace('-', ' ') : search ? `"${search}"` : 'All products'}
            </h1>
            {pagination.total !== undefined && (
              <p className={styles.count}>{pagination.total} items</p>
            )}
          </div>
          <div className={styles.headerActions}>
            <button
              className={`${styles.filterToggle} ${filtersOpen ? styles.active : ''}`}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <SlidersHorizontal size={15} />
              Filters {hasFilters && <span className={styles.filterDot} />}
            </button>
            <div className={styles.sortWrap}>
              <select
                value={sort}
                onChange={(e) => setParam('sort', e.target.value)}
                className={styles.sortSelect}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className={styles.selectChevron} />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        {filtersOpen && (
          <div className={styles.filterBar}>
            <div className={styles.filterSection}>
              <h4 className={styles.filterLabel}>Category</h4>
              <div className={styles.filterChips}>
                <button
                  onClick={() => setParam('category', '')}
                  className={`${styles.chip} ${!category ? styles.chipActive : ''}`}
                >All</button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setParam('category', c)}
                    className={`${styles.chip} ${category === c ? styles.chipActive : ''}`}
                  >{c.replace('-', ' ')}</button>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <h4 className={styles.filterLabel}>Price range</h4>
              <div className={styles.priceInputs}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setParam('minPrice', e.target.value)}
                  className={styles.priceInput}
                />
                <span className={styles.priceDash}>–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setParam('maxPrice', e.target.value)}
                  className={styles.priceInput}
                />
              </div>
            </div>

            {hasFilters && (
              <button onClick={clearFilters} className={styles.clearBtn}>
                <X size={14} /> Clear all
              </button>
            )}
          </div>
        )}

        {/* Active filter tags */}
        {hasFilters && (
          <div className={styles.activeTags}>
            {search && <span className={styles.tag}>Search: "{search}" <button onClick={() => setParam('search', '')}>×</button></span>}
            {category && <span className={styles.tag}>{category} <button onClick={() => setParam('category', '')}>×</button></span>}
            {(minPrice || maxPrice) && (
              <span className={styles.tag}>
                ${minPrice || '0'} – ${maxPrice || '∞'}
                <button onClick={() => { setParam('minPrice', ''); setParam('maxPrice', ''); }}>×</button>
              </span>
            )}
          </div>
        )}

        {/* Products */}
        {loading ? (
          <div className={styles.grid}>
            {[...Array(12)].map((_, i) => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No products found</p>
            <p className={styles.emptySub}>Try adjusting your filters</p>
            <button onClick={clearFilters} className={styles.clearBtn}>Clear filters</button>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className={styles.pagination}>
            <button
              disabled={page <= 1}
              onClick={() => setParam('page', page - 1)}
              className={styles.pageBtn}
            >← Prev</button>
            <span className={styles.pageInfo}>{page} / {pagination.pages}</span>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setParam('page', page + 1)}
              className={styles.pageBtn}
            >Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
