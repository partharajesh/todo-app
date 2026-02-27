import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import type { Task } from '../types';

interface Props {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onUpdate: (id: string, updates: { title: string }) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function SortableTaskCard({ task, ...props }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard task={task} dragHandleProps={{ ...attributes, ...listeners }} {...props} />
    </div>
  );
}
