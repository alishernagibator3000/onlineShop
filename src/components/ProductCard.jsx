// src/components/ProductCard.jsx
import { Link } from 'react-router-dom';
import FavButton from './FavButton.jsx';
import { useAuth } from '../hooks/useAuth.js';

export default function ProductCard({ product }) {
  const { isAuth } = useAuth();

  return (
    <div className="product-card">
      {isAuth && <FavButton id={product.id} />}
      <Link to={`/products/${product.id}`} style={{ display: 'contents' }}>
        <img
          src={product.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image'}
          alt={product.title}
          loading="lazy"
        />
        <div className="product-card-body">
          <span className="product-card-category">{product.category}</span>
          <p className="product-card-title">{product.title}</p>
          <p className="product-card-price">${Number(product.price).toFixed(2)}</p>
        </div>
      </Link>
    </div>
  );
}