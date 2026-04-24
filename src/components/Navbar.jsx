// src/components/Navbar.jsx
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { getCart, getUnreadNotificationCount } from '../services/api.js';

export default function Navbar() {
  const { user, isAuth, isAdmin, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const refreshCart = () => {
    setCartCount(getCart().reduce((s, c) => s + (c.qty || 1), 0));
  };
  const refreshNotif = () => {
    if (isAdmin) setNotifCount(getUnreadNotificationCount());
  };

  useEffect(() => {
    refreshCart();
    refreshNotif();
    window.addEventListener('cart-updated', refreshCart);
    window.addEventListener('notif-updated', refreshNotif);
    return () => {
      window.removeEventListener('cart-updated', refreshCart);
      window.removeEventListener('notif-updated', refreshNotif);
    };
  }, [isAdmin]);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  function handleLogout() {
    logout();
    addToast('Вы вышли из аккаунта', 'info');
    navigate('/', { replace: true });
    setMenuOpen(false);
  }

  return (
    <nav ref={menuRef}>
      <div className="nav-inner">
        <NavLink to="/" className="nav-logo">StyleShop</NavLink>

        {/* Hamburger button — visible only on mobile */}
        <button
          className={`nav-hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Открыть меню"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Overlay for mobile menu */}
        {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)} />}

        <ul className={`nav-links${menuOpen ? ' nav-links--open' : ''}`}>
          <li><NavLink to="/products">Каталог</NavLink></li>
          <li>
            <NavLink to="/cart" style={{ display: 'flex', alignItems: 'center' }}>
              Корзина
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </NavLink>
          </li>

          {isAuth ? (
            <>
              <li><NavLink to="/my-items">Мои товары</NavLink></li>
              <li><NavLink to="/favorites">Избранное</NavLink></li>
              {isAdmin && (
                <>
                  <li>
                    <NavLink to="/admin#Уведомления" className="nav-admin-link" title="Уведомления">
                      🔔 {notifCount > 0 && <span className="notif-badge">{notifCount}</span>}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin" className="nav-admin-link">
                      ⚙ Админка
                    </NavLink>
                  </li>
                </>
              )}
              <li className="nav-profile-item">
                <NavLink to="/profile" className="nav-profile-btn">
                  <span className="nav-avatar">
                    {user?.name?.[0]?.toUpperCase() || '?'}
                  </span>
                  <span>{user?.name?.split(' ')[0] || 'Профиль'}</span>
                </NavLink>
              </li>
              <li>
                <button onClick={handleLogout} className="nav-logout-btn">
                  Выйти
                </button>
              </li>
            </>
          ) : (
            <>
              <li><NavLink to="/login">Войти</NavLink></li>
              <li>
                <NavLink to="/register" className="nav-register-btn">
                  Регистрация
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}