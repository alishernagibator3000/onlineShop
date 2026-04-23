// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getMyItemIds, getFavoriteIds } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import Spinner from '../components/Spinner.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  const myIds  = getMyItemIds();
  const favIds = getFavoriteIds();

  useEffect(() => {
    getProducts().then(setProducts).finally(() => setLoading(false));
  }, []);

  const myProducts     = products.filter((p) => myIds.includes(p.id));
  const favProducts    = products.filter((p) => favIds.includes(p.id));
  const totalValue     = myProducts.reduce((s, p) => s + p.price, 0);
  const categories     = [...new Set(myProducts.map((p) => p.category))];
  const recentMy       = [...myProducts].slice(-3).reverse();
  const recentFav      = [...favProducts].slice(-3).reverse();

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  if (loading) return <Spinner />;

  return (
    <div>
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-avatar">{initials}</div>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 600, letterSpacing: '-0.3px' }}>
            Добро пожаловать, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="muted-text">{user?.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <p className="stat-label">Мои товары</p>
          <p className="stat-value">{myProducts.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Избранное</p>
          <p className="stat-value">{favIds.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Сумма товаров</p>
          <p className="stat-value">${totalValue.toFixed(0)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Категорий</p>
          <p className="stat-value">{categories.length}</p>
        </div>
      </div>

      {/* Quick actions */}
      <p className="section-title">Быстрые действия</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '1px',
          background: '#e8e8e6',
          border: '1px solid #e8e8e6',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '2rem',
        }}
      >
        {[
          { label: 'Мои товары',   to: '/my-items',          desc: 'Управление объявлениями' },
          { label: 'Добавить товар', to: '/products/create',  desc: 'Создать новое объявление' },
          { label: 'Избранное',    to: '/favorites',          desc: `${favIds.length} сохранено` },
          { label: 'Каталог',      to: '/products',           desc: 'Все товары' },
          { label: 'Профиль',      to: '/profile',            desc: 'Настройки аккаунта' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            style={{ background: '#fff', padding: '1.25rem 1.5rem', display: 'block', transition: 'background 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#fafaf9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
          >
            <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#111', marginBottom: '0.25rem' }}>
              {item.label}
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#999' }}>{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Two-column activity */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Recent own products */}
        <div>
          <div className="page-header" style={{ marginBottom: '0.75rem' }}>
            <p className="section-title" style={{ margin: 0 }}>Последние мои товары</p>
            <Link to="/my-items" className="btn btn-ghost btn-sm">Все →</Link>
          </div>
          {recentMy.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#bbb',
                border: '1px dashed #e0e0de',
                borderRadius: 10,
                background: '#fff',
              }}
            >
              <p style={{ marginBottom: '0.75rem' }}>Нет товаров</p>
              <Link to="/products/create" className="btn btn-primary btn-sm">Добавить</Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <tbody>
                  {recentMy.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <img
                            src={p.imageUrl}
                            alt=""
                            style={{ width: 32, height: 32, objectFit: 'contain', background: '#f9f9f8', borderRadius: 4, padding: 2 }}
                          />
                          <Link
                            to={`/products/${p.id}`}
                            style={{ fontWeight: 500, fontSize: '0.875rem', color: '#111' }}
                          >
                            {p.title.length > 28 ? p.title.slice(0, 28) + '…' : p.title}
                          </Link>
                        </div>
                      </td>
                      <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                        ${Number(p.price).toFixed(2)}
                      </td>
                      <td>
                        <Link
                          to={`/products/${p.id}/edit`}
                          className="btn btn-ghost btn-sm"
                        >
                          Изменить
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent favorites */}
        <div>
          <div className="page-header" style={{ marginBottom: '0.75rem' }}>
            <p className="section-title" style={{ margin: 0 }}>Недавнее избранное</p>
            <Link to="/favorites" className="btn btn-ghost btn-sm">Все →</Link>
          </div>
          {recentFav.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#bbb',
                border: '1px dashed #e0e0de',
                borderRadius: 10,
                background: '#fff',
              }}
            >
              <p style={{ marginBottom: '0.75rem' }}>Нет избранного</p>
              <Link to="/products" className="btn btn-primary btn-sm">В каталог</Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <tbody>
                  {recentFav.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <img
                            src={p.imageUrl}
                            alt=""
                            style={{ width: 32, height: 32, objectFit: 'contain', background: '#f9f9f8', borderRadius: 4, padding: 2 }}
                          />
                          <Link
                            to={`/products/${p.id}`}
                            style={{ fontWeight: 500, fontSize: '0.875rem', color: '#111' }}
                          >
                            {p.title.length > 28 ? p.title.slice(0, 28) + '…' : p.title}
                          </Link>
                        </div>
                      </td>
                      <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                        ${Number(p.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}