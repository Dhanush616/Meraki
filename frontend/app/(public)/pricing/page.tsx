"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckIcon, XIcon, PlusIcon, MinusIcon, ArrowRightIcon } from "lucide-react";
import { Navbar } from "@/components/navbar";

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

const plans = [
    {
        name: "Free",
        price: "\u20B90",
        period: "",
        tagline: "Get started, understand your gaps, and see what Paradosis can do. No credit card. No time limit.",
        features: [
            "3 assets",
            "1 beneficiary",
            "AI video will (1 recording)",
            "Basic will document generation",
            "Email check-in",
            "Email support",
        ],
        cta: "Start free",
        featured: false,
        dark: false,
    },
    {
        name: "Legacy",
        price: "\u20B91,299",
        period: "/month",
        tagline: "For individuals who want complete peace of mind. Everything, unlimited.",
        features: [
            "Unlimited assets and beneficiaries",
            "All 12 asset types",
            "All legal claim forms",
            "Crypto routing",
            "Annual vault health check reminder",
            "Per-beneficiary disclosure settings",
            "Emergency contact + escalation system",
            "Vault export backup",
            "Priority email support",
        ],
        cta: "Go Legacy",
        featured: true,
        dark: true,
    },
    {
        name: "Family",
        price: "\u20B91,499",
        period: "/month",
        tagline: "For couples. One subscription, two complete vaults, jointly managed.",
        features: [
            "Everything in Legacy, for 2 people",
            "Linked vault view",
            "Joint asset handling (e.g., joint bank accounts)",
            "Separate execution packages per person",
            "Priority support",
        ],
        cta: "Choose Family",
        featured: false,
        dark: false,
    },
    {
        name: "Professional",
        price: "\u20B912,999",
        period: "/month",
        tagline: "For wealth managers, estate lawyers, and CAs who want to offer Paradosis to their clients.",
        features: [
            "Everything in Family",
            "Manage up to 200 client vaults",
            "White-label portal with your branding",
            "Client onboarding dashboard",
            "API access",
            "Dedicated account manager",
        ],
        cta: "Contact us",
        featured: false,
        dark: false,
    },
];

const pricingFaqs = [
    {
        q: "Is my data safe if I'm on the free plan?",
        a: "Yes. Encryption is not a paid feature. Every plan — including Free — uses the same zero-knowledge encryption. We cannot read your data on any plan.",
    },
    {
        q: "What happens to my vault if I stop paying?",
        a: "Your vault is preserved. You will not be able to add new assets or generate updated documents until you resubscribe, but your data is never deleted. Your escalation system continues running.",
    },
    {
        q: "Is there a setup fee?",
        a: "No. No hidden fees, no activation charges.",
    },
    {
        q: "When is the execution fee charged?",
        a: "When your vault executes (i.e., after death is verified and forms are generated), we charge a one-time \u20B914,999 execution service fee. This is separate from the subscription. It covers full form generation, beneficiary package delivery, and our human team support during the process.",
    },
    {
        q: "Can I pay yearly and get a refund if I cancel?",
        a: "Yes. We offer a 30-day refund on yearly subscriptions if you cancel within 30 days of payment.",
    },
];

function CheckOrX({ ok, dark }: { ok: boolean; dark?: boolean }) {
    if (ok) {
        return dark ? (
            <span className="flex w-5 h-5 items-center justify-center rounded-full bg-white text-black">
                <CheckIcon className="w-3 h-3" />
            </span>
        ) : (
            <span className="flex w-5 h-5 items-center justify-center rounded-full bg-black text-white">
                <CheckIcon className="w-3 h-3" />
            </span>
        );
    }
    return (
        <span className="flex w-5 h-5 items-center justify-center text-[#a3a3a3]">
            <XIcon className="w-4 h-4" />
        </span>
    );
}

export default function PricingPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-32 pb-24">
                {/* Hero */}
                <motion.section
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    className="mx-auto max-w-4xl px-6 text-center"
                >
                    <span className="text-sm font-medium tracking-widest uppercase text-[#737373]">
                        Pricing
                    </span>
                    <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-black">
                        Simple, honest pricing.
                    </h1>
                    <p className="mt-5 text-lg text-[#525252] max-w-2xl mx-auto">
                        Start free. Your vault stays yours, regardless of which plan
                        you&apos;re on.
                    </p>
                </motion.section>

                {/* Plans */}
                <section className="mx-auto max-w-7xl px-6 mt-16">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-60px" }}
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
                    >
                        {plans.map((p) => (
                            <motion.div
                                key={p.name}
                                variants={fadeUp}
                                className={
                                    p.dark
                                        ? "rounded-2xl bg-black text-white p-8 flex flex-col"
                                        : "rounded-2xl border border-[#e5e5e5] p-8 flex flex-col"
                                }
                            >
                                <h3 className={`text-lg font-medium tracking-tight ${p.dark ? "text-white" : "text-black"}`}>
                                    {p.name}
                                </h3>
                                <div className="mt-4 flex items-baseline gap-1">
                                    <span className={`text-4xl font-semibold tracking-tight ${p.dark ? "text-white" : "text-black"}`}>
                                        {p.price}
                                    </span>
                                    <span className={`text-sm ${p.dark ? "text-[#d4d4d4]" : "text-[#737373]"}`}>
                                        {p.period}
                                    </span>
                                </div>
                                <p className={`mt-4 text-[14px] leading-relaxed ${p.dark ? "text-[#d4d4d4]" : "text-[#525252]"}`}>
                                    {p.tagline}
                                </p>
                                <ul className={`mt-6 space-y-2.5 text-[14px] ${p.dark ? "text-[#d4d4d4]" : "text-[#525252]"}`}>
                                    {p.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2.5">
                                            <CheckIcon className="w-4 h-4 mt-0.5 shrink-0" />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/auth/signup"
                                    className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                                        p.dark
                                            ? "bg-white text-black hover:bg-[#e5e5e5]"
                                            : "bg-black text-white hover:bg-[#262626]"
                                    }`}
                                >
                                    {p.cta}
                                    <ArrowRightIcon className="w-4 h-4" />
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* Comparison table */}
                <section className="mx-auto max-w-5xl px-6 mt-24">
                    <motion.h2
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="text-3xl font-semibold tracking-tight text-black"
                    >
                        Compare plans
                    </motion.h2>
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="mt-8 overflow-x-auto rounded-2xl border border-[#e5e5e5]"
                    >
                        <table className="w-full min-w-[640px] text-left text-[14px]">
                            <thead>
                                <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                                    <th className="px-5 py-4 font-medium text-black">Feature</th>
                                    <th className="px-5 py-4 font-medium text-black text-center">Free</th>
                                    <th className="px-5 py-4 font-medium text-black text-center">Legacy</th>
                                    <th className="px-5 py-4 font-medium text-black text-center">Family</th>
                                    <th className="px-5 py-4 font-medium text-black text-center">Professional</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["Assets", "3", "Unlimited", "Unlimited", "Unlimited"],
                                    ["Beneficiaries", "1", "Unlimited", "Unlimited", "Unlimited"],
                                    ["Asset types", "3", "All 12", "All 12", "All 12"],
                                    ["AI video will", "1 recording", "Unlimited", "Unlimited", "Unlimited"],
                                    ["Legal will document", "Basic", "Full", "Full", "Full"],
                                    ["Legal claim forms", false, true, true, true],
                                    ["Crypto routing", false, true, true, true],
                                    ["Beneficiary privacy settings", false, true, true, true],
                                    ["Escalation system", "Email only", "Full 5-level", "Full 5-level", "Full 5-level"],
                                    ["Vault health score", false, true, true, true],
                                    ["Vault export backup", false, true, true, true],
                                    ["Vaults included", "1", "1", "2", "200"],
                                    ["Support", "Email", "Priority email", "Priority email", "Dedicated manager"],
                                ].map((row) => (
                                    <tr key={row[0] as string} className="border-b border-[#e5e5e5] last:border-0">
                                        {(row as (string | boolean)[]).map((cell, ci) => (
                                            <td
                                                key={ci}
                                                className={`px-5 py-4 ${ci === 0 ? "text-[#525252]" : "text-center text-black"} ${typeof cell === "boolean" ? "flex items-center justify-center" : ""}`}
                                            >
                                                {typeof cell === "boolean" ? <CheckOrX ok={cell} /> : cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                </section>

                {/* Pricing FAQ */}
                <section className="mx-auto max-w-3xl px-6 mt-24">
                    <motion.h2
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="text-center text-3xl font-semibold tracking-tight text-black"
                    >
                        Pricing questions
                    </motion.h2>

                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-60px" }}
                        className="mt-10"
                    >
                        {pricingFaqs.map((faq, i) => {
                            const isOpen = openIndex === i;
                            return (
                                <motion.div
                                    key={faq.q}
                                    variants={fadeUp}
                                    className="border-b border-[#e5e5e5] last:border-0"
                                >
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : i)}
                                        className="w-full flex items-start justify-between gap-6 py-6 text-left group"
                                        aria-expanded={isOpen}
                                    >
                                        <span className="text-lg text-black leading-snug">{faq.q}</span>
                                        <span className="shrink-0 mt-1 w-6 h-6 rounded-full border border-[#e5e5e5] flex items-center justify-center text-[#737373] group-hover:text-black transition-all">
                                            {isOpen ? <MinusIcon className="w-3.5 h-3.5" /> : <PlusIcon className="w-3.5 h-3.5" />}
                                        </span>
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                key="answer"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.35, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <p className="pb-6 pr-12 text-[15px] leading-relaxed text-[#525252]">
                                                    {faq.a}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </section>
            </main>
        </div>
    );
}
