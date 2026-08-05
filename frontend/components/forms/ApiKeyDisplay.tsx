"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";

export function ApiKeyDisplay({ apiKey, onContinue }: { apiKey: string; onContinue: () => void }) {
  const [copied, setCopied] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

  const snippet = `<script src="${typeof window !== "undefined" ? window.location.origin : ""}/sdk/analytics.js"></script>
<script>
  Analytics.init("${apiKey}", { apiUrl: "${apiUrl}" });
  Analytics.track("Page Viewed");
</script>`;

  const copySnippet = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="text-small text-gray-500 mb-1">Your project API key</p>
        <code className="block break-all text-small bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">{apiKey}</code>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <p className="text-small text-gray-500">Install the SDK</p>
          <button onClick={copySnippet} className="text-caption flex items-center gap-1 text-primary hover:underline">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="text-caption bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 overflow-x-auto">
          <code>{snippet}</code>
        </pre>
      </Card>

      <Button onClick={onContinue}>Go to dashboard</Button>
    </div>
  );
}
