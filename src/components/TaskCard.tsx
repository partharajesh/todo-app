import { format, isToday, isPast, parseISO } from 'date-fns';
import { Pencil, Trash2, Calendar } from 'lucide-react';
import type { Task } from '../types';
import { TagBadge } from './TagBadge';

interface Props {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onToggle, onEdit, onDelete }: Props) {
  const getDueDateInfo = () => {
    if (!task.due_date) return null;
    const date = parseISO(task.due_date);
    if (task.completed) return { label: format(date, 'MMM d'), className: 'text-gray-400' };
    if (isPast(date) && !isToday(date))
      return { label: `Overdue · ${format(date, 'MMM d')}`, className: 'text-red-500 font-medium' };
    if (isToday(date)) return { label: 'Due today', className: 'text-amber-500 font-medium' };
    return { label: format(date, 'MMM d'), className: 'text-gray-400' };
  };

  const dueDateInfo = getDueDateInfo();
  const isOverdue =
    task.due_date &&
    !task.completed &&
    isPast(parseISO(task.due_date)) &&
    !isToday(parseISO(task.due_date));

  return (
    <div
      className={`group flex items-start gap-3 p-4 bg-white rounded-xl border transition-all ${
        isOverdue ? 'border-red-100 bg-red-50/40' : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      <button
        onClick={() => onToggle(task.id, !task.completed)}
        className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded-full border-2 transition-all flex items-center justify-center ${
          task.completed
            ? 'bg-indigo-500 border-indigo-500'
            : 'border-gray-300 hover:border-indigo-400'
        }`}
        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {task.completed && (
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-snug ${
            task.completed ? 'line-through text-gray-400' : 'text-gray-800'
          }`}
        >
          {task.title}
        </p>
        {task.notes && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{task.notes}</p>
        )}
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          {dueDateInfo && (
            <span className={`flex items-center gap-1 text-xs ${dueDateInfo.className}`}>
              <Calendar size={11} />
              {dueDateInfo.label}
            </span>
          )}
          {task.tags?.map((tag) => <TagBadge key={tag.id} tag={tag} />)}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
          aria-label="Edit task"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
