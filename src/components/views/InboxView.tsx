"use client";

import { useStore } from "@/store/useStore";
import TaskList from "@/components/TaskList";
import AddTask from "@/components/AddTask";
import SectionHeader from "@/components/SectionHeader";
import { Inbox } from "lucide-react";

export default function InboxView() {
  const inboxProject = useStore((state) => state.getInboxProject());
  const unsectionedTasks = useStore((state) =>
    state.getTasksBySection(inboxProject.id, null)
  );
  const sections = useStore((state) => state.getSectionsByProject(inboxProject.id));

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Inbox className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-[#202020]">Inbox</h1>
        </div>
      </div>

      <div className="mb-6">
        <TaskList tasks={unsectionedTasks} projectId={inboxProject.id} sectionId={null} />
        <div className="mt-2">
          <AddTask projectId={inboxProject.id} sectionId={null} />
        </div>
      </div>

      {sections.map((section) => {
        const sectionTasks = useStore
          .getState()
          .getTasksBySection(inboxProject.id, section.id);

        return (
          <div key={section.id} className="mb-6">
            <SectionHeader section={section} />
            {!section.collapsed && (
              <>
                <TaskList
                  tasks={sectionTasks}
                  projectId={inboxProject.id}
                  sectionId={section.id}
                />
                <div className="mt-2">
                  <AddTask projectId={inboxProject.id} sectionId={section.id} />
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
