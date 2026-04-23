// src/pages/Products/Details.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getProductById, deleteProduct,
  isMyItem, isFavorite, toggleFavorite,
} from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import Spinner from '../../components/Spinner.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';

export default function Details() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { isAuth, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [product, setProduct]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [deleting, setDeleting]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [fav, setFav]             = useState(() => isFavorite(Number(id)));

  const owner = isAuth && (isMyItem(Number(id)) || isAdmin);

  useEffect(() => {
    setLoading(true);
    getProductById(id)
      .then(setProduct)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteProduct(id);
      addToast('Товар удалён', 'success');
      navigate('/products');
    } catch {
      addToast('Ошибка при удалении', 'error');
      setDeleting(false);
      setShowModal(false);
    }
  }

  function handleFav() {
    toggleFavorite(Number(id));
    setFav((v) => !v);
    addToast(fav ? 'Убрано из избранного' : 'Добавлено в избранное', 'success');
  }

  if (loading) return <Spinner />;
  if (error || !product) return (
    <div className="status-wrap">
      <div className="alert alert-error">{error || 'Товар не найден'}</div>
      <Link to="/products" className="btn btn-secondary" style={{ marginTop: '1rem' }}>Назад</Link>
    </div>
  );

  return (
    <div>
      {showModal && (
        <ConfirmModal
          title="Удалить товар?"
          message={`Вы уверены, что хотите удалить «${product.title}»? Это действие нельзя отменить.`}
          onConfirm={handleDelete}
          onCancel={() => setShowModal(false)}
          loading={deleting}
        />
      )}

      <Link to="/products" className="back-link">← Назад в каталог</Link>

      <div className="details-layout">
        <div className="details-img-wrap">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={product.title}
          />
        </div>

        <div className="details-info">
          <span className="details-category">{product.category}</span>
          <h1>
            {product.title}
            {isMyItem(Number(id)) && (
              <span className="owner-badge" style={{ marginLeft: '0.5rem' }}>Ваш товар</span>
            )}
          </h1>
          <p className="details-price">${Number(product.price).toFixed(2)}</p>
          <p className="details-desc">{product.description}</p>

          <div className="details-actions">
            {isAuth && (
              <button
                className="btn btn-secondary"
                onClick={handleFav}
                style={fav ? { background: '#111', color: '#fff', borderColor: '#111' } : {}}
              >
                {fav ? '♥ Сохранено' : '♡ Сохранить'}
              </button>
            )}
            {owner && (
              <>
                <Link to={`/products/${product.id}/edit`} className="btn btn-primary">
                  Редактировать
                </Link>
                <button className="btn btn-danger" onClick={() => setShowModal(true)}>
                  Удалить
                </button>
              </>
            )}
            {!isAuth && (
              <Link to="/login" className="btn btn-primary">Войти чтобы сохранить</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}