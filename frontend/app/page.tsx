"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ROUTES } from "@/constants/app.constants";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? ROUTES.DASHBOARD : ROUTES.LOGIN);
  }, [isLoading, user, router]);

  return null;
}
