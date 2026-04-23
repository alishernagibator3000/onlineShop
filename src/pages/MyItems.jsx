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
  const [products, setProducts]   = useState([]);
  const [myIds, setMyIds]         = useState(() => getMyItemIds());
  const [loading, setLoading]     = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]   = useState(false);

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

  const myProducts = products.filter((p) => myIds.includes(p.id));
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
        <h1>Мои товары</h1>
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
                <th>Товар</th>
                <th>Категория</th>
                <th>Цена</th>
                <th></th>
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
                        style={{ width: 36, height: 36, objectFit: 'contain', background: '#f9f9f8', borderRadius: 4, padding: 3 }}
                      />
                      <Link to={`/products/${p.id}`} style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                        {p.title.length > 40 ? p.title.slice(0, 40) + '…' : p.title}
                      </Link>
                    </div>
                  </td>
                  <td className="muted-text">{p.category}</td>
                  <td style={{ fontWeight: 500 }}>${Number(p.price).toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                      <Link to={`/products/${p.id}/edit`} className="btn btn-ghost"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.8125rem' }}>
                        Изменить
                      </Link>
                      <button className="btn btn-danger"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.8125rem' }}
                        onClick={() => setDeleteTarget(p.id)}>
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
    </div>
  );
}