// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { validateRegister, hasErrors } from '../utils/validators.js';

export default function Register() {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [form, setForm]     = useState({ name: '', email: '', password: '' });
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
    const errs = validateRegister(form);
    if (hasErrors(errs)) { setErrors(errs); return; }

    setLoading(true);
    setApiErr(null);
    try {
      const user = await registerUser(form);
      login(user);
      addToast('Аккаунт создан! Добро пожаловать.', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setApiErr(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-wrap">
      <h1>Регистрация</h1>

      {apiErr && <div className="alert alert-error">{apiErr}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name">Имя</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handle}
            className={errors.name ? 'input-error' : ''}
            autoComplete="name"
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handle}
            className={errors.email ? 'input-error' : ''}
            autoComplete="email"
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handle}
            className={errors.password ? 'input-error' : ''}
            autoComplete="new-password"
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Создание...' : 'Создать аккаунт'}
          </button>
        </div>
      </form>

      <p className="form-footer">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  );
}