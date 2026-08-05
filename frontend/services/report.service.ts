import { apiClient } from "@/lib/axios";

/** Downloads the project's events as CSV. Uses a blob request (not a plain link) since the endpoint needs the auth header. */
export const reportService = {
  async downloadEventsCsv(projectId: string, startDate?: string, endDate?: string): Promise<void> {
    const response = await apiClient.get(`/projects/${projectId}/reports/events.csv`, {
      params: { start_date: startDate, end_date: endDate },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = `events_${startDate ?? "all"}_${endDate ?? "today"}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
