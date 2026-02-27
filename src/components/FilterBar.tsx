import type { FilterType, Tag } from '../types';

interface Props {
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
  tags: Tag[];
  selectedTagId: string | null;
  onTagSelect: (id: string | null) => void;
}

export function FilterBar({ filter, onFilterChange, tags, selectedTagId, onTagSelect }: Props) {
  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Done' },
  ];

  return (
    <div className="flex flex-wrap gap-3 items-center">
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

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Tag:</span>
          <button
            onClick={() => onTagSelect(null)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedTagId === null
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => onTagSelect(selectedTagId === tag.id ? null : tag.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium text-white transition-opacity ${
                selectedTagId !== null && selectedTagId !== tag.id ? 'opacity-40' : 'opacity-100'
              }`}
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
