import { Footer } from "@/components/footer";
import { IntroBanner } from "@/components/intro-banner";
import { Nav } from "@/components/nav";

// Milestone 1 shell: Nav, X-ray intro banner, footer. The sections arrive in Milestone 2.
export default function Home() {
  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <Nav current="home" />
      <IntroBanner />
      <main>
        <div id="top" />
      </main>
      <Footer maxWidth={1040} />
    </div>
  );
}
