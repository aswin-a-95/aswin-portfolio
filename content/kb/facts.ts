import { siteMeta } from "@/content/site-meta";

export type Fact = { id: string; text: string; label: string; href: string };

/**
 * Canonical bio facts used in answers (SPEC §6). Statements below are taken from the design copy.
 * Labels are the source chips Ask my work shows (Ask.dc.html: "About · career", "Case studies").
 */
export const facts: Fact[] = [
  { id: "fact-title", text: "Senior Product Manager.", label: "About · career", href: "/about" },
  {
    id: "fact-focus",
    text: "Works on platforms, APIs and integrations, including in healthcare.",
    label: "About · career",
    href: "/about",
  },
  {
    id: "fact-years",
    text: `${siteMeta.yearsOfExperience} years as a product manager.`,
    label: "About · career",
    href: "/about",
  },
  {
    id: "fact-ai-work",
    text: "Builds AI agents: a job-search agent and this site's fit check. An Instagram competitor agent for Dhee's is in progress and not live yet.",
    label: "Case studies",
    href: "/work",
  },
  {
    id: "fact-llm-experience",
    text: "No professional LLM role yet. His AI work is agents he built and shipped on his own projects.",
    label: "About · career",
    href: "/about",
  },
  {
    id: "fact-platform-win",
    // Chosen from the master resume; Aswin to confirm it is the one he'd lead with.
    text: "Delivered 17 platform packages in 8 months at Zelthy; 95% of new apps adopted them and time to deploy fell 80%.",
    label: "About · career",
    href: "/about",
  },
  // From the master resume and the public CV, Nov 2026.
  {
    id: "fact-career-total",
    text: "9 years across product and technology: 4 years in product management at Zelthy (Associate Product Manager to Senior Product Manager, 2020–2024) and about 5 years as a founder owning product at two startups, The Solar Labs (2017–2020) and Dhee's (2024–2026).",
    label: "About · career",
    href: "/about",
  },
  {
    id: "fact-education",
    text: "B.Tech in Computer Science and Engineering, IIT Mandi (2013–2017). A former developer: wrote production code for about 3 years at The Solar Labs.",
    label: "Resume (PDF)",
    href: "/resume.pdf",
  },
  {
    id: "fact-location",
    text: "Based in Chennai, India. Has worked remotely with clients and teams in Singapore, Malaysia, Vietnam, Hong Kong and Australia.",
    label: "About · career",
    href: "/about",
  },
  {
    id: "fact-leadership",
    text: "Led 5 product managers and 2 interns at Zelthy, hired 3 of the PMs, and led project teams of 20+.",
    label: "About · career",
    href: "/about",
  },
  {
    id: "fact-ai-tools",
    text: "Uses Claude, Claude Code, ChatGPT, Cursor and v0 day to day for PRDs, documentation, prototypes and agents.",
    label: "About · career",
    href: "/about",
  },
];
