export interface List {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  list_id: string | null;
  title: string;
  notes: string | null;
  due_date: string | null;
  completed: boolean;
  created_at: string;
  tags?: Tag[];
}

export type FilterType = 'all' | 'active' | 'completed';

export type DueGroupKey =
  | 'overdue'
  | 'today'
  | 'this-week'
  | 'next-week'
  | 'this-month'
  | 'this-year'
  | 'later'
  | 'no-date'
  | 'completed';
