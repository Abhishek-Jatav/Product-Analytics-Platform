"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/common/Button";
import { EventFilterBar } from "@/components/dashboard/EventFilterBar";
import { EventTable } from "@/components/dashboard/EventTable";
import { LiveEventTicker } from "@/components/dashboard/LiveEventTicker";
import { LiveToggle } from "@/components/dashboard/LiveToggle";
import { Pagination } from "@/components/dashboard/Pagination";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useWorkspaceContext } from "@/context/WorkspaceContext";
import { useEventNames, useEvents } from "@/hooks/useEvents";
import { useLiveEvents } from "@/hooks/useLiveEvents";
import { reportService } from "@/services/report.service";
import { getErrorMessage } from "@/utils/error.utils";

const PAGE_SIZE = 25;

export default function EventsPage() {
  const { currentProjectId } = useWorkspaceContext();
  const [eventName, setEventName] = useState("");
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const { data: eventNames = [] } = useEventNames(currentProjectId);
  const { data, isLoading, refetch } = useEvents(currentProjectId, {
    event_name: eventName || undefined,
    page,
    page_size: PAGE_SIZE,
  });
  const { events: liveEvents, isConnected } = useLiveEvents(currentProjectId, isLive);

  const handleFilterChange = (value: string) => {
    setEventName(value);
    setPage(1);
  };

  const handleExport = async () => {
    if (!currentProjectId) return;
    setIsExporting(true);
    try {
      await reportService.downloadEventsCsv(currentProjectId);
      toast.success("Export complete");
    } catch (error) {
      toast.error(getErrorMessage(error, "Export failed"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-h2">Event Explorer</h1>
          <p className="text-small text-gray-500 mt-1">Every event tracked by your SDK, in real time.</p>
        </div>
        <div className="flex items-center gap-2">
          <LiveToggle
            enabled={isLive}
            isConnected={isConnected}
            onToggle={() => {
              const next = !isLive;
              setIsLive(next);
              if (!next) refetch(); // refresh the table with anything that came in while live
            }}
          />
          <EventFilterBar eventNames={eventNames} selected={eventName} onChange={handleFilterChange} />
          <Button variant="ghost" onClick={handleExport} isLoading={isExporting}>
            <Download size={14} className="mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>

      {isLive && <LiveEventTicker events={liveEvents} />}

      <EventTable events={data?.items ?? []} isLoading={isLoading} />

      {data && <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />}
    </DashboardShell>
  );
}
