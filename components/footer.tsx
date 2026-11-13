import { siteMeta } from "@/content/site-meta";

// The artboards use a different inner width per page.
const WIDTHS = { 880: "max-w-[880px]", 1040: "max-w-[1040px]", 1200: "max-w-[1200px]" } as const;

export function Footer({ maxWidth }: { maxWidth: keyof typeof WIDTHS }) {
  return (
    <footer className="border-t border-rule px-6 py-7">
      <div
        className={`mx-auto flex flex-wrap justify-between gap-3 font-mono text-[12px] text-muted ${WIDTHS[maxWidth]}`}
      >
        <span>This site is an AI product. Turn on X-ray to see how it works.</span>
        <span>© 2026 Aswin · {siteMeta.domain}</span>
      </div>
    </footer>
  );
}
