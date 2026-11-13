"use client";

import type { ReactNode } from "react";
import { useSite } from "@/components/xray-provider";

/** "live here" cards: turn X-ray on and jump to the hero (#top). */
export function LiveLink({ className, children }: { className: string; children: ReactNode }) {
  const { setXray } = useSite();
  return (
    <a href="#top" onClick={() => setXray(true)} className={className}>
      {children}
    </a>
  );
}
