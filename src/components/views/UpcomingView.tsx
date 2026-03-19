"use client";

import { useStore } from "@/store/useStore";
import TaskItem from "@/components/TaskItem";
import AddTask from "@/components/AddTask";
import { CalendarRange } from "lucide-react";
import { format, addDays, parseISO, startOfDay, endOfDay } from "date-fns";
import { formatDateHeader } from "@/utils/dates";

export default function UpcomingView() {
  const upcomingTasks = useStore((state) => state.getUpcomingTasks());

  const today = startOfDay(new Date());
  const dateGroups = new Map<string, typeof upcomingTasks>();

  for (let i = 0; i < 14; i++) {
    const date = addDays(today, i);
    const dateStr = format(date, "yyyy-MM-dd");
    dateGroups.set(dateStr, []);
  }
  dateGroups.set("no-date", []);

  upcomingTasks.forEach((task) => {
    if (!task.dueDate) {
      dateGroups.get("no-date")!.push(task);
    } else {
      const taskDate = parseISO(task.dueDate);
      if (taskDate <= endOfDay(addDays(today, 13))) {
        const dateStr = task.dueDate;
        if (dateGroups.has(dateStr)) {
          dateGroups.get(dateStr)!.push(task);
        } else {
          dateGroups.set(dateStr, [task]);
        }
      } else {
        if (!dateGroups.has("later")) dateGroups.set("later", []);
        dateGroups.get("later")!.push(task);
      }
    }
  });

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <CalendarRange className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-[#202020]">Upcoming</h1>
        </div>
      </div>

      {Array.from(dateGroups.entries()).map(([dateStr, tasks]) => {
        if (tasks.length === 0 && dateStr !== "no-date") return null;
        if (dateStr === "later" && tasks.length === 0) return null;

        const isNoDate = dateStr === "no-date";
        const isLater = dateStr === "later";

        return (
          <div key={dateStr} className="mb-8">
            <div className="border-b border-gray-200 pb-2 mb-3">
              <h2 className="text-sm font-semibold text-[#202020]">
                {isNoDate ? "No date" : isLater ? "Later" : formatDateHeader(dateStr)}
              </h2>
            </div>

            {tasks.length > 0 && (
              <div className="space-y-0.5 mb-3">
                {tasks.map((task) => (
                  <TaskItem key={task.id} task={task} showProject />
                ))}
              </div>
            )}

            {!isNoDate && !isLater && (
              <AddTask projectId="inbox" sectionId={null} defaultDate={dateStr} />
            )}
          </div>
        );
      })}

      {upcomingTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No upcoming tasks</p>
        </div>
      )}
    </div>
  );
}
