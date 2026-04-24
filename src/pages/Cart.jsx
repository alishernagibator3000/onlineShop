import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartQty, removeFromCart, placeOrder, clearCart } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';

export default function Cart() {
  const navigate = useNavigate();
  const { isAuth, user } = useAuth();
  const { addToast } = useToast();
  
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // checkout form state
  const [step, setStep] = useState('cart'); // cart, checkout, success
  const [address, setAddress] = useState('');

  useEffect(() => {
    setCart(getCart());
  }, []);

  const handleQty = (id, delta) => {
    const item = cart.find(c => c.id === id);
    if (!item) return;
    const newCart = updateCartQty(id, (item.qty || 1) + delta);
    setCart(newCart);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleRemove = (id) => {
    const newCart = removeFromCart(id);
    setCart(newCart);
    addToast('Удалено из корзины', 'info');
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleClearCart = () => {
    if (window.confirm("Удалить все товары из корзины?")) {
      clearCart();
      setCart([]);
      window.dispatchEvent(new Event('cart-updated'));
      addToast('Корзина очищена', 'info');
    }
  };

  const total = cart.reduce((s, c) => s + c.price * (c.qty || 1), 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      addToast('Введите адрес доставки', 'error');
      return;
    }
    setLoading(true);
    try {
      const order = await placeOrder({
        user,
        cart,
        delivery: { address }
      });
      setPlacedOrder(order);
      setCart([]);
      window.dispatchEvent(new Event('cart-updated'));
      setStep('success');
    } catch (err) {
      addToast('Ошибка при оформлении', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success' && placedOrder) {
    return (
      <div className="container">
        <div className="empty-state" style={{ borderColor: '#b9e4c9', background: '#f2faf5', color: '#1a6638' }}>
          <h2 style={{ marginBottom: '1rem', color: '#1a6638' }}>Заказ оформлен!</h2>
          <p>Номер заказа: #{placedOrder.id}</p>
          <p>Сумма: ${placedOrder.total}</p>
          <div style={{ marginTop: '2rem' }}>
            <Link to="/products" className="btn btn-primary">Продолжить покупки</Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'checkout') {
    return (
      <div className="container">
        <button onClick={() => setStep('cart')} className="back-link">← Назад в корзину</button>
        <div className="form-wrap" style={{ maxWidth: '600px' }}>
          <h1>Оформление заказа</h1>
          <form onSubmit={handleCheckout}>
            <div className="form-group">
              <label>Адрес доставки</label>
              <textarea 
                value={address} 
                onChange={e => setAddress(e.target.value)}
                placeholder="Город, улица, дом..."
                required
              />
            </div>
            
            <div style={{ margin: '2rem 0', padding: '1.5rem', background: '#f9f9f8', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Ваш заказ</h3>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  <span>{item.title} × {item.qty || 1}</span>
                  <span>${(item.price * (item.qty || 1)).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e0e0de', fontWeight: '600' }}>
                <span>Итого</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Оформляем...' : 'Подтвердить заказ'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="cart-header">
        <h1 className="cart-title">Корзина покупок</h1>
        <p className="cart-sub">
          {cart.length
            ? `${cart.length} товаров в корзине`
            : "Корзина пуста"}
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="empty-state">
          <p>В вашей корзине пока ничего нет</p>
          <Link to="/products" className="btn btn-secondary">Перейти в каталог</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <Link to={`/products/${item.id}`} style={{ display: 'flex' }}>
                  <img 
                    src={item.imageUrl || 'https://via.placeholder.com/150?text=No+Image'} 
                    alt={item.title} 
                    className="cart-item-img" 
                  />
                </Link>

                <div className="cart-item-info">
                  <span className="cart-item-cat">{item.category}</span>
                  <Link to={`/products/${item.id}`} className="cart-item-title">{item.title}</Link>
                  <span className="cart-item-price">${(item.price * (item.qty || 1)).toFixed(2)}</span>
                </div>

                <div className="cart-item-qty">
                  <button className="cart-qty-btn" onClick={() => handleQty(item.id, -1)} disabled={item.qty <= 1}>−</button>
                  <span className="cart-qty-val">{item.qty || 1}</span>
                  <button className="cart-qty-btn" onClick={() => handleQty(item.id, 1)}>+</button>
                </div>

                <button className="cart-item-remove" onClick={() => handleRemove(item.id)} title="Удалить">✕</button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-summary-row">
              <span>Товаров:</span>
              <span>{cart.reduce((s, c) => s + (c.qty || 1), 0)} шт.</span>
            </div>
            <div className="cart-summary-row cart-summary-total">
              <span>Итого:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button 
              className="btn btn-primary checkout-btn"
              onClick={() => isAuth ? setStep('checkout') : navigate('/login')}
            >
              Оформить заказ
            </button>
            <button 
              className="btn btn-ghost checkout-btn"
              style={{ marginTop: '0.5rem', color: '#999' }}
              onClick={handleClearCart}
            >
              Очистить корзину
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
