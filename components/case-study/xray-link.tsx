"use client";

import { useSite } from "@/components/xray-provider";

export function XrayLinkButton() {
  const { xray, toggleXray } = useSite();
  return (
    <button
      type="button"
      onClick={toggleXray}
      className="min-h-11 cursor-pointer rounded-[10px] border border-rule bg-paper px-[14px] py-2 font-sans text-[15px] text-ink"
    >
      {xray ? "Close How I built this" : "How I built this (X-ray)"}
    </button>
  );
}
