import type { ComponentPropsWithoutRef } from "react";

/** The X-RAY pill pinned top-right of every X-ray panel (design update 3, CHANGES.md §0). */
export function XrayPill() {
  return (
    <span className="absolute top-[10px] right-3 rounded-full border border-xr-accent px-2 py-[2px] font-mono text-[10px] tracking-[0.1em] text-xr-accent">
      X-RAY
    </span>
  );
}

/**
 * An inline X-ray panel: the X-ray panel tokens, `1px solid` rule and the X-RAY pill (SPEC §3).
 * `className` carries the radius, padding and layout, which differ per panel. Server-safe: pages
 * decide whether it shows (`xray` from `useSite()`, or the `.xray-only` class).
 */
export function XrayPanel({
  paper = false,
  className = "",
  children,
  ...rest
}: ComponentPropsWithoutRef<"div"> & { /** X-ray `paper` instead of `bg` (the Break my AI panel). */ paper?: boolean }) {
  return (
    <div {...rest} className={`relative border border-xr-rule text-xr-ink ${paper ? "bg-xr-paper" : "bg-xr-bg"} ${className}`}>
      <XrayPill />
      {children}
    </div>
  );
}
