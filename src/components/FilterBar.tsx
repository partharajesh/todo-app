import type { FilterType, SortOption } from '../types';

interface Props {
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
  sortOption: SortOption;
  onSortChange: (s: SortOption) => void;
}

export function FilterBar({ filter, onFilterChange, sortOption, onSortChange }: Props) {
  const filters: { value: FilterType; label: string }[] = [
    { value: 'all',       label: 'All' },
    { value: 'active',    label: 'Active' },
    { value: 'completed', label: 'Done' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-indigo-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <select
        value={sortOption}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:ring-2 focus:ring-indigo-200 text-gray-600"
      >
        <option value="due-date">Sort: Due Date</option>
        <option value="alphabetical">Sort: A–Z</option>
        <option value="priority">Sort: Priority</option>
      </select>
    </div>
  );
}
