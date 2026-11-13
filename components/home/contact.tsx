import Link from "next/link";
import { ContactForm } from "@/components/home/contact-form";
import { siteMeta } from "@/content/site-meta";
import { hrefOf, withTodo } from "@/lib/content";

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-h" className="border-t border-rule px-6 pt-[72px] pb-[88px]">
      <div className="mx-auto flex max-w-[1040px] flex-wrap gap-10">
        <div className="flex flex-[1_1_320px] flex-col gap-[14px]">
          <h2 id="contact-h" className="m-0 font-serif text-[48px] font-normal leading-[1.05] tracking-[-0.01em]">
            Talk to Aswin.
          </h2>
          <p className="m-0 font-serif text-[20px] leading-[1.45] text-muted">
            If the fit check sent you here, the role is already filled in. I read every message myself.
          </p>
          <div className="mt-2 flex flex-wrap gap-x-[18px] gap-y-2">
            <a href={hrefOf(siteMeta.linkedin)} className="inline-flex min-h-11 items-center text-[15px]">
              {withTodo("LinkedIn", siteMeta.linkedin)}
            </a>
            <a href={hrefOf(siteMeta.github)} className="inline-flex min-h-11 items-center text-[15px]">
              {withTodo("GitHub", siteMeta.github)}
            </a>
            <Link href="/about" className="inline-flex min-h-11 items-center text-[15px]">
              Resume (PDF)
            </Link>
          </div>
        </div>
        <div className="flex-[1_1_420px]">
          <ContactForm responseTime={siteMeta.responseTime} />
        </div>
      </div>
    </section>
  );
}
