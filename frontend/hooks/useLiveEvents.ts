"use client";

import { useEffect, useRef, useState } from "react";

import { tokenStorage } from "@/utils/token.utils";
import type { AnalyticsEvent } from "@/types/event.types";

const MAX_LIVE_EVENTS = 20;

function wsUrl(projectId: string, token: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  const wsBase = apiUrl.replace(/^http/, "ws");
  return `${wsBase}/ws/projects/${projectId}/live?token=${encodeURIComponent(token)}`;
}

export function useLiveEvents(projectId: string | null, enabled: boolean) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled || !projectId) {
      socketRef.current?.close();
      setIsConnected(false);
      return;
    }

    const token = tokenStorage.getAccessToken();
    if (!token) return;

    const socket = new WebSocket(wsUrl(projectId, token));
    socketRef.current = socket;

    socket.onopen = () => setIsConnected(true);
    socket.onclose = () => setIsConnected(false);
    socket.onerror = () => setIsConnected(false);

    socket.onmessage = (message) => {
      try {
        const payload = JSON.parse(message.data);
        if (payload.type !== "event") return;
        setEvents((prev) => [
          { id: payload.id, name: payload.name, distinct_id: payload.distinct_id, properties: payload.properties, timestamp: payload.timestamp },
          ...prev,
        ].slice(0, MAX_LIVE_EVENTS));
      } catch {
        // ignore malformed frames
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [projectId, enabled]);

  return { events, isConnected };
}
