import Link from "next/link";
import type { CaseStudy } from "@/lib/schemas/content";

const isInUse = (status: string) => status.startsWith("IN USE");

/**
 * "Proof, one click away." (Main.dc.html) plus the phone list (Mobile.dc.html, ≤ 640px).
 * `headingLevel` is 1 on the standalone /work page (a design gap, SPEC §4).
 */
export function WorkSection({ studies, headingLevel = 2 }: { studies: CaseStudy[]; headingLevel?: 1 | 2 }) {
  const H = headingLevel === 1 ? "h1" : "h2";
  return (
    <>
      <section aria-labelledby="work-h" className="border-t border-rule px-6 py-16 max-[640px]:hidden">
        <div className="mx-auto flex max-w-[1040px] flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="m-0 font-mono text-[12px] uppercase tracking-[0.08em] text-muted">Work · written like PRDs</p>
            <H id="work-h" className="m-0 font-serif text-[44px] font-normal leading-[1.1] tracking-[-0.01em]">
              Proof, one click away.
            </H>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(420px,1fr))] gap-4">
            {studies.map((c) => (
              <Link
                key={c.slug}
                href={`/work/${c.slug}`}
                className="box-border flex min-h-[230px] flex-col gap-[14px] rounded-[14px] border border-rule bg-paper p-[26px] text-ink no-underline"
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <span className="flex items-center gap-[10px]">
                    <span className="font-mono text-[12px] text-muted">{c.num}</span>
                    <span
                      className={`rounded-full border px-2 py-[3px] font-mono text-[11px] tracking-[0.06em] ${
                        isInUse(c.status) ? "border-accent text-accent" : "border-rule text-muted"
                      }`}
                    >
                      {c.status}
                    </span>
                  </span>
                  <span className="font-mono text-[12px] text-muted">{c.cardLabel}</span>
                </div>
                <h3 className="m-0 font-serif text-[30px] font-normal leading-[1.15]">{c.cardTitle}</h3>
                <p className="m-0 text-[16px] leading-[1.5] text-muted">{c.angle}</p>
                <p className="m-0 text-[15px] leading-[1.5]">
                  <span className="font-mono text-[11px] tracking-[0.06em] text-muted">WHAT I BUILT </span>
                  {c.built}
                </p>
                {c.flow && (
                  <div className="flex flex-wrap items-center gap-[6px] font-mono text-[12px]">
                    {c.flow.map((f, i) => (
                      <span key={f.label} className="contents">
                        <span
                          className={`rounded-md px-2 py-1 ${
                            f.approval ? "border-[1.5px] border-dashed border-amber-border text-amber-text" : "border border-rule text-ink"
                          }`}
                        >
                          {f.label}
                        </span>
                        {i < c.flow!.length - 1 && <span className="text-muted">→</span>}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-auto flex flex-wrap gap-[6px]">
                  {c.tags.map((tag) => (
                    <span key={tag} className="rounded-md border border-rule px-2 py-1 font-mono text-[12px] text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="xray-only m-0 border-t border-dashed border-rule pt-3 font-mono text-[12px] text-muted">{c.xr}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="m-work"
        className="hidden flex-col gap-3 border-t border-rule px-5 pt-9 pb-14 max-[640px]:flex"
      >
        <H id="m-work" className="m-0 mb-1 font-serif text-[30px] font-normal">
          Proof, one tap away.
        </H>
        {studies
          .filter((c) => c.onPhone)
          .map((c) => (
            <Link
              key={c.slug}
              href={`/work/${c.slug}`}
              className={`flex flex-col rounded-xl border border-rule bg-paper px-4 py-[14px] no-underline ${
                c.flow ? "gap-2" : "gap-[6px]"
              }`}
            >
              <span className={`font-mono text-[11px] ${isInUse(c.status) ? "text-accent" : "text-muted"}`}>
                {[c.status, ...c.tags.slice(0, 2)].join(" · ")}
              </span>
              <span className="text-[16px]">{c.cardTitle}</span>
              {c.flow && (
                <span className="font-mono text-[12px] text-muted">
                  {c.flow.map((f, i) => (
                    <span key={f.label}>
                      {f.approval ? <span className="text-amber-text">{f.label}</span> : f.label}
                      {i < c.flow!.length - 1 ? " → " : ""}
                    </span>
                  ))}
                </span>
              )}
            </Link>
          ))}
      </section>
    </>
  );
}
