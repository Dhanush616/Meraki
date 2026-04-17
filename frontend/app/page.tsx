import { HeroGemini } from "@/components/HeroGemini";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { SearchIcon, LockIcon, FileTextIcon, ShieldCheckIcon, ShieldIcon, EyeIcon, MailIcon, CheckCircle2Icon, VideoIcon, FolderIcon, SettingsIcon, GitBranchIcon, FileWarningIcon, ShieldAlertIcon } from "lucide-react";

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-parchment w-full">
            {/* Hero section */}
            <section className="px-4 pb-8 max-w-[1200px] mx-auto relative z-20">
                <HeroGemini />
            </section>

            {/* Stats Bar */}
            <section className="bg-ivory border-t border-b border-border-cream py-16">
                <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row gap-8 justify-between text-center divide-y md:divide-y-0 md:divide-x divide-border-cream">
                    <div className="flex-1 pt-6 md:pt-0">
                        <h3 className="text-4xl font-serif text-brand mb-2 font-medium">₹1.5 Lakh Cr</h3>
                        <p className="font-sans text-olive-gray text-base leading-relaxed">sitting unclaimed in <br />Indian bank accounts</p>
                    </div>
                    <div className="flex-1 pt-6 md:pt-0">
                        <h3 className="text-4xl font-serif text-brand mb-2 font-medium">3.7 Million</h3>
                        <p className="font-sans text-olive-gray text-base leading-relaxed">BTC lost forever due to <br />crypto inheritance failures</p>
                    </div>
                    <div className="flex-1 pt-6 md:pt-0">
                        <h3 className="text-4xl font-serif text-brand mb-2 font-medium">6–18 Months</h3>
                        <p className="font-sans text-olive-gray text-base leading-relaxed">average time families <br />spend navigating claims</p>
                    </div>
                </div>
                <div className="text-center mt-12 text-sm text-stone-gray font-sans">
                    All statistics are sourced from RBI, Outlook Money, and Chainalysis reports.
                </div>
            </section>

            {/* Problem Section over Dotted Surface */}
            <section className="relative">
                <DottedSurface size={24} dotColor="rgba(94, 93, 89, 0.1)">
                    <div className="py-32 px-4 max-w-[1200px] mx-auto relative z-10 w-full">
                        <div className="text-center mb-16">
                            <span className="text-sm font-sans tracking-wide uppercase text-olive-gray mb-4 block font-medium">
                                The Problem
                            </span>
                            <h2 className="text-[52px] font-serif text-near-black leading-[1.10] font-medium mb-6">
                                Your family loves you.<br />But they don't know what you own.
                            </h2>
                            <p className="text-xl font-sans text-olive-gray max-w-2xl mx-auto leading-relaxed">
                                When someone passes away in India, their family faces three crises at once — a paperwork nightmare during the worst week of their lives.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: "The Discovery Problem",
                                    icon: <SearchIcon className="w-8 h-8 text-brand mb-6" />,
                                    desc: "Your family doesn't know what bank accounts exist, which insurance policies are active, or whether you have any crypto. Assets worth crores disappear simply because no one knew to look.",
                                    stat: "₹1.5 lakh crore unclaimed in Indian banks"
                                },
                                {
                                    title: "The Crypto Black Hole",
                                    icon: <LockIcon className="w-8 h-8 text-brand mb-6" />,
                                    desc: "When a crypto investor dies, their private key dies with them. No court order, no lawyer, no amount of grief can recover a wallet without its key. The money is mathematically gone.",
                                    stat: "3.7 million BTC lost to inaccessible wallets"
                                },
                                {
                                    title: "The Paper Nightmare",
                                    icon: <FileTextIcon className="w-8 h-8 text-brand mb-6" />,
                                    desc: "A death certificate alone unlocks almost nothing. Banks need a succession certificate. Property needs mutation. Each institution has different forms, different offices, different waiting periods.",
                                    stat: "6–18 months of bureaucratic chaos"
                                }
                            ].map((item, i) => (
                                <div key={i} className="bg-ivory rounded-xl p-10 border border-border-cream shadow-[0_0_0_1px_rgba(232,230,220,1)] hover:shadow-[0_0_0_1px_rgba(209,207,197,1),0_4px_24px_rgba(0,0,0,0.05)] transition-all duration-300 group">
                                    {item.icon}
                                    <h3 className="font-serif text-2xl font-medium text-near-black mb-4">{item.title}</h3>
                                    <p className="font-sans text-olive-gray leading-[1.60] mb-8 min-h-[120px]">{item.desc}</p>
                                    <div className="font-sans text-sm font-medium text-brand">
                                        {item.stat}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </DottedSurface>
            </section>

            {/* Solution Section */}
            <section id="how-it-works" className="bg-ivory py-32 px-4 shadow-[0_-1px_0_0_rgba(232,230,220,1)] relative z-10">
                <div className="max-w-[1200px] mx-auto text-near-black">
                    <div className="text-center mb-20 text-near-black">
                        <span className="text-sm font-sans tracking-wide uppercase text-olive-gray mb-4 block font-medium">
                            The Solution
                        </span>
                        <h2 className="text-[52px] font-serif leading-[1.10] font-medium mb-6">
                            Paradosis bridges the gap between<br />your life's work and your family's future.
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <ShieldIcon className="w-8 h-8 text-brand mb-6" />,
                                phase: "Phase 1 — Before",
                                title: "Build Your Vault",
                                desc: "Add every asset you own. Assign exactly who gets what. Record a video will in your own words. We generate a legally valid will document — ready to sign."
                            },
                            {
                                icon: <EyeIcon className="w-8 h-8 text-brand mb-6" />,
                                phase: "Phase 2 — During",
                                title: "We Watch Over You",
                                desc: "We check in quarterly with a single tap. If something seems wrong, we escalate. We never act without a government-verified death certificate."
                            },
                            {
                                icon: <MailIcon className="w-8 h-8 text-brand mb-6" />,
                                phase: "Phase 3 — After",
                                title: "Your Family Receives Everything",
                                desc: "The moment death is verified, your crypto routes automatically. Every asset generates a pre-filled legal claim form — delivered directly to beneficiaries. No confusion."
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-parchment rounded-xl p-8 shadow-[0_0_0_1px_rgba(232,230,220,1)] hover:shadow-[0_0_0_1px_rgba(209,207,197,1),0_4px_24px_rgba(0,0,0,0.05)] transition-all duration-300">
                                <span className="text-xs font-sans tracking-widest uppercase text-olive-gray mb-4 block">{item.phase}</span>
                                {item.icon}
                                <h3 className="font-serif text-2xl font-medium text-near-black mb-4">{item.title}</h3>
                                <p className="font-sans text-olive-gray leading-[1.60]">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Competitor Table Section */}
            <section id="pricing" className="bg-parchment py-32 px-4 shadow-[0_-1px_0_0_rgba(232,230,220,1)] relative z-20">
                <div className="max-w-[1000px] mx-auto text-near-black">
                    <div className="text-center mb-16 text-near-black">
                        <span className="text-sm font-sans tracking-wide uppercase text-olive-gray mb-4 block font-medium">Why Paradosis</span>
                        <h2 className="text-[52px] font-serif leading-[1.10] font-medium border-b-0">
                            Every other solution stops at the document.<br />We start there.
                        </h2>
                    </div>

                    <div className="overflow-x-auto pb-4">
                        <table className="w-[800px] md:w-full text-left font-sans bg-ivory rounded-[16px] overflow-hidden shadow-[0_0_0_1px_rgba(232,230,220,1)] border-collapse border-style-hidden">
                            <thead className="bg-[#ebe9df]/30 text-sm">
                                <tr>
                                    <th className="p-6 font-medium text-olive-gray border-b border-border-cream w-1/4">Key Feature</th>
                                    <th className="p-6 font-semibold text-brand border-b border-border-cream bg-brand/5">Paradosis</th>
                                    <th className="p-6 font-medium text-olive-gray border-b border-border-cream">Estate Lawyer</th>
                                    <th className="p-6 font-medium text-olive-gray border-b border-border-cream">Yellow</th>
                                    <th className="p-6 font-medium text-olive-gray border-b border-border-cream">Cipherwill</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-cream text-[15px]">
                                {[
                                    ["Asset Discovery", "✅ Complete", "❌ Manual", "⚡ Partial", "⚡ Partial"],
                                    ["Crypto Inheritance", "✅ Auto-routed", "❌ None", "❌ None", "⚡ Vault only"],
                                    ["Legal Forms", "✅ All major forms", "⚡ Manual", "⚡ Manual", "❌ None"],
                                    ["Beneficiary Privacy", "✅ Per-person control", "❌ None", "❌ None", "❌ None"],
                                    ["Death Verification", "✅ Govt. cert.", "⚡ Manual", "❌ None", "⚡ Inactivity only"],
                                    ["Cost", "From ₹0", "₹5k–50k+", "Paid", "Paid"],
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-[#ebe9df]/30 transition-colors duration-200">
                                        <td className="p-6 font-medium text-near-black break-words">{row[0]}</td>
                                        <td className="p-6 font-medium text-brand bg-brand/5">{row[1]}</td>
                                        <td className="p-6 text-olive-gray">{row[2]}</td>
                                        <td className="p-6 text-olive-gray">{row[3]}</td>
                                        <td className="p-6 text-olive-gray">{row[4]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-center text-sm font-sans text-stone-gray mt-6">Comparison based on publicly available information as of 2025.</p>
                </div>
            </section>

            {/* Features Grid Section */}
            <section id="features" className="bg-ivory py-32 px-4 shadow-[0_-1px_0_0_rgba(232,230,220,1)] relative z-10">
                <div className="max-w-[1200px] mx-auto text-near-black">
                    <div className="text-center mb-20 text-near-black">
                        <span className="text-sm font-sans tracking-wide uppercase text-olive-gray mb-4 block font-medium">What's Inside</span>
                        <h2 className="text-[52px] font-serif leading-[1.10] font-medium">
                            Everything your family needs.<br />Nothing they'll have to figure out alone.
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <VideoIcon className="w-5 h-5 text-brand" />,
                                title: "AI Video Will",
                                desc: "Record yourself in plain language. Paradosis transcribes it, extracts the intent, and maps it to your vault — automatically.",
                                tag: "Powered by Gemini AI"
                            },
                            {
                                icon: <FolderIcon className="w-5 h-5 text-brand" />,
                                title: "Complete Asset Vault",
                                desc: "Bank accounts, FDs, property, insurance, mutual funds, crypto. Every asset in one place, encrypted so only you can read it.",
                                tag: "12 Asset Types"
                            },
                            {
                                icon: <FileWarningIcon className="w-5 h-5 text-brand" />,
                                title: "Legal Will + Claim Forms",
                                desc: "We generate a legally valid will. After death, we auto-fill bank claim forms, succession petitions, and insurance claim forms.",
                                tag: "India's Legal Framework"
                            },
                            {
                                icon: <ShieldAlertIcon className="w-5 h-5 text-brand" />,
                                title: "Beneficiary Privacy",
                                desc: "You control who knows what — and when. Each person receives only their portion, in a private portal, after death is confirmed.",
                                tag: "Per-person controls"
                            },
                            {
                                icon: <SettingsIcon className="w-5 h-5 text-brand" />,
                                title: "Smart Escalation",
                                desc: "Quarterly check-ins. If you go quiet, we reach out to an emergency contact, then beneficiaries. Governed by verified death certs.",
                                tag: "No guardians required"
                            },
                            {
                                icon: <GitBranchIcon className="w-5 h-5 text-brand" />,
                                title: "Crypto Routing",
                                desc: "Assign crypto wallets to beneficiaries beforehand. Smart contracts route assets automatically. No private key handoff needed.",
                                tag: "Polygon Smart Contract"
                            },
                        ].map((ft, i) => (
                            <div key={i} className="p-8 shadow-[0_0_0_1px_rgba(232,230,220,1)] hover:shadow-[0_0_0_1px_rgba(209,207,197,1),0_4px_24px_rgba(0,0,0,0.05)] rounded-xl bg-parchment transition-all duration-300">
                                <div className="mb-6 bg-ivory w-12 h-12 flex items-center justify-center rounded-lg shadow-[0_0_0_1px_rgba(232,230,220,1)]">{ft.icon}</div>
                                <h3 className="text-[25px] font-serif font-medium text-near-black mb-3">{ft.title}</h3>
                                <p className="font-sans text-olive-gray leading-[1.60] mb-6 min-h-[100px]">{ft.desc}</p>
                                <span className="text-[12px] font-sans font-medium text-brand bg-brand/10 px-3 py-1.5 rounded-full tracking-wide">{ft.tag}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Security Section (Dark) */}
            <section className="bg-near-black py-32 px-4">
                <div className="max-w-[1200px] mx-auto w-full text-center">
                    <span className="text-sm font-sans tracking-wide uppercase text-warm-silver mb-4 block font-medium">
                        Your Trust is Everything
                    </span>
                    <h2 className="text-[52px] font-serif text-ivory leading-[1.10] font-medium mb-20">
                        We can't read your data.<br />Even if we wanted to.
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <ShieldCheckIcon className="w-8 h-8 text-brand mx-auto mb-6" />,
                                title: "Zero-Knowledge Encryption",
                                desc: "Every sensitive field — account numbers, Aadhaar, PAN, wallet addresses — is encrypted in your browser before it ever reaches our servers. Only your password can unlock it."
                            },
                            {
                                icon: <FileTextIcon className="w-8 h-8 text-brand mx-auto mb-6" />,
                                title: "Government-Verified Trigger",
                                desc: "We never execute a vault on someone's word alone. A government-issued death certificate, verified against India's Civil Registration System, is the only key that unlocks a vault."
                            },
                            {
                                icon: <LockIcon className="w-8 h-8 text-brand mx-auto mb-6" />,
                                title: "Your Data, Always Yours",
                                desc: "Download an encrypted backup of your entire vault at any time. If Paradosis ever shuts down, your data is never held hostage. It belongs to you."
                            }
                        ].map((item, i) => (
                            <div key={i}>
                                {item.icon}
                                <h3 className="text-2xl font-serif text-ivory mb-4">{item.title}</h3>
                                <p className="text-warm-silver font-sans leading-[1.60]">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="bg-brand py-32 px-4 shadow-[0_-1px_0_0_rgba(232,230,220,1)] relative z-20">
                <div className="max-w-[800px] mx-auto text-center">
                    <h2 className="text-[52px] font-serif leading-[1.10] font-medium text-ivory mb-6">
                        Start building your vault today.
                    </h2>
                    <p className="font-sans text-parchment/80 leading-[1.60] text-xl mb-10 max-w-[600px] mx-auto">
                        Join waitlist to secure your family's future. Early access members receive free document translation.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button className="bg-near-black text-ivory px-8 py-4 rounded-full font-sans font-medium hover:bg-[#1a1c1a] transition-colors w-full sm:w-auto text-lg h-[56px] flex items-center justify-center">
                            Join the Waitlist
                        </button>
                        <button className="bg-transparent border border-parchment/30 text-ivory px-8 py-4 rounded-full font-sans font-medium hover:bg-parchment/10 transition-colors w-full sm:w-auto text-lg h-[56px] flex items-center justify-center">
                            View Example Vault
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}