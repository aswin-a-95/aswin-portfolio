import Link from "next/link";
import type { Post } from "@/lib/schemas/content";

export function FromTheLog({ posts }: { posts: Post[] }) {
  return (
    <section aria-labelledby="log-h" className="border-t border-rule px-6 py-16">
      <div className="mx-auto flex max-w-[1040px] flex-col gap-[18px]">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="log-h" className="m-0 font-serif text-[36px] font-normal">
            From the build log
          </h2>
          <Link href="/log" className="inline-flex min-h-11 items-center text-[15px] text-accent">
            All posts →
          </Link>
        </div>
        <div className="flex flex-col">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/log/${p.slug}`}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-rule py-[18px] text-ink no-underline"
            >
              <span className="font-serif text-[23px] leading-[1.3]">{p.title}</span>
              <span className="font-mono text-[12px] text-muted">
                {p.tag} · {p.date}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
