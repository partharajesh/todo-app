import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DUE_GROUP_CONFIG } from '../utils/groupByDueDate';
import { SortableTaskCard } from './SortableTaskCard';
import type { DueGroupKey, Task } from '../types';

interface Props {
  groupKey: DueGroupKey;
  tasks: Task[];
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  defaultCollapsed?: boolean;
}

export function TaskGroup({ groupKey, tasks, onToggle, onEdit, onDelete, defaultCollapsed = false }: Props) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const config = DUE_GROUP_CONFIG[groupKey];

  return (
    <div>
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-2 w-full text-left mb-2 group"
      >
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dotColor}`} />
        <span className={`text-xs font-semibold uppercase tracking-wider ${config.textColor}`}>
          {config.label}
        </span>
        <span className="text-xs text-gray-400 font-normal">({tasks.length})</span>
        <span className="text-gray-300 group-hover:text-gray-400 transition-colors ml-auto">
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {!collapsed && (
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 mb-6">
            {tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
}
