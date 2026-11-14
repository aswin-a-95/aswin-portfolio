import { handleRun } from "@/lib/run/handle";

/** The single AI endpoint (SPEC §4, §6–8). */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export function POST(request: Request): Promise<Response> {
  return handleRun(request);
}
