// src/components/ProductCard.jsx
import { Link } from 'react-router-dom';
import FavButton from './FavButton.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { addToCart, getCart } from '../services/api.js';
import { useToast } from '../hooks/useToast.js';
import { useState, useEffect } from 'react';

export default function ProductCard({ product }) {
  const { isAuth } = useAuth();
  const { addToast } = useToast();
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    const checkCart = () => {
      setInCart(getCart().some(c => Number(c.id) === Number(product.id)));
    };
    checkCart();
    window.addEventListener('cart-updated', checkCart);
    return () => window.removeEventListener('cart-updated', checkCart);
  }, [product.id]);

  const handleAddCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    addToast('Добавлено в корзину', 'success');
    window.dispatchEvent(new Event('cart-updated'));
  };

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
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem' }}>
            <p className="product-card-price" style={{ marginTop: 0, paddingTop: 0 }}>${Number(product.price).toFixed(2)}</p>
            {inCart ? (
              <Link to="/cart" className="btn btn-secondary btn-sm" onClick={e => e.stopPropagation()}>В корзине</Link>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={handleAddCart}>В корзину</button>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}