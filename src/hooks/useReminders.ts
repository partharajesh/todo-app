import { useEffect, useState } from 'react';
import { isToday, isPast, parseISO } from 'date-fns';
import type { Task } from '../types';

export function useReminders(tasks: Task[]) {
  const [dismissed, setDismissed] = useState(false);
  const [notified, setNotified] = useState(false);

  const dueTasks = tasks.filter((t) => {
    if (t.completed || !t.due_date) return false;
    const date = parseISO(t.due_date);
    return isToday(date) || isPast(date);
  });

  useEffect(() => {
    if (dueTasks.length === 0 || notified) return;

    const requestAndNotify = async () => {
      setNotified(true);
      if (!('Notification' in window)) return;

      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        const overdue = dueTasks.filter(
          (t) => t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date))
        );
        const todayTasks = dueTasks.filter((t) => t.due_date && isToday(parseISO(t.due_date)));

        const parts: string[] = [];
        if (overdue.length > 0)
          parts.push(`${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}`);
        if (todayTasks.length > 0)
          parts.push(`${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''} due today`);

        new Notification('Task Reminder', {
          body: parts.join(' and '),
          icon: '/favicon.ico',
        });
      }
    };

    requestAndNotify();
  }, [dueTasks.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return { dueTasks, dismissed, dismiss: () => setDismissed(true) };
}
