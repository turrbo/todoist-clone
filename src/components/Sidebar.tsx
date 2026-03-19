"use client";

import { useState, useRef, useEffect } from "react";
import {
  Inbox, CalendarDays, CalendarRange, SlidersHorizontal,
  ChevronDown, ChevronRight, Plus, Menu, MoreHorizontal,
  Heart, Pencil, Trash2,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { useApp } from "@/components/AppProvider";
import { useRouter } from "@/components/Router";
import { PROJECT_COLORS } from "@/types";

export default function Sidebar() {
  const { pathname, navigate } = useRouter();
  const {
    sidebarOpen, setSidebarOpen, setQuickAddOpen,
    setAddProjectModalOpen, setEditingProjectId,
  } = useApp();
  const [projectsCollapsed, setProjectsCollapsed] = useState(false);
  const [favoritesCollapsed, setFavoritesCollapsed] = useState(false);
  const [projectMenuId, setProjectMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const projects = useStore((s) => s.projects);
  const labels = useStore((s) => s.labels);
  const filters = useStore((s) => s.filters);
  const updateProject = useStore((s) => s.updateProject);
  const deleteProject = useStore((s) => s.deleteProject);
  const getTasksByProject = useStore((s) => s.getTasksByProject);
  const getTodayTasks = useStore((s) => s.getTodayTasks);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProjectMenuId(null);
      }
    }
    if (projectMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [projectMenuId]);

  const todayTaskCount = getTodayTasks().length;
  const favoriteProjects = projects.filter((p) => p.isFavorite && !p.isInbox);
  const favoriteLabels = labels.filter((l) => l.isFavorite);
  const favoriteFilters = filters.filter((f) => f.isFavorite);
  const hasFavorites = favoriteProjects.length > 0 || favoriteLabels.length > 0 || favoriteFilters.length > 0;
  const regularProjects = projects.filter((p) => !p.isInbox).sort((a, b) => a.order - b.order);
  const isActive = (path: string) => pathname === path;

  const NavLink = ({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) => (
    <a
      href={href}
      onClick={(e) => { e.preventDefault(); navigate(href); }}
      className={className}
    >
      {children}
    </a>
  );

  const ProjectListItem = ({ project, showMenu = true }: { project: typeof projects[0]; showMenu?: boolean }) => {
    const taskCount = getTasksByProject(project.id).length;
    const colorValue = PROJECT_COLORS[project.color] || PROJECT_COLORS.charcoal;
    const active = isActive(`/project/${project.id}`);
    const isMenuOpen = projectMenuId === project.id;

    return (
      <div className={`group relative flex items-center h-8 px-2 rounded-md transition-colors ${active ? "bg-[#eae5e0] font-medium" : "hover:bg-[#f5f3f0]"}`}>
        <NavLink href={`/project/${project.id}`} className="flex items-center flex-1 min-w-0 text-sm text-[#202020]">
          <div className="w-2 h-2 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: colorValue }} />
          <span className="truncate">{project.name}</span>
          {taskCount > 0 && <span className="ml-auto text-xs text-[#808080] pl-2">{taskCount}</span>}
        </NavLink>
        {showMenu && (
          <div className="relative ml-1">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setProjectMenuId(isMenuOpen ? null : project.id); }}
              className={`p-1 rounded hover:bg-[#e8e4df] transition-colors ${isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            >
              <MoreHorizontal className="w-3.5 h-3.5 text-[#808080]" />
            </button>
            {isMenuOpen && (
              <div ref={menuRef} className="absolute right-0 top-6 z-50 w-48 bg-white rounded-lg shadow-lg border border-[#f0eded] py-1">
                <button onClick={() => { updateProject(project.id, { isFavorite: !project.isFavorite }); setProjectMenuId(null); }} className="w-full flex items-center px-3 py-2 text-sm text-[#202020] hover:bg-[#f5f3f0]">
                  <Heart className={`w-4 h-4 mr-2 ${project.isFavorite ? "fill-[#db4035] text-[#db4035]" : "text-[#808080]"}`} />
                  {project.isFavorite ? "Remove from favorites" : "Add to favorites"}
                </button>
                <button onClick={() => { setEditingProjectId(project.id); setAddProjectModalOpen(true); setProjectMenuId(null); }} className="w-full flex items-center px-3 py-2 text-sm text-[#202020] hover:bg-[#f5f3f0]">
                  <Pencil className="w-4 h-4 mr-2 text-[#808080]" /> Edit project
                </button>
                <div className="border-t border-[#f0eded] my-1" />
                <button onClick={() => { if (confirm("Delete this project and all its tasks?")) { deleteProject(project.id); setProjectMenuId(null); } }} className="w-full flex items-center px-3 py-2 text-sm text-[#db4035] hover:bg-[#fff5f5]">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete project
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-[305px] h-full bg-[#fcfaf8] border-r border-[#f0eded]">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-12 px-3 border-b border-[#f0eded] flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-md hover:bg-[#f5f3f0]"><Menu className="w-5 h-5 text-[#202020]" /></button>
          <button onClick={() => setQuickAddOpen(true)} className="p-1.5 rounded-md hover:bg-[#f5f3f0]"><Plus className="w-5 h-5 text-[#202020]" /></button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1 mb-6">
            <NavLink href="/" className={`flex items-center h-8 px-2 rounded-md transition-colors ${isActive("/") ? "bg-[#eae5e0] font-medium" : "hover:bg-[#f5f3f0]"}`}>
              <Inbox className="w-5 h-5 mr-2 text-[#246fe0]" /><span className="text-sm text-[#202020]">Inbox</span>
            </NavLink>
            <NavLink href="/today" className={`flex items-center h-8 px-2 rounded-md transition-colors ${isActive("/today") ? "bg-[#eae5e0] font-medium" : "hover:bg-[#f5f3f0]"}`}>
              <CalendarDays className="w-5 h-5 mr-2 text-[#058527]" /><span className="text-sm text-[#202020]">Today</span>
              {todayTaskCount > 0 && <span className="ml-auto bg-[#db4035] text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">{todayTaskCount}</span>}
            </NavLink>
            <NavLink href="/upcoming" className={`flex items-center h-8 px-2 rounded-md transition-colors ${isActive("/upcoming") ? "bg-[#eae5e0] font-medium" : "hover:bg-[#f5f3f0]"}`}>
              <CalendarRange className="w-5 h-5 mr-2 text-[#a970ff]" /><span className="text-sm text-[#202020]">Upcoming</span>
            </NavLink>
            <NavLink href="/filters" className={`flex items-center h-8 px-2 rounded-md transition-colors ${isActive("/filters") ? "bg-[#eae5e0] font-medium" : "hover:bg-[#f5f3f0]"}`}>
              <SlidersHorizontal className="w-5 h-5 mr-2 text-[#808080]" /><span className="text-sm text-[#202020]">Filters & Labels</span>
            </NavLink>
          </div>

          {hasFavorites && (
            <div className="mb-6">
              <button onClick={() => setFavoritesCollapsed(!favoritesCollapsed)} className="flex items-center w-full h-7 px-2 hover:bg-[#f5f3f0] rounded-md">
                {favoritesCollapsed ? <ChevronRight className="w-4 h-4 mr-1 text-[#808080]" /> : <ChevronDown className="w-4 h-4 mr-1 text-[#808080]" />}
                <span className="text-xs font-medium text-[#808080] uppercase tracking-wide">Favorites</span>
              </button>
              {!favoritesCollapsed && (
                <div className="mt-1 space-y-1">
                  {favoriteProjects.map((p) => <ProjectListItem key={p.id} project={p} showMenu={false} />)}
                  {favoriteLabels.map((label) => (
                    <NavLink key={label.id} href={`/label/${label.id}`} className={`flex items-center h-8 px-2 rounded-md transition-colors ${isActive(`/label/${label.id}`) ? "bg-[#eae5e0] font-medium" : "hover:bg-[#f5f3f0]"}`}>
                      <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: PROJECT_COLORS[label.color] || "#808080" }} />
                      <span className="text-sm text-[#202020] truncate">{label.name}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <button onClick={() => setProjectsCollapsed(!projectsCollapsed)} className="flex items-center w-full h-7 px-2 hover:bg-[#f5f3f0] rounded-md">
              {projectsCollapsed ? <ChevronRight className="w-4 h-4 mr-1 text-[#808080]" /> : <ChevronDown className="w-4 h-4 mr-1 text-[#808080]" />}
              <span className="text-xs font-medium text-[#808080] uppercase tracking-wide">My Projects</span>
            </button>
            {!projectsCollapsed && (
              <div className="mt-1 space-y-1">
                {regularProjects.map((p) => <ProjectListItem key={p.id} project={p} />)}
                <button onClick={() => setAddProjectModalOpen(true)} className="flex items-center w-full h-8 px-2 rounded-md hover:bg-[#f5f3f0] text-left">
                  <Plus className="w-4 h-4 mr-2 text-[#808080]" /><span className="text-sm text-[#808080]">Add project</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
}
