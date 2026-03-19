"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { Task, Project, Section, Label, Filter, Priority, Comment } from "@/types";

const INBOX_ID = "inbox";

interface TodoStore {
  tasks: Task[];
  projects: Project[];
  sections: Section[];
  labels: Label[];
  filters: Filter[];

  // Task actions
  addTask: (task: Partial<Task> & { content: string }) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  uncompleteTask: (id: string) => void;
  reorderTasks: (projectId: string, sectionId: string | null, taskIds: string[]) => void;

  // Comment actions
  addComment: (taskId: string, content: string) => void;
  deleteComment: (taskId: string, commentId: string) => void;

  // Project actions
  addProject: (project: Partial<Project> & { name: string }) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Section actions
  addSection: (section: Partial<Section> & { projectId: string; name: string }) => Section;
  updateSection: (id: string, updates: Partial<Section>) => void;
  deleteSection: (id: string) => void;

  // Label actions
  addLabel: (label: Partial<Label> & { name: string }) => Label;
  updateLabel: (id: string, updates: Partial<Label>) => void;
  deleteLabel: (id: string) => void;

  // Filter actions
  addFilter: (filter: Partial<Filter> & { name: string; query: string }) => Filter;
  updateFilter: (id: string, updates: Partial<Filter>) => void;
  deleteFilter: (id: string) => void;

  // Getters
  getTasksByProject: (projectId: string) => Task[];
  getTasksBySection: (projectId: string, sectionId: string | null) => Task[];
  getTasksByLabel: (labelName: string) => Task[];
  getSubtasks: (parentId: string) => Task[];
  getTodayTasks: () => Task[];
  getUpcomingTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getProjectById: (id: string) => Project | undefined;
  getSectionsByProject: (projectId: string) => Section[];
  getInboxProject: () => Project;
  getTaskById: (id: string) => Task | undefined;
  getCompletedTasks: (projectId?: string) => Task[];
}

function getDefaultState() {
  return {
    tasks: [] as Task[],
    projects: [
      {
        id: INBOX_ID,
        name: "Inbox",
        color: "sky_blue",
        order: 0,
        isFavorite: false,
        isInbox: true,
        viewStyle: "list" as const,
      },
    ],
    sections: [] as Section[],
    labels: [] as Label[],
    filters: [] as Filter[],
  };
}

export const useStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      ...getDefaultState(),

      // Task actions
      addTask: (taskData) => {
        const projectTasks = get().tasks.filter(
          (t) =>
            t.projectId === (taskData.projectId || INBOX_ID) &&
            t.sectionId === (taskData.sectionId || null) &&
            !t.parentId
        );
        const maxOrder = projectTasks.reduce((max, t) => Math.max(max, t.order), -1);

        const newTask: Task = {
          id: uuidv4(),
          content: taskData.content,
          description: taskData.description || "",
          projectId: taskData.projectId || INBOX_ID,
          sectionId: taskData.sectionId || null,
          parentId: taskData.parentId || null,
          priority: taskData.priority || 4,
          dueDate: taskData.dueDate || null,
          dueTime: taskData.dueTime || null,
          recurring: taskData.recurring || null,
          labels: taskData.labels || [],
          completed: false,
          completedAt: null,
          order: taskData.order ?? maxOrder + 1,
          createdAt: new Date().toISOString(),
          comments: [],
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
        return newTask;
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      deleteTask: (id) => {
        set((state) => {
          const idsToDelete = new Set<string>();
          const collectIds = (parentId: string) => {
            idsToDelete.add(parentId);
            state.tasks.filter((t) => t.parentId === parentId).forEach((t) => collectIds(t.id));
          };
          collectIds(id);
          return { tasks: state.tasks.filter((t) => !idsToDelete.has(t.id)) };
        });
      },

      completeTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        if (task.recurring) {
          const nextDate = getNextRecurringDate(task.dueDate, task.recurring);
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === id ? { ...t, dueDate: nextDate } : t
            ),
          }));
        } else {
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === id
                ? { ...t, completed: true, completedAt: new Date().toISOString() }
                : t.parentId === id
                ? { ...t, completed: true, completedAt: new Date().toISOString() }
                : t
            ),
          }));
        }
      },

      uncompleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: false, completedAt: null } : t
          ),
        }));
      },

      reorderTasks: (projectId, sectionId, taskIds) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            const idx = taskIds.indexOf(t.id);
            if (idx !== -1) {
              return { ...t, order: idx, projectId, sectionId };
            }
            return t;
          }),
        }));
      },

      // Comment actions
      addComment: (taskId, content) => {
        const comment: Comment = {
          id: uuidv4(),
          taskId,
          content,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t
          ),
        }));
      },

      deleteComment: (taskId, commentId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, comments: t.comments.filter((c) => c.id !== commentId) }
              : t
          ),
        }));
      },

      // Project actions
      addProject: (projectData) => {
        const maxOrder = get().projects.reduce((max, p) => Math.max(max, p.order), -1);
        const newProject: Project = {
          id: uuidv4(),
          name: projectData.name,
          color: projectData.color || "charcoal",
          order: projectData.order ?? maxOrder + 1,
          isFavorite: projectData.isFavorite || false,
          isInbox: false,
          viewStyle: projectData.viewStyle || "list",
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
        return newProject;
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          tasks: state.tasks.filter((t) => t.projectId !== id),
          sections: state.sections.filter((s) => s.projectId !== id),
        }));
      },

      // Section actions
      addSection: (sectionData) => {
        const projectSections = get().sections.filter(
          (s) => s.projectId === sectionData.projectId
        );
        const maxOrder = projectSections.reduce((max, s) => Math.max(max, s.order), -1);
        const newSection: Section = {
          id: uuidv4(),
          projectId: sectionData.projectId,
          name: sectionData.name,
          order: sectionData.order ?? maxOrder + 1,
          collapsed: false,
        };
        set((state) => ({ sections: [...state.sections, newSection] }));
        return newSection;
      },

      updateSection: (id, updates) => {
        set((state) => ({
          sections: state.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }));
      },

      deleteSection: (id) => {
        set((state) => ({
          sections: state.sections.filter((s) => s.id !== id),
          tasks: state.tasks.map((t) =>
            t.sectionId === id ? { ...t, sectionId: null } : t
          ),
        }));
      },

      // Label actions
      addLabel: (labelData) => {
        const maxOrder = get().labels.reduce((max, l) => Math.max(max, l.order), -1);
        const newLabel: Label = {
          id: uuidv4(),
          name: labelData.name,
          color: labelData.color || "charcoal",
          order: labelData.order ?? maxOrder + 1,
          isFavorite: labelData.isFavorite || false,
        };
        set((state) => ({ labels: [...state.labels, newLabel] }));
        return newLabel;
      },

      updateLabel: (id, updates) => {
        set((state) => ({
          labels: state.labels.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        }));
      },

      deleteLabel: (id) => {
        const label = get().labels.find((l) => l.id === id);
        if (label) {
          set((state) => ({
            labels: state.labels.filter((l) => l.id !== id),
            tasks: state.tasks.map((t) => ({
              ...t,
              labels: t.labels.filter((l) => l !== label.name),
            })),
          }));
        }
      },

      // Filter actions
      addFilter: (filterData) => {
        const maxOrder = get().filters.reduce((max, f) => Math.max(max, f.order), -1);
        const newFilter: Filter = {
          id: uuidv4(),
          name: filterData.name,
          query: filterData.query,
          color: filterData.color || "charcoal",
          order: filterData.order ?? maxOrder + 1,
          isFavorite: filterData.isFavorite || false,
        };
        set((state) => ({ filters: [...state.filters, newFilter] }));
        return newFilter;
      },

      updateFilter: (id, updates) => {
        set((state) => ({
          filters: state.filters.map((f) => (f.id === id ? { ...f, ...updates } : f)),
        }));
      },

      deleteFilter: (id) => {
        set((state) => ({ filters: state.filters.filter((f) => f.id !== id) }));
      },

      // Getters
      getTasksByProject: (projectId) => {
        return get()
          .tasks.filter((t) => t.projectId === projectId && !t.completed && !t.parentId)
          .sort((a, b) => a.order - b.order);
      },

      getTasksBySection: (projectId, sectionId) => {
        return get()
          .tasks.filter(
            (t) =>
              t.projectId === projectId &&
              t.sectionId === sectionId &&
              !t.completed &&
              !t.parentId
          )
          .sort((a, b) => a.order - b.order);
      },

      getTasksByLabel: (labelName) => {
        return get()
          .tasks.filter((t) => t.labels.includes(labelName) && !t.completed)
          .sort((a, b) => a.order - b.order);
      },

      getSubtasks: (parentId) => {
        return get()
          .tasks.filter((t) => t.parentId === parentId)
          .sort((a, b) => a.order - b.order);
      },

      getTodayTasks: () => {
        const today = new Date().toISOString().split("T")[0];
        return get()
          .tasks.filter((t) => {
            if (t.completed || t.parentId) return false;
            if (!t.dueDate) return false;
            return t.dueDate <= today;
          })
          .sort((a, b) => {
            if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) {
              return a.dueDate.localeCompare(b.dueDate);
            }
            return a.order - b.order;
          });
      },

      getUpcomingTasks: () => {
        const today = new Date().toISOString().split("T")[0];
        return get()
          .tasks.filter((t) => {
            if (t.completed || t.parentId) return false;
            if (!t.dueDate) return false;
            return t.dueDate >= today;
          })
          .sort((a, b) => {
            if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
            return 0;
          });
      },

      getOverdueTasks: () => {
        const today = new Date().toISOString().split("T")[0];
        return get()
          .tasks.filter((t) => {
            if (t.completed || t.parentId) return false;
            if (!t.dueDate) return false;
            return t.dueDate < today;
          })
          .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!));
      },

      getProjectById: (id) => get().projects.find((p) => p.id === id),
      getSectionsByProject: (projectId) =>
        get()
          .sections.filter((s) => s.projectId === projectId)
          .sort((a, b) => a.order - b.order),
      getInboxProject: () => get().projects.find((p) => p.isInbox)!,
      getTaskById: (id) => get().tasks.find((t) => t.id === id),
      getCompletedTasks: (projectId) =>
        get()
          .tasks.filter(
            (t) => t.completed && (projectId ? t.projectId === projectId : true)
          )
          .sort(
            (a, b) =>
              new Date(b.completedAt || 0).getTime() -
              new Date(a.completedAt || 0).getTime()
          ),
    }),
    {
      name: "todoist-clone-storage",
    }
  )
);

function getNextRecurringDate(currentDate: string | null, recurring: string): string {
  const base = currentDate ? new Date(currentDate + "T00:00:00") : new Date();
  const lower = recurring.toLowerCase().trim();

  if (lower === "daily" || lower === "every day") {
    base.setDate(base.getDate() + 1);
  } else if (lower === "weekly" || lower === "every week") {
    base.setDate(base.getDate() + 7);
  } else if (lower === "monthly" || lower === "every month") {
    base.setMonth(base.getMonth() + 1);
  } else if (lower === "yearly" || lower === "every year") {
    base.setFullYear(base.getFullYear() + 1);
  } else if (lower.startsWith("every ")) {
    const parts = lower.replace("every ", "").split(" ");
    const num = parseInt(parts[0]) || 1;
    const unit = parts[parts.length - 1];
    if (unit.startsWith("day")) base.setDate(base.getDate() + num);
    else if (unit.startsWith("week")) base.setDate(base.getDate() + num * 7);
    else if (unit.startsWith("month")) base.setMonth(base.getMonth() + num);
    else if (unit.startsWith("year")) base.setFullYear(base.getFullYear() + num);
  } else {
    base.setDate(base.getDate() + 1);
  }

  return base.toISOString().split("T")[0];
}
