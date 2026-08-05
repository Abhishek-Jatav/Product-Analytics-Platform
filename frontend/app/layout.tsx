import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppProviders } from "@/context/AppProviders";
import { APP_NAME } from "@/constants/app.constants";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: "Track user behavior, funnels, retention, and experiments in one place.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
