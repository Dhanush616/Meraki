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
        q: "How does crypto routing work without sharing private keys?",
        a: "You never share your private keys. When you set up crypto routing, a smart contract on Polygon is authorised to transfer specific amounts to your beneficiaries' wallets after death is independently verified. Your private keys stay with you, always — until the moment they're no longer needed.",
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
            className="border-b border-oat-border last:border-0"
        >
            <button
                onClick={onClick}
                className="w-full flex items-start justify-between gap-6 py-7 text-left group"
            >
                <span className="font-serif text-xl text-near-black group-hover:text-brand transition-colors leading-snug">
                    {q}
                </span>
                <span className="shrink-0 mt-1 w-6 h-6 rounded-full border border-oat-border flex items-center justify-center text-olive-gray group-hover:border-brand group-hover:text-brand transition-all">
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
                        <p className="pb-7 font-sans text-warm-charcoal leading-relaxed text-[15px] max-w-2xl">
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
        <main className="min-h-screen bg-parchment w-full">

            {/* Hero */}
            <section className="w-full relative z-20">
                <HeroGemini />
            </section>

            {/* Stats Bar */}
            <section className="bg-ivory border-t border-b border-oat-border py-16 relative z-10">
                <motion.div
                    className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row gap-8 justify-between text-center divide-y md:divide-y-0 md:divide-x divide-oat-border"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={stagger}
                >
                    {[
                        { value: "₹1.5 Lakh Crore", label: "sitting unclaimed in\nIndian bank accounts" },
                        { value: "3.7 Million BTC", label: "lost forever due to\ncrypto inheritance failures" },
                        { value: "6–18 Months", label: "average time families\nspend navigating claims" },
                    ].map((stat, i) => (
                        <motion.div key={i} variants={fadeUp} className="flex-1 pt-6 md:pt-0">
                            <h3 className="text-4xl font-serif text-brand mb-2 font-medium">{stat.value}</h3>
                            <p className="font-sans text-olive-gray text-base leading-relaxed whitespace-pre-line">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>
                <p className="text-center mt-12 text-sm text-stone-gray font-sans">
                    Statistics sourced from RBI, Outlook Money, and Chainalysis reports.
                </p>
            </section>

            {/* Problem Section */}
            <section className="relative">
                <DottedSurface size={24} dotColor="rgba(94, 93, 89, 0.08)">
                    <div className="py-32 px-4 max-w-[1200px] mx-auto relative z-10 w-full">
                        <motion.div
                            className="text-center mb-16"
                            initial="hidden" whileInView="show" viewport={{ once: true }}
                            variants={fadeUp}
                        >
                            <span className="text-sm font-sans tracking-widest uppercase text-olive-gray mb-4 block font-medium">
                                The Problem
                            </span>
                            <h2 className="text-[48px] font-serif text-near-black leading-[1.10] font-medium mb-6">
                                Your family loves you.<br />But they don't know what you own.
                            </h2>
                            <p className="text-lg font-sans text-olive-gray max-w-2xl mx-auto leading-relaxed">
                                When someone passes away in India, their family faces three crises at once — a paperwork nightmare during the worst week of their lives.
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
                                    icon: <SearchIcon className="w-8 h-8 text-brand mb-6" />,
                                    desc: "Your family doesn't know what bank accounts exist, which insurance policies are active, or whether you have any crypto. Assets worth crores disappear simply because no one knew to look.",
                                    stat: "₹1.5 lakh crore unclaimed in Indian banks",
                                },
                                {
                                    title: "The Crypto Black Hole",
                                    icon: <LockIcon className="w-8 h-8 text-brand mb-6" />,
                                    desc: "When a crypto investor dies, their private key dies with them. No court order, no lawyer, no amount of grief can recover a wallet without its key. The money is mathematically gone.",
                                    stat: "3.7 million BTC lost to inaccessible wallets",
                                },
                                {
                                    title: "The Paperwork Nightmare",
                                    icon: <FileTextIcon className="w-8 h-8 text-brand mb-6" />,
                                    desc: "A death certificate alone unlocks almost nothing. Banks need a succession certificate. Property needs mutation. Each institution has different forms, different offices, different waiting periods.",
                                    stat: "6–18 months of bureaucratic delays",
                                },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    variants={fadeUp}
                                    whileHover={{ y: -4 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-ivory rounded-2xl p-10 border border-oat-border shadow-[0_1px_1px_rgba(0,0,0,0.05),0_-1px_1px_rgba(0,0,0,0.02)_inset] group cursor-default"
                                >
                                    {item.icon}
                                    <h3 className="font-serif text-2xl font-medium text-near-black mb-4">{item.title}</h3>
                                    <p className="font-sans text-olive-gray leading-[1.70] mb-8 min-h-[120px]">{item.desc}</p>
                                    <div className="font-sans text-sm font-medium text-brand bg-brand/10 px-3 py-1.5 rounded-full inline-block">
                                        {item.stat}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </DottedSurface>
            </section>

            {/* Solution Section */}
            <section id="how-it-works" className="bg-ivory py-32 px-4 shadow-[0_-1px_0_0_rgba(218,212,200,1)] relative z-10">
                <div className="max-w-[1200px] mx-auto text-near-black">
                    <motion.div
                        className="text-center mb-20"
                        initial="hidden" whileInView="show" viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <span className="text-sm font-sans tracking-widest uppercase text-olive-gray mb-4 block font-medium">
                            The Solution
                        </span>
                        <h2 className="text-[48px] font-serif leading-[1.10] font-medium mb-6">
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
                                icon: <ShieldIcon className="w-8 h-8 text-brand mb-6" />,
                                phase: "Phase 1 — Before",
                                title: "Build Your Vault",
                                desc: "Add every asset you own. Assign exactly who gets what. Record a video will in your own words. We generate a legally valid will document — ready to sign.",
                            },
                            {
                                icon: <EyeIcon className="w-8 h-8 text-brand mb-6" />,
                                phase: "Phase 2 — During",
                                title: "We Watch Over You",
                                desc: "We check in quarterly with a single tap. If something seems wrong, we escalate. We never act without a government-verified death certificate.",
                            },
                            {
                                icon: <MailIcon className="w-8 h-8 text-brand mb-6" />,
                                phase: "Phase 3 — After",
                                title: "Your Family Receives Everything",
                                desc: "The moment death is verified, your crypto routes automatically. Every asset generates a pre-filled legal claim form — delivered directly to beneficiaries. No confusion.",
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                whileHover={{ y: -4 }}
                                transition={{ duration: 0.2 }}
                                className="bg-parchment rounded-2xl p-8 shadow-[0_1px_1px_rgba(0,0,0,0.05),0_-1px_1px_rgba(0,0,0,0.02)_inset] border border-oat-border"
                            >
                                <span className="text-xs font-sans tracking-widest uppercase text-olive-gray mb-4 block">{item.phase}</span>
                                {item.icon}
                                <h3 className="font-serif text-2xl font-medium text-near-black mb-4">{item.title}</h3>
                                <p className="font-sans text-olive-gray leading-[1.70]">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="bg-parchment py-32 px-4 shadow-[0_-1px_0_0_rgba(218,212,200,1)] relative z-20">
                <div className="max-w-[800px] mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden" whileInView="show" viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <span className="text-sm font-sans tracking-widest uppercase text-olive-gray mb-4 block font-medium">Your Questions</span>
                        <h2 className="text-[48px] font-serif text-near-black leading-[1.10] font-medium">
                            Everything you need<br />to trust us with everything.
                        </h2>
                    </motion.div>

                    <motion.div
                        initial="hidden" whileInView="show" viewport={{ once: true }}
                        variants={stagger}
                        className="bg-ivory rounded-[24px] border border-oat-border px-10 shadow-[0_1px_1px_rgba(0,0,0,0.04),0_-1px_1px_rgba(0,0,0,0.02)_inset]"
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
            <section id="features" className="bg-ivory py-32 px-4 shadow-[0_-1px_0_0_rgba(218,212,200,1)] relative z-10">
                <div className="max-w-[1200px] mx-auto text-near-black">
                    <motion.div
                        className="text-center mb-20"
                        initial="hidden" whileInView="show" viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <span className="text-sm font-sans tracking-widest uppercase text-olive-gray mb-4 block font-medium">What's Inside</span>
                        <h2 className="text-[48px] font-serif leading-[1.10] font-medium">
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
                                icon: <VideoIcon className="w-5 h-5 text-brand" />,
                                title: "AI Video Will",
                                desc: "Record yourself in plain language. Paradosis transcribes it, extracts the intent, and maps it to your vault — automatically.",
                                tag: "Powered by Gemini AI",
                            },
                            {
                                icon: <FolderIcon className="w-5 h-5 text-brand" />,
                                title: "Complete Asset Vault",
                                desc: "Bank accounts, fixed deposits, property, insurance, mutual funds, crypto. Every asset in one place, encrypted so only you can read it.",
                                tag: "12 Asset Types",
                            },
                            {
                                icon: <FileWarningIcon className="w-5 h-5 text-brand" />,
                                title: "Legal Will & Claim Forms",
                                desc: "We generate a legally valid will. After death, we auto-fill bank claim forms, succession petitions, and insurance claim forms.",
                                tag: "India's Legal Framework",
                            },
                            {
                                icon: <ShieldAlertIcon className="w-5 h-5 text-brand" />,
                                title: "Beneficiary Privacy",
                                desc: "You control who knows what — and when. Each person receives only their portion, in a private portal, after death is confirmed.",
                                tag: "Per-person controls",
                            },
                            {
                                icon: <SettingsIcon className="w-5 h-5 text-brand" />,
                                title: "Smart Escalation",
                                desc: "Quarterly check-ins. If you go quiet, we reach out to an emergency contact, then beneficiaries. Governed by verified death certificates.",
                                tag: "No guardians required",
                            },
                            {
                                icon: <GitBranchIcon className="w-5 h-5 text-brand" />,
                                title: "Crypto Routing",
                                desc: "Assign crypto wallets to beneficiaries beforehand. Smart contracts route assets automatically. No private key handoff needed.",
                                tag: "Polygon Smart Contract",
                            },
                        ].map((ft, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                whileHover={{ y: -5, boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(218,212,200,1)" }}
                                transition={{ duration: 0.2 }}
                                className="p-8 shadow-[0_0_0_1px_rgba(218,212,200,1)] rounded-2xl bg-parchment cursor-default"
                            >
                                <div className="mb-6 bg-ivory w-12 h-12 flex items-center justify-center rounded-xl shadow-[0_0_0_1px_rgba(218,212,200,1)]">{ft.icon}</div>
                                <h3 className="text-[22px] font-serif font-medium text-near-black mb-3">{ft.title}</h3>
                                <p className="font-sans text-olive-gray leading-[1.70] mb-6 min-h-[88px]">{ft.desc}</p>
                                <span className="text-[12px] font-sans font-medium text-brand bg-brand/10 px-3 py-1.5 rounded-full tracking-wide">{ft.tag}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Security Section */}
            <section className="bg-near-black py-32 px-4">
                <div className="max-w-[1200px] mx-auto w-full text-center">
                    <motion.div
                        initial="hidden" whileInView="show" viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <span className="text-sm font-sans tracking-widest uppercase text-warm-silver mb-4 block font-medium">
                            Your Trust is Everything
                        </span>
                        <h2 className="text-[48px] font-serif text-ivory leading-[1.10] font-medium mb-20">
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
                                icon: <ShieldCheckIcon className="w-8 h-8 text-brand mx-auto mb-6" />,
                                title: "Zero-Knowledge Encryption",
                                desc: "Every sensitive field — account numbers, Aadhaar, PAN, wallet addresses — is encrypted in your browser before it ever reaches our servers. Only your password can unlock it.",
                            },
                            {
                                icon: <FileTextIcon className="w-8 h-8 text-brand mx-auto mb-6" />,
                                title: "Government-Verified Trigger",
                                desc: "We never execute a vault on someone's word alone. A government-issued death certificate, verified against India's Civil Registration System, is the only key that unlocks a vault.",
                            },
                            {
                                icon: <LockIcon className="w-8 h-8 text-brand mx-auto mb-6" />,
                                title: "Your Data, Always Yours",
                                desc: "Download an encrypted backup of your entire vault at any time. If Paradosis ever shuts down, your data is never held hostage. It belongs to you.",
                            },
                        ].map((item, i) => (
                            <motion.div key={i} variants={fadeUp}>
                                {item.icon}
                                <h3 className="text-2xl font-serif text-ivory mb-4">{item.title}</h3>
                                <p className="text-warm-silver font-sans leading-[1.70] text-[15px]">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="bg-brand py-32 px-4 relative z-20">
                <motion.div
                    className="max-w-[800px] mx-auto text-center"
                    initial="hidden" whileInView="show" viewport={{ once: true }}
                    variants={fadeUp}
                >
                    <h2 className="text-[48px] font-serif leading-[1.10] font-medium text-ivory mb-6">
                        Start building your vault today.
                    </h2>
                    <p className="font-sans text-parchment/80 leading-[1.70] text-xl mb-10 max-w-[600px] mx-auto">
                        Join the waitlist to secure your family's future. Early access members receive free legal document generation.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/auth/signup">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-near-black text-ivory px-8 py-4 rounded-full font-sans font-medium hover:bg-dark-surface transition-colors w-full sm:w-auto text-base h-[52px] flex items-center justify-center gap-2"
                            >
                                Get Started Free
                                <ArrowRightIcon className="w-4 h-4" />
                            </motion.button>
                        </Link>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-transparent border border-parchment/30 text-ivory px-8 py-4 rounded-full font-sans font-medium hover:bg-parchment/10 transition-colors w-full sm:w-auto text-base h-[52px] flex items-center justify-center"
                        >
                            View Example Vault
                        </motion.button>
                    </div>
                </motion.div>
            </section>
        </main>
    );
}
