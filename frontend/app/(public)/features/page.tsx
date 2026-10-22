"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    VideoIcon, VaultIcon, FileTextIcon, EyeIcon,
    EyeOffIcon, BellIcon, WalletIcon, ArrowRightIcon,
    SparklesIcon, BriefcaseIcon, UsersIcon, GlobeIcon, FolderIcon,
} from "lucide-react";
import { Navbar } from "@/components/navbar";

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

const features = [
    {
        icon: VideoIcon,
        name: "AI Video Will",
        headline: "Say it out loud. We'll handle the rest.",
        body: "Recording a video will is the most natural thing in the world. You speak to your family, not to a legal template. Paradosis transcribes your words using Google Gemini, extracts every asset-to-beneficiary assignment you mentioned, flags any ambiguities for you to resolve, and maps it all to your vault — automatically. The video itself is stored encrypted, and can be included in your beneficiary's execution package as a personal final message.",
        bullets: [
            "In-browser recording (no app needed)",
            "Supports video upload for pre-recorded content",
            "AI conflict detection for ambiguous assignments",
            "Personal message delivery to each beneficiary",
        ],
        dark: true,
    },
    {
        icon: VaultIcon,
        name: "Complete Asset Vault",
        headline: "12 asset types. One vault.",
        body: "Most Indians have assets spread across multiple banks, one or two insurance policies, a property or two, and increasingly, crypto holdings. Paradosis covers every category India's middle-class family actually owns. Each asset type has purpose-built input fields — you're never staring at a blank text box.",
        bullets: [
            "Bank accounts and fixed deposits",
            "Property (residential, commercial, agricultural)",
            "Insurance policies (LIC, private)",
            "Mutual funds and demat accounts",
            "Crypto wallets (all chains)",
            "PPF, EPF, NPS, vehicles, gold, business shares",
        ],
        dark: false,
    },
    {
        icon: FileTextIcon,
        name: "Legal Will + Claim Forms",
        headline: "India's legal framework, pre-loaded.",
        body: "Paradosis generates a properly structured will document under the Indian Succession Act, 1925 — formatted for Hindu, Muslim, and Christian succession law. After death is confirmed, we auto-generate every legal claim form your family will need. Not blank templates. Forms filled with the right data, in the right places, ready to submit.",
        bullets: [
            "Hindu, Muslim, and Christian succession law variants",
            "Succession Certificate petition (district court)",
            "Legal Heir Certificate application",
            "Bank-specific claim forms (SBI, HDFC, Canara, PNB, ICICI, and more)",
            "Property mutation application (state-aware)",
            "Insurance claim forms",
        ],
        dark: false,
    },
    {
        icon: EyeOffIcon,
        name: "Beneficiary Privacy Controls",
        headline: "Your choices, your privacy.",
        body: "Not everyone needs to know what they're inheriting — or even that they've been named. Paradosis gives you three disclosure settings, set independently for each beneficiary: Total Secrecy (they know nothing until execution), Partial Awareness (they know they're named, not what they receive), or Full Transparency (they see everything upfront). You can change these at any time.",
        bullets: [
            "Per-beneficiary disclosure level",
            "Beneficiaries never contacted while you are alive",
            "Minor beneficiary handling with mandatory trustee",
            "Personal encrypted message for each beneficiary",
        ],
        dark: false,
    },
    {
        icon: BellIcon,
        name: "Smart Escalation System",
        headline: "We watch. You live.",
        body: "Paradosis runs a passive monitoring system in the background. Quarterly check-ins. Login frequency tracking. A five-level escalation ladder that moves from gentle contact to government-verified execution. No guardians required — Paradosis is the neutral third party. No one can trigger your vault accidentally or maliciously.",
        bullets: [
            "Quarterly check-ins via email, SMS, WhatsApp",
            "Personal login baseline tracking",
            "Emergency contact buffer before beneficiaries",
            "Vacation mode (up to 180 days)",
            "15-day liveness window after certificate submission",
            "Human team review at each escalation step",
        ],
        dark: false,
    },
    {
        icon: WalletIcon,
        name: "Crypto Routing",
        headline: "The only crypto inheritance solution built for India.",
        body: "India has no nominee system for crypto. No legal framework. When a crypto holder dies without a plan, the assets are gone. Paradosis solves this with a pre-configured smart contract — you lock in the beneficiary wallet addresses before you need to. When execution triggers, the contract routes assets automatically. No private key is ever shared, stored, or handed off.",
        bullets: [
            "Ethereum, Polygon, and Bitcoin wallet support",
            "Multi-beneficiary percentage splits",
            "Simulated execution for demo",
            "No exchange login or intervention needed",
            "Full audit trail of the transaction",
        ],
        dark: false,
    },
];

const roadmap = [
    {
        icon: SparklesIcon,
        title: "PAN-Based Asset Sweep",
        body: "After death, scan RBI, SEBI, and IRDAI databases using the deceased's PAN to discover assets that were never added to the vault. Catches what even the vault owner forgot.",
    },
    {
        icon: BriefcaseIcon,
        title: "Lawyer & CA Marketplace",
        body: "Connect families to verified estate lawyers and chartered accountants for steps that require professional help — probate, court proceedings, dispute resolution.",
    },
    {
        icon: UsersIcon,
        title: "Joint Vault (HUF Support)",
        body: "Family vaults for Hindu Undivided Families, with partition-aware distribution logic.",
    },
    {
        icon: GlobeIcon,
        title: "NRI Mode",
        body: "Dual-jurisdiction handling for NRIs with Indian and foreign assets. FEMA-compliant.",
    },
    {
        icon: FolderIcon,
        title: "DigiLocker Integration",
        body: "Pull digital documents directly from your DigiLocker account — Aadhaar, PAN, existing insurance policies.",
    },
];

export default function FeaturesPage() {
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
                        Built for India
                    </span>
                    <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-black">
                        Everything your family needs — built in.
                    </h1>
                    <p className="mt-5 text-lg text-[#525252] max-w-2xl mx-auto">
                        Paradosis is not just a will-writing tool. It is a complete
                        inheritance execution platform — built specifically for
                        India&apos;s legal system, asset landscape, and families.
                    </p>
                </motion.section>

                {/* Feature grid */}
                <section className="mx-auto max-w-6xl px-6 mt-20">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-60px" }}
                        className="grid gap-6 md:grid-cols-2"
                    >
                        {features.map((f) => (
                            <motion.div
                                key={f.name}
                                variants={fadeUp}
                                className={
                                    f.dark
                                        ? "rounded-2xl bg-black text-white p-8"
                                        : "rounded-2xl border border-[#e5e5e5] p-8"
                                }
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={
                                            f.dark
                                                ? "flex w-10 h-10 items-center justify-center rounded-full bg-white text-black"
                                                : "flex w-10 h-10 items-center justify-center rounded-full bg-black text-white"
                                        }
                                    >
                                        <f.icon className="w-4.5 h-4.5" />
                                    </span>
                                    <span
                                        className={
                                            f.dark
                                                ? "text-[13px] font-medium uppercase tracking-widest text-[#d4d4d4]"
                                                : "text-[13px] font-medium uppercase tracking-widest text-[#737373]"
                                        }
                                    >
                                        {f.name}
                                    </span>
                                </div>
                                <h3 className={`mt-4 text-xl font-medium tracking-tight ${f.dark ? "text-white" : "text-black"}`}>
                                    {f.headline}
                                </h3>
                                <p className={`mt-3 text-[15px] leading-relaxed ${f.dark ? "text-[#d4d4d4]" : "text-[#525252]"}`}>
                                    {f.body}
                                </p>
                                <ul className={`mt-5 space-y-2 text-[14px] ${f.dark ? "text-[#d4d4d4]" : "text-[#525252]"}`}>
                                    {f.bullets.map((b) => (
                                        <li key={b}>+ {b}</li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* Roadmap */}
                <section className="mx-auto max-w-6xl px-6 mt-28">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                        <span className="text-sm font-medium tracking-widest uppercase text-[#737373]">
                            V2 roadmap
                        </span>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black">
                            What&apos;s coming next
                        </h2>
                    </motion.div>

                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-60px" }}
                        className="mt-10 grid gap-6 md:grid-cols-3"
                    >
                        {roadmap.map((r) => (
                            <motion.div
                                key={r.title}
                                variants={fadeUp}
                                className="rounded-2xl border border-[#e5e5e5] p-6"
                            >
                                <r.icon className="w-5 h-5 text-black" />
                                <h3 className="mt-3 text-lg font-medium text-black tracking-tight">
                                    {r.title}
                                </h3>
                                <p className="mt-2 text-[14px] leading-relaxed text-[#525252]">
                                    {r.body}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="mt-20 text-center"
                    >
                        <Link
                            href="/pricing"
                            className="inline-flex items-center gap-2 rounded-full bg-black text-white px-6 py-3 text-sm font-medium hover:bg-[#262626] transition-colors"
                        >
                            See pricing
                            <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </section>
            </main>
        </div>
    );
}
