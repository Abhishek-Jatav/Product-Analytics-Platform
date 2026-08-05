"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { STORAGE_KEYS } from "@/constants/app.constants";

interface WorkspaceContextValue {
  currentWorkspaceId: string | null;
  currentProjectId: string | null;
  setCurrentWorkspaceId: (id: string | null) => void;
  setCurrentProjectId: (id: string | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

/**
 * Holds only the *currently selected* workspace/project IDs (client UI state).
 * Actual workspace/project data is fetched via TanStack Query hooks, per
 * CodingStandards.md: "Do NOT use Context for server data."
 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [currentWorkspaceId, setWorkspaceIdState] = useState<string | null>(null);
  const [currentProjectId, setProjectIdState] = useState<string | null>(null);

  useEffect(() => {
    setWorkspaceIdState(localStorage.getItem(STORAGE_KEYS.CURRENT_WORKSPACE));
    setProjectIdState(localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT));
  }, []);

  const setCurrentWorkspaceId = (id: string | null) => {
    setWorkspaceIdState(id);
    if (id) localStorage.setItem(STORAGE_KEYS.CURRENT_WORKSPACE, id);
    else localStorage.removeItem(STORAGE_KEYS.CURRENT_WORKSPACE);
  };

  const setCurrentProjectId = (id: string | null) => {
    setProjectIdState(id);
    if (id) localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, id);
    else localStorage.removeItem(STORAGE_KEYS.CURRENT_PROJECT);
  };

  return (
    <WorkspaceContext.Provider
      value={{ currentWorkspaceId, currentProjectId, setCurrentWorkspaceId, setCurrentProjectId }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspaceContext must be used within a WorkspaceProvider");
  return ctx;
}
