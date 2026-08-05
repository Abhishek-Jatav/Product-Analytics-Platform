"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { useInviteMember } from "@/hooks/useWorkspaces";
import { inviteMemberSchema, type InviteMemberValues } from "@/lib/validation/team.schema";
import { getErrorMessage } from "@/utils/error.utils";

export function InviteMemberForm({ workspaceId, onInvited }: { workspaceId: string; onInvited: () => void }) {
  const { mutateAsync, isPending } = useInviteMember(workspaceId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteMemberValues>({ resolver: zodResolver(inviteMemberSchema), defaultValues: { role: "member" } });

  const onSubmit = async (values: InviteMemberValues) => {
    try {
      await mutateAsync(values);
      toast.success("Member added");
      onInvited();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not add member"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <InputField
        id="invite-email"
        label="Email"
        type="email"
        placeholder="teammate@company.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <p className="text-caption text-gray-400 -mt-2">They need an existing account to be added.</p>

      <div className="flex flex-col gap-1.5">
        <label className="text-small font-medium text-gray-700 dark:text-gray-300">Role</label>
        <select className="input-field" {...register("role")}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <Button type="submit" isLoading={isPending} className="mt-2">
        Add to workspace
      </Button>
    </form>
  );
}
