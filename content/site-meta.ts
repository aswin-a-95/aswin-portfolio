import { todo } from "@/lib/content";

/** Facts used across the site. Every todo() is Aswin's to fill in (SPEC §12). */
export const siteMeta = {
  yearsOfExperience: todo("[N]"), // TODO(aswin): years as a PM (About, KB facts)
  evalSetLink: todo("[link]"), // TODO(aswin): public eval set on GitHub
  github: todo("[link]"), // TODO(aswin): GitHub profile
  linkedin: todo("[link]"), // TODO(aswin): LinkedIn profile
  domain: todo("[domain]"), // TODO(aswin): production domain
  responseTime: todo("[response time]"), // TODO(aswin): "usually within …" on the contact success state
  postingCadence: todo("[2–3]"), // TODO(aswin): build log cadence, in weeks
  whatBreaksFirstAtScale: todo("[what breaks first at scale]"), // TODO(aswin)
  next: todo("[what you'll improve]"), // TODO(aswin)
  costPerRun: todo("[cost per run]"), // TODO(aswin): measured, never invented
  ninetyDayPlan: todo("[Your 90-day ramp-up plan.]"), // TODO(aswin)
  resumeUpdated: todo("[date]"), // TODO(aswin): date of the resume in public/resume.pdf
  kbSynced: todo("[date]"), // Filled by the KB snapshot in Milestone 5.
  liveResponseTime: todo("[response time]"), // TODO(aswin): measured median, live usage
  // Offline eval numbers. Milestone 7 replaces these with content/eval-results.json written by CI.
  evalCaseCount: todo("[N]"),
  evalPassRate: todo("[measured]"),
  evalFailedFirst: todo("[what broke]"),
} as const;
