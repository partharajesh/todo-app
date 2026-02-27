interface Props {
  completed: number;
  total: number;
  label?: string;
}

export function ProgressBar({ completed, total, label }: Props) {
  if (total === 0) return null;
  const pct = Math.round((completed / total) * 100);
  const allDone = pct === 100;

  return (
    <div className="mb-5 p-4 bg-white rounded-xl border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">{label ?? 'Progress'}</span>
        <span className={`text-xs font-semibold ${allDone ? 'text-green-600' : 'text-gray-700'}`}>
          {completed}/{total} · {pct}%
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            allDone ? 'bg-green-500' : pct > 66 ? 'bg-indigo-500' : pct > 33 ? 'bg-amber-500' : 'bg-red-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {allDone && (
        <p className="text-xs text-green-600 font-medium mt-1.5">All done — great work!</p>
      )}
    </div>
  );
}
