"use client";

import { Check, Copy, KeyRound } from "lucide-react";
import { useState } from "react";

import { Card } from "@/components/common/Card";
import { useApiKey } from "@/hooks/useApiKey";

export function ApiKeyCard({ projectId }: { projectId: string | null }) {
  const { data: apiKey, isLoading } = useApiKey(projectId);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-small text-gray-500">
          <KeyRound size={14} />
          <span>Project API key</span>
        </div>
        <button
          onClick={handleCopy}
          disabled={!apiKey}
          className="text-caption flex items-center gap-1 text-primary hover:underline disabled:opacity-40 disabled:cursor-not-allowed">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {isLoading ? (
        <p className="text-small text-gray-500">Loading key…</p>
      ) : apiKey ? (
        <code className="block break-all text-small bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
          {apiKey.key}
        </code>
      ) : (
        <p className="text-small text-gray-500">
          No API key found for this project.
        </p>
      )}
    </Card>
  );
}
