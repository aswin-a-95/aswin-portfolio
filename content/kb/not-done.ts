export type NotDone = { id: string; topic: string; closest?: string; note: string };

/** Things Aswin has NOT done. The fit check must never present these as matches (SPEC §7, guard.honesty). */
export const notDone: NotDone[] = [
  { id: "hardware-roadmaps", topic: "Hardware roadmaps from prototype to mass production", note: "Not something Aswin has done." },
  { id: "contract-manufacturing", topic: "Contract manufacturers and supply chain", note: "Not something Aswin has done." },
  {
    id: "retail-channel-pl",
    topic: "Retail channel P&L",
    closest: "Runs Dhee's, a direct-to-consumer brand. Not retail, not hardware.",
    note: "Not retail, not hardware.",
  },
  { id: "consumer-hardware-launches", topic: "Consumer hardware launches", note: "Not something Aswin has done." },
  // TODO(aswin): add anything else you have not done (e.g. professional LLM role is a stated gap, not a match).
];
