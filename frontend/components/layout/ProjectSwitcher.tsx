"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { useWorkspaceContext } from "@/context/WorkspaceContext";
import { useProjects } from "@/hooks/useProjects";

export function ProjectSwitcher() {
  const { currentWorkspaceId, currentProjectId, setCurrentProjectId } = useWorkspaceContext();
  const { data: projects } = useProjects(currentWorkspaceId);
  const [isOpen, setIsOpen] = useState(false);

  const current = projects?.find((p) => p.id === currentProjectId);
  if (!projects || projects.length <= 1) return null; // nothing to switch between

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-small text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {current?.name ?? "Select project"}
        <ChevronDown size={14} className="text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-1 w-52 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-card z-20 py-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  setCurrentProjectId(project.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-small hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  project.id === currentProjectId ? "text-primary font-medium" : ""
                }`}
              >
                {project.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
