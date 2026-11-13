import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { WorkSection } from "@/components/home/work-section";
import { Nav } from "@/components/nav";
import { caseStudies } from "@/lib/case-studies";

export const metadata: Metadata = { title: "Work" };

// Design gap (SPEC §4): the home page's Work section as a standalone page.
export default async function WorkIndex() {
  const studies = await caseStudies();
  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <Nav current="work" />
      <main>
        <WorkSection studies={studies} headingLevel={1} />
      </main>
      <Footer maxWidth={1040} />
    </div>
  );
}
