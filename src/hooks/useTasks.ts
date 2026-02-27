import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Task } from '../types';

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
  created_at: string;
  task_tags: RawTaskTag[];
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
      const { error: tagError } = await supabase
        .from('task_tags')
        .insert(task.tag_ids.map((tag_id) => ({ task_id: data.id, tag_id })));
      if (tagError) console.error('createTask tag error:', tagError);
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
    await supabase.from('tasks').update({ completed }).eq('id', id);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
  };

  return { tasks, loading, createTask, updateTask, deleteTask, toggleComplete, refetch: fetchTasks };
}
