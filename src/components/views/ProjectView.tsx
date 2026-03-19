"use client";

import { useStore } from "@/store/useStore";
import TaskList from "@/components/TaskList";
import AddTask from "@/components/AddTask";
import SectionHeader from "@/components/SectionHeader";
import { PROJECT_COLORS } from "@/types";
import { List, LayoutGrid, Plus } from "lucide-react";
import { useState } from "react";

interface ProjectViewProps {
  projectId: string;
}

export default function ProjectView({ projectId }: ProjectViewProps) {
  const project = useStore((state) => state.getProjectById(projectId));
  const unsectionedTasks = useStore((state) => state.getTasksBySection(projectId, null));
  const sections = useStore((state) => state.getSectionsByProject(projectId));
  const updateProject = useStore((state) => state.updateProject);
  const addSection = useStore((state) => state.addSection);

  const [addingSectionName, setAddingSectionName] = useState("");
  const [showAddSection, setShowAddSection] = useState(false);

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (addingSectionName.trim()) {
      addSection({ projectId, name: addingSectionName.trim() });
      setAddingSectionName("");
      setShowAddSection(false);
    }
  };

  const toggleViewStyle = () => {
    updateProject(projectId, {
      viewStyle: project.viewStyle === "list" ? "board" : "list",
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: PROJECT_COLORS[project.color] }}
            />
            <h1 className="text-2xl font-bold text-[#202020]">{project.name}</h1>
          </div>
          <button
            onClick={toggleViewStyle}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title={`Switch to ${project.viewStyle === "list" ? "board" : "list"} view`}
          >
            {project.viewStyle === "list" ? (
              <LayoutGrid className="w-5 h-5 text-gray-500" />
            ) : (
              <List className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {project.viewStyle === "board" && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          Board view coming soon. Showing list view for now.
        </div>
      )}

      {/* Unsectioned tasks */}
      <div className="mb-6">
        <TaskList tasks={unsectionedTasks} projectId={projectId} sectionId={null} />
        <div className="mt-2">
          <AddTask projectId={projectId} sectionId={null} />
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => {
        const sectionTasks = useStore.getState().getTasksBySection(projectId, section.id);
        return (
          <div key={section.id} className="mb-6">
            <SectionHeader section={section} />
            {!section.collapsed && (
              <>
                <TaskList tasks={sectionTasks} projectId={projectId} sectionId={section.id} />
                <div className="mt-2">
                  <AddTask projectId={projectId} sectionId={section.id} />
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* Add section */}
      <div className="mt-6">
        {showAddSection ? (
          <form onSubmit={handleAddSection} className="flex items-center gap-2">
            <input
              type="text"
              value={addingSectionName}
              onChange={(e) => setAddingSectionName(e.target.value)}
              placeholder="Section name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:border-[#dc4c3e]"
              autoFocus
              onBlur={() => {
                if (!addingSectionName.trim()) setShowAddSection(false);
              }}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#dc4c3e] text-white rounded text-sm font-medium hover:bg-[#c53727] transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => { setShowAddSection(false); setAddingSectionName(""); }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowAddSection(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add section</span>
          </button>
        )}
      </div>
    </div>
  );
}
