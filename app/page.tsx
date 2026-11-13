import { Footer } from "@/components/footer";
import { Hero } from "@/components/fit-check/hero";
import { BeforeAfter } from "@/components/home/before-after";
import { Contact } from "@/components/home/contact";
import { FromTheLog } from "@/components/home/from-the-log";
import { UnderTheHood } from "@/components/home/under-the-hood";
import { WorkSection } from "@/components/home/work-section";
import { IntroBanner } from "@/components/intro-banner";
import { Nav } from "@/components/nav";
import { siteMeta } from "@/content/site-meta";
import { hrefOf, isTodo } from "@/lib/content";
import { caseStudies } from "@/lib/case-studies";
import { posts } from "@/lib/posts";

export default async function Home() {
  const [studies, logPosts] = await Promise.all([caseStudies(), posts()]);
  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <Nav current="home" />
      <IntroBanner />
      <main>
        <div id="top" />
        <Hero
          meta={{
            evalCaseCount: siteMeta.evalCaseCount,
            evalPassRate: siteMeta.evalPassRate,
            evalFailedFirst: siteMeta.evalFailedFirst,
            costPerRun: siteMeta.costPerRun,
            liveResponseTime: siteMeta.liveResponseTime,
            whatBreaksFirstAtScale: siteMeta.whatBreaksFirstAtScale,
            next: siteMeta.next,
          }}
          resultMeta={{
            evalPassRate: siteMeta.evalPassRate,
            evalLastRun: siteMeta.evalLastRun,
            evalRedTeamHeld: siteMeta.evalRedTeamHeld,
            evalCaseCount: siteMeta.evalCaseCount,
            // Placeholder links render as "#" with the design's " [link]" after the label.
            evalSet: { href: hrefOf(siteMeta.evalSetLink), todo: isTodo(siteMeta.evalSetLink) ? " [link]" : "" },
          }}
        />
        <UnderTheHood />
        <BeforeAfter />
        {studies.length > 0 && <WorkSection studies={studies} />}
        {logPosts.length > 0 && <FromTheLog posts={logPosts} />}
        <Contact />
      </main>
      <Footer maxWidth={1040} />
    </div>
  );
}
