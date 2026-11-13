import { todo } from "@/lib/content";

export type Project = {
  id: string;
  title: string;
  status: string;
  summary: string;
  /** Proof the fit check may cite. Empty until Aswin supplies it; a project without proof is left out. */
  evidence: string[];
  label: string;
  href: string;
};

export const projects: Project[] = [
  {
    id: "cloudeagle",
    title: "CloudEagle.ai — AI integration builder",
    status: "CONCEPT",
    summary: "Safeguards as the centrepiece. A small sandbox lets you try to break it.",
    evidence: [todo("[evidence]")], // TODO(aswin)
    label: "Case study · CloudEagle concept",
    href: "/work/cloudeagle",
  },
  {
    id: "job-search-agent",
    title: "Job-search agent",
    status: "IN USE · RECORDED RUN",
    summary: "A multi-step agent that never applies to a job without my approval.",
    evidence: [todo("[evidence]")], // TODO(aswin)
    label: "Case study · Job-search agent",
    href: "/work/job-search-agent",
  },
  {
    id: "dhees-instagram-agent",
    title: "Dhee's Instagram competitor agent",
    status: "IN USE · RECORDED RUN",
    summary: "What competitors post, what performs, and what Dhee’s should make next.",
    evidence: [todo("[evidence]")], // TODO(aswin)
    label: "Case study · Dhee's agent",
    href: "/work/dhees-instagram-agent",
  },
  {
    id: "platform-api-work",
    title: "Platform & API work",
    status: todo("PRE-AI · [STATUS]"), // TODO(aswin)
    summary: todo("Why integrations experience is agent experience. [Project to be chosen]"), // TODO(aswin)
    evidence: [todo("[evidence]")], // TODO(aswin)
    label: "Case study · Platform & API work",
    href: "/work/platform-api-work",
  },
];
