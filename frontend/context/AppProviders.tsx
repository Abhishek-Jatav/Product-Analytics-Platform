"use client";

import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "@/context/AuthContext";
import { QueryProvider } from "@/context/QueryProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import { WorkspaceProvider } from "@/context/WorkspaceContext";

/**
 * Single wrapper mounted once in the root layout.
 * Order matters: Query and Theme don't depend on Auth, but Auth's
 * router redirects assume Theme/Toaster are already mounted.
 * Workspace state depends on Auth being resolved first.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <WorkspaceProvider>
            {children}
            <Toaster position="top-right" />
          </WorkspaceProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
