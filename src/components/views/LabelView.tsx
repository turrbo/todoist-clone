"use client";

import { useStore } from "@/store/useStore";
import TaskItem from "@/components/TaskItem";
import AddTask from "@/components/AddTask";
import { Tag } from "lucide-react";
import { PROJECT_COLORS } from "@/types";

interface LabelViewProps {
  labelId: string;
}

export default function LabelView({ labelId }: LabelViewProps) {
  const labels = useStore((state) => state.labels);
  const label = labels.find((l) => l.id === labelId);
  const tasks = useStore((state) => (label ? state.getTasksByLabel(label.name) : []));

  if (!label) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Label not found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Tag
            className="w-6 h-6"
            style={{ color: PROJECT_COLORS[label.color] }}
          />
          <h1 className="text-2xl font-bold text-[#202020]">{label.name}</h1>
        </div>
      </div>

      {/* Tasks */}
      {tasks.length > 0 ? (
        <div className="space-y-0.5 mb-4">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} showProject />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No tasks with this label</p>
        </div>
      )}

      {/* Add task with this label */}
      <div className="mt-6">
        <AddTask projectId="inbox" sectionId={null} defaultLabels={[label.name]} />
      </div>
    </div>
  );
}
