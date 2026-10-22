"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, MinusIcon, ArrowRightIcon } from "lucide-react";
import { Navbar } from "@/components/navbar";

const faqs: { q: string; a: string }[] = [
    {
        q: "Is Paradosis a legal will service?",
        a: "No. Paradosis is not a law firm and does not provide legal advice. We are an asset organisation and intent coordination platform. The will document we generate is a structured template that becomes legally binding only when you print it, sign it, and have it witnessed by two adults — as required under the Indian Succession Act. For complex estates, contested assets, or probate proceedings, we recommend consulting a qualified estate lawyer. Paradosis handles the discovery, organisation, and delivery — not the legal representation.",
    },
    {
        q: "What if Paradosis shuts down?",
        a: "We take this question seriously. Every vault owner can download an encrypted backup of their complete vault data at any time from their Security settings. This file is readable by any authorised person with the decryption key — independent of Paradosis. In a shutdown scenario, we are committed to giving at least 12 months' notice and providing a full data export to every user.",
    },
    {
        q: "Can my beneficiaries see my assets while I'm alive?",
        a: "Only if you choose to allow it. The default for every beneficiary is Total Secrecy — they don't know they're named, they can't log in to see anything, and Paradosis will not contact them unless the escalation system reaches Level 3. You can change this to Partial Awareness (they know they're named, not what they receive) or Full Transparency (they see everything) — per beneficiary, at any time.",
    },
    {
        q: "What if all my beneficiaries are unreachable?",
        a: "Paradosis supports four beneficiary slots per vault — two primary and two backup. If all four are unreachable after multiple contact attempts, the vault enters a 5-year dormant hold state. Any legal heir who comes forward with the death certificate within 5 years can unlock it through our human team verification process.",
    },
    {
        q: "How exactly is my data encrypted?",
        a: "Every sensitive field you type — account numbers, Aadhaar, PAN, wallet addresses, beneficiary details — is encrypted in your browser using AES-256-GCM via the Web Crypto API, before it leaves your device. The encryption key is derived from your password using PBKDF2 — a key derivation function that means we never store your password or your key. Our servers only ever see the ciphertext. Even a complete database breach would yield unreadable data.",
    },
    {
        q: "What documents does my family need after execution?",
        a: "Paradosis generates the forms. Your family still needs to physically submit them. For bank accounts: the pre-filled bank claim form + a physical copy of the death certificate + their own KYC documents. For a succession certificate (for bank accounts without nominees): the pre-filled petition is ready — they file it at the district court. For property: the mutation application + death certificate + legal heir certificate. For insurance: the claim form + death certificate + policy document. Paradosis tells each beneficiary exactly what to bring to which office — step by step.",
    },
    {
        q: "Does this work for NRIs?",
        a: "Yes, for assets located in India. NRIs with property, bank accounts, and investments in India can use Paradosis to organise and plan those assets. For assets in other countries, the legal forms may differ — Paradosis currently generates India-specific forms only. NRI-specific handling (FEMA compliance, international form support) is on our V2 roadmap.",
    },
    {
        q: "What happens to my crypto if I don't have a hardware wallet?",
        a: "If your crypto is in a software wallet (like MetaMask), you add the wallet address to your vault. Upon execution, the smart contract routes the assigned percentage to your beneficiaries' pre-registered wallet addresses. You do not need to share your private key with Paradosis — ever. If your crypto is on an exchange (like CoinDCX or WazirX), exchange-specific inheritance depends on that platform's policies — we recommend also registering a nominee directly with the exchange.",
    },
    {
        q: "Can I change my beneficiaries at any time?",
        a: "Yes. You can add, remove, or edit beneficiaries at any time while you are alive. Every change is versioned and timestamped in your activity log. When you make a significant change (adding or removing a beneficiary, changing percentages), we automatically generate a new version of your will document for re-signing. The most recent signed version is always the operative one.",
    },
    {
        q: "What is a nominee and why is it not enough?",
        a: "A nominee registered with a bank or insurance company is a custodian — not a legal owner. They receive the asset on behalf of all legal heirs, but are legally obligated to distribute it to the rightful heirs according to succession law. A nominee is not automatically the legal owner. Without a will or succession certificate, even a nominee can face challenges from other heirs. Paradosis builds the full structure — will, legal heir identification, and claim forms — so your family is protected beyond just the nominee.",
    },
    {
        q: "How do you verify the death certificate?",
        a: "India's Civil Registration System (CRS) issues digital death certificates with embedded QR codes. When a beneficiary uploads a death certificate to Paradosis, our system reads the QR code, extracts the verification URL, and checks the certificate's registration number and the name against the vault owner's registered name. A certificate that doesn't pass this check does not proceed. Additionally, our human team reviews all submissions before final execution approval.",
    },
    {
        q: "What if I go on a long vacation and miss check-ins?",
        a: "Set Vacation Mode in your Escalation Settings before you leave. You can pause check-ins for up to 180 days. During this window, the escalation ladder is frozen — no contacts are made, no alerts are sent. When the vacation window ends, check-ins resume normally. If you forget to set Vacation Mode and we can't reach you, the escalation ladder begins — but it takes multiple missed check-ins and weeks of silence before we contact anyone.",
    },
];

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
};

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="mx-auto max-w-4xl px-6 pt-32 pb-24">
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    className="text-center"
                >
                    <span className="text-sm font-medium tracking-widest uppercase text-[#737373]">
                        Questions &amp; answers
                    </span>
                    <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-black">
                        Frequently asked questions
                    </h1>
                    <p className="mt-4 text-lg text-[#525252] max-w-2xl mx-auto">
                        Everything you need to know about how Paradosis protects your
                        assets, your privacy, and your family.
                    </p>
                </motion.div>

                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-60px" }}
                    className="mt-16"
                >
                    {faqs.map((faq, i) => {
                        const isOpen = openIndex === i;
                        return (
                            <motion.div
                                key={faq.q}
                                variants={fadeUp}
                                className="border-b border-[#e5e5e5] last:border-0"
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : i)}
                                    className="w-full flex items-start justify-between gap-6 py-7 text-left group"
                                    aria-expanded={isOpen}
                                >
                                    <span className="font-sans text-lg md:text-xl text-black leading-snug group-hover:opacity-80 transition-opacity">
                                        {faq.q}
                                    </span>
                                    <span className="shrink-0 mt-1 w-6 h-6 rounded-full border border-[#e5e5e5] flex items-center justify-center text-[#737373] group-hover:border-primary group-hover:text-black transition-all">
                                        {isOpen ? (
                                            <MinusIcon className="w-3.5 h-3.5" />
                                        ) : (
                                            <PlusIcon className="w-3.5 h-3.5" />
                                        )}
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
                                            <p className="pb-7 pr-12 text-[15px] leading-relaxed text-[#525252]">
                                                {faq.a}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </motion.div>

                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="mt-20 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-10 text-center"
                >
                    <h2 className="text-2xl font-semibold text-black tracking-tight">
                        Still have questions?
                    </h2>
                    <p className="mt-2 text-[#525252]">
                        Explore how Paradosis works end to end, or create your vault
                        and see for yourself.
                    </p>
                    <Link
                        href="/how-it-works"
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-black text-white px-6 py-3 text-sm font-medium hover:bg-[#262626] transition-colors"
                    >
                        How it works
                        <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                </motion.div>
            </main>
        </div>
    );
}
