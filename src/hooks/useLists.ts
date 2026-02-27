import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { List } from '../types';

export function useLists(userId: string | undefined) {
  const [lists, setLists] = useState<List[]>([]);

  const fetchLists = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at');
    if (data) setLists(data as List[]);
  }, [userId]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const createList = async (name: string, color: string): Promise<List | undefined> => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('lists')
      .insert({ name, color, user_id: userId })
      .select()
      .single();
    if (error) {
      console.error('createList error:', error);
      return;
    }
    if (data) {
      const list = data as List;
      setLists((prev) => [...prev, list]);
      return list;
    }
  };

  const deleteList = async (id: string) => {
    await supabase.from('lists').delete().eq('id', id);
    setLists((prev) => prev.filter((l) => l.id !== id));
  };

  return { lists, createList, deleteList, refetch: fetchLists };
}
