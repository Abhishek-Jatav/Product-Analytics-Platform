import type { Metadata } from "next";

import { RegisterForm } from "@/components/forms/RegisterForm";
import { AuthLayout } from "@/components/layout/AuthLayout";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <AuthLayout title="Create your account" subtitle="Start tracking your product in minutes">
      <RegisterForm />
    </AuthLayout>
  );
}
