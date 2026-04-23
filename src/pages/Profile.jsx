// src/pages/Profile.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { getMyItemIds, getFavoriteIds, isAdmin as checkAdmin } from '../services/api.js';

export default function Profile() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const initials = user?.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  function handleLogout() {
    logout();
    addToast('Вы вышли из аккаунта', 'info');
    navigate('/', { replace: true });
  }

  return (
    <div>
      <div className="page-header"><h1>Профиль</h1></div>
      <div className="profile-layout">
        <div className="profile-sidebar">
          <div className="profile-avatar">{initials}</div>
          <p className="profile-name">{user?.name}</p>
          <p className="profile-email">{user?.email}</p>
          <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
          <button
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '0.75rem' }}
            onClick={handleLogout}
          >
            Выйти
          </button>
        </div>

        <div className="profile-main">
          <h2>Данные аккаунта</h2>
          <div className="field-row">
            <span className="field-key">Имя</span>
            <span className="field-val">{user?.name}</span>
          </div>
          <div className="field-row">
            <span className="field-key">Email</span>
            <span className="field-val">{user?.email}</span>
          </div>
          <div className="field-row">
            <span className="field-key">Роль</span>
            <span className="field-val">
              <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
            </span>
          </div>
          <div className="field-row">
            <span className="field-key">Моих товаров</span>
            <span className="field-val">{getMyItemIds().length}</span>
          </div>
          <div className="field-row">
            <span className="field-key">В избранном</span>
            <span className="field-val">{getFavoriteIds().length}</span>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to="/my-items" className="btn btn-secondary">Мои товары</Link>
            <Link to="/favorites" className="btn btn-secondary">Избранное</Link>
            <Link to="/dashboard" className="btn btn-secondary">Dashboard</Link>
            {checkAdmin() && (
              <Link to="/admin" className="btn btn-primary">Панель Admin</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}