"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useApp } from "@/components/AppProvider";
import { PROJECT_COLORS } from "@/types";
import { X, Star } from "lucide-react";

export default function AddProjectModal() {
  const { addProjectModalOpen, setAddProjectModalOpen, editingProjectId, setEditingProjectId } =
    useApp();
  const addProject = useStore((state) => state.addProject);
  const updateProject = useStore((state) => state.updateProject);
  const getProjectById = useStore((state) => state.getProjectById);

  const [name, setName] = useState("");
  const [color, setColor] = useState("charcoal");
  const [viewStyle, setViewStyle] = useState<"list" | "board">("list");
  const [isFavorite, setIsFavorite] = useState(false);

  const isEditing = !!editingProjectId;
  const editingProject = isEditing ? getProjectById(editingProjectId) : null;

  useEffect(() => {
    if (isEditing && editingProject) {
      setName(editingProject.name);
      setColor(editingProject.color);
      setViewStyle(editingProject.viewStyle);
      setIsFavorite(editingProject.isFavorite);
    } else {
      setName("");
      setColor("charcoal");
      setViewStyle("list");
      setIsFavorite(false);
    }
  }, [isEditing, editingProject]);

  const handleClose = () => {
    setAddProjectModalOpen(false);
    setEditingProjectId(null);
    setName("");
    setColor("charcoal");
    setViewStyle("list");
    setIsFavorite(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing && editingProjectId) {
      updateProject(editingProjectId, {
        name: name.trim(),
        color,
        viewStyle,
        isFavorite,
      });
    } else {
      addProject({
        name: name.trim(),
        color,
        viewStyle,
        isFavorite,
      });
    }

    handleClose();
  };

  if (!addProjectModalOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-todoist-primary">
              {isEditing ? "Edit Project" : "Add Project"}
            </h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-todoist-secondary" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Name input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-todoist-primary mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project name"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-todoist-priority-1"
                autoFocus
              />
            </div>

            {/* Color picker */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-todoist-primary mb-2">
                Color
              </label>
              <div className="grid grid-cols-10 gap-2">
                {Object.entries(PROJECT_COLORS).map(([colorName, colorValue]) => (
                  <button
                    key={colorName}
                    type="button"
                    onClick={() => setColor(colorName)}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                      color === colorName ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
                    }`}
                    style={{ backgroundColor: colorValue }}
                    title={colorName.replace(/_/g, " ")}
                  />
                ))}
              </div>
            </div>

            {/* View style */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-todoist-primary mb-2">
                View
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setViewStyle("list")}
                  className={`flex-1 px-4 py-2 rounded border text-sm font-medium transition-colors ${
                    viewStyle === "list"
                      ? "bg-red-50 border-todoist-priority-1 text-todoist-priority-1"
                      : "border-gray-300 text-todoist-secondary hover:bg-gray-50"
                  }`}
                >
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setViewStyle("board")}
                  className={`flex-1 px-4 py-2 rounded border text-sm font-medium transition-colors ${
                    viewStyle === "board"
                      ? "bg-red-50 border-todoist-priority-1 text-todoist-priority-1"
                      : "border-gray-300 text-todoist-secondary hover:bg-gray-50"
                  }`}
                >
                  Board
                </button>
              </div>
            </div>

            {/* Favorite toggle */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-10 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-todoist-priority-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-todoist-priority-1"></div>
                <span className="text-sm text-todoist-primary flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Add to favorites
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm text-todoist-secondary hover:text-todoist-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-4 py-2 bg-todoist-priority-1 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEditing ? "Save" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
