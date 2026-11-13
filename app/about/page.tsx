import type { Metadata } from "next";
import { DependencyGraph } from "@/components/about/dependency-graph";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { deps, graphProjects } from "@/content/career-graph";
import { certificates } from "@/content/certificates";
import { notDone } from "@/content/kb/not-done";
import { projects } from "@/content/kb/projects";
import { roles } from "@/content/kb/roles";
import { siteMeta } from "@/content/site-meta";
import { hrefOf } from "@/lib/content";

export const metadata: Metadata = { title: "About Aswin" };

export default function About() {
  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <Nav current="about" />
      <main className="mx-auto flex max-w-[1040px] flex-col gap-[72px] px-6 pt-[72px] pb-24">
        <header className="flex flex-wrap items-start gap-x-14 gap-y-8">
          <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
            <p className="m-0 font-mono text-[12px] tracking-[0.08em] text-muted">ABOUT</p>
            <h1 className="m-0 font-serif text-[clamp(44px,6vw,68px)] font-normal leading-[1.04] tracking-[-0.02em]">
              From platform plumbing to agents.
            </h1>
            <div className="flex flex-col gap-4 font-serif text-[21px] leading-[1.55]">
              <p className="m-0">
                I&apos;ve spent <span className="font-mono text-[16px] text-muted">{siteMeta.yearsOfExperience}</span> years as a
                product manager on platforms, APIs and integrations, including in healthcare. Platforms taught me that the hard
                part of software is the seams between systems.
              </p>
              <p className="m-0">
                Now I build AI agents: a job-search agent, an Instagram competitor agent for Dhee&apos;s, the fresh dog-food brand I
                run, and this site. Agents live at those same seams.
              </p>
              <p className="m-0 text-muted">
                I don&apos;t claim years of professional LLM experience. I claim built and shipped, and every project here can be
                checked.
              </p>
            </div>
          </div>
          <aside className="flex flex-[1_1_260px] flex-col gap-3 rounded-[14px] border border-rule bg-paper p-[22px]">
            <p className="m-0 font-mono text-[11px] tracking-[0.06em] text-muted">RESUME</p>
            <a
              href="/resume.pdf"
              className="inline-flex min-h-12 items-center justify-center rounded-[10px] bg-btn-bg px-[18px] py-[10px] text-[16px] font-semibold text-btn-ink no-underline"
            >
              Download resume (PDF)
            </a>
            <p className="m-0 font-mono text-[12px] leading-[1.6] text-muted">
              Built from the same master resume as the fit check, so the two never disagree. Updated {siteMeta.resumeUpdated}.
            </p>
            <p className="xray-only m-0 border-t border-dashed border-rule pt-[10px] font-mono text-[12px] leading-[1.6] text-muted">
              knowledge base: {roles.length} roles · {projects.length} projects · {notDone.length} not-done entries · synced{" "}
              {siteMeta.kbSynced}
            </p>
          </aside>
        </header>

        <section aria-labelledby="graph-h" className="flex flex-col gap-[22px]">
          <div className="flex flex-col gap-2">
            <p className="m-0 font-mono text-[12px] tracking-[0.08em] text-muted">CAREER AS A DEPENDENCY GRAPH</p>
            <h2 id="graph-h" className="m-0 font-serif text-[40px] font-normal leading-[1.1]">
              Integrations experience is agent experience.
            </h2>
            <p className="m-0 text-[16px] text-muted">Pick a project to see which earlier work it depends on.</p>
          </div>
          <DependencyGraph deps={deps} projects={graphProjects} />
        </section>

        <section aria-labelledby="roles-h" className="flex flex-col gap-[14px]">
          <h2 id="roles-h" className="m-0 font-serif text-[34px] font-normal">
            Roles
          </h2>
          <div className="flex flex-col border-t border-rule">
            {roles.map((r) => (
              <div key={r.id} className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-b border-rule py-[18px]">
                <div className="flex flex-col gap-1">
                  <span className="text-[17px] font-semibold">
                    {r.title} · {r.company}
                  </span>
                  <span className="font-mono text-[13px] text-muted">{r.summary}</span>
                </div>
                <span className="font-mono text-[13px] text-muted">{r.years}</span>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="cert-h" className="flex flex-col gap-3">
          <h2 id="cert-h" className="m-0 font-mono text-[12px] font-medium tracking-[0.08em] text-muted">
            CERTIFICATES
          </h2>
          <div className="flex flex-wrap gap-[10px]">
            {certificates.map((c) => (
              <a
                key={c.label}
                href={hrefOf(c.href)}
                className="inline-flex min-h-11 items-center gap-[10px] rounded-lg border border-rule bg-paper px-3 py-[6px] text-[14px] no-underline"
              >
                {c.label} <span className="font-mono text-[12px] text-accent">verify ↗</span>
              </a>
            ))}
          </div>
        </section>
      </main>
      <Footer maxWidth={1040} />
    </div>
  );
}
