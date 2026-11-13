import { todo } from "@/lib/content";

export type Role = { id: string; title: string; company: string; years: string; summary: string; label: string; href: string };

/** Roles the fit check and Ask my work may cite. Only the shape and the Dhee's entry come from the design. */
export const roles: Role[] = [
  {
    id: "platform-api",
    title: todo("[Role]"), // TODO(aswin)
    company: todo("[Company]"), // TODO(aswin)
    years: todo("[years]"), // TODO(aswin)
    summary: todo("[What you owned, one line: platform, APIs, integrations]"), // TODO(aswin)
    label: "Role · About",
    href: "/about",
  },
  {
    id: "healthcare-integrations",
    title: todo("[Role]"), // TODO(aswin)
    company: todo("[Company]"), // TODO(aswin)
    years: todo("[years]"), // TODO(aswin)
    summary: todo("[Healthcare integrations: systems and outcome]"), // TODO(aswin)
    label: "Role · About",
    href: "/about",
  },
  {
    id: "dhees",
    title: todo("[Your title]"), // TODO(aswin)
    company: "Dhee's",
    years: todo("[years]"), // TODO(aswin)
    summary: "Runs a fresh dog-food brand, direct to consumer",
    label: "Role · About",
    href: "/about",
  },
];
