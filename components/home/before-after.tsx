import Link from "next/link";
import { beforeAfter } from "@/content/before-after";
import { published } from "@/lib/content";

export function BeforeAfter() {
  const cards = published(beforeAfter);
  if (cards.length === 0) return null;
  return (
    <section aria-labelledby="ba-h" className="border-t border-rule px-6 py-14">
      <div className="mx-auto flex max-w-[1040px] flex-col gap-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="ba-h" className="m-0 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
            Before / after AI
          </h2>
          <p className="m-0 font-mono text-[12px] text-muted">
            business impact · measured runs only · never mixed with eval or usage numbers
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[14px]">
          {cards.map((b) => (
            <Link
              key={b.task}
              href={b.href}
              className="flex flex-col gap-[14px] rounded-xl border border-rule bg-paper p-5 text-ink no-underline"
            >
              <p className="m-0 text-[16px] font-semibold">{b.task}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[11px] tracking-[0.06em] text-muted">MANUAL</span>
                  <span className="font-mono text-[20px] text-muted">{b.manual}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[11px] tracking-[0.06em] text-accent">WITH THE AGENT</span>
                  <span className="font-mono text-[20px] text-ink">{b.agent}</span>
                </div>
              </div>
              <span className="font-mono text-[12px] text-accent">{b.source} →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
