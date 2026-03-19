"use client";

import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import QuickAdd from "@/components/QuickAdd";
import TaskDetail from "@/components/TaskDetail";
import AddProjectModal from "@/components/AddProjectModal";
import AppRouter from "@/components/Router";
import { useApp } from "@/components/AppProvider";

export default function AppShell() {
  const {
    sidebarOpen,
    quickAddOpen,
    setQuickAddOpen,
    selectedTaskId,
    setSelectedTaskId,
    addProjectModalOpen,
  } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "q" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable
        ) {
          e.preventDefault();
          setQuickAddOpen(true);
        }
      }
      if (e.key === "Escape") {
        setQuickAddOpen(false);
        setSelectedTaskId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setQuickAddOpen, setSelectedTaskId]);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <div
        className={`sidebar-transition fixed left-0 top-0 h-full z-30 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      <main
        className={`content-transition flex-1 h-full overflow-auto ${
          sidebarOpen ? "ml-[305px]" : "ml-0"
        }`}
      >
        <div className="max-w-[800px] mx-auto px-6 py-8">
          <AppRouter />
        </div>
      </main>

      {selectedTaskId && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSelectedTaskId(null)}
          />
          <div className="fixed right-0 top-0 h-full w-[450px] bg-white shadow-2xl z-50 overflow-auto">
            <TaskDetail taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
          </div>
        </>
      )}

      {quickAddOpen && <QuickAdd onClose={() => setQuickAddOpen(false)} />}
      {addProjectModalOpen && <AddProjectModal />}
    </div>
  );
}
