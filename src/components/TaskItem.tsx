"use client";

import { useState, useRef, useEffect } from "react";
import {
  GripVertical,
  Calendar,
  Tag,
  Flag,
  MessageSquare,
  MoreHorizontal,
  Edit3,
  CheckCircle2,
} from "lucide-react";
import type { Task } from "@/types";
import { PRIORITY_COLORS, PROJECT_COLORS } from "@/types";
import { useStore } from "@/store/useStore";
import { formatDueDate, getDueDateColor } from "@/utils/dates";
import { useApp } from "@/components/AppProvider";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskItemProps {
  task: Task;
  showProject?: boolean;
}

export default function TaskItem({
  task,
  showProject = false,
}: TaskItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isCheckboxHovered, setIsCheckboxHovered] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const { setSelectedTaskId } = useApp();

  const { completeTask, getSubtasks, labels, getProjectById } = useStore();
  const subtasks = getSubtasks(task.id);
  const completedSubtasks = subtasks.filter((st) => st.completed).length;
  const totalSubtasks = subtasks.length;

  const project = showProject ? getProjectById(task.projectId) : undefined;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const priorityColor = PRIORITY_COLORS[task.priority];
  const borderWidth = task.priority === 4 ? "1.5px" : "2px";

  const handleCheckboxClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCompleting(true);

    // Brief animation delay
    setTimeout(() => {
      completeTask(task.id);
    }, 300);
  };

  const handleRowClick = () => {
    if (!isCompleting) {
      setSelectedTaskId(task.id);
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTaskId(task.id);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get label objects for the task
  const taskLabels = labels.filter((l) => task.labels.includes(l.name));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative flex items-start gap-2 py-2 px-0 border-b border-[#f0eded]
        transition-all duration-200 min-h-[40px]
        ${isHovered && !isDragging ? "bg-[#fafafa]" : "bg-transparent"}
        ${isDragging ? "opacity-50" : "opacity-100"}
        ${isCompleting ? "opacity-0 transition-opacity duration-300" : ""}
        cursor-pointer
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleRowClick}
      {...attributes}
    >
      {/* Left side: Drag handle + Checkbox */}
      <div className="flex items-center gap-2 flex-shrink-0 pt-[3px]">
        {/* Drag handle - only visible on hover */}
        <div
          {...listeners}
          className={`
            cursor-grab active:cursor-grabbing
            transition-opacity duration-150
            ${isHovered ? "opacity-100" : "opacity-0"}
          `}
        >
          <GripVertical className="w-4 h-4 text-[#808080]" />
        </div>

        {/* Custom circular checkbox */}
        <button
          onClick={handleCheckboxClick}
          onMouseEnter={() => setIsCheckboxHovered(true)}
          onMouseLeave={() => setIsCheckboxHovered(false)}
          className="relative flex items-center justify-center flex-shrink-0 cursor-pointer"
          aria-label={`Complete task: ${task.content}`}
        >
          <div
            className={`
              w-[18px] h-[18px] rounded-full
              transition-all duration-150
              flex items-center justify-center
            `}
            style={{
              border: `${borderWidth} solid ${priorityColor}`,
              backgroundColor: isCheckboxHovered || isCompleting
                ? `${priorityColor}15`
                : "transparent",
            }}
          >
            {isCompleting && (
              <CheckCircle2
                className="w-3 h-3"
                style={{ color: priorityColor }}
              />
            )}
          </div>
        </button>
      </div>

      {/* Center: Task content */}
      <div className="flex-1 min-w-0 pt-[1px]">
        {/* Task title */}
        <div
          className={`
            text-[14px] leading-[1.4] mb-1
            ${task.completed ? "line-through text-[#808080]" : "text-[#202020]"}
          `}
        >
          {task.content}
        </div>

        {/* Description preview */}
        {task.description && (
          <div className="text-[13px] text-[#808080] leading-[1.3] truncate mb-1">
            {task.description}
          </div>
        )}

        {/* Metadata row */}
        {(task.dueDate || taskLabels.length > 0 || totalSubtasks > 0 || task.comments.length > 0 || (showProject && project)) && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Due date */}
            {task.dueDate && (
              <div
                className={`
                  text-[12px] flex items-center gap-1
                  ${getDueDateColor(task.dueDate)}
                `}
              >
                <Calendar className="w-3 h-3" />
                <span>{formatDueDate(task.dueDate)}</span>
              </div>
            )}

            {/* Labels */}
            {taskLabels.map((label) => (
              <div
                key={label.id}
                className="flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-medium"
                style={{
                  backgroundColor: `${label.color}15`,
                  color: label.color,
                }}
              >
                {label.name}
              </div>
            ))}

            {/* Subtask count */}
            {totalSubtasks > 0 && (
              <div className="text-[12px] text-[#808080] flex items-center gap-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-[#808080]"
                >
                  <path
                    d="M2 4h12M2 8h12M2 12h12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span>
                  {completedSubtasks}/{totalSubtasks}
                </span>
              </div>
            )}

            {/* Comment count */}
            {task.comments.length > 0 && (
              <div className="text-[12px] text-[#808080] flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>{task.comments.length}</span>
              </div>
            )}

            {/* Project badge (if showProject is true) */}
            {showProject && project && (
              <div className="flex items-center gap-1.5 text-[12px] text-[#808080]">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: PROJECT_COLORS[project.color] }}
                />
                <span>{project.name}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side: Action icons (visible on hover) */}
      <div
        className={`
          flex items-center gap-1 flex-shrink-0 pt-[1px]
          transition-opacity duration-150
          ${isHovered && !isDragging ? "opacity-100" : "opacity-0"}
        `}
      >
        <button
          onClick={handleActionClick}
          className="p-1 hover:bg-[#f3f3f3] rounded transition-colors duration-150"
          aria-label="Edit task"
        >
          <Edit3 className="w-4 h-4 text-[#808080] hover:text-[#202020]" />
        </button>
        <button
          onClick={handleActionClick}
          className="p-1 hover:bg-[#f3f3f3] rounded transition-colors duration-150"
          aria-label="Set due date"
        >
          <Calendar className="w-4 h-4 text-[#808080] hover:text-[#202020]" />
        </button>
        <button
          onClick={handleActionClick}
          className="p-1 hover:bg-[#f3f3f3] rounded transition-colors duration-150"
          aria-label="Add label"
        >
          <Tag className="w-4 h-4 text-[#808080] hover:text-[#202020]" />
        </button>
        <button
          onClick={handleActionClick}
          className="p-1 hover:bg-[#f3f3f3] rounded transition-colors duration-150"
          aria-label="Set priority"
        >
          <Flag className="w-4 h-4 text-[#808080] hover:text-[#202020]" />
        </button>
        <button
          onClick={handleActionClick}
          className="p-1 hover:bg-[#f3f3f3] rounded transition-colors duration-150"
          aria-label="Add comment"
        >
          <MessageSquare className="w-4 h-4 text-[#808080] hover:text-[#202020]" />
        </button>
        <button
          onClick={handleActionClick}
          className="p-1 hover:bg-[#f3f3f3] rounded transition-colors duration-150"
          aria-label="More options"
        >
          <MoreHorizontal className="w-4 h-4 text-[#808080] hover:text-[#202020]" />
        </button>
      </div>
    </div>
  );
}
