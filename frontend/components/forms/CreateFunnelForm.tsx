"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { useCreateFunnel } from "@/hooks/useFunnels";
import { createFunnelSchema, type CreateFunnelValues } from "@/lib/validation/funnel.schema";
import type { Funnel } from "@/types/funnel.types";
import { getErrorMessage } from "@/utils/error.utils";

export function CreateFunnelForm({ projectId, onCreated }: { projectId: string; onCreated: (funnel: Funnel) => void }) {
  const { mutateAsync, isPending } = useCreateFunnel(projectId);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFunnelValues>({
    resolver: zodResolver(createFunnelSchema),
    defaultValues: { name: "", steps: ["", ""] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "steps" as never });

  const onSubmit = async (values: CreateFunnelValues) => {
    try {
      const funnel = await mutateAsync(values);
      toast.success("Funnel created");
      onCreated(funnel);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create funnel"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <InputField
        id="funnel-name"
        label="Funnel name"
        placeholder="Onboarding"
        error={errors.name?.message}
        {...register("name")}
      />

      <div>
        <p className="text-small font-medium text-gray-700 dark:text-gray-300 mb-1.5">Steps, in order</p>
        <div className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <span className="text-caption text-gray-400 w-4">{index + 1}</span>
              <input
                className="input-field"
                placeholder="e.g. Signup"
                {...register(`steps.${index}` as const)}
              />
              {fields.length > 2 && (
                <button
                  type="button"
                  aria-label="Remove step"
                  onClick={() => remove(index)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.steps && <p className="text-caption text-danger mt-1">{errors.steps.message as string}</p>}

        {fields.length < 10 && (
          <button
            type="button"
            onClick={() => append("")}
            className="mt-2 flex items-center gap-1 text-small text-primary hover:underline"
          >
            <Plus size={14} /> Add step
          </button>
        )}
      </div>

      <Button type="submit" isLoading={isPending} className="mt-2">
        Create funnel
      </Button>
    </form>
  );
}
