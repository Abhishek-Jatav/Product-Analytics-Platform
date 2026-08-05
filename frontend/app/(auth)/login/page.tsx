import type { Metadata } from "next";

import { LoginForm } from "@/components/forms/LoginForm";
import { AuthLayout } from "@/components/layout/AuthLayout";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your workspace">
      <LoginForm />
    </AuthLayout>
  );
}
