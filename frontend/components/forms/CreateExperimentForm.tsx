"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { useCreateExperiment } from "@/hooks/useExperiments";
import { createExperimentSchema, type CreateExperimentValues } from "@/lib/validation/experiment.schema";
import type { Experiment } from "@/types/experiment.types";
import { getErrorMessage } from "@/utils/error.utils";

export function CreateExperimentForm({
  projectId,
  onCreated,
}: {
  projectId: string;
  onCreated: (experiment: Experiment) => void;
}) {
  const { mutateAsync, isPending } = useCreateExperiment(projectId);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateExperimentValues>({
    resolver: zodResolver(createExperimentSchema),
    defaultValues: {
      name: "",
      conversion_event: "",
      variants: [
        { name: "Control", traffic_allocation: 50 },
        { name: "Variant B", traffic_allocation: 50 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });
  const watchedVariants = useWatch({ control, name: "variants" });
  const total = (watchedVariants ?? []).reduce((sum, v) => sum + (Number(v?.traffic_allocation) || 0), 0);

  const onSubmit = async (values: CreateExperimentValues) => {
    try {
      const experiment = await mutateAsync(values);
      toast.success("Experiment created");
      onCreated(experiment);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create experiment"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <InputField
        id="experiment-name"
        label="Experiment name"
        placeholder="Checkout Button Color"
        error={errors.name?.message}
        {...register("name")}
      />
      <InputField
        id="conversion-event"
        label="Conversion event"
        placeholder="Purchase"
        error={errors.conversion_event?.message}
        {...register("conversion_event")}
      />

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-small font-medium text-gray-700 dark:text-gray-300">Variants</p>
          <p className={`text-caption ${total === 100 ? "text-gray-400" : "text-danger"}`}>{total}% allocated</p>
        </div>
        <div className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <input className="input-field flex-1" placeholder="Variant name" {...register(`variants.${index}.name` as const)} />
              <input
                type="number"
                className="input-field w-20"
                placeholder="%"
                {...register(`variants.${index}.traffic_allocation` as const)}
              />
              {fields.length > 2 && (
                <button
                  type="button"
                  aria-label="Remove variant"
                  onClick={() => remove(index)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.variants && (
          <p className="text-caption text-danger mt-1">
            {errors.variants.message ?? errors.variants.root?.message ?? "Check your variants"}
          </p>
        )}

        {fields.length < 6 && (
          <button
            type="button"
            onClick={() => append({ name: "", traffic_allocation: 0 })}
            className="mt-2 flex items-center gap-1 text-small text-primary hover:underline"
          >
            <Plus size={14} /> Add variant
          </button>
        )}
      </div>

      <Button type="submit" isLoading={isPending} className="mt-2">
        Create experiment
      </Button>
    </form>
  );
}
