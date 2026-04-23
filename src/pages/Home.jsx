// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const CATEGORIES = [
  { label: "Мужская одежда", value: "men's clothing" },
  { label: "Женская одежда", value: "women's clothing" },
  { label: 'Аксессуары',    value: 'accessories' },
  { label: 'Спорт',         value: 'sport' },
];

export default function Home() {
  const { isAuth, user } = useAuth();

  return (
    <div>
      <div className="hero">
        <h1>StyleShop</h1>
        <p>Современная одежда на каждый день.{isAuth && ` Привет, ${user.name}!`}</p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/products" className="btn btn-primary">Перейти в каталог</Link>
          {!isAuth && <Link to="/register" className="btn btn-secondary">Зарегистрироваться</Link>}
        </div>
      </div>

      <p className="section-title">Категории</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '1px',
          background: '#e8e8e6',
          border: '1px solid #e8e8e6',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '2rem',
        }}
      >
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            to={`/products?category=${encodeURIComponent(cat.value)}`}
            style={{
              background: '#fff',
              padding: '1.5rem 1rem',
              fontWeight: 500,
              fontSize: '0.9375rem',
              color: '#111',
              display: 'block',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#fafaf9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {isAuth && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1px',
            background: '#e8e8e6',
            border: '1px solid #e8e8e6',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          {[
            { label: 'Dashboard', to: '/dashboard', desc: 'Ваша статистика' },
            { label: 'Мои товары', to: '/my-items', desc: 'Управление товарами' },
            { label: 'Избранное', to: '/favorites', desc: 'Сохранённые товары' },
            { label: 'Добавить товар', to: '/products/create', desc: 'Новое объявление' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              style={{
                background: '#fff',
                padding: '1.25rem 1.5rem',
                display: 'block',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#fafaf9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
            >
              <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#111', marginBottom: '0.25rem' }}>{item.label}</p>
              <p style={{ fontSize: '0.8125rem', color: '#999' }}>{item.desc}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}