import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  isThisYear,
  isPast,
  startOfDay,
  parseISO,
  addDays,
  addWeeks,
  addMonths,
  nextMonday,
  nextSaturday,
  nextSunday,
  isBefore,
} from "date-fns";

export function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isYesterday(date)) return "Yesterday";

  const now = new Date();
  const diffDays = Math.ceil(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays > 0 && diffDays < 7) {
    return format(date, "EEEE");
  }

  if (isThisYear(date)) {
    return format(date, "MMM d");
  }
  return format(date, "MMM d yyyy");
}

export function getDueDateColor(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = parseISO(dateStr);
  if (isToday(date)) return "text-todoist-priority-3 font-semibold";
  if (isBefore(startOfDay(date), startOfDay(new Date()))) return "text-todoist-priority-1 font-semibold";
  if (isTomorrow(date)) return "text-todoist-priority-2";
  const diffDays = Math.ceil(
    (startOfDay(date).getTime() - startOfDay(new Date()).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays <= 7) return "text-purple-600";
  return "text-todoist-text-secondary";
}

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return isBefore(parseISO(dateStr), startOfDay(new Date()));
}

export function parseDateInput(input: string): { date: string | null; recurring: string | null } {
  const lower = input.toLowerCase().trim();

  // Recurring patterns
  if (lower.startsWith("every ") || lower === "daily" || lower === "weekly" || lower === "monthly" || lower === "yearly") {
    const today = format(new Date(), "yyyy-MM-dd");
    return { date: today, recurring: lower };
  }

  // Relative dates
  const now = new Date();
  if (lower === "today" || lower === "tod") {
    return { date: format(now, "yyyy-MM-dd"), recurring: null };
  }
  if (lower === "tomorrow" || lower === "tom") {
    return { date: format(addDays(now, 1), "yyyy-MM-dd"), recurring: null };
  }
  if (lower === "next week") {
    return { date: format(nextMonday(now), "yyyy-MM-dd"), recurring: null };
  }
  if (lower === "next weekend") {
    return { date: format(nextSaturday(now), "yyyy-MM-dd"), recurring: null };
  }
  if (lower === "next month") {
    return { date: format(addMonths(now, 1), "yyyy-MM-dd"), recurring: null };
  }

  // Day names
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayIdx = dayNames.indexOf(lower);
  if (dayIdx !== -1) {
    let target = new Date(now);
    const currentDay = target.getDay();
    let daysToAdd = dayIdx - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    target = addDays(now, daysToAdd);
    return { date: format(target, "yyyy-MM-dd"), recurring: null };
  }

  // Short day names
  const shortDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const shortDayIdx = shortDays.indexOf(lower);
  if (shortDayIdx !== -1) {
    let target = new Date(now);
    const currentDay = target.getDay();
    let daysToAdd = shortDayIdx - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    target = addDays(now, daysToAdd);
    return { date: format(target, "yyyy-MM-dd"), recurring: null };
  }

  // "in X days/weeks/months"
  const inMatch = lower.match(/^in\s+(\d+)\s+(day|week|month)s?$/);
  if (inMatch) {
    const num = parseInt(inMatch[1]);
    const unit = inMatch[2];
    if (unit === "day") return { date: format(addDays(now, num), "yyyy-MM-dd"), recurring: null };
    if (unit === "week") return { date: format(addWeeks(now, num), "yyyy-MM-dd"), recurring: null };
    if (unit === "month") return { date: format(addMonths(now, num), "yyyy-MM-dd"), recurring: null };
  }

  // Try parsing as date string (various formats)
  // MM/DD, MM/DD/YYYY, YYYY-MM-DD, Mon DD, Month DD
  const monthNames: Record<string, number> = {
    jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
    apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
    aug: 7, august: 7, sep: 8, september: 8, oct: 9, october: 9,
    nov: 10, november: 10, dec: 11, december: 11,
  };

  // "Jan 15" or "January 15"
  const monthDayMatch = lower.match(/^(\w+)\s+(\d{1,2})(?:\s*,?\s*(\d{4}))?$/);
  if (monthDayMatch) {
    const monthNum = monthNames[monthDayMatch[1]];
    if (monthNum !== undefined) {
      const day = parseInt(monthDayMatch[2]);
      const year = monthDayMatch[3] ? parseInt(monthDayMatch[3]) : now.getFullYear();
      const date = new Date(year, monthNum, day);
      if (date < startOfDay(now) && !monthDayMatch[3]) {
        date.setFullYear(date.getFullYear() + 1);
      }
      return { date: format(date, "yyyy-MM-dd"), recurring: null };
    }
  }

  // "15 Jan" or "15 January"
  const dayMonthMatch = lower.match(/^(\d{1,2})\s+(\w+)(?:\s*,?\s*(\d{4}))?$/);
  if (dayMonthMatch) {
    const monthNum = monthNames[dayMonthMatch[2]];
    if (monthNum !== undefined) {
      const day = parseInt(dayMonthMatch[1]);
      const year = dayMonthMatch[3] ? parseInt(dayMonthMatch[3]) : now.getFullYear();
      const date = new Date(year, monthNum, day);
      if (date < startOfDay(now) && !dayMonthMatch[3]) {
        date.setFullYear(date.getFullYear() + 1);
      }
      return { date: format(date, "yyyy-MM-dd"), recurring: null };
    }
  }

  // YYYY-MM-DD
  const isoMatch = lower.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return { date: lower, recurring: null };
  }

  // MM/DD or MM/DD/YYYY
  const slashMatch = lower.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (slashMatch) {
    const month = parseInt(slashMatch[1]) - 1;
    const day = parseInt(slashMatch[2]);
    let year = slashMatch[3] ? parseInt(slashMatch[3]) : now.getFullYear();
    if (year < 100) year += 2000;
    const date = new Date(year, month, day);
    return { date: format(date, "yyyy-MM-dd"), recurring: null };
  }

  return { date: null, recurring: null };
}

export function groupTasksByDate(tasks: { dueDate: string | null }[]): Map<string, typeof tasks> {
  const groups = new Map<string, typeof tasks>();
  for (const task of tasks) {
    const key = task.dueDate || "no-date";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(task);
  }
  return groups;
}

export function formatDateHeader(dateStr: string): string {
  if (dateStr === "no-date") return "No date";
  const date = parseISO(dateStr);
  if (isToday(date)) return `Today ${format(date, "EEE")}`;
  if (isTomorrow(date)) return `Tomorrow ${format(date, "EEE")}`;
  if (isYesterday(date)) return "Yesterday";
  if (isThisYear(date)) return format(date, "MMM d · EEEE");
  return format(date, "MMM d yyyy · EEEE");
}
