"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { useAuth } from "@/context/AuthContext";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth.schema";
import { getErrorMessage } from "@/utils/error.utils";

export function LoginForm() {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(values);
    } catch (error) {
      toast.error(getErrorMessage(error, "Login failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <InputField
        id="email"
        label="Email"
        type="email"
        placeholder="you@company.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <InputField
        id="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />
      <Button type="submit" isLoading={isSubmitting} className="mt-2">
        Log in
      </Button>
      <p className="text-small text-center text-gray-600 dark:text-gray-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
