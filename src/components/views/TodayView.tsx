"use client";

import { useStore } from "@/store/useStore";
import TaskItem from "@/components/TaskItem";
import AddTask from "@/components/AddTask";
import { CalendarCheck2 } from "lucide-react";
import { format } from "date-fns";
import { PROJECT_COLORS } from "@/types";

export default function TodayView() {
  const todayTasks = useStore((state) => state.getTodayTasks());
  const overdueTasks = useStore((state) => state.getOverdueTasks());
  const getProjectById = useStore((state) => state.getProjectById);

  const today = new Date();
  const dateStr = format(today, "EEE MMM d");

  const tasksByProject = new Map<string, typeof todayTasks>();
  todayTasks.forEach((task) => {
    const projectId = task.projectId;
    if (!tasksByProject.has(projectId)) {
      tasksByProject.set(projectId, []);
    }
    tasksByProject.get(projectId)!.push(task);
  });

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <CalendarCheck2 className="w-6 h-6 text-green-600" />
          <h1 className="text-2xl font-bold text-[#202020]">Today</h1>
        </div>
        <p className="text-sm text-gray-500">{dateStr}</p>
      </div>

      {overdueTasks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-[#d1453b] uppercase tracking-wider mb-3">
            Overdue
          </h2>
          <div className="space-y-0.5">
            {overdueTasks.map((task) => (
              <TaskItem key={task.id} task={task} showProject />
            ))}
          </div>
        </div>
      )}

      {tasksByProject.size === 0 && overdueTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">All clear for today!</p>
          <AddTask projectId="inbox" sectionId={null} defaultDate={format(today, "yyyy-MM-dd")} />
        </div>
      ) : (
        <>
          {Array.from(tasksByProject.entries()).map(([projectId, tasks]) => {
            const project = getProjectById(projectId);
            if (!project) return null;

            return (
              <div key={projectId} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: PROJECT_COLORS[project.color] }}
                  />
                  <h3 className="text-sm font-semibold text-[#202020]">
                    {project.name}
                  </h3>
                </div>
                <div className="space-y-0.5">
                  {tasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              </div>
            );
          })}
          <div className="mt-6">
            <AddTask projectId="inbox" sectionId={null} defaultDate={format(today, "yyyy-MM-dd")} />
          </div>
        </>
      )}
    </div>
  );
}
