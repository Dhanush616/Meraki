"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    SearchIcon, LockIcon, FileTextIcon, ShieldCheckIcon, ShieldIcon,
    EyeIcon, MailIcon, VideoIcon, FolderIcon, SettingsIcon,
    GitBranchIcon, FileWarningIcon, ShieldAlertIcon, PlusIcon, MinusIcon,
    ArrowRightIcon,
} from "lucide-react";
import { HeroGemini } from "@/components/HeroGemini";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { Navbar } from "@/components/navbar";

const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
};

const faqs = [
    {
        q: "What happens if I lose my master password?",
        a: "There is no recovery. That's by design. Your master password is the only key that decrypts your data — not even we can read it. This is zero-knowledge encryption. We strongly recommend storing your password in a physical safe or a trusted password manager alongside your vault backup.",
    },
    {
        q: "How exactly does Paradosis verify a death certificate?",
        a: "We cross-reference submitted documents against India's Civil Registration System (CRS) — the national digital registry of birth and death records. No vault is released without a government-issued, digitally verifiable certificate. Word-of-mouth or third-party claims cannot trigger a release.",
    },
    {
        q: "Can Paradosis employees access my vault contents?",
        a: "No. Every sensitive field — account numbers, Aadhaar, PAN, wallet addresses — is encrypted in your browser before it ever reaches our servers. We store only ciphertext. Without your master password, which we never receive, the data is mathematically unreadable.",
    },
    {
        q: "What if Paradosis shuts down?",
        a: "You can download a full encrypted backup of your vault at any time in an open, documented format. We publish the decryption specification so any developer can build a compatible reader. Your data is never held hostage by our platform.",
    },
    {
        q: "How does the automated document delivery work?",
        a: "When a vault is executed, Paradosis automatically generates pre-filled claim forms and instruction sets for each asset. These are delivered securely to your beneficiaries' private portals, ensuring they have everything needed to interface with banks and authorities without legal guesswork.",
    },
    {
        q: "Is a Paradosis-generated will legally valid in India?",
        a: "Yes — for most asset classes. We generate a will document that conforms to the Indian Succession Act, 1925. It requires your signature and two witnesses to become legally enforceable. For immovable property and Hindu Undivided Families, we flag additional registration requirements.",
    },
];

function FAQItem({
    q, a, isOpen, onClick, index,
}: {
    q: string; a: string; isOpen: boolean; onClick: () => void; index: number;
}) {
    return (
        <motion.div
            variants={fadeUp}
            className="border-b border-[#e5e5e5] last:border-0"
        >
            <button
                onClick={onClick}
                className="w-full flex items-start justify-between gap-6 py-7 text-left group"
            >
                <span className="font-sans text-xl text-black group-hover:text-black transition-colors leading-snug">
                    {q}
                </span>
                <span className="shrink-0 mt-1 w-6 h-6 rounded-full border border-[#e5e5e5] flex items-center justify-center text-[#737373] group-hover:border-primary group-hover:text-black transition-all">
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
                        <p className="pb-7 font-sans text-[#525252] leading-relaxed text-[15px] max-w-2xl">
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function LandingPage() {
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);

    return (
        <main className="min-h-screen bg-white w-full">
            <Navbar />

            {/* Hero */}
            <section className="w-full relative z-20">
                <HeroGemini />
            </section>

            {/* Stats Bar */}
            <section className="bg-[#fafafa] border-t border-b border-[#e5e5e5] py-12 relative z-10">
                <motion.div
                    className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row gap-8 justify-between text-center divide-y md:divide-y-0 md:divide-x divide-oat-border"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={stagger}
                >
                    {[
                        { value: "₹1.5 Lakh Crore", label: "sitting unclaimed in\nIndian bank accounts" },
                        { value: "₹2.5 Lakh Crore", label: "dormant across insurance,\nPF, and physical assets" },
                        { value: "6–18 Months", label: "average time families\nspend navigating claims" },
                    ].map((stat, i) => (
                        <motion.div key={i} variants={fadeUp} className="flex-1 pt-6 md:pt-0">
                            <h3 className="text-4xl font-sans text-black mb-2 font-medium">{stat.value}</h3>
                            <p className="font-sans text-[#737373] text-base leading-relaxed whitespace-pre-line">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>
                <p className="text-center mt-12 text-sm text-[#a3a3a3] font-sans">
                    Statistics sourced from RBI, Outlook Money, and Ministry of Finance reports.
                </p>
            </section>

            {/* Problem Section */}
            <section className="relative">
                <div className="bg-white">
                    <div className="py-12 px-4 max-w-[1200px] mx-auto relative z-10 w-full">
                        <motion.div
                            className="text-center mb-16"
                            initial="hidden" whileInView="show" viewport={{ once: true }}
                            variants={fadeUp}
                        >
                            <span className="text-sm font-sans tracking-widest uppercase text-[#737373] mb-4 block font-medium">
                                The Problem
                            </span>
                            <h2 className="text-4xl md:text-5xl font-sans text-black leading-[1.10] font-medium mb-6">
                                Secure your digital and physical assets.<br />Ensure smooth transfer when it matters.
                            </h2>
                            <p className="text-lg font-sans text-[#737373] max-w-2xl mx-auto leading-relaxed">
                                The modern portfolio is fragmented across dozens of institutions and private records. We organize, secure, and legally route your life's work without friction.
                            </p>
                        </motion.div>

                        <motion.div
                            className="grid md:grid-cols-3 gap-8"
                            initial="hidden" whileInView="show" viewport={{ once: true }}
                            variants={stagger}
                        >
                            {[
                                {
                                    title: "The Discovery Problem",
                                    icon: <SearchIcon className="w-8 h-8 text-black mb-6" />,
                                    desc: "Your family doesn't know what bank accounts exist, which insurance policies are active, or where the property deeds are. Assets worth crores disappear simply because no one knew to look.",
                                    stat: "₹1.5 lakh crore unclaimed in Indian banks",
                                },
                                {
                                    title: "The Administrative Gap",
                                    icon: <LockIcon className="w-8 h-8 text-black mb-6" />,
                                    desc: "Hidden assets like physical gold, private investments, and secondary bank accounts are often lost forever. Without a central roadmap, your family faces an impossible search during their hardest time.",
                                    stat: "₹2.5 lakh crore lost to fragmented records",
                                },
                                {
                                    title: "The Paperwork Nightmare",
                                    icon: <FileTextIcon className="w-8 h-8 text-black mb-6" />,
                                    desc: "A death certificate alone unlocks almost nothing. Banks need a succession certificate. Property needs mutation. Each institution has different forms, different offices, and different waiting periods.",
                                    stat: "6–18 months of bureaucratic delays",
                                },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    variants={fadeUp}
                                    whileHover={{ y: -4 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-[#fafafa] rounded-xl p-10 border border-[#e5e5e5] shadow-none group cursor-default"
                                >
                                    {item.icon}
                                    <h3 className="font-sans text-2xl font-medium text-black mb-4">{item.title}</h3>
                                    <p className="font-sans text-[#737373] leading-[1.70] mb-8 min-h-[120px]">{item.desc}</p>
                                    <div className="font-sans text-sm font-medium text-black bg-[#e5e5e5] px-3 py-1.5 rounded-full inline-block">
                                        {item.stat}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Solution Section */}
            <section id="how-it-works" className="bg-[#fafafa] py-12 px-4 border-t border-[#e5e5e5] relative z-10">
                <div className="max-w-[1200px] mx-auto text-black">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden" whileInView="show" viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <span className="text-sm font-sans tracking-widest uppercase text-[#737373] mb-4 block font-medium">
                            The Solution
                        </span>
                        <h2 className="text-4xl md:text-5xl font-sans leading-[1.10] font-medium mb-6">
                            Paradosis bridges the gap between<br />your life's work and your family's future.
                        </h2>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-3 gap-8"
                        initial="hidden" whileInView="show" viewport={{ once: true }}
                        variants={stagger}
                    >
                        {[
                            {
                                icon: <ShieldIcon className="w-8 h-8 text-black mb-6" />,
                                phase: "Phase 1 — Before",
                                title: "Build Your Vault",
                                desc: "Add every asset you own. Assign exactly who gets what. Record a video will in your own words. We generate a legally valid will document — ready to sign.",
                            },
                            {
                                icon: <EyeIcon className="w-8 h-8 text-black mb-6" />,
                                phase: "Phase 2 — During",
                                title: "We Watch Over You",
                                desc: "We check in quarterly with a single tap. If something seems wrong, we escalate. We never act without a government-verified death certificate.",
                            },
                            {
                                icon: <MailIcon className="w-8 h-8 text-black mb-6" />,
                                phase: "Phase 3 — After",
                                title: "Your Family Receives Everything",
                                desc: "The moment death is verified, document packages are delivered securely. Every asset generates a pre-filled legal claim form — sent directly to beneficiaries. No confusion.",
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                whileHover={{ y: -4 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-xl p-8 shadow-none border border-[#e5e5e5]"
                            >
                                <span className="text-xs font-sans tracking-widest uppercase text-[#737373] mb-4 block">{item.phase}</span>
                                {item.icon}
                                <h3 className="font-sans text-2xl font-medium text-black mb-4">{item.title}</h3>
                                <p className="font-sans text-[#737373] leading-[1.70]">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="bg-white py-12 px-4 border-t border-[#e5e5e5] relative z-20">
                <div className="max-w-[800px] mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden" whileInView="show" viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <span className="text-sm font-sans tracking-widest uppercase text-[#737373] mb-4 block font-medium">Your Questions</span>
                        <h2 className="text-4xl md:text-5xl font-sans text-black leading-[1.10] font-medium">
                            Everything you need<br />to trust us with everything.
                        </h2>
                    </motion.div>

                    <motion.div
                        initial="hidden" whileInView="show" viewport={{ once: true }}
                        variants={stagger}
                        className="bg-[#fafafa] rounded-xl border border-[#e5e5e5] px-10 shadow-none"
                    >
                        {faqs.map((faq, i) => (
                            <FAQItem
                                key={i}
                                index={i}
                                q={faq.q}
                                a={faq.a}
                                isOpen={openFAQ === i}
                                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                            />
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="bg-[#fafafa] py-12 px-4 border-t border-[#e5e5e5] relative z-10">
                <div className="max-w-[1200px] mx-auto text-black">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden" whileInView="show" viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <span className="text-sm font-sans tracking-widest uppercase text-[#737373] mb-4 block font-medium">What's Inside</span>
                        <h2 className="text-4xl md:text-5xl font-sans leading-[1.10] font-medium">
                            Everything your family needs.<br />Nothing they'll have to figure out alone.
                        </h2>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial="hidden" whileInView="show" viewport={{ once: true }}
                        variants={stagger}
                    >
                        {[
                            {
                                icon: <VideoIcon className="w-5 h-5 text-black" />,
                                title: "AI Video Will",
                                desc: "Record yourself in plain language. Paradosis transcribes it, extracts the intent, and maps it to your vault — automatically.",
                                tag: "Powered by Gemini AI",
                            },
                            {
                                icon: <FolderIcon className="w-5 h-5 text-black" />,
                                title: "Complete Asset Vault",
                                desc: "Bank accounts, fixed deposits, property, insurance, mutual funds, and private records. Every asset in one place, encrypted so only you can read it.",
                                tag: "12 Asset Types",
                            },
                            {
                                icon: <FileWarningIcon className="w-5 h-5 text-black" />,
                                title: "Legal Will & Claim Forms",
                                desc: "We generate a legally valid will. After death, we auto-fill bank claim forms, succession petitions, and insurance claim forms.",
                                tag: "India's Legal Framework",
                            },
                            {
                                icon: <ShieldAlertIcon className="w-5 h-5 text-black" />,
                                title: "Beneficiary Privacy",
                                desc: "You control who knows what — and when. Each person receives only their portion, in a private portal, after death is confirmed.",
                                tag: "Per-person controls",
                            },
                            {
                                icon: <SettingsIcon className="w-5 h-5 text-black" />,
                                title: "Smart Escalation",
                                desc: "Quarterly check-ins. If you go quiet, we reach out to an emergency contact, then beneficiaries. Governed by verified death certificates.",
                                tag: "No intermediaries",
                            },
                            {
                                icon: <GitBranchIcon className="w-5 h-5 text-black" />,
                                title: "Automated Asset Claiming",
                                desc: "Generate pre-filled forms for every asset class automatically. Smart logic routes document packages to the right authorities.",
                                tag: "Frictionless Transfer",
                            },
                        ].map((ft, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                whileHover={{ y: -5, boxShadow: "none" }}
                                transition={{ duration: 0.2 }}
                                className="p-8 border border-[#e5e5e5] rounded-xl bg-white cursor-default"
                            >
                                <div className="mb-6 bg-[#fafafa] w-12 h-12 flex items-center justify-center rounded-xl border border-[#e5e5e5]">{ft.icon}</div>
                                <h3 className="text-[22px] font-sans font-medium text-black mb-3">{ft.title}</h3>
                                <p className="font-sans text-[#737373] leading-[1.70] mb-6 min-h-[88px]">{ft.desc}</p>
                                <span className="text-[12px] font-sans font-medium text-black bg-[#e5e5e5] px-3 py-1.5 rounded-full tracking-wide">{ft.tag}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Security Section */}
            <section className="bg-white py-12 px-4">
                <div className="max-w-[1200px] mx-auto w-full text-center">
                    <motion.div
                        initial="hidden" whileInView="show" viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <span className="text-sm font-sans tracking-widest uppercase text-[#737373] mb-4 block font-medium">
                            Your Trust is Everything
                        </span>
                        <h2 className="text-4xl md:text-5xl font-sans text-black leading-[1.10] font-medium mb-16">
                            We can't read your data.<br />Even if we wanted to.
                        </h2>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-3 gap-12"
                        initial="hidden" whileInView="show" viewport={{ once: true }}
                        variants={stagger}
                    >
                        {[
                            {
                                icon: <ShieldCheckIcon className="w-8 h-8 text-black mx-auto mb-6" />,
                                title: "Zero-Knowledge Encryption",
                                desc: "Every sensitive field — account numbers, Aadhaar, and PAN — is encrypted in your browser before it ever reaches our servers. Only your password can unlock it.",
                            },
                            {
                                icon: <FileTextIcon className="w-8 h-8 text-black mx-auto mb-6" />,
                                title: "Government-Verified Trigger",
                                desc: "We never execute a vault on someone's word alone. A government-issued death certificate, verified against India's Civil Registration System, is the only key that unlocks a vault.",
                            },
                            {
                                icon: <LockIcon className="w-8 h-8 text-black mx-auto mb-6" />,
                                title: "Your Data, Always Yours",
                                desc: "Download an encrypted backup of your entire vault at any time. If Paradosis ever shuts down, your data is never held hostage. It belongs to you.",
                            },
                        ].map((item, i) => (
                            <motion.div key={i} variants={fadeUp}>
                                {item.icon}
                                <h3 className="text-2xl font-sans text-black mb-4">{item.title}</h3>
                                <p className="text-[#737373] font-sans leading-[1.70] text-[15px]">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="bg-black py-12 px-4 relative z-20">
                <motion.div
                    className="max-w-[800px] mx-auto text-center"
                    initial="hidden" whileInView="show" viewport={{ once: true }}
                    variants={fadeUp}
                >
                    <h2 className="text-4xl md:text-5xl font-sans leading-[1.10] font-medium text-white mb-6">
                        Start building your vault today.
                    </h2>
                    <p className="font-sans text-[#a3a3a3] leading-[1.70] text-xl mb-10 max-w-[600px] mx-auto">
                        Join the waitlist to secure your family's future. Early access members receive free legal document generation.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/auth/signup">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-white text-black px-6 py-2.5 rounded-full font-sans font-medium hover:bg-[#e5e5e5] transition-colors w-full sm:w-auto text-base flex items-center justify-center gap-2"
                            >
                                Get Started Free
                                <ArrowRightIcon className="w-4 h-4" />
                            </motion.button>
                        </Link>
                        <Link href="/auth/signin?role=guardian">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-transparent border border-white/20 text-white px-6 py-2.5 rounded-full font-sans font-medium hover:bg-white/10 transition-colors w-full sm:w-auto text-base flex items-center justify-center gap-2"
                            >
                                <ShieldIcon className="w-4 h-4" />
                                Guardian Access
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>
            </section>
        </main>
    );
}
