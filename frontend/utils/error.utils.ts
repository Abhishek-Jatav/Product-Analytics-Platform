import { AxiosError } from "axios";

/** Pulls the backend's `message` field out of a failed request, with a safe fallback. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof AxiosError) {
    return (error.response?.data as { message?: string } | undefined)?.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
