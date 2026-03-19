"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AppContextType {
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  quickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  addProjectModalOpen: boolean;
  setAddProjectModalOpen: (open: boolean) => void;
  editingProjectId: string | null;
  setEditingProjectId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [addProjectModalOpen, setAddProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{
        selectedTaskId,
        setSelectedTaskId,
        quickAddOpen,
        setQuickAddOpen,
        sidebarOpen,
        setSidebarOpen,
        addProjectModalOpen,
        setAddProjectModalOpen,
        editingProjectId,
        setEditingProjectId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
