"use client";

import { motion } from "framer-motion";
import {
    VaultIcon, EyeIcon, GiftIcon, UserIcon, LandmarkIcon,
    PercentIcon, VideoIcon, PenLineIcon, BellIcon,
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

const buildSteps: {
    icon: React.ElementType;
    title: string;
    body: string;
}[] = [
    {
        icon: UserIcon,
        title: "Create your vault",
        body: "Add your name, religion, address, and family details. This data pre-fills every legal form that will ever be generated — you enter it once, it goes everywhere.",
    },
    {
        icon: LandmarkIcon,
        title: "Add every asset you own",
        body: "12 asset categories: bank accounts, fixed deposits, property, insurance, mutual funds, stocks and demat, crypto wallets, PPF/EPF, vehicles, gold and jewellery, business ownership, and anything else. Each asset has specific fields for its category. Nothing is missed.",
    },
    {
        icon: PercentIcon,
        title: "Assign beneficiaries with splits",
        body: "For each asset, you decide who gets what — and in what percentage. Primary beneficiaries and backup beneficiaries. Your HDFC account: 60% to your spouse, 40% to your daughter. Your flat: 100% to your spouse, with your son as backup. It's your decision, captured precisely.",
    },
    {
        icon: VideoIcon,
        title: "Record your video will",
        body: "Speak naturally: \u201cMy savings should go to Kavitha. My crypto wallet goes to Arjun — he knows what to do with it.\u201d Paradosis transcribes your words, extracts your intent using AI, and maps it to your vault.",
    },
    {
        icon: PenLineIcon,
        title: "Sign your will document",
        body: "We generate a legally valid will document from your vault data — properly structured under the Indian Succession Act. Print it. Sign it in the presence of two witnesses. It's now legally binding.",
    },
    {
        icon: BellIcon,
        title: "Configure your escalation settings",
        body: "Set how often you want us to check in. Add an emergency contact. Set a vacation mode if you travel. Choose what your beneficiaries are told — and when.",
    },
];

const escalationLadder = [
    {
        level: "Level 0 — Normal",
        body: "You log in regularly. You respond to quarterly check-ins with one tap. Your vault is green. Nothing happens.",
        dark: false,
    },
    {
        level: "Level 1 — Concern",
        body: "You've missed a check-in and your login frequency has dropped. We switch to monthly contact — a gentle email and SMS asking if you're okay. One tap to reset.",
        dark: false,
    },
    {
        level: "Level 2 — Alert",
        body: "You've missed two check-ins and haven't logged in for 90 days. We contact you across every channel — email, SMS, WhatsApp — every week. Our team is internally flagged.",
        dark: false,
    },
    {
        level: "Level 3 — Suspected Death",
        body: "All contact attempts have failed. We contact your emergency contact first: \u201cWe've been trying to reach you. Do you know if they're okay?\u201d If they confirm a passing, or are also unreachable, we move to your beneficiaries.",
        dark: true,
    },
    {
        level: "Level 4 — Death Claimed",
        body: "A beneficiary has confirmed the passing. We ask them to upload the official government death certificate from DigiLocker or the CRS portal. We verify the QR code against the Civil Registration System. A 15-day liveness window opens — one final chance for you to confirm you're alive.",
        dark: true,
    },
    {
        level: "Level 5 — Execution",
        body: "15 days pass. No response. The government certificate is verified. The vault unlocks. Everything executes.",
        dark: true,
    },
];

const formsGenerated = [
    "Bank claim forms (SBI, HDFC, Canara, and more)",
    "Succession Certificate petition (district court)",
    "Legal Heir Certificate application (tehsildar/SDM)",
    "Property mutation application (state-specific)",
    "Insurance claim forms (LIC and private insurers)",
];

export default function HowItWorksPage() {
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
                        Three phases. One promise.
                    </span>
                    <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-black">
                        How Paradosis Works
                    </h1>
                    <p className="mt-5 text-lg text-[#525252] max-w-2xl mx-auto">
                        A simple idea: do the hard work before it&apos;s needed, so your
                        family doesn&apos;t have to do it during the hardest moment of
                        their lives.
                    </p>
                </motion.section>

                {/* Phase 1 */}
                <section className="mx-auto max-w-5xl px-6 mt-28">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                        <span className="text-sm font-medium tracking-widest uppercase text-[#737373]">
                            Phase 1 — Before
                        </span>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black">
                            Build your complete financial picture in one place.
                        </h2>
                    </motion.div>

                    <motion.ol
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-60px" }}
                        className="mt-12 grid gap-6 md:grid-cols-2"
                    >
                        {buildSteps.map((step, i) => (
                            <motion.li
                                key={step.title}
                                variants={fadeUp}
                                className="rounded-2xl border border-[#e5e5e5] p-7 bg-white"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex w-9 h-9 items-center justify-center rounded-full bg-black text-white">
                                        <step.icon className="w-4 h-4" />
                                    </span>
                                    <span className="text-[13px] font-medium uppercase tracking-widest text-[#737373]">
                                        Step {i + 1}
                                    </span>
                                </div>
                                <h3 className="mt-4 text-xl font-medium text-black tracking-tight">
                                    {step.title}
                                </h3>
                                <p className="mt-2 text-[15px] leading-relaxed text-[#525252]">
                                    {step.body}
                                </p>
                            </motion.li>
                        ))}
                    </motion.ol>
                </section>

                {/* Phase 2 */}
                <section className="mx-auto max-w-5xl px-6 mt-28">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                        <span className="text-sm font-medium tracking-widest uppercase text-[#737373]">
                            Phase 2 — During
                        </span>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black">
                            We check in so your family doesn&apos;t have to worry.
                        </h2>
                        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#525252]">
                            The escalation ladder: from gentle contact to
                            government-verified execution, every step is measured and
                            reviewed by our human team.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-60px" }}
                        className="mt-12 space-y-3"
                    >
                        {escalationLadder.map((l) => (
                            <motion.div
                                key={l.level}
                                variants={fadeUp}
                                className={
                                    l.dark
                                        ? "rounded-2xl bg-black text-white p-7"
                                        : "rounded-2xl border border-[#e5e5e5] p-7"
                                }
                            >
                                <h3 className={`text-lg font-medium tracking-tight ${l.dark ? "text-white" : "text-black"}`}>
                                    {l.level}
                                </h3>
                                <p className={`mt-2 text-[15px] leading-relaxed ${l.dark ? "text-[#d4d4d4]" : "text-[#525252]"}`}>
                                    {l.body}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.blockquote
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="mt-10 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-10 text-center"
                    >
                        <p className="text-lg md:text-xl font-medium text-black leading-relaxed max-w-3xl mx-auto">
                            &ldquo;We never execute a vault on someone&apos;s word alone. A
                            government-issued death certificate — verified against
                            India&apos;s Civil Registration System — is the only key. No
                            certificate, no execution. Ever.&rdquo;
                        </p>
                    </motion.blockquote>
                </section>

                {/* Phase 3 */}
                <section className="mx-auto max-w-5xl px-6 mt-28">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                        <span className="text-sm font-medium tracking-widest uppercase text-[#737373]">
                            Phase 3 — After
                        </span>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black">
                            Two tracks. One trigger. Complete delivery.
                        </h2>
                    </motion.div>

                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-60px" }}
                        className="mt-12 grid gap-6 md:grid-cols-2"
                    >
                        <motion.div variants={fadeUp} className="rounded-2xl border border-[#e5e5e5] p-8">
                            <div className="flex items-center gap-3">
                                <span className="flex w-9 h-9 items-center justify-center rounded-full bg-black text-white">
                                    <LandmarkIcon className="w-4 h-4" />
                                </span>
                                <h3 className="text-xl font-medium text-black tracking-tight">
                                    Traditional assets
                                </h3>
                            </div>
                            <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-[#525252] list-none">
                                <li>1. Each beneficiary receives a private, secure link to their portion of the vault.</li>
                                <li>2. The portal opens with a personal letter and a card for each asset assigned to them.</li>
                                <li>3. Every card contains a pre-filled legal claim form — bank-specific, institution-specific, court-ready.</li>
                                <li>4. Step-by-step instructions: which office to visit, what to bring, what to say.</li>
                                <li>5. The family walks in with the right paperwork. Not blank forms. Filled ones.</li>
                            </ul>
                            <div className="mt-6 border-t border-[#e5e5e5] pt-5">
                                <p className="text-[13px] font-medium uppercase tracking-widest text-[#737373]">
                                    Forms we generate
                                </p>
                                <ul className="mt-3 space-y-2 text-[15px] text-[#525252]">
                                    {formsGenerated.map((f) => (
                                        <li key={f}>+ {f}</li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>

                        <motion.div variants={fadeUp} className="rounded-2xl bg-black text-white p-8">
                            <div className="flex items-center gap-3">
                                <span className="flex w-9 h-9 items-center justify-center rounded-full bg-white text-black">
                                    <VaultIcon className="w-4 h-4" />
                                </span>
                                <h3 className="text-xl font-medium tracking-tight">
                                    Crypto assets
                                </h3>
                            </div>
                            <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-[#d4d4d4]">
                                <li>1. Upon vault execution, the smart contract fires.</li>
                                <li>2. Each crypto asset routes to the beneficiary&apos;s pre-registered wallet address.</li>
                                <li>3. No private key handoff. No exchange login. No court order.</li>
                                <li>4. A transaction reference is generated and shown in the beneficiary portal.</li>
                            </ul>
                            <div className="mt-6 border-t border-[#262626] pt-5">
                                <div className="flex items-center gap-3">
                                    <EyeIcon className="w-4 h-4 text-[#d4d4d4]" />
                                    <p className="text-[13px] font-medium uppercase tracking-widest text-[#d4d4d4]">
                                        Privacy by default
                                    </p>
                                </div>
                                <p className="mt-3 text-[15px] leading-relaxed text-[#d4d4d4]">
                                    Beneficiaries receive a private, encrypted portal link — only
                                    their portion. They see nothing else: no other beneficiaries,
                                    no other assets, no other instructions.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </section>
            </main>
        </div>
    );
}
