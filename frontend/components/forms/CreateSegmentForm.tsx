"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { useCreateSegment } from "@/hooks/useSegments";
import { createSegmentSchema } from "@/lib/validation/segment.schema";
import type { Segment, SegmentCondition } from "@/types/segment.types";
import { getErrorMessage } from "@/utils/error.utils";

const emptyPropertyCondition: SegmentCondition = { type: "property", key: "", operator: "equals", value: "" };

export function CreateSegmentForm({ projectId, onCreated }: { projectId: string; onCreated: (segment: Segment) => void }) {
  const { mutateAsync, isPending } = useCreateSegment(projectId);
  const [name, setName] = useState("");
  const [conditions, setConditions] = useState<SegmentCondition[]>([emptyPropertyCondition]);
  const [formError, setFormError] = useState<string | null>(null);

  const updateCondition = (index: number, patch: Partial<SegmentCondition>) => {
    setConditions((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const changeType = (index: number, type: "property" | "event") => {
    setConditions((prev) =>
      prev.map((c, i) =>
        i === index
          ? type === "property"
            ? { type: "property", key: "", operator: "equals", value: "" }
            : { type: "event", event_name: "", operator: "at_least", count: 1 }
          : c
      )
    );
  };

  const onSubmit = async () => {
    setFormError(null);
    const parsed = createSegmentSchema.safeParse({ name, conditions });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }

    try {
      const segment = await mutateAsync(parsed.data);
      toast.success("Segment created");
      onCreated(segment);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create segment"));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <InputField id="segment-name" label="Segment name" placeholder="Power users" value={name} onChange={(e) => setName(e.target.value)} />

      <div>
        <p className="text-small font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Conditions <span className="text-caption text-gray-400 font-normal">(all must match)</span>
        </p>
        <div className="flex flex-col gap-2">
          {conditions.map((condition, index) => (
            <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <select
                className="input-field w-28"
                value={condition.type}
                onChange={(e) => changeType(index, e.target.value as "property" | "event")}
              >
                <option value="property">Property</option>
                <option value="event">Event</option>
              </select>

              {condition.type === "property" ? (
                <>
                  <input
                    className="input-field flex-1"
                    placeholder="key (e.g. country)"
                    value={condition.key ?? ""}
                    onChange={(e) => updateCondition(index, { key: e.target.value })}
                  />
                  <select
                    className="input-field w-32"
                    value={condition.operator}
                    onChange={(e) => updateCondition(index, { operator: e.target.value as SegmentCondition["operator"] })}
                  >
                    <option value="equals">equals</option>
                    <option value="not_equals">not equals</option>
                    <option value="contains">contains</option>
                  </select>
                  <input
                    className="input-field flex-1"
                    placeholder="value"
                    value={condition.value ?? ""}
                    onChange={(e) => updateCondition(index, { value: e.target.value })}
                  />
                </>
              ) : (
                <>
                  <input
                    className="input-field flex-1"
                    placeholder="event name (e.g. Purchase)"
                    value={condition.event_name ?? ""}
                    onChange={(e) => updateCondition(index, { event_name: e.target.value })}
                  />
                  <select
                    className="input-field w-32"
                    value={condition.operator}
                    onChange={(e) => updateCondition(index, { operator: e.target.value as SegmentCondition["operator"] })}
                  >
                    <option value="at_least">at least</option>
                    <option value="exactly">exactly</option>
                    <option value="never">never</option>
                  </select>
                  {condition.operator !== "never" && (
                    <input
                      type="number"
                      className="input-field w-20"
                      placeholder="count"
                      value={condition.count ?? 1}
                      onChange={(e) => updateCondition(index, { count: Number(e.target.value) })}
                    />
                  )}
                </>
              )}

              {conditions.length > 1 && (
                <button
                  type="button"
                  aria-label="Remove condition"
                  onClick={() => setConditions((prev) => prev.filter((_, i) => i !== index))}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        {formError && <p className="text-caption text-danger mt-1">{formError}</p>}

        <button
          type="button"
          onClick={() => setConditions((prev) => [...prev, emptyPropertyCondition])}
          className="mt-2 flex items-center gap-1 text-small text-primary hover:underline"
        >
          <Plus size={14} /> Add condition
        </button>
      </div>

      <Button onClick={onSubmit} isLoading={isPending} className="mt-2">
        Create segment
      </Button>
    </div>
  );
}
