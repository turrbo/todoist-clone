"use client";
import React, { useState, useRef, useEffect } from "react";
import { Plus, Calendar, Flag, Tag, X } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Priority, PRIORITY_COLORS } from "@/types";
import { parseDateInput, formatDueDate } from "@/utils/dates";

interface AddTaskProps {
  projectId?: string;
  sectionId?: string | null;
  parentId?: string | null;
  onClose?: () => void;
  autoFocus?: boolean;
  defaultPriority?: Priority;
  defaultDate?: string | null;
  defaultLabels?: string[];
}

export default function AddTask({
  projectId,
  sectionId = null,
  parentId = null,
  onClose,
  autoFocus = false,
  defaultPriority = 4,
  defaultDate = null,
  defaultLabels = [],
}: AddTaskProps) {
  const [isExpanded, setIsExpanded] = useState(autoFocus);
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(defaultDate);
  const [recurring, setRecurring] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>(defaultPriority);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(defaultLabels);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [dateInput, setDateInput] = useState("");

  const contentInputRef = useRef<HTMLTextAreaElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const priorityPickerRef = useRef<HTMLDivElement>(null);
  const labelPickerRef = useRef<HTMLDivElement>(null);

  const { addTask, labels, projects, getInboxProject } = useStore();

  useEffect(() => {
    if (isExpanded && contentInputRef.current) {
      contentInputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setContent("");
    setDescription("");
    setDueDate(null);
    setRecurring(null);
    setPriority(defaultPriority);
    setSelectedLabels([]);
    setDateInput("");
    onClose?.();
  };

  const handleAddTask = () => {
    if (!content.trim()) return;

    addTask({
      content: content.trim(),
      description: description.trim(),
      projectId: projectId || getInboxProject().id,
      sectionId,
      parentId,
      priority,
      dueDate,
      recurring,
      labels: selectedLabels,
    });

    // Reset form but keep expanded
    setContent("");
    setDescription("");
    setDueDate(null);
    setRecurring(null);
    setPriority(defaultPriority);
    setSelectedLabels([]);
    setDateInput("");
    contentInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleAddTask();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleDateSelect = (quickOption: string) => {
    const parsed = parseDateInput(quickOption);
    setDueDate(parsed.date);
    setRecurring(parsed.recurring);
    setDateInput(quickOption);
    setShowDatePicker(false);
  };

  const handleDateInputChange = (value: string) => {
    setDateInput(value);
    const parsed = parseDateInput(value);
    if (parsed.date) {
      setDueDate(parsed.date);
      setRecurring(parsed.recurring);
    }
  };

  const handleDateInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setShowDatePicker(false);
    }
  };

  const clearDueDate = () => {
    setDueDate(null);
    setRecurring(null);
    setDateInput("");
  };

  const handlePrioritySelect = (p: Priority) => {
    setPriority(p);
    setShowPriorityPicker(false);
  };

  const handleLabelToggle = (labelName: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelName)
        ? prev.filter((l) => l !== labelName)
        : [...prev, labelName]
    );
  };

  if (!isExpanded) {
    return (
      <button
        onClick={handleExpand}
        className="flex items-center gap-2 text-[#dc4c3e] hover:text-[#c5372b] transition-colors py-2 px-1 group w-full text-left"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm">Add task</span>
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2 shadow-sm">
      <div className="space-y-2">
        {/* Task name input */}
        <textarea
          ref={contentInputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Task name"
          className="w-full text-sm resize-none border-none outline-none focus:outline-none p-0 placeholder-gray-400"
          rows={1}
          style={{
            minHeight: "24px",
            maxHeight: "150px",
            overflow: "hidden",
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "24px";
            target.style.height = target.scrollHeight + "px";
          }}
        />

        {/* Description input */}
        <textarea
          ref={descriptionInputRef}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Description"
          className="w-full text-xs text-gray-600 resize-none border-none outline-none focus:outline-none p-0 placeholder-gray-400"
          rows={1}
          style={{
            minHeight: "20px",
            maxHeight: "100px",
            overflow: "hidden",
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "20px";
            target.style.height = target.scrollHeight + "px";
          }}
        />

        {/* Toolbar */}
        <div className="flex items-center gap-2 pt-2">
          {/* Due date button */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded hover:bg-gray-100 transition-colors ${
                dueDate
                  ? "text-[#246fe0] bg-blue-50 hover:bg-blue-100"
                  : "text-gray-600"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{dueDate ? formatDueDate(dueDate) : "Due date"}</span>
              {dueDate && (
                <X
                  className="w-3 h-3 ml-0.5 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearDueDate();
                  }}
                />
              )}
              {recurring && (
                <span className="text-[10px] ml-0.5 text-purple-600">↻</span>
              )}
            </button>

            {/* Date picker dropdown */}
            {showDatePicker && (
              <div
                ref={datePickerRef}
                className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 w-60"
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
                    onClick={() => handleDateSelect("")}
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
                  {recurring && (
                    <div className="text-xs text-purple-600 px-3 py-1">
                      Recurring: {recurring}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Priority button */}
          <div className="relative">
            <button
              onClick={() => setShowPriorityPicker(!showPriorityPicker)}
              className="flex items-center gap-1.5 px-2 py-1 text-xs rounded hover:bg-gray-100 transition-colors text-gray-600"
            >
              <Flag
                className="w-3.5 h-3.5"
                style={{
                  color: PRIORITY_COLORS[priority],
                  fill: priority !== 4 ? PRIORITY_COLORS[priority] : "none",
                }}
              />
              <span>Priority</span>
            </button>

            {/* Priority picker dropdown */}
            {showPriorityPicker && (
              <div
                ref={priorityPickerRef}
                className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 w-40"
              >
                <div className="space-y-1">
                  {[1, 2, 3, 4].map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePrioritySelect(p as Priority)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2 ${
                        priority === p ? "bg-gray-100" : ""
                      }`}
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
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Label button */}
          <div className="relative">
            <button
              onClick={() => setShowLabelPicker(!showLabelPicker)}
              className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded hover:bg-gray-100 transition-colors ${
                selectedLabels.length > 0
                  ? "text-purple-600 bg-purple-50 hover:bg-purple-100"
                  : "text-gray-600"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>
                {selectedLabels.length > 0
                  ? `${selectedLabels.length} label${selectedLabels.length > 1 ? "s" : ""}`
                  : "Labels"}
              </span>
            </button>

            {/* Label picker dropdown */}
            {showLabelPicker && (
              <div
                ref={labelPickerRef}
                className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 w-48 max-h-60 overflow-y-auto"
              >
                {labels.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-500">
                    No labels yet
                  </div>
                ) : (
                  <div className="space-y-1">
                    {labels.map((label) => (
                      <button
                        key={label.id}
                        onClick={() => handleLabelToggle(label.name)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2 ${
                          selectedLabels.includes(label.name)
                            ? "bg-gray-100"
                            : ""
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              label.color === "charcoal"
                                ? "#808080"
                                : label.color,
                          }}
                        ></div>
                        <span>{label.name}</span>
                        {selectedLabels.includes(label.name) && (
                          <span className="ml-auto text-[#246fe0]">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddTask}
            disabled={!content.trim()}
            className={`px-3 py-1.5 text-xs text-white rounded transition-colors ${
              content.trim()
                ? "bg-[#dc4c3e] hover:bg-[#c5372b]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Add task
          </button>
        </div>
      </div>
    </div>
  );
}
