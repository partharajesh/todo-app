import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { Task, List, Priority, Recurrence } from '../types';

interface SaveData {
  title: string;
  notes: string;
  due_date: string;
  list_id: string | null;
  priority: Priority | null;
  recurrence: Recurrence | null;
}

interface Props {
  task?: Task | null;
  lists: List[];
  defaultListId?: string | null;
  onSave: (data: SaveData) => Promise<{ error: string | null } | undefined>;
  onClose: () => void;
}

const RECURRENCE_OPTIONS: { value: Recurrence | ''; label: string }[] = [
  { value: '',         label: 'Does not repeat' },
  { value: 'daily',   label: 'Daily' },
  { value: 'weekly',  label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly',  label: 'Yearly' },
];

export function TaskModal({ task, lists, defaultListId, onSave, onClose }: Props) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [dueDate, setDueDate] = useState(task?.due_date ?? '');
  const [listId, setListId] = useState<string | null>(task?.list_id ?? defaultListId ?? null);
  const [priority, setPriority] = useState<Priority | null>(task?.priority ?? null);
  const [recurrence, setRecurrence] = useState<Recurrence | null>(task?.recurrence ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleSave = async () => {
    if (!title.trim()) return;
    setError('');
    setSaving(true);
    const result = await onSave({ title: title.trim(), notes, due_date: dueDate, list_id: listId, priority, recurrence });
    setSaving(false);
    if (result?.error) {
      setError(result.error);
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {task ? 'Edit task' : 'New task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <input
            ref={titleRef}
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="w-full text-sm font-medium placeholder:text-gray-400 text-gray-900 outline-none border-b border-gray-100 pb-3 focus:border-indigo-300"
          />

          <textarea
            placeholder="Add notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full text-sm text-gray-600 placeholder:text-gray-400 border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
          />

          {/* Due date + Folder */}
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Due date</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
                />
                {dueDate && (
                  <button onClick={() => setDueDate('')} className="text-xs text-gray-400 hover:text-gray-600">
                    Clear
                  </button>
                )}
              </div>
            </div>

            {lists.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Folder</label>
                <select
                  value={listId ?? ''}
                  onChange={(e) => setListId(e.target.value || null)}
                  className="text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                >
                  <option value="">No folder</option>
                  {lists.map((list) => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Priority <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(priority === p ? null : p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    priority === p
                      ? p === 'high'   ? 'bg-red-500 text-white'
                      : p === 'medium' ? 'bg-amber-500 text-white'
                      :                  'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Repeat</label>
            <select
              value={recurrence ?? ''}
              onChange={(e) => setRecurrence((e.target.value as Recurrence) || null)}
              className="text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
            >
              {RECURRENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-5 pt-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving…' : task ? 'Save changes' : 'Add task'}
          </button>
        </div>
      </div>
    </div>
  );
}
