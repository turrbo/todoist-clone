"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Section } from "@/types";
import { ChevronDown, ChevronRight, MoreHorizontal, Edit2, Trash2 } from "lucide-react";

interface SectionHeaderProps {
  section: Section;
}

export default function SectionHeader({ section }: SectionHeaderProps) {
  const updateSection = useStore((state) => state.updateSection);
  const deleteSection = useStore((state) => state.deleteSection);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(section.name);
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  const handleToggleCollapse = () => {
    updateSection(section.id, { collapsed: !section.collapsed });
  };

  const handleRename = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveRename = () => {
    if (editName.trim() && editName.trim() !== section.name) {
      updateSection(section.id, { name: editName.trim() });
    } else {
      setEditName(section.name);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveRename();
    } else if (e.key === "Escape") {
      setEditName(section.name);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (confirm(`Delete section "${section.name}"? Tasks will be moved to the project root.`)) {
      deleteSection(section.id);
    }
    setShowMenu(false);
  };

  return (
    <div className="flex items-center justify-between py-2 mb-2 group">
      <div className="flex items-center gap-2 flex-1">
        {/* Collapse toggle */}
        <button
          onClick={handleToggleCollapse}
          className="p-0.5 hover:bg-gray-200 rounded transition-colors"
        >
          {section.collapsed ? (
            <ChevronRight className="w-4 h-4 text-todoist-secondary" />
          ) : (
            <ChevronDown className="w-4 h-4 text-todoist-secondary" />
          )}
        </button>

        {/* Section name */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveRename}
            onKeyDown={handleKeyDown}
            className="px-2 py-1 border border-gray-300 rounded text-sm font-semibold text-todoist-primary flex-1"
          />
        ) : (
          <h3
            className="text-sm font-semibold text-todoist-primary cursor-pointer hover:text-todoist-priority-1 transition-colors"
            onDoubleClick={handleRename}
          >
            {section.name}
          </h3>
        )}
      </div>

      {/* More menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all"
        >
          <MoreHorizontal className="w-4 h-4 text-todoist-secondary" />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg z-20">
            <button
              onClick={handleRename}
              className="w-full px-3 py-2 text-left text-sm text-todoist-primary hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Edit2 className="w-3 h-3" />
              Rename
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
