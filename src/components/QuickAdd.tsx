"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { CalendarDays, Flag, Tag, X, ChevronDown, Check } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Priority, PRIORITY_COLORS, PROJECT_COLORS } from "@/types";
import { parseDateInput, formatDueDate } from "@/utils/dates";

interface QuickAddProps {
  onClose: () => void;
}

export default function QuickAdd({ onClose }: QuickAddProps) {
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("inbox");
  const [selectedPriority, setSelectedPriority] = useState<Priority>(4);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [recurring, setRecurring] = useState<string | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [dateInput, setDateInput] = useState("");

  const contentInputRef = useRef<HTMLInputElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const priorityPickerRef = useRef<HTMLDivElement>(null);
  const labelPickerRef = useRef<HTMLDivElement>(null);
  const projectPickerRef = useRef<HTMLDivElement>(null);

  const projects = useStore((state) => state.projects);
  const labels = useStore((state) => state.labels);
  const addTask = useStore((state) => state.addTask);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  useEffect(() => {
    setTimeout(() => contentInputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (datePickerRef.current && !datePickerRef.current.contains(target)) {
        setShowDatePicker(false);
      }
      if (priorityPickerRef.current && !priorityPickerRef.current.contains(target)) {
        setShowPriorityPicker(false);
      }
      if (labelPickerRef.current && !labelPickerRef.current.contains(target)) {
        setShowLabelPicker(false);
      }
      if (projectPickerRef.current && !projectPickerRef.current.contains(target)) {
        setShowProjectPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset form on unmount
  useEffect(() => {
    return () => {
      setContent("");
      setDescription("");
      setSelectedProjectId("inbox");
      setSelectedPriority(4);
      setSelectedLabels([]);
      setDueDate(null);
      setRecurring(null);
      setDateInput("");
      setShowDatePicker(false);
      setShowPriorityPicker(false);
      setShowLabelPicker(false);
      setShowProjectPicker(false);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addTask({
      content: content.trim(),
      description: description.trim(),
      projectId: selectedProjectId,
      priority: selectedPriority,
      labels: selectedLabels,
      dueDate,
      recurring,
    });

    setContent("");
    setDescription("");
    setSelectedLabels([]);
    setDueDate(null);
    setRecurring(null);
    setDateInput("");
    contentInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleDateSelect = (option: string) => {
    if (option === "no-date") {
      setDueDate(null);
      setRecurring(null);
      setShowDatePicker(false);
      return;
    }

    const parsed = parseDateInput(option);
    setDueDate(parsed.date);
    setRecurring(parsed.recurring);
    setDateInput("");
    setShowDatePicker(false);
  };

  const handleDateInputChange = (value: string) => {
    setDateInput(value);
    if (value.trim()) {
      const parsed = parseDateInput(value);
      if (parsed.date) {
        setDueDate(parsed.date);
        setRecurring(parsed.recurring);
      }
    }
  };

  const handleLabelToggle = (labelName: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelName)
        ? prev.filter((l) => l !== labelName)
        : [...prev, labelName]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onKeyDown={handleKeyDown}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[550px] mx-4 bg-white rounded-lg shadow-2xl">
        <form onSubmit={handleSubmit}>
          {/* Header Input */}
          <div className="p-4 border-b border-gray-200">
            <input
              ref={contentInputRef}
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Task name"
              className="w-full text-[15px] font-medium text-gray-900 placeholder-gray-400 outline-none"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={2}
              className="w-full mt-2 text-[13px] text-gray-700 placeholder-gray-400 outline-none resize-none"
            />
          </div>

          {/* Toolbar */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              {/* Due Date */}
              <div className="relative" ref={datePickerRef}>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] rounded hover:bg-gray-100 transition-colors ${
                    dueDate ? "text-green-700 font-medium" : "text-gray-700"
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  {dueDate ? formatDueDate(dueDate) : "Due date"}
                </button>

                {showDatePicker && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      type="button"
                      onClick={() => handleDateSelect("today")}
                      className="w-full px-3 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-50"
                    >
                      <span className="text-green-600 font-medium">Today</span>
                      <span className="text-gray-500 ml-2">
                        {new Date().toLocaleDateString("en-US", { weekday: "short" })}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDateSelect("tomorrow")}
                      className="w-full px-3 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-50"
                    >
                      <span className="text-orange-500 font-medium">Tomorrow</span>
                      <span className="text-gray-500 ml-2">
                        {new Date(Date.now() + 86400000).toLocaleDateString("en-US", { weekday: "short" })}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDateSelect("next week")}
                      className="w-full px-3 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-50"
                    >
                      <span className="text-purple-600 font-medium">Next week</span>
                      <span className="text-gray-500 ml-2">Mon</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDateSelect("next weekend")}
                      className="w-full px-3 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-50"
                    >
                      <span className="text-blue-600 font-medium">Next weekend</span>
                      <span className="text-gray-500 ml-2">Sat</span>
                    </button>
                    <div className="border-t border-gray-200 my-1" />
                    <button
                      type="button"
                      onClick={() => handleDateSelect("no-date")}
                      className="w-full px-3 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-50"
                    >
                      No date
                    </button>
                    <div className="border-t border-gray-200 my-1" />
                    <div className="px-3 py-2">
                      <input
                        type="text"
                        value={dateInput}
                        onChange={(e) => handleDateInputChange(e.target.value)}
                        placeholder="Type a due date..."
                        className="w-full px-2 py-1.5 text-[13px] border border-gray-300 rounded outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Priority */}
              <div className="relative" ref={priorityPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowPriorityPicker(!showPriorityPicker)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] rounded hover:bg-gray-100 transition-colors"
                >
                  <Flag
                    className="w-4 h-4"
                    style={{ color: PRIORITY_COLORS[selectedPriority] }}
                    fill={selectedPriority !== 4 ? PRIORITY_COLORS[selectedPriority] : "none"}
                  />
                  <span className="text-gray-700">Priority</span>
                </button>

                {showPriorityPicker && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {([1, 2, 3, 4] as Priority[]).map((priority) => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => {
                          setSelectedPriority(priority);
                          setShowPriorityPicker(false);
                        }}
                        className="w-full px-3 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Flag
                          className="w-4 h-4"
                          style={{ color: PRIORITY_COLORS[priority] }}
                          fill={priority !== 4 ? PRIORITY_COLORS[priority] : "none"}
                        />
                        <span>Priority {priority}</span>
                        {selectedPriority === priority && (
                          <Check className="w-4 h-4 ml-auto text-gray-700" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Labels */}
              {labels.length > 0 && (
                <div className="relative" ref={labelPickerRef}>
                  <button
                    type="button"
                    onClick={() => setShowLabelPicker(!showLabelPicker)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] rounded hover:bg-gray-100 transition-colors ${
                      selectedLabels.length > 0 ? "text-purple-700 font-medium" : "text-gray-700"
                    }`}
                  >
                    <Tag className="w-4 h-4" />
                    {selectedLabels.length > 0 ? `${selectedLabels.length} label${selectedLabels.length > 1 ? "s" : ""}` : "Labels"}
                  </button>

                  {showLabelPicker && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-64 overflow-y-auto">
                      {labels.map((label) => (
                        <button
                          key={label.id}
                          type="button"
                          onClick={() => handleLabelToggle(label.name)}
                          className="w-full px-3 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: PROJECT_COLORS[label.color] || label.color }}
                          />
                          <span className="flex-1">{label.name}</span>
                          {selectedLabels.includes(label.name) && (
                            <Check className="w-4 h-4 text-gray-700" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 flex items-center justify-between">
            {/* Project Selector */}
            <div className="relative" ref={projectPickerRef}>
              <button
                type="button"
                onClick={() => setShowProjectPicker(!showProjectPicker)}
                className="flex items-center gap-2 px-2 py-1.5 text-[13px] text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: PROJECT_COLORS[selectedProject.color] || selectedProject.color }}
                />
                <span>{selectedProject.name}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showProjectPicker && (
                <div className="absolute bottom-full left-0 mb-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-80 overflow-y-auto">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => {
                        setSelectedProjectId(project.id);
                        setShowProjectPicker(false);
                      }}
                      className="w-full px-3 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PROJECT_COLORS[project.color] || project.color }}
                      />
                      <span className="flex-1">{project.name}</span>
                      {selectedProjectId === project.id && (
                        <Check className="w-4 h-4 text-gray-700" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-100 rounded transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!content.trim()}
                className="px-3 py-1.5 text-[13px] text-white bg-red-600 rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Add task
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
