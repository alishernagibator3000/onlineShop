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
              <li><NavLink to="/dashboard">Dashboard</NavLink></li>
              <li><NavLink to="/favorites">Избранное</NavLink></li>
              <li><NavLink to="/my-items">Мои товары</NavLink></li>
              <li><NavLink to="/products/create">Добавить</NavLink></li>
              {isAdmin && (
                <li>
                  <NavLink
                    to="/admin"
                    style={({ isActive }) => ({
                      color: isActive ? '#111' : '#c0392b',
                      fontWeight: 500,
                    })}
                  >
                    Admin
                  </NavLink>
                </li>
              )}
              <li><NavLink to="/profile">{user?.name?.split(' ')[0] || 'Профиль'}</NavLink></li>
              <li><button onClick={handleLogout}>Выйти</button></li>
            </>
          ) : (
            <>
              <li><NavLink to="/login">Войти</NavLink></li>
              <li><NavLink to="/register">Регистрация</NavLink></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}