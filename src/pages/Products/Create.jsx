// src/pages/Products/Create.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct, addMyItem } from '../../services/api.js';
import { useToast } from '../../hooks/useToast.js';
import { validateProduct, hasErrors } from '../../utils/validators.js';

const CATEGORIES = ["men's clothing", "women's clothing", 'accessories', 'sport'];
const EMPTY = { title: '', price: '', description: '', category: '', imageUrl: '' };

export default function Create() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [apiErr, setApiErr] = useState(null);
  const [loading, setLoading] = useState(false);

  function handle(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateProduct(form);
    if (hasErrors(errs)) { setErrors(errs); return; }

    setLoading(true);
    setApiErr(null);
    try {
      const created = await createProduct({ ...form, price: parseFloat(form.price) });
      addMyItem(created.id);
      addToast('Товар успешно создан!', 'success');
      navigate('/my-items');
    } catch (err) {
      setApiErr(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-wrap">
      <h1>Новый товар</h1>
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
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Сохранение...' : 'Создать товар'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}