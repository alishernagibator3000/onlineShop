// src/pages/Favorites.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getFavoriteIds, toggleFavorite } from '../services/api.js';
import { useToast } from '../hooks/useToast.js';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Favorites() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [favIds, setFavIds]     = useState(() => getFavoriteIds());
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getProducts().then(setProducts).finally(() => setLoading(false));
  }, []);

  function handleRemove(id) {
    setFavIds(toggleFavorite(id));
    addToast('Убрано из избранного', 'info');
  }

  const favorites = products.filter((p) => favIds.includes(p.id));

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Избранное</h1>
        <span className="muted-text">{favorites.length} сохранено</span>
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          message="Пока ничего не сохранено."
          action={<Link to="/products" className="btn btn-primary">Перейти в каталог</Link>}
        />
      ) : (
        <div className="product-grid">
          {favorites.map((product) => (
            <div key={product.id} className="product-card">
              <button
                className="fav-btn active"
                onClick={() => handleRemove(product.id)}
                title="Убрать из избранного"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z" />
                </svg>
              </button>
              <Link to={`/products/${product.id}`} style={{ display: 'contents' }}>
                <img src={product.imageUrl} alt={product.title} loading="lazy" />
                <div className="product-card-body">
                  <span className="product-card-category">{product.category}</span>
                  <p className="product-card-title">{product.title}</p>
                  <p className="product-card-price">${Number(product.price).toFixed(2)}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}