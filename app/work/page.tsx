import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export const metadata: Metadata = { title: "Work" };

// Milestone 1 shell. The page content arrives in Milestone 2.
export default function Page() {
  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <Nav current="work" />
      <main />
      <Footer maxWidth={1040} />
    </div>
  );
}
