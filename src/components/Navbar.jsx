// src/components/Navbar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';

export default function Navbar() {
  const { user, isAuth, isAdmin, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    addToast('Вы вышли из аккаунта', 'info');
    navigate('/', { replace: true });
  }

  return (
    <nav>
      <div className="nav-inner">
        <NavLink to="/" className="nav-logo">StyleShop</NavLink>
        <ul className="nav-links">
          <li><NavLink to="/products">Каталог</NavLink></li>

          {isAuth ? (
            <>
              <li><NavLink to="/my-items">Мои товары</NavLink></li>
              <li><NavLink to="/favorites">Избранное</NavLink></li>
              {isAdmin && (
                <li>
                  <NavLink to="/admin" className="nav-admin-link">
                    ⚙ Админка
                  </NavLink>
                </li>
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