"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ROUTES } from "@/constants/app.constants";
import { useWorkspaceContext } from "@/context/WorkspaceContext";
import { useProjects } from "@/hooks/useProjects";
import { useWorkspaces } from "@/hooks/useWorkspaces";

/**
 * Ensures the user always has a selected workspace + project once they're
 * past auth. Sends brand-new accounts (zero workspaces) to /onboarding,
 * and falls back to the first workspace/project otherwise.
 */
export function useEnsureWorkspace() {
  const router = useRouter();
  const { currentWorkspaceId, currentProjectId, setCurrentWorkspaceId, setCurrentProjectId } = useWorkspaceContext();
  const { data: workspaces, isLoading: workspacesLoading } = useWorkspaces();
  const { data: projects, isLoading: projectsLoading } = useProjects(currentWorkspaceId);

  useEffect(() => {
    if (workspacesLoading) return;
    if (!workspaces || workspaces.length === 0) {
      router.replace(ROUTES.ONBOARDING);
      return;
    }
    if (!currentWorkspaceId || !workspaces.some((w) => w.id === currentWorkspaceId)) {
      const first = workspaces[0];
      if (first) setCurrentWorkspaceId(first.id);
    }
  }, [workspaces, workspacesLoading, currentWorkspaceId, router, setCurrentWorkspaceId]);

  useEffect(() => {
    if (projectsLoading || !currentWorkspaceId) return;
    if (projects && projects.length === 0) {
      router.replace(ROUTES.ONBOARDING);
      return;
    }
    if (projects && (!currentProjectId || !projects.some((p) => p.id === currentProjectId))) {
      const first = projects[0];
      if (first) setCurrentProjectId(first.id);
    }
  }, [projects, projectsLoading, currentWorkspaceId, currentProjectId, router, setCurrentProjectId]);

  return {
    isReady: !workspacesLoading && !projectsLoading && !!currentWorkspaceId && !!currentProjectId,
  };
}
