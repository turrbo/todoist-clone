"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  X,
  MoreHorizontal,
  Trash2,
  Calendar,
  Flag,
  Tag,
  FolderOpen,
  ChevronDown,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { Priority, PRIORITY_COLORS, PROJECT_COLORS } from "@/types";
import { formatDueDate, parseDateInput } from "@/utils/dates";
import { formatDistanceToNow } from "date-fns";
import AddTask from "@/components/AddTask";

interface TaskDetailProps {
  taskId: string;
  onClose: () => void;
}

export default function TaskDetail({ taskId, onClose }: TaskDetailProps) {
  const {
    getTaskById,
    getProjectById,
    updateTask,
    deleteTask,
    completeTask,
    uncompleteTask,
    getSubtasks,
    addComment,
    projects,
    labels,
  } = useStore();

  const task = getTaskById(taskId);
  const project = task ? getProjectById(task.projectId) : null;
  const subtasks = task ? getSubtasks(taskId) : [];

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task?.content || "");
  const [editedDescription, setEditedDescription] = useState(
    task?.description || ""
  );
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [dateInput, setDateInput] = useState("");
  const [commentContent, setCommentContent] = useState("");

  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const projectPickerRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const priorityPickerRef = useRef<HTMLDivElement>(null);
  const labelPickerRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (task) {
      setEditedTitle(task.content);
      setEditedDescription(task.description);
    }
  }, [task]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setShowMoreMenu(false);
      }
      if (
        projectPickerRef.current &&
        !projectPickerRef.current.contains(event.target as Node)
      ) {
        setShowProjectPicker(false);
      }
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
      if (
        priorityPickerRef.current &&
        !priorityPickerRef.current.contains(event.target as Node)
      ) {
        setShowPriorityPicker(false);
      }
      if (
        labelPickerRef.current &&
        !labelPickerRef.current.contains(event.target as Node)
      ) {
        setShowLabelPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!task || !project) {
    return null;
  }

  const handleTitleBlur = () => {
    if (editedTitle.trim() && editedTitle !== task.content) {
      updateTask(taskId, { content: editedTitle.trim() });
    } else if (!editedTitle.trim()) {
      setEditedTitle(task.content);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTitleBlur();
    } else if (e.key === "Escape") {
      setEditedTitle(task.content);
      setIsEditingTitle(false);
    }
  };

  const handleDescriptionBlur = () => {
    if (editedDescription !== task.description) {
      updateTask(taskId, { description: editedDescription });
    }
  };

  const handleToggleComplete = () => {
    if (task.completed) {
      uncompleteTask(taskId);
    } else {
      completeTask(taskId);
    }
  };

  const handleDelete = () => {
    deleteTask(taskId);
    onClose();
  };

  const handleProjectChange = (projectId: string) => {
    updateTask(taskId, { projectId, sectionId: null });
    setShowProjectPicker(false);
  };

  const handleDateSelect = (quickOption: string) => {
    const parsed = parseDateInput(quickOption);
    updateTask(taskId, { dueDate: parsed.date, recurring: parsed.recurring });
    setDateInput(quickOption);
    setShowDatePicker(false);
  };

  const handleDateInputChange = (value: string) => {
    setDateInput(value);
    const parsed = parseDateInput(value);
    if (parsed.date) {
      updateTask(taskId, { dueDate: parsed.date, recurring: parsed.recurring });
    }
  };

  const handleDateInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setShowDatePicker(false);
    }
  };

  const clearDueDate = () => {
    updateTask(taskId, { dueDate: null, recurring: null });
    setDateInput("");
  };

  const handlePrioritySelect = (p: Priority) => {
    updateTask(taskId, { priority: p });
    setShowPriorityPicker(false);
  };

  const handleLabelToggle = (labelName: string) => {
    const currentLabels = task.labels || [];
    const newLabels = currentLabels.includes(labelName)
      ? currentLabels.filter((l) => l !== labelName)
      : [...currentLabels, labelName];
    updateTask(taskId, { labels: newLabels });
  };

  const handleAddComment = () => {
    if (commentContent.trim()) {
      addComment(taskId, commentContent.trim());
      setCommentContent("");
    }
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const getPriorityLabel = (priority: Priority) => {
    const labels = {
      1: "P1",
      2: "P2",
      3: "P3",
      4: "P4",
    };
    return labels[priority];
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[450px] bg-white shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: PROJECT_COLORS[project.color] || "#808080",
            }}
          />
          <span className="font-medium">{project.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>
            {showMoreMenu && (
              <div
                ref={moreMenuRef}
                className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 w-48"
              >
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete task</span>
                </button>
              </div>
            )}
          </div>
          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          {/* Task checkbox and title */}
          <div className="flex items-start gap-3">
            <button
              onClick={handleToggleComplete}
              className="mt-1 flex-shrink-0"
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  task.completed
                    ? "bg-gray-400 border-gray-400"
                    : "border-gray-400 hover:border-gray-500"
                }`}
                style={{
                  borderColor:
                    !task.completed && task.priority !== 4
                      ? PRIORITY_COLORS[task.priority]
                      : undefined,
                }}
              >
                {task.completed && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </button>
            <div className="flex-1 min-w-0">
              {isEditingTitle ? (
                <textarea
                  ref={titleInputRef}
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  onKeyDown={handleTitleKeyDown}
                  className="w-full text-lg font-semibold resize-none border border-gray-300 rounded px-2 py-1 outline-none focus:border-[#246fe0] focus:ring-1 focus:ring-[#246fe0]"
                  rows={1}
                  style={{
                    minHeight: "32px",
                    maxHeight: "150px",
                    overflow: "hidden",
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "32px";
                    target.style.height = target.scrollHeight + "px";
                  }}
                />
              ) : (
                <div
                  onClick={() => setIsEditingTitle(true)}
                  className={`text-lg font-semibold cursor-text px-2 py-1 -ml-2 rounded hover:bg-gray-50 ${
                    task.completed ? "line-through text-gray-400" : ""
                  }`}
                >
                  {task.content}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <textarea
              ref={descriptionInputRef}
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Description"
              className="w-full text-sm text-gray-700 resize-none border-none outline-none focus:outline-none p-2 -ml-2 placeholder-gray-400 rounded hover:bg-gray-50 focus:bg-gray-50"
              rows={3}
              style={{
                minHeight: "60px",
                maxHeight: "200px",
              }}
            />
          </div>

          {/* Subtasks section */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Sub-tasks
            </div>
            <div className="space-y-2">
              {subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-start gap-3">
                  <button
                    onClick={() => {
                      if (subtask.completed) {
                        uncompleteTask(subtask.id);
                      } else {
                        completeTask(subtask.id);
                      }
                    }}
                    className="mt-0.5 flex-shrink-0"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        subtask.completed
                          ? "bg-gray-400 border-gray-400"
                          : "border-gray-400 hover:border-gray-500"
                      }`}
                      style={{
                        borderColor:
                          !subtask.completed && subtask.priority !== 4
                            ? PRIORITY_COLORS[subtask.priority]
                            : undefined,
                      }}
                    >
                      {subtask.completed && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                  <span
                    className={`text-sm flex-1 ${
                      subtask.completed ? "line-through text-gray-400" : ""
                    }`}
                  >
                    {subtask.content}
                  </span>
                </div>
              ))}
              {showAddSubtask ? (
                <div className="mt-2">
                  <AddTask
                    projectId={task.projectId}
                    sectionId={task.sectionId}
                    parentId={taskId}
                    onClose={() => setShowAddSubtask(false)}
                    autoFocus={true}
                    defaultPriority={task.priority}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowAddSubtask(true)}
                  className="flex items-center gap-2 text-gray-500 hover:text-[#dc4c3e] transition-colors py-1 text-sm"
                >
                  <span className="text-lg leading-none">+</span>
                  <span>Add sub-task</span>
                </button>
              )}
            </div>
          </div>

          {/* Metadata section */}
          <div className="space-y-2">
            {/* Project */}
            <div className="relative">
              <button
                onClick={() => setShowProjectPicker(!showProjectPicker)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center gap-2 text-gray-600">
                  <FolderOpen className="w-4 h-4" />
                  <span className="font-medium">Project</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        PROJECT_COLORS[project.color] || "#808080",
                    }}
                  />
                  <span className="text-gray-700">{project.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </button>
              {showProjectPicker && (
                <div
                  ref={projectPickerRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 max-h-60 overflow-y-auto"
                >
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleProjectChange(p.id)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: PROJECT_COLORS[p.color] || "#808080",
                        }}
                      />
                      <span>{p.name}</span>
                      {p.id === task.projectId && (
                        <span className="ml-auto text-[#246fe0]">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Due date */}
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Due date</span>
                </div>
                <div className="flex items-center gap-2">
                  {task.dueDate ? (
                    <>
                      <span className="text-gray-700">
                        {formatDueDate(task.dueDate)}
                      </span>
                      {task.recurring && (
                        <span className="text-purple-600">↻</span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearDueDate();
                        }}
                        className="p-0.5 hover:bg-gray-200 rounded"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-400">No date</span>
                  )}
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </button>
              {showDatePicker && (
                <div
                  ref={datePickerRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50"
                >
                  <div className="space-y-1">
                    <button
                      onClick={() => handleDateSelect("today")}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => handleDateSelect("tomorrow")}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      Tomorrow
                    </button>
                    <button
                      onClick={() => handleDateSelect("next week")}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      Next week
                    </button>
                    <button
                      onClick={() => handleDateSelect("next weekend")}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      Next weekend
                    </button>
                    <button
                      onClick={() => {
                        clearDueDate();
                        setShowDatePicker(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded text-gray-500"
                    >
                      No date
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <input
                      type="text"
                      value={dateInput}
                      onChange={(e) => handleDateInputChange(e.target.value)}
                      onKeyDown={handleDateInputKeyDown}
                      placeholder="Type a due date..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded outline-none focus:border-[#246fe0] focus:ring-1 focus:ring-[#246fe0]"
                    />
                    {task.recurring && (
                      <div className="text-xs text-purple-600 px-3 py-1">
                        Recurring: {task.recurring}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Priority */}
            <div className="relative">
              <button
                onClick={() => setShowPriorityPicker(!showPriorityPicker)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center gap-2 text-gray-600">
                  <Flag className="w-4 h-4" />
                  <span className="font-medium">Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag
                    className="w-4 h-4"
                    style={{
                      color: PRIORITY_COLORS[task.priority],
                      fill:
                        task.priority !== 4
                          ? PRIORITY_COLORS[task.priority]
                          : "none",
                    }}
                  />
                  <span className="text-gray-700">
                    {getPriorityLabel(task.priority)}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </button>
              {showPriorityPicker && (
                <div
                  ref={priorityPickerRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
                >
                  {[1, 2, 3, 4].map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePrioritySelect(p as Priority)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Flag
                        className="w-4 h-4"
                        style={{
                          color: PRIORITY_COLORS[p as Priority],
                          fill:
                            p !== 4 ? PRIORITY_COLORS[p as Priority] : "none",
                        }}
                      />
                      <span>Priority {p}</span>
                      {p === task.priority && (
                        <span className="ml-auto text-[#246fe0]">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Labels */}
            <div className="relative">
              <button
                onClick={() => setShowLabelPicker(!showLabelPicker)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center gap-2 text-gray-600">
                  <Tag className="w-4 h-4" />
                  <span className="font-medium">Labels</span>
                </div>
                <div className="flex items-center gap-2">
                  {task.labels && task.labels.length > 0 ? (
                    <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                      {task.labels.map((labelName) => {
                        const label = labels.find((l) => l.name === labelName);
                        return (
                          <span
                            key={labelName}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700"
                          >
                            {label && (
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    label.color === "charcoal"
                                      ? "#808080"
                                      : label.color,
                                }}
                              />
                            )}
                            {labelName}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-gray-400">No labels</span>
                  )}
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              </button>
              {showLabelPicker && (
                <div
                  ref={labelPickerRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 max-h-60 overflow-y-auto"
                >
                  {labels.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No labels yet
                    </div>
                  ) : (
                    labels.map((label) => (
                      <button
                        key={label.id}
                        onClick={() => handleLabelToggle(label.name)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              label.color === "charcoal"
                                ? "#808080"
                                : label.color,
                          }}
                        />
                        <span>{label.name}</span>
                        {task.labels?.includes(label.name) && (
                          <span className="ml-auto text-[#246fe0]">✓</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Comments section */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Comments
            </div>
            <div className="space-y-3 mb-4">
              {task.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-50 rounded-lg p-3 text-sm"
                >
                  <div className="text-gray-700 mb-1">{comment.content}</div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <textarea
                ref={commentInputRef}
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                onKeyDown={handleCommentKeyDown}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#246fe0] focus:ring-1 focus:ring-[#246fe0] resize-none placeholder-gray-400"
                rows={3}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddComment}
                  disabled={!commentContent.trim()}
                  className={`px-4 py-2 text-sm text-white rounded-lg transition-colors ${
                    commentContent.trim()
                      ? "bg-[#dc4c3e] hover:bg-[#c5372b]"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  Add comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
