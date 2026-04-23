// src/pages/MyItems.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getMyItemIds, removeMyItem, deleteProduct } from '../services/api.js';
import { useToast } from '../hooks/useToast.js';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';

export default function MyItems() {
  const { addToast } = useToast();
  const [products, setProducts]         = useState([]);
  const [myIds, setMyIds]               = useState(() => getMyItemIds());
  const [loading, setLoading]           = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [search, setSearch]             = useState('');

  useEffect(() => {
    getProducts().then(setProducts).finally(() => setLoading(false));
  }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget);
      removeMyItem(deleteTarget);
      setMyIds((prev) => prev.filter((x) => x !== deleteTarget));
      addToast('Товар удалён', 'success');
    } catch {
      addToast('Ошибка при удалении', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  let myProducts = products.filter((p) => myIds.includes(p.id));
  if (search.trim()) {
    const q = search.toLowerCase();
    myProducts = myProducts.filter((p) => p.title.toLowerCase().includes(q));
  }

  const totalValue  = products.filter((p) => myIds.includes(p.id)).reduce((s, p) => s + p.price, 0);
  const targetProduct = products.find((p) => p.id === deleteTarget);

  if (loading) return <Spinner />;

  return (
    <div>
      {deleteTarget && (
        <ConfirmModal
          title="Удалить товар?"
          message={`Вы уверены, что хотите удалить «${targetProduct?.title}»?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      <div className="page-header">
        <div>
          <h1>Мои товары</h1>
          <p className="muted-text" style={{ marginTop: '0.2rem' }}>
            {myIds.length} товаров · сумма ${totalValue.toFixed(2)}
          </p>
        </div>
        <Link to="/products/create" className="btn btn-primary">+ Добавить товар</Link>
      </div>

      {myIds.length === 0 ? (
        <EmptyState
          message="Вы ещё не добавили ни одного товара."
          action={<Link to="/products/create" className="btn btn-primary">Добавить первый товар</Link>}
        />
      ) : (
        <>
          {/* Search within own items */}
          <div className="filter-bar" style={{ marginBottom: '1rem' }}>
            <input
              className="filter-input"
              type="text"
              placeholder="Поиск по своим товарам..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="btn btn-ghost" onClick={() => setSearch('')}>
                Сбросить
              </button>
            )}
          </div>

          {myProducts.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#bbb',
                border: '1px dashed #e0e0de',
                borderRadius: 10,
              }}
            >
              Ничего не найдено
            </div>
          ) : (
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
                  {myProducts.map((p) => (
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
                          <Link
                            to={`/products/${p.id}`}
                            style={{ fontWeight: 500, fontSize: '0.875rem', color: '#111' }}
                          >
                            {p.title.length > 42 ? p.title.slice(0, 42) + '…' : p.title}
                          </Link>
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}