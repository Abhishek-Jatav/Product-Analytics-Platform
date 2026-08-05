"use client";

import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useWorkspaceContext } from "@/context/WorkspaceContext";
import { useWorkspaces } from "@/hooks/useWorkspaces";

export function WorkspaceSwitcher() {
  const { data: workspaces } = useWorkspaces();
  const { currentWorkspaceId, setCurrentWorkspaceId, setCurrentProjectId } = useWorkspaceContext();
  const [isOpen, setIsOpen] = useState(false);

  const current = workspaces?.find((w) => w.id === currentWorkspaceId);
  if (!workspaces || workspaces.length === 0) return null;

  const selectWorkspace = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
    setCurrentProjectId(null); // let useEnsureWorkspace pick that workspace's first project
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-small font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {current?.name ?? "Select workspace"}
        <ChevronDown size={14} className="text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-1 w-56 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-card z-20 py-1">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => selectWorkspace(workspace.id)}
                className={`w-full text-left px-3 py-2 text-small hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between ${
                  workspace.id === currentWorkspaceId ? "text-primary font-medium" : ""
                }`}
              >
                {workspace.name}
                <span className="text-caption text-gray-400 capitalize">{workspace.role}</span>
              </button>
            ))}
            <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
              <Link
                href="/onboarding"
                className="flex items-center gap-1.5 px-3 py-2 text-small text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Plus size={14} /> New workspace
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
