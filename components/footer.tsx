import { siteMeta } from "@/content/site-meta";

// The artboards use a different inner width per page.
const WIDTHS = { 880: "max-w-[880px]", 1040: "max-w-[1040px]", 1200: "max-w-[1200px]" } as const;

/** The deploy date, filled at build time (next.config `BUILD_DATE`, e.g. "20 Nov 2026"). Never hard-coded. */
const updated = `Updated ${process.env.BUILD_DATE}`;

/**
 * Footer on every page (design update 4). `phone` adds the one-line phone footer from
 * Mobile.dc.html, which replaces this one at ≤ 640px (home only; other pages aren't drawn at 390).
 */
export function Footer({ maxWidth, phone = false }: { maxWidth: keyof typeof WIDTHS; phone?: boolean }) {
  return (
    <>
      <footer className={`border-t border-rule px-6 py-7 ${phone ? "max-[640px]:hidden" : ""}`}>
        <div
          className={`mx-auto flex flex-wrap justify-between gap-3 font-mono text-[12px] text-muted ${WIDTHS[maxWidth]}`}
        >
          <span>This site is an AI product. Turn on X-ray to see how it works.</span>
          <span>
            {updated} · © 2026 Aswin · {siteMeta.domain}
          </span>
        </div>
      </footer>
      {phone && (
        <footer className="hidden border-t border-rule p-5 font-mono text-[12px] text-muted max-[640px]:block">
          {updated} · © 2026 Aswin
        </footer>
      )}
    </>
  );
}
