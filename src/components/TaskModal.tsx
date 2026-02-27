import { useState, useEffect, useRef } from 'react';
import { X, Plus, Tag, AlertCircle } from 'lucide-react';
import type { Task, Tag as TagType, List } from '../types';

const TAG_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#6366f1',
  '#a855f7',
  '#ec4899',
  '#64748b',
  '#78716c',
];

interface SaveData {
  title: string;
  notes: string;
  due_date: string;
  tag_ids: string[];
  list_id: string | null;
}

interface Props {
  task?: Task | null;
  tags: TagType[];
  lists: List[];
  defaultListId?: string | null;
  onCreateTag: (name: string, color: string) => Promise<TagType | undefined>;
  onSave: (data: SaveData) => Promise<{ error: string | null } | undefined>;
  onClose: () => void;
}

export function TaskModal({ task, tags, lists, defaultListId, onCreateTag, onSave, onClose }: Props) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [dueDate, setDueDate] = useState(task?.due_date ?? '');
  const [listId, setListId] = useState<string | null>(
    task?.list_id ?? defaultListId ?? null
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    task?.tags?.map((t) => t.id) ?? []
  );
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[5]);
  const [showTagCreate, setShowTagCreate] = useState(false);
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
    const result = await onSave({
      title: title.trim(),
      notes,
      due_date: dueDate,
      tag_ids: selectedTagIds,
      list_id: listId,
    });
    setSaving(false);
    if (result?.error) {
      setError(result.error);
    } else {
      onClose();
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    const tag = await onCreateTag(newTagName.trim(), newTagColor);
    if (tag) {
      setSelectedTagIds((prev) => [...prev, tag.id]);
      setNewTagName('');
      setShowTagCreate(false);
    }
  };

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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
                  <button
                    onClick={() => setDueDate('')}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
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
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium text-white transition-opacity ${
                    selectedTagIds.includes(tag.id)
                      ? 'opacity-100 outline outline-2 outline-offset-1 outline-gray-400'
                      : 'opacity-50 hover:opacity-75'
                  }`}
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </button>
              ))}
              <button
                onClick={() => setShowTagCreate(!showTagCreate)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <Plus size={10} />
                New tag
              </button>
            </div>

            {showTagCreate && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Tag size={14} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                  className="flex-1 text-xs bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                  autoFocus
                />
                <div className="flex gap-1">
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewTagColor(color)}
                      className={`w-4 h-4 rounded-full transition-transform ${
                        newTagColor === color ? 'scale-125 ring-1 ring-offset-1 ring-gray-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
                <button
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            )}
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
