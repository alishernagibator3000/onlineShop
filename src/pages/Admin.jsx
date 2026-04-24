// src/pages/Admin.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllUsers, updateUserRole, deleteUser,
  getProducts, deleteProduct, removeMyItem,
  getAdminNotifications, markNotificationsRead, clearAdminNotifications
} from '../services/api.js';
import { useToast } from '../hooks/useToast.js';
import Spinner from '../components/Spinner.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';

const TABS = ['Обзор', 'Уведомления', 'Пользователи', 'Товары'];

export default function Admin() {
  const [tab, setTab] = useState(() => {
    const hash = decodeURIComponent(window.location.hash.replace('#', ''));
    return TABS.includes(hash) ? hash : 'Обзор';
  });

  useEffect(() => {
    const handleHash = () => {
      const hash = decodeURIComponent(window.location.hash.replace('#', ''));
      if (TABS.includes(hash)) setTab(hash);
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleTabChange = (t) => {
    setTab(t);
    window.location.hash = t;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Панель администратора</h1>
          <p className="muted-text" style={{ marginTop: '0.25rem' }}>
            Управление пользователями и товарами
          </p>
        </div>
        <span className="role-badge role-admin">admin</span>
      </div>

      <div className="tab-bar" style={{ marginBottom: '1.5rem' }}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`tab-btn${tab === t ? ' active' : ''}`}
            onClick={() => handleTabChange(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Обзор'        && <AdminOverview onTabChange={handleTabChange} />}
      {tab === 'Уведомления'  && <AdminNotifications />}
      {tab === 'Пользователи' && <AdminUsers />}
      {tab === 'Товары'       && <AdminProducts />}
    </div>
  );
}

/* ── Notifications tab ── */
function AdminNotifications() {
  const [notifs, setNotifs] = useState(() => getAdminNotifications());

  useEffect(() => {
    const hasUnread = notifs.some(n => !n.read);
    if (hasUnread) {
      markNotificationsRead();
      window.dispatchEvent(new Event('notif-updated'));
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    }
  }, [notifs]);

  if (notifs.length === 0) {
    return (
      <div className="empty-state">
        <p>Уведомлений пока нет</p>
      </div>
    );
  }

  const handleClear = () => {
    if (window.confirm("Удалить все уведомления?")) {
      clearAdminNotifications();
      setNotifs([]);
      window.dispatchEvent(new Event('notif-updated'));
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <span className="section-title" style={{ margin: 0 }}>Уведомления о заказах</span>
        <button className="btn btn-ghost btn-sm" onClick={handleClear}>
          Очистить все
        </button>
      </div>
      <div>
        {notifs.map((n) => (
          <div key={n.id} className={`notif-item ${!n.read ? 'notif-item--unread' : ''}`}>
            <div>
              <div className="notif-item-header">
                <span className="notif-item-title">Новый заказ #{n.orderId}</span>
                <span className="notif-item-date">{n.date}</span>
              </div>
              <div className="notif-item-body">
                <p><strong>Покупатель:</strong> {n.userName} ({n.userEmail})</p>
                <p><strong>Товаров:</strong> {n.itemsCount} шт.</p>
              </div>
            </div>
            <div className="notif-item-price">${n.total}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Overview tab ── */
function AdminOverview({ onTabChange }) {
  const [products, setProducts] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts(),
    ]).then(([prods]) => {
      setProducts(prods);
      setUsers(getAllUsers());
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const adminCount  = users.filter((u) => u.role === 'admin').length;
  const userCount   = users.filter((u) => u.role !== 'admin').length;
  const totalValue  = products.reduce((s, p) => s + p.price, 0);
  const categories  = [...new Set(products.map((p) => p.category))];

  const categoryStats = categories.map((cat) => ({
    name: cat,
    count: products.filter((p) => p.category === cat).length,
    avg: (
      products.filter((p) => p.category === cat).reduce((s, p) => s + p.price, 0) /
      products.filter((p) => p.category === cat).length
    ).toFixed(2),
  }));

  const recentProducts = [...products].slice(-5).reverse();
  const recentUsers    = [...users].slice(-5).reverse();

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <p className="stat-label">Всего товаров</p>
          <p className="stat-value">{products.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Пользователей</p>
          <p className="stat-value">{users.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Администраторов</p>
          <p className="stat-value">{adminCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Сумма каталога</p>
          <p className="stat-value">${totalValue.toFixed(0)}</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Category breakdown */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="section-title" style={{ margin: 0 }}>Товары по категориям</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Категория</th>
                <th>Товаров</th>
                <th>Ср. цена</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.map((c) => (
                <tr key={c.name}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>{c.count}</td>
                  <td className="muted-text">${c.avg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User roles */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="section-title" style={{ margin: 0 }}>Состав пользователей</span>
          </div>
          <div style={{ padding: '1rem' }}>
            <div className="admin-role-bar">
              <div
                className="admin-role-fill admin-role-admin"
                style={{ width: `${(adminCount / users.length) * 100}%` }}
              />
              <div
                className="admin-role-fill admin-role-user"
                style={{ width: `${(userCount / users.length) * 100}%` }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem' }}>
              <div>
                <span className="role-badge role-admin">admin</span>
                <span className="muted-text" style={{ marginLeft: '0.5rem' }}>{adminCount}</span>
              </div>
              <div>
                <span className="role-badge role-user">user</span>
                <span className="muted-text" style={{ marginLeft: '0.5rem' }}>{userCount}</span>
              </div>
            </div>
          </div>

          <div className="admin-card-header" style={{ borderTop: '1px solid #f0f0ee' }}>
            <span className="section-title" style={{ margin: 0 }}>Последние пользователи</span>
          </div>
          <table className="data-table">
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="mini-avatar">{u.name?.[0]?.toUpperCase()}</div>
                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td className="muted-text">{u.email}</td>
                  <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent products */}
      <div className="admin-card">
        <div className="admin-card-header">
          <span className="section-title" style={{ margin: 0 }}>Последние товары</span>
          <button className="btn btn-ghost btn-sm" onClick={() => onTabChange('Товары')}>
            Все товары →
          </button>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Товар</th><th>Категория</th><th>Цена</th><th></th></tr>
          </thead>
          <tbody>
            {recentProducts.map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={p.imageUrl}
                      alt=""
                      style={{ width: 32, height: 32, objectFit: 'contain', background: '#f9f9f8', borderRadius: 4, padding: 2 }}
                    />
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      {p.title.length > 40 ? p.title.slice(0, 40) + '…' : p.title}
                    </span>
                  </div>
                </td>
                <td className="muted-text">{p.category}</td>
                <td style={{ fontWeight: 500 }}>${Number(p.price).toFixed(2)}</td>
                <td>
                  <Link
                    to={`/products/${p.id}`}
                    className="btn btn-ghost btn-sm"
                  >
                    Открыть
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Users tab ── */
function AdminUsers() {
  const { addToast } = useToast();
  const [users, setUsers]               = useState(() => getAllUsers());
  const [search, setSearch]             = useState('');
  const [roleFilter, setRoleFilter]     = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  })();

  function handleRoleChange(userId, role) {
    setUsers(updateUserRole(userId, role));
    addToast('Роль обновлена', 'success');
  }

  function handleDelete() {
    setUsers(deleteUser(deleteTarget));
    addToast('Пользователь удалён', 'success');
    setDeleteTarget(null);
  }

  const filtered = useMemo(() => {
    let result = [...users];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'all') result = result.filter((u) => u.role === roleFilter);
    return result;
  }, [users, search, roleFilter]);

  const targetUser = users.find((u) => u.id === deleteTarget);

  return (
    <div>
      {deleteTarget && (
        <ConfirmModal
          title="Удалить пользователя?"
          message={`Удалить аккаунт ${targetUser?.name} (${targetUser?.email})?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: '1rem' }}>
        <input
          className="filter-input"
          type="text"
          placeholder="Поиск по имени или email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="filter-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">Все роли</option>
          <option value="admin">Администраторы</option>
          <option value="user">Пользователи</option>
        </select>
        <span className="muted-text" style={{ paddingLeft: '0.25rem' }}>
          {filtered.length} из {users.length}
        </span>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Пользователь</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Дата</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#bbb', padding: '2rem' }}>
                  Нет пользователей
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div className="mini-avatar">{u.name?.[0]?.toUpperCase()}</div>
                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                      {u.id === currentUser?.id && (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            background: '#f3f3f1',
                            color: '#888',
                            padding: '1px 6px',
                            borderRadius: 4,
                            border: '1px solid #e8e8e6',
                          }}
                        >
                          вы
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="muted-text">{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="role-select"
                      disabled={u.id === currentUser?.id}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="muted-text">{u.createdAt}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteTarget(u.id)}
                      disabled={u.id === currentUser?.id}
                      title={u.id === currentUser?.id ? 'Нельзя удалить себя' : ''}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Products tab ── */
function AdminProducts() {
  const { addToast } = useToast();
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [category, setCategory]         = useState('all');
  const [sort, setSort]                 = useState('default');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => {
    getProducts().then(setProducts).finally(() => setLoading(false));
  }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget);
      removeMyItem(deleteTarget);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget));
      addToast('Товар удалён', 'success');
    } catch {
      addToast('Ошибка при удалении', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

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
    switch (sort) {
      case 'price-asc':  result = [...result].sort((a, b) => a.price - b.price); break;
      case 'price-desc': result = [...result].sort((a, b) => b.price - a.price); break;
      case 'name-asc':   result = [...result].sort((a, b) => a.title.localeCompare(b.title)); break;
      default: break;
    }
    return result;
  }, [products, search, category, sort]);

  const targetProduct = products.find((p) => p.id === deleteTarget);

  if (loading) return <Spinner />;

  return (
    <div>
      {deleteTarget && (
        <ConfirmModal
          title="Удалить товар?"
          message={`Удалить «${targetProduct?.title}»?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      <div className="filter-bar" style={{ marginBottom: '1rem' }}>
        <input
          className="filter-input"
          type="text"
          placeholder="Поиск товаров..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="filter-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Все категории</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          className="filter-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="default">Сортировка</option>
          <option value="price-asc">Цена ↑</option>
          <option value="price-desc">Цена ↓</option>
          <option value="name-asc">Название А–Я</option>
        </select>
        <span className="muted-text" style={{ paddingLeft: '0.25rem' }}>
          {filtered.length} из {products.length}
        </span>
        <Link to="/products/create" className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>
          + Добавить товар
        </Link>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Товар</th>
              <th>Категория</th>
              <th>Цена</th>
              <th style={{ textAlign: 'right' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#bbb', padding: '2rem' }}>
                  Нет товаров
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={p.imageUrl}
                        alt=""
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: 'contain',
                          background: '#f9f9f8',
                          borderRadius: 6,
                          padding: 3,
                          border: '1px solid #f0f0ee',
                        }}
                      />
                      <div>
                        <p style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: 2 }}>
                          {p.title.length > 45 ? p.title.slice(0, 45) + '…' : p.title}
                        </p>
                        <p className="muted-text">ID: {p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="muted-text">{p.category}</td>
                  <td style={{ fontWeight: 500 }}>${Number(p.price).toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                      <Link
                        to={`/products/${p.id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        Открыть
                      </Link>
                      <Link
                        to={`/products/${p.id}/edit`}
                        className="btn btn-secondary btn-sm"
                      >
                        Изменить
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteTarget(p.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
