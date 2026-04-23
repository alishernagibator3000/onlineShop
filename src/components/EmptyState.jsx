// src/components/EmptyState.jsx
export default function EmptyState({ message = 'Ничего не найдено', action }) {
  return (
    <div className="empty-state">
      <p>{message}</p>
      {action}
    </div>
  );
}