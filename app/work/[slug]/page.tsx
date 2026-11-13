import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { projects } from "@/content/kb/projects";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.id === slug);
  return { title: project ? `Case study — ${project.title}` : "Case study" };
}

// Milestone 1 shell. The PRD template arrives in Milestone 2.
export default async function CaseStudy({ params }: Props) {
  const { slug } = await params;
  if (!projects.some((p) => p.id === slug)) notFound();
  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <Nav current="work" />
      <main />
      <Footer maxWidth={1200} />
    </div>
  );
}
