"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiKeyDisplay } from "@/components/forms/ApiKeyDisplay";
import { CreateProjectForm } from "@/components/forms/CreateProjectForm";
import { CreateWorkspaceForm } from "@/components/forms/CreateWorkspaceForm";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { ROUTES } from "@/constants/app.constants";
import { useWorkspaceContext } from "@/context/WorkspaceContext";
import type { ProjectWithKey } from "@/types/workspace.types";

type Step = "workspace" | "project" | "key";

/**
 * First-run flow for a brand-new account: create a workspace, create a
 * project inside it (which mints an API key), then hand the user their
 * key + SDK snippet before dropping them into the dashboard.
 */
export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("workspace");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [projectResult, setProjectResult] = useState<ProjectWithKey | null>(null);
  const { setCurrentWorkspaceId, setCurrentProjectId } = useWorkspaceContext();
  const router = useRouter();

  const stepConfig: Record<Step, { title: string; subtitle: string }> = {
    workspace: { title: "Create your workspace", subtitle: "This is where your team's projects live" },
    project: { title: "Create your first project", subtitle: "A project is a single product you want to track" },
    key: { title: "You're all set", subtitle: "Add this snippet to start tracking events" },
  };

  return (
    <ProtectedRoute>
      <AuthLayout title={stepConfig[step].title} subtitle={stepConfig[step].subtitle}>
        {step === "workspace" && (
          <CreateWorkspaceForm
            onCreated={(id) => {
              setWorkspaceId(id);
              setCurrentWorkspaceId(id);
              setStep("project");
            }}
          />
        )}

        {step === "project" && workspaceId && (
          <CreateProjectForm
            workspaceId={workspaceId}
            onCreated={(result) => {
              setProjectResult(result);
              setCurrentProjectId(result.project.id);
              setStep("key");
            }}
          />
        )}

        {step === "key" && projectResult && (
          <ApiKeyDisplay apiKey={projectResult.api_key.key} onContinue={() => router.push(ROUTES.DASHBOARD)} />
        )}
      </AuthLayout>
    </ProtectedRoute>
  );
}
