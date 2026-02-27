import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Tag } from '../types';

export function useTags(userId: string | undefined) {
  const [tags, setTags] = useState<Tag[]>([]);

  const fetchTags = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    if (data) setTags(data as Tag[]);
  }, [userId]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = async (name: string, color: string): Promise<Tag | undefined> => {
    if (!userId) return;
    const { data } = await supabase
      .from('tags')
      .insert({ name, color, user_id: userId })
      .select()
      .single();
    if (data) {
      const tag = data as Tag;
      setTags((prev) => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)));
      return tag;
    }
  };

  const deleteTag = async (id: string) => {
    await supabase.from('tags').delete().eq('id', id);
    setTags((prev) => prev.filter((t) => t.id !== id));
  };

  return { tags, createTag, deleteTag, refetch: fetchTags };
}
