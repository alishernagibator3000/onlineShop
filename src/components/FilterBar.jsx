// src/components/FilterBar.jsx
const SORT_OPTIONS = [
  { value: 'default',    label: 'По умолчанию' },
  { value: 'price-asc',  label: 'Цена: по возрастанию' },
  { value: 'price-desc', label: 'Цена: по убыванию' },
  { value: 'name-asc',   label: 'Название: A–Z' },
  { value: 'name-desc',  label: 'Название: Z–A' },
];

export default function FilterBar({
  search, setSearch,
  category, setCategory,
  sort, setSort,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  categories,
  onClear,
  hasFilters,
}) {
  return (
    <div className="filter-bar">
      <input
        className="filter-input"
        type="text"
        placeholder="Поиск по названию..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        className="filter-select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="all">Все категории</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        className="filter-select"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <div className="price-range">
        <input
          className="filter-input price-input"
          type="number"
          placeholder="от $"
          min="0"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <span className="muted-text">—</span>
        <input
          className="filter-input price-input"
          type="number"
          placeholder="до $"
          min="0"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>

      {hasFilters && (
        <button className="btn btn-ghost" onClick={onClear}>
          Сбросить
        </button>
      )}
    </div>
  );
}