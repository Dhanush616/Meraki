"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightIcon, ShieldCheckIcon, KeySquareIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
    {
        title: "Your Email",
        desc: "We use this to verify identity",
    },
    {
        title: "Master Password",
        desc: "Make it complex. We can't recover it.",
    }
];

export default function SignUpPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleNext = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (step === 0 && email) {
            setStep(1);
            return;
        }

        if (step === 1 && password) {
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const response = await fetch(`${apiUrl}/api/auth/signup`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.detail || "Failed to sign up");
                }

                console.log("Signup successful", data);
                // Optionally auto-login and push to /dashboard
                router.push("/dashboard"); 
            } catch (err: any) {
                setError(err.message || "An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-parchment flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-[800px] flex flex-col md:flex-row shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-ivory rounded-[32px] overflow-hidden border border-border-cream"
            >
                {/* Left Side: Form */}
                <div className="flex-1 p-12 relative flex flex-col">
                    <Link href="/" className="mb-12 inline-block">
                        <span className="font-serif text-2xl font-bold text-near-black flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-brand"></span>
                            Paradosis
                        </span>
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-3xl font-serif text-near-black mb-2">Build your vault</h1>
                        <p className="text-olive-gray font-sans">Step {step + 1} of 2: {steps[step].title}</p>
                    </div>

                    {error && (
                        <div className="p-3 mb-6 rounded-lg bg-red-50 text-red-600 text-sm font-sans border border-red-100">
                            {error}
                        </div>
                    )}

                    <form className="flex flex-col flex-1" onSubmit={handleNext}>
                        <AnimatePresence mode="wait">
                            {step === 0 ? (
                                <motion.div
                                    key="step0"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="space-y-4"
                                >
                                    <label className="text-sm font-medium text-near-black font-sans">Enter your email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-parchment border border-border-cream rounded-lg px-4 py-4 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all font-sans text-near-black text-lg shadow-inner"
                                        placeholder="you@example.com"
                                        autoFocus
                                        required
                                    />
                                    <p className="text-sm text-olive-gray font-sans flex items-center gap-2 mt-4">
                                        <ShieldCheckIcon className="w-4 h-4 text-brand" /> {steps[0].desc}
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step1"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="space-y-4"
                                >
                                    <label className="text-sm font-medium text-near-black font-sans">Create Master Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-parchment border-2 border-brand rounded-lg px-4 py-4 outline-none focus:ring-4 focus:ring-brand/20 transition-all font-sans text-near-black text-lg shadow-inner"
                                        placeholder="••••••••"
                                        autoFocus
                                        required
                                    />
                                    <p className="text-sm text-olive-gray font-sans flex items-center gap-2 mt-4">
                                        <KeySquareIcon className="w-4 h-4 text-brand" /> {steps[1].desc}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-auto pt-12 flex justify-between items-center">
                            {step === 1 ? (
                                <button type="button" onClick={() => setStep(0)} className="text-sm text-olive-gray hover:text-near-black font-sans">
                                    Back
                                </button>
                            ) : (
                                <div />
                            )}
                            <Button type="submit" disabled={loading} className="bg-brand text-ivory hover:bg-[#b05637] transition-all rounded-full py-6 px-8 group self-end ml-auto">
                                <span className="font-medium text-base ml-2">{loading ? "Wait..." : (step === 0 ? "Continue" : "Create Vault")}</span>
                                {!loading && <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Right Side: Philosophy */}
                <div className="flex-1 bg-near-black p-12 text-ivory flex flex-col justify-center relative overflow-hidden hidden md:flex lg:w-1/2">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <span className="text-[200px] font-serif text-parchment border-b-2">P</span>
                    </div>
                    <div className="z-10 relative space-y-12 max-w-[280px] mx-auto">
                        <div className="flex gap-4 items-start">
                            <EyeOffIcon className="w-8 h-8 text-brand shrink-0" />
                            <div>
                                <h3 className="font-serif text-lg mb-2">Zero Knowledge</h3>
                                <p className="text-sm font-sans text-warm-sand opacity-80 leading-relaxed">Your data is encrypted locally. We literally cannot see your passwords or private keys.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <ShieldCheckIcon className="w-8 h-8 text-brand shrink-0" />
                            <div>
                                <h3 className="font-serif text-lg mb-2">Verified Triggers</h3>
                                <p className="text-sm font-sans text-warm-sand opacity-80 leading-relaxed">No timers. No guesses. Only a government death certificate unlocks the vault.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <p className="text-center mt-8 text-olive-gray font-sans text-sm">
                Already have a vault? <Link href="/auth/signin" className="text-brand font-medium hover:underline">Sign into Paradosis</Link>
            </p>
        </div>
    );
}
