// src/pages/Products/List.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import ProductGrid from '../../components/ProductGrid.jsx';
import FilterBar from '../../components/FilterBar.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function List() {
  const { isAuth } = useAuth();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort]         = useState('default');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products]
  );

  const filtered = useMemo(() => {
    let result = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q));
    }
    if (category !== 'all') result = result.filter((p) => p.category === category);
    if (minPrice !== '') result = result.filter((p) => p.price >= Number(minPrice));
    if (maxPrice !== '') result = result.filter((p) => p.price <= Number(maxPrice));
    switch (sort) {
      case 'price-asc':  result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'name-asc':   result.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'name-desc':  result.sort((a, b) => b.title.localeCompare(a.title)); break;
      default: break;
    }
    return result;
  }, [products, search, category, sort, minPrice, maxPrice]);

  function clearFilters() {
    setSearch(''); setCategory('all'); setSort('default');
    setMinPrice(''); setMaxPrice('');
  }

  const hasFilters = search || category !== 'all' || sort !== 'default' || minPrice || maxPrice;

  if (loading) return <Spinner />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Каталог</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className="muted-text">{filtered.length} из {products.length}</span>
          {isAuth && <Link to="/products/create" className="btn btn-primary">+ Добавить</Link>}
        </div>
      </div>

      <FilterBar
        search={search} setSearch={setSearch}
        category={category} setCategory={setCategory}
        sort={sort} setSort={setSort}
        minPrice={minPrice} setMinPrice={setMinPrice}
        maxPrice={maxPrice} setMaxPrice={setMaxPrice}
        categories={categories}
        onClear={clearFilters}
        hasFilters={hasFilters}
      />

      {filtered.length === 0 ? (
        <EmptyState
          message="Ничего не найдено по вашим фильтрам."
          action={<button className="btn btn-primary" onClick={clearFilters}>Сбросить фильтры</button>}
        />
      ) : (
        <ProductGrid products={filtered} />
      )}
    </div>
  );
}