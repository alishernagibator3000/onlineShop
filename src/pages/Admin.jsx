// src/pages/Admin.jsx
import { useState, useEffect } from 'react';
import {
  getAllUsers, updateUserRole, deleteUser,
  getProducts, deleteProduct, removeMyItem,
} from '../services/api.js';
import { useToast } from '../hooks/useToast.js';
import Spinner from '../components/Spinner.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';

const TABS = ['Пользователи', 'Товары'];

export default function Admin() {
  const [tab, setTab] = useState('Пользователи');

  return (
    <div>
      <div className="page-header">
        <h1>Панель администратора</h1>
        <span className="role-badge role-admin">admin</span>
      </div>
      <div className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t}
            className={`tab-btn${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === 'Пользователи' && <AdminUsers />}
      {tab === 'Товары'       && <AdminProducts />}
    </div>
  );
}

/* ── Users tab ── */
function AdminUsers() {
  const { addToast } = useToast();
  const [users, setUsers]           = useState(() => getAllUsers());
  const [deleteTarget, setDeleteTarget] = useState(null);

  function handleRoleChange(userId, role) {
    setUsers(updateUserRole(userId, role));
    addToast('Роль обновлена', 'success');
  }

  function handleDelete() {
    setUsers(deleteUser(deleteTarget));
    addToast('Пользователь удалён', 'success');
    setDeleteTarget(null);
  }

  const targetUser = users.find((u) => u.id === deleteTarget);

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {deleteTarget && (
        <ConfirmModal
          title="Удалить пользователя?"
          message={`Удалить аккаунт ${targetUser?.name} (${targetUser?.email})?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Имя</th><th>Email</th><th>Роль</th><th>Дата</th><th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 500 }}>{u.name}</td>
                <td className="muted-text">{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="role-select"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="muted-text">{u.createdAt}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.8125rem' }}
                    onClick={() => setDeleteTarget(u.id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Products tab ── */
function AdminProducts() {
  const { addToast } = useToast();
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('all');
  const [sort, setSort]             = useState('default');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]     = useState(false);

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

  const categories = [...new Set(products.map((p) => p.category))].sort();
  let filtered = [...products];
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter((p) => p.title.toLowerCase().includes(q));
  }
  if (category !== 'all') filtered = filtered.filter((p) => p.category === category);
  switch (sort) {
    case 'price-asc':  filtered.sort((a, b) => a.price - b.price); break;
    case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
    default: break;
  }

  const targetProduct = products.find((p) => p.id === deleteTarget);

  if (loading) return <Spinner />;

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {deleteTarget && (
        <ConfirmModal
          title="Удалить товар?"
          message={`Удалить «${targetProduct?.title}»?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      <div className="filter-bar">
        <input className="filter-input" type="text" placeholder="Поиск товаров..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="filter-select" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">Все категории</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="filter-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="default">Сортировка</option>
          <option value="price-asc">Цена ↑</option>
          <option value="price-desc">Цена ↓</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Товар</th><th>Категория</th><th>Цена</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={p.imageUrl} alt="" style={{ width: 36, height: 36, objectFit: 'contain', background: '#f9f9f8', borderRadius: 4, padding: 2 }} />
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      {p.title.length > 45 ? p.title.slice(0, 45) + '…' : p.title}
                    </span>
                  </div>
                </td>
                <td className="muted-text">{p.category}</td>
                <td style={{ fontWeight: 500 }}>${Number(p.price).toFixed(2)}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.8125rem' }}
                    onClick={() => setDeleteTarget(p.id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}