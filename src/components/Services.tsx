"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import ScrollReveal from "./ui/ScrollReveal";
import RevealText from "./ui/RevealText";

const EASE = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

const serviceIcons = [
  // Design UI/UX
  <svg key="design" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
  </svg>,
  // Development
  <svg key="dev" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
  </svg>,
  // SEO
  <svg key="seo" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
  </svg>,
  // E-Commerce
  <svg key="ecom" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>,
];

const serviceKeys = ["design", "development", "seo", "ecommerce"] as const;

/* Bento grid: design(span2) + dev(span1) on row 1, seo(span1) + ecommerce(span2) on row 2 */
const bentoSpans = [2, 1, 1, 2] as const;

export default function Services() {
  const t = useTranslations("services");

  return (
    <section id="services" className="bg-[#FAFAFA] px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium tracking-wider text-gold uppercase">
            {t("badge")}
          </span>
          <RevealText as="h2" className="mb-6 text-3xl font-bold tracking-tight text-[#121212] sm:text-4xl md:text-5xl">
            {t("title")}
          </RevealText>
          <p className="mx-auto max-w-2xl text-lg text-gray-500">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        {/* Bento Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {serviceKeys.map((key, i) => {
            const span = bentoSpans[i];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.5,
                  ease: EASE,
                }}
                className={`group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-[0_4px_30px_rgba(212,175,55,0.08)] ${
                  span === 2 ? "lg:col-span-2" : "lg:col-span-1"
                } ${span === 2 ? "min-h-[240px]" : "min-h-[200px]"}`}
              >
                {/* Watermark number */}
                <span className="pointer-events-none absolute top-4 right-6 text-7xl font-extrabold text-[#D4AF37]/[0.1] select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="relative z-10">
                  <div className="mb-6 inline-flex rounded-xl bg-gold/10 p-3 text-gold transition-colors group-hover:bg-gold/20">
                    {serviceIcons[i]}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-[#121212]">
                    {t(`items.${key}.title`)}
                  </h3>
                  <p className={`leading-relaxed text-gray-500 ${span === 2 ? "max-w-md text-base" : "text-sm"}`}>
                    {t(`items.${key}.description`)}
                  </p>
                </div>

                {/* Decorative grid pattern for large cards */}
                {span === 2 && (
                  <div
                    className="pointer-events-none absolute right-0 bottom-0 h-32 w-48 opacity-[0.03]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, rgba(212,175,55,1) 1px, transparent 1px)",
                      backgroundSize: "12px 12px",
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
