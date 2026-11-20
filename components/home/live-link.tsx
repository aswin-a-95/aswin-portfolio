"use client";

import type { ReactNode } from "react";
import { useSite } from "@/components/xray-provider";

/**
 * "live here" cards: turn X-ray on and jump to `href` (`#top` or `#break-my-ai`). The Break my AI
 * panel only exists while X-ray is on, so X-ray turns on first and the scroll waits for the target.
 */
export function LiveLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  const { setXray } = useSite();
  return (
    <a
      href={href}
      onClick={(e) => {
        setXray(true);
        const id = href.slice(1);
        if (document.getElementById(id)) return; // already rendered: the browser jumps there
        e.preventDefault();
        let frames = 0;
        const tryScroll = () => {
          const el = document.getElementById(id);
          if (el) {
            history.pushState(null, "", href);
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
          } else if (++frames < 60) requestAnimationFrame(tryScroll);
        };
        requestAnimationFrame(tryScroll);
      }}
      className={className}
    >
      {children}
    </a>
  );
}
