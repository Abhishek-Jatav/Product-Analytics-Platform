"use client";

import type { ReactNode } from "react";

import { Navbar } from "@/components/layout/Navbar";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import { useEnsureWorkspace } from "@/hooks/useEnsureWorkspace";

function DashboardGate({ children }: { children: ReactNode }) {
  const { isReady } = useEnsureWorkspace();

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-small text-gray-500">
        Loading your workspace…
      </div>
    );
  }

  return <>{children}</>;
}

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardGate>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">{children}</main>
          </div>
        </div>
      </DashboardGate>
    </ProtectedRoute>
  );
}
