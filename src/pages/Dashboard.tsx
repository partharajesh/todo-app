import { useState } from 'react';
import {
  Plus,
  CheckSquare,
  LogOut,
  AlertCircle,
  X,
  Folder,
  LayoutList,
  Menu,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useTags } from '../hooks/useTags';
import { useLists } from '../hooks/useLists';
import { useReminders } from '../hooks/useReminders';
import { TaskGroup } from '../components/TaskGroup';
import { TaskModal } from '../components/TaskModal';
import { FilterBar } from '../components/FilterBar';
import { groupTasksByDueDate } from '../utils/groupByDueDate';
import type { FilterType, Task } from '../types';

const LIST_COLORS = [
  '#6366f1',
  '#22c55e',
  '#f97316',
  '#ef4444',
  '#06b6d4',
  '#a855f7',
  '#eab308',
  '#ec4899',
];

export function Dashboard() {
  const { user, signOut } = useAuth();
  const { tasks, loading, createTask, updateTask, deleteTask, toggleComplete } = useTasks(
    user?.id
  );
  const { tags, createTag } = useTags(user?.id);
  const { lists, createList, deleteList } = useLists(user?.id);
  const { dueTasks, dismissed, dismiss } = useReminders(tasks);

  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState(LIST_COLORS[0]);
  const [showNewList, setShowNewList] = useState(false);

  const filteredTasks = tasks.filter((t) => {
    if (selectedListId && t.list_id !== selectedListId) return false;
    if (selectedTagId && !t.tags?.some((tag) => tag.id === selectedTagId)) return false;
    return true;
  });

  const groups = groupTasksByDueDate(filteredTasks, filter);

  const handleSaveTask = async (data: {
    title: string;
    notes: string;
    due_date: string;
    tag_ids: string[];
    list_id: string | null;
  }) => {
    if (editingTask) {
      return await updateTask(editingTask.id, {
        title: data.title,
        notes: data.notes,
        due_date: data.due_date || null,
        list_id: data.list_id,
        tag_ids: data.tag_ids,
      });
    } else {
      return await createTask({
        title: data.title,
        notes: data.notes,
        due_date: data.due_date,
        list_id: data.list_id,
        tag_ids: data.tag_ids,
      });
    }
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    await createList(newListName.trim(), newListColor);
    setNewListName('');
    setShowNewList(false);
  };

  const activeTasks = filteredTasks.filter((t) => !t.completed).length;
  const selectedList = lists.find((l) => l.id === selectedListId);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
            <CheckSquare size={15} className="text-white" />
          </div>
          <span className="text-base font-bold text-gray-900">Taskly</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        <button
          onClick={() => {
            setSelectedListId(null);
            setSidebarOpen(false);
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            selectedListId === null
              ? 'bg-indigo-50 text-indigo-700 font-medium'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <LayoutList size={15} className="flex-shrink-0" />
          <span>All Tasks</span>
          <span className="ml-auto text-xs text-gray-400">
            {tasks.filter((t) => !t.completed).length}
          </span>
        </button>

        {lists.length > 0 && (
          <div className="pt-3 pb-1">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Folders
            </p>
            {lists.map((list) => {
              const count = tasks.filter(
                (t) => t.list_id === list.id && !t.completed
              ).length;
              return (
                <div key={list.id} className="group flex items-center">
                  <button
                    onClick={() => {
                      setSelectedListId(list.id);
                      setSidebarOpen(false);
                    }}
                    className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedListId === list.id
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: list.color }}
                    />
                    <span className="truncate">{list.name}</span>
                    {count > 0 && (
                      <span className="ml-auto text-xs text-gray-400">{count}</span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (selectedListId === list.id) setSelectedListId(null);
                      deleteList(list.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 mr-1 text-gray-300 hover:text-red-400 transition-all rounded"
                    aria-label={`Delete ${list.name}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2">
          {showNewList ? (
            <div className="px-2 py-2 bg-gray-50 rounded-lg space-y-2">
              <input
                type="text"
                placeholder="Folder name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateList();
                  if (e.key === 'Escape') setShowNewList(false);
                }}
                autoFocus
                className="w-full text-xs bg-white border border-gray-200 rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-300"
              />
              <div className="flex items-center gap-1 flex-wrap">
                {LIST_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewListColor(color)}
                    className={`w-4 h-4 rounded transition-transform ${
                      newListColor === color ? 'scale-125 ring-1 ring-offset-1 ring-gray-400' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateList}
                  disabled={!newListName.trim()}
                  className="flex-1 text-xs font-medium text-white bg-indigo-500 rounded px-2 py-1 hover:bg-indigo-600 disabled:opacity-40"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewList(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewList(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Plus size={14} />
              New folder
            </button>
          )}
        </div>
      </nav>

      <div className="p-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 truncate px-3 mb-1">{user?.email}</p>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 flex-shrink-0 sticky top-0 h-screen overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center">
                <CheckSquare size={13} className="text-white" />
              </div>
              <span className="font-bold text-gray-900">Taskly</span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="p-1.5 text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6">
          {!dismissed && dueTasks.length > 0 && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-800">
                  {dueTasks.length} task{dueTasks.length > 1 ? 's' : ''} need your attention
                </p>
                <ul className="mt-1 space-y-0.5">
                  {dueTasks.slice(0, 3).map((t) => (
                    <li key={t.id} className="text-xs text-amber-700 truncate">
                      · {t.title}
                    </li>
                  ))}
                  {dueTasks.length > 3 && (
                    <li className="text-xs text-amber-600">and {dueTasks.length - 3} more…</li>
                  )}
                </ul>
              </div>
              <button
                onClick={dismiss}
                className="text-amber-400 hover:text-amber-600 flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              {selectedList && (
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: selectedList.color }}
                />
              )}
              {!selectedList && <Folder size={18} className="text-gray-400" />}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {selectedList ? selectedList.name : 'All Tasks'}
                </h1>
                <p className="text-xs text-gray-400">
                  {activeTasks} task{activeTasks !== 1 ? 's' : ''} remaining
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-xl hover:bg-indigo-600 transition-colors shadow-sm"
            >
              <Plus size={16} />
              New task
            </button>
          </div>

          <div className="mb-5">
            <FilterBar
              filter={filter}
              onFilterChange={setFilter}
              tags={tags}
              selectedTagId={selectedTagId}
              onTagSelect={setSelectedTagId}
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-white rounded-xl border border-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckSquare size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                {filter === 'completed'
                  ? 'No completed tasks yet'
                  : filter === 'active'
                  ? "No active tasks — you're all caught up!"
                  : 'No tasks yet. Add one above!'}
              </p>
            </div>
          ) : (
            <div>
              {groups.map(({ key, tasks: groupTasks }) => (
                <TaskGroup
                  key={key}
                  groupKey={key}
                  tasks={groupTasks}
                  onToggle={toggleComplete}
                  onEdit={openEdit}
                  onDelete={deleteTask}
                  defaultCollapsed={key === 'completed'}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <TaskModal
          task={editingTask}
          tags={tags}
          lists={lists}
          defaultListId={selectedListId}
          onCreateTag={createTag}
          onSave={handleSaveTask}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
