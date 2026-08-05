"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { useCreateProject } from "@/hooks/useProjects";
import { projectNameSchema, type ProjectNameValues } from "@/lib/validation/workspace.schema";
import type { ProjectWithKey } from "@/types/workspace.types";
import { getErrorMessage } from "@/utils/error.utils";

export function CreateProjectForm({
  workspaceId,
  onCreated,
}: {
  workspaceId: string;
  onCreated: (result: ProjectWithKey) => void;
}) {
  const { mutateAsync, isPending } = useCreateProject(workspaceId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectNameValues>({ resolver: zodResolver(projectNameSchema) });

  const onSubmit = async (values: ProjectNameValues) => {
    try {
      const result = await mutateAsync(values.name);
      toast.success("Project created");
      onCreated(result);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create project"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <InputField
        id="project-name"
        label="Project name"
        placeholder="EyePilot Web"
        error={errors.name?.message}
        {...register("name")}
      />
      <Button type="submit" isLoading={isPending}>
        Create project
      </Button>
    </form>
  );
}
