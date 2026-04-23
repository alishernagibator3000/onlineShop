// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="status-wrap">
      <p style={{ fontSize: '3rem', fontWeight: 600, letterSpacing: '-1px', marginBottom: '0.5rem' }}>404</p>
      <p style={{ marginBottom: '1.5rem' }}>Страница не найдена</p>
      <Link to="/" className="btn btn-primary">На главную</Link>
    </div>
  );
}