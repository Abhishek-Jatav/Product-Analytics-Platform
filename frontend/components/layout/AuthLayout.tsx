import type { ReactNode } from "react";

import { APP_NAME } from "@/constants/app.constants";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-bold mb-3">
            P
          </div>
          <p className="text-caption uppercase tracking-wide text-gray-500">{APP_NAME}</p>
          <h1 className="text-h3 mt-1">{title}</h1>
          <p className="text-small text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="card">{children}</div>
      </div>
    </div>
  );
}
