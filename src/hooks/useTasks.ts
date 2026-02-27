import { useState, useEffect, useCallback } from 'react';
import { parseISO, addDays, addWeeks, addMonths, addYears, format } from 'date-fns';
import { supabase } from '../lib/supabase';
import type { Task, Priority, Recurrence } from '../types';

interface RawTaskTag {
  tags: {
    id: string;
    user_id: string;
    name: string;
    color: string;
    created_at: string;
  } | null;
}

interface RawTask {
  id: string;
  user_id: string;
  list_id: string | null;
  title: string;
  notes: string | null;
  due_date: string | null;
  completed: boolean;
  priority: string | null;
  recurrence: string | null;
  sort_order: number | null;
  created_at: string;
  task_tags: RawTaskTag[];
}

function getNextDueDate(currentDate: string, recurrence: Recurrence): string {
  const date = parseISO(currentDate);
  switch (recurrence) {
    case 'daily':   return format(addDays(date, 1), 'yyyy-MM-dd');
    case 'weekly':  return format(addWeeks(date, 1), 'yyyy-MM-dd');
    case 'monthly': return format(addMonths(date, 1), 'yyyy-MM-dd');
    case 'yearly':  return format(addYears(date, 1), 'yyyy-MM-dd');
  }
}

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*, task_tags(tags(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('fetchTasks error:', error);
    } else if (data) {
      const normalised: Task[] = (data as RawTask[]).map((t) => ({
        id: t.id,
        user_id: t.user_id,
        list_id: t.list_id,
        title: t.title,
        notes: t.notes,
        due_date: t.due_date,
        completed: t.completed,
        priority: (t.priority as Priority) ?? null,
        recurrence: (t.recurrence as Recurrence) ?? null,
        sort_order: t.sort_order ?? null,
        created_at: t.created_at,
        tags: t.task_tags?.flatMap((tt) => (tt.tags ? [tt.tags] : [])) ?? [],
      }));
      setTasks(normalised);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (task: {
    title: string;
    notes?: string;
    due_date?: string;
    list_id?: string | null;
    priority?: Priority | null;
    recurrence?: Recurrence | null;
    tag_ids?: string[];
  }): Promise<{ error: string | null }> => {
    if (!userId) return { error: 'Not logged in' };

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        notes: task.notes || null,
        due_date: task.due_date || null,
        list_id: task.list_id || null,
        priority: task.priority || null,
        recurrence: task.recurrence || null,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('createTask error:', error);
      return { error: error.message };
    }
    if (!data) return { error: 'Task could not be saved. Please try again.' };

    if (task.tag_ids && task.tag_ids.length > 0) {
      await supabase
        .from('task_tags')
        .insert(task.tag_ids.map((tag_id) => ({ task_id: data.id, tag_id })));
    }

    await fetchTasks();
    return { error: null };
  };

  const updateTask = async (
    id: string,
    updates: {
      title?: string;
      notes?: string;
      due_date?: string | null;
      list_id?: string | null;
      priority?: Priority | null;
      recurrence?: Recurrence | null;
      completed?: boolean;
      tag_ids?: string[];
    }
  ): Promise<{ error: string | null }> => {
    const { tag_ids, ...taskUpdates } = updates;

    if (Object.keys(taskUpdates).length > 0) {
      const { error } = await supabase.from('tasks').update(taskUpdates).eq('id', id);
      if (error) {
        console.error('updateTask error:', error);
        return { error: error.message };
      }
    }

    if (tag_ids !== undefined) {
      await supabase.from('task_tags').delete().eq('task_id', id);
      if (tag_ids.length > 0) {
        await supabase
          .from('task_tags')
          .insert(tag_ids.map((tag_id) => ({ task_id: id, tag_id })));
      }
    }

    await fetchTasks();
    return { error: null };
  };

  const deleteTask = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    const { error } = await supabase.from('tasks').update({ completed }).eq('id', id);
    if (error) {
      console.error('toggleComplete error:', error);
      return;
    }

    // Auto-create next occurrence when completing a recurring task
    if (completed) {
      const task = tasks.find((t) => t.id === id);
      if (task?.recurrence && task.due_date) {
        const nextDueDate = getNextDueDate(task.due_date, task.recurrence);
        await supabase.from('tasks').insert({
          title: task.title,
          notes: task.notes,
          due_date: nextDueDate,
          list_id: task.list_id,
          priority: task.priority,
          recurrence: task.recurrence,
          user_id: userId,
        });
      }
    }

    await fetchTasks();
  };

  const reorderTasks = async (updates: Array<{ id: string; sort_order: number }>) => {
    // Optimistic update first
    setTasks((prev) =>
      prev.map((t) => {
        const u = updates.find((x) => x.id === t.id);
        return u ? { ...t, sort_order: u.sort_order } : t;
      })
    );
    // Persist in parallel
    await Promise.all(
      updates.map(({ id, sort_order }) =>
        supabase.from('tasks').update({ sort_order }).eq('id', id)
      )
    );
  };

  return { tasks, loading, createTask, updateTask, deleteTask, toggleComplete, reorderTasks, refetch: fetchTasks };
}
