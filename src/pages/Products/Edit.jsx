// src/pages/Products/Edit.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, updateProduct, isMyItem } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { validateProduct, hasErrors } from '../../utils/validators.js';
import Spinner from '../../components/Spinner.jsx';

const CATEGORIES = ["men's clothing", "women's clothing", 'accessories', 'sport'];

export default function Edit() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { addToast } = useToast();

  const [form, setForm]     = useState(null);
  const [errors, setErrors] = useState({});
  const [apiErr, setApiErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    if (!isMyItem(Number(id)) && !isAdmin) {
      navigate(`/products/${id}`, { replace: true });
      return;
    }
    getProductById(id)
      .then((p) => setForm({
        title: p.title, price: String(p.price),
        description: p.description, category: p.category, imageUrl: p.imageUrl || '',
      }))
      .catch((e) => setApiErr(e.message))
      .finally(() => setLoading(false));
  }, [id, isAdmin, navigate]);

  function handle(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateProduct(form);
    if (hasErrors(errs)) { setErrors(errs); return; }

    setSaving(true);
    setApiErr(null);
    try {
      await updateProduct(id, { ...form, price: parseFloat(form.price) });
      addToast('Товар обновлён!', 'success');
      navigate(`/products/${id}`);
    } catch (err) {
      setApiErr(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner />;
  if (apiErr && !form) return <div className="alert alert-error" style={{ maxWidth: 440, margin: '0 auto' }}>{apiErr}</div>;

  return (
    <div className="form-wrap">
      <h1>Редактировать товар</h1>
      {apiErr && <div className="alert alert-error">{apiErr}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>Название *</label>
          <input name="title" value={form.title} onChange={handle}
            className={errors.title ? 'input-error' : ''} />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label>Цена ($) *</label>
          <input name="price" type="number" step="0.01" min="0"
            value={form.price} onChange={handle}
            className={errors.price ? 'input-error' : ''} />
          {errors.price && <span className="field-error">{errors.price}</span>}
        </div>

        <div className="form-group">
          <label>Категория *</label>
          <select name="category" value={form.category} onChange={handle}
            className={errors.category ? 'input-error' : ''}>
            <option value="">Выберите категорию</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <span className="field-error">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label>URL изображения</label>
          <input name="imageUrl" type="url" value={form.imageUrl} onChange={handle} />
        </div>

        <div className="form-group">
          <label>Описание *</label>
          <textarea name="description" value={form.description} onChange={handle}
            className={errors.description ? 'input-error' : ''} />
          {errors.description && <span className="field-error">{errors.description}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
          <button type="button" className="btn btn-secondary"
            onClick={() => navigate(`/products/${id}`)}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}