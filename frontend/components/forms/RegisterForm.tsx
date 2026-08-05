"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { useAuth } from "@/context/AuthContext";
import { registerSchema, type RegisterFormValues } from "@/lib/validation/auth.schema";
import { getErrorMessage } from "@/utils/error.utils";

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await registerUser(values);
    } catch (error) {
      toast.error(getErrorMessage(error, "Registration failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <InputField id="name" label="Full name" placeholder="Ada Lovelace" error={errors.name?.message} {...register("name")} />
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
        placeholder="At least 8 characters"
        error={errors.password?.message}
        {...register("password")}
      />
      <Button type="submit" isLoading={isSubmitting} className="mt-2">
        Create account
      </Button>
      <p className="text-small text-center text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
