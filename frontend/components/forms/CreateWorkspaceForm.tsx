"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { useCreateWorkspace } from "@/hooks/useWorkspaces";
import { workspaceNameSchema, type WorkspaceNameValues } from "@/lib/validation/workspace.schema";
import { getErrorMessage } from "@/utils/error.utils";

export function CreateWorkspaceForm({ onCreated }: { onCreated: (workspaceId: string) => void }) {
  const { mutateAsync, isPending } = useCreateWorkspace();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkspaceNameValues>({ resolver: zodResolver(workspaceNameSchema) });

  const onSubmit = async (values: WorkspaceNameValues) => {
    try {
      const workspace = await mutateAsync(values.name);
      toast.success("Workspace created");
      onCreated(workspace.id);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create workspace"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <InputField
        id="workspace-name"
        label="Workspace name"
        placeholder="Acme Inc"
        error={errors.name?.message}
        {...register("name")}
      />
      <Button type="submit" isLoading={isPending}>
        Create workspace
      </Button>
    </form>
  );
}
