import {
  isToday,
  isPast,
  parseISO,
  isThisWeek,
  isThisMonth,
  getYear,
  startOfWeek,
  endOfWeek,
  addWeeks,
  isWithinInterval,
} from 'date-fns';
import type { DueGroupKey, Task } from '../types';

export const DUE_GROUP_CONFIG: Record<
  DueGroupKey,
  { label: string; textColor: string; dotColor: string }
> = {
  overdue: { label: 'Overdue', textColor: 'text-red-600', dotColor: 'bg-red-500' },
  today: { label: 'Due Today', textColor: 'text-amber-600', dotColor: 'bg-amber-500' },
  'this-week': { label: 'Due This Week', textColor: 'text-blue-600', dotColor: 'bg-blue-500' },
  'next-week': {
    label: 'Due Next Week',
    textColor: 'text-indigo-600',
    dotColor: 'bg-indigo-500',
  },
  'this-month': {
    label: 'Due This Month',
    textColor: 'text-violet-600',
    dotColor: 'bg-violet-500',
  },
  'this-year': { label: 'Due This Year', textColor: 'text-gray-600', dotColor: 'bg-gray-400' },
  later: { label: 'Later', textColor: 'text-gray-500', dotColor: 'bg-gray-300' },
  'no-date': { label: 'No Due Date', textColor: 'text-gray-400', dotColor: 'bg-gray-200' },
  completed: { label: 'Completed', textColor: 'text-gray-400', dotColor: 'bg-gray-200' },
};

export const ACTIVE_GROUP_ORDER: DueGroupKey[] = [
  'overdue',
  'today',
  'this-week',
  'next-week',
  'this-month',
  'this-year',
  'later',
  'no-date',
];

export function getDueGroupKey(dueDate: string | null): Exclude<DueGroupKey, 'completed'> {
  if (!dueDate) return 'no-date';
  const date = parseISO(dueDate);
  const now = new Date();

  if (isPast(date) && !isToday(date)) return 'overdue';
  if (isToday(date)) return 'today';
  if (isThisWeek(date, { weekStartsOn: 1 })) return 'this-week';

  const nextWeekStart = startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });
  const nextWeekEnd = endOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });
  if (isWithinInterval(date, { start: nextWeekStart, end: nextWeekEnd })) return 'next-week';

  if (isThisMonth(date)) return 'this-month';
  if (getYear(date) === getYear(now)) return 'this-year';
  return 'later';
}

export function groupTasksByDueDate(
  tasks: Task[],
  filter: 'all' | 'active' | 'completed'
): Array<{ key: DueGroupKey; tasks: Task[] }> {
  if (filter === 'completed') {
    const done = tasks.filter((t) => t.completed);
    return done.length > 0 ? [{ key: 'completed', tasks: done }] : [];
  }

  const active = tasks.filter((t) => !t.completed);
  const completed = filter === 'all' ? tasks.filter((t) => t.completed) : [];

  const groupMap = new Map<DueGroupKey, Task[]>();
  for (const task of active) {
    const key = getDueGroupKey(task.due_date);
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(task);
  }

  const result: Array<{ key: DueGroupKey; tasks: Task[] }> = [];
  for (const key of ACTIVE_GROUP_ORDER) {
    const grouped = groupMap.get(key);
    if (grouped && grouped.length > 0) {
      result.push({ key, tasks: grouped });
    }
  }

  if (completed.length > 0) {
    result.push({ key: 'completed', tasks: completed });
  }

  return result;
}
