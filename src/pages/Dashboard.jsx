// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getMyItemIds, getFavoriteIds } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  const myIds  = getMyItemIds();
  const favIds = getFavoriteIds();

  useEffect(() => {
    getProducts().then(setProducts).finally(() => setLoading(false));
  }, []);

  const myProducts = products.filter((p) => myIds.includes(p.id));
  const totalValue = myProducts.reduce((s, p) => s + p.price, 0);
  const categories = [...new Set(myProducts.map((p) => p.category))].length;

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <span className="muted-text">Привет, {user?.name}!</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Мои товары</p>
          <p className="stat-value">{myProducts.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Избранное</p>
          <p className="stat-value">{favIds.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Общая сумма</p>
          <p className="stat-value">${totalValue.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Категорий</p>
          <p className="stat-value">{categories}</p>
        </div>
      </div>

      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <p className="section-title" style={{ margin: 0 }}>Мои товары</p>
        <Link to="/products/create" className="btn btn-primary">+ Добавить</Link>
      </div>

      {myProducts.length === 0 ? (
        <EmptyState
          message="Вы ещё не добавили ни одного товара."
          action={<Link to="/products/create" className="btn btn-primary">Добавить первый товар</Link>}
        />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Категория</th>
                <th>Цена</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {myProducts.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.title}
                  </td>
                  <td className="muted-text">{p.category}</td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <Link to={`/products/${p.id}`} className="btn btn-ghost"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.8125rem' }}>Открыть</Link>
                      <Link to={`/products/${p.id}/edit`} className="btn btn-ghost"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.8125rem' }}>Изменить</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}