import clsx from "clsx";
import type { ReactNode } from "react";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("card", className)}>{children}</div>;
}
