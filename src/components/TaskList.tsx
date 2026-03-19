"use client";

import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskItem from "@/components/TaskItem";
import { Task } from "@/types";
import { useStore } from "@/store/useStore";

interface TaskListProps {
  tasks: Task[];
  projectId: string;
  sectionId?: string | null;
}

export default function TaskList({ tasks, projectId, sectionId = null }: TaskListProps) {
  const reorderTasks = useStore((state) => state.reorderTasks);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedTasks = [...tasks];
    const [movedTask] = reorderedTasks.splice(oldIndex, 1);
    reorderedTasks.splice(newIndex, 0, movedTask);

    reorderTasks(
      projectId,
      sectionId,
      reorderedTasks.map((t) => t.id)
    );
  };

  if (tasks.length === 0) return null;

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-0.5">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
