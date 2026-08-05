"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { ROUTES } from "@/constants/app.constants";
import { useAuth } from "@/context/AuthContext";

/** Wrap any page that requires a logged-in user with this. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-small text-gray-500">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
