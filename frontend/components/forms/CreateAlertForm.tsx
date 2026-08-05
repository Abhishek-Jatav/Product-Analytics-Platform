"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { useCreateAlert } from "@/hooks/useAlerts";
import { createAlertSchema, type CreateAlertValues } from "@/lib/validation/alert.schema";
import type { AlertRule } from "@/types/alert.types";
import { getErrorMessage } from "@/utils/error.utils";

const METRIC_LABELS: Record<string, string> = { dau: "Daily Active Users", revenue: "Revenue", conversion_rate: "Conversion Rate" };

export function CreateAlertForm({ projectId, onCreated }: { projectId: string; onCreated: (rule: AlertRule) => void }) {
  const { mutateAsync, isPending } = useCreateAlert(projectId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAlertValues>({
    resolver: zodResolver(createAlertSchema),
    defaultValues: { metric: "dau", direction: "drop", threshold_percent: 20 },
  });

  const onSubmit = async (values: CreateAlertValues) => {
    try {
      const rule = await mutateAsync(values);
      toast.success("Alert rule created");
      onCreated(rule);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create alert rule"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <InputField id="alert-name" label="Alert name" placeholder="DAU Drop Alert" error={errors.name?.message} {...register("name")} />

      <div className="flex flex-col gap-1.5">
        <label className="text-small font-medium text-gray-700 dark:text-gray-300">Metric</label>
        <select className="input-field" {...register("metric")}>
          {Object.entries(METRIC_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-small font-medium text-gray-700 dark:text-gray-300">Alert me when it</label>
        <select className="input-field" {...register("direction")}>
          <option value="drop">Drops</option>
          <option value="spike">Spikes</option>
        </select>
      </div>

      <InputField
        id="threshold"
        label="Threshold (% change vs. previous day)"
        type="number"
        step="1"
        error={errors.threshold_percent?.message}
        {...register("threshold_percent")}
      />

      <Button type="submit" isLoading={isPending} className="mt-2">
        Create alert
      </Button>
    </form>
  );
}
