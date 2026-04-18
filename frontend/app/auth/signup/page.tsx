"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightIcon, ShieldCheckIcon, KeySquareIcon, EyeOffIcon, ShieldIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";

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
    const searchParams = useSearchParams();
    const role = searchParams.get("role");
    const isGuardian = role === "guardian";

    const [step, setStep] = useState(0);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleNext = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (isGuardian) {
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                // For guardians, "Signup" is essentially "Activation" which works like a passwordless login
                const res = await fetch(`${apiUrl}/api/guardian/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.detail || "This email is not registered as a guardian for any vault.");
                }

                localStorage.setItem("guardian_token", data.token);
                router.push("/guardian/portal");
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
            return;
        }

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
                // Go to verification screen
                router.push("/auth/verify-email");
            } catch (err: any) {
                setError(err.message || "An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-[800px] flex flex-col md:flex-row shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-card rounded-[32px] overflow-hidden border border-border"
            >
                {/* Left Side: Form */}
                <div className="flex-1 p-12 relative flex flex-col">
                    <Logo className="mb-12" />

                    <div className="mb-8">
                        <h1 className="text-3xl font-sans text-foreground mb-2">
                            {isGuardian ? "Guardian Activation" : "Build your vault"}
                        </h1>
                        <p className="text-muted-foreground font-sans">
                            {isGuardian 
                                ? "Activate your guardian access to protect a loved one's vault." 
                                : `Step ${step + 1} of 2: ${steps[step].title}`}
                        </p>
                        {isGuardian && (
                            <div className="mt-4 flex items-center gap-2 text-primary font-medium text-sm bg-primary/5 px-3 py-2 rounded-lg border border-primary/10">
                                <ShieldIcon className="w-4 h-4" /> Authorized Guardian Mode
                            </div>
                        )}
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
                                    <label className="text-sm font-medium text-foreground font-sans">Enter your email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-4 outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all font-sans text-foreground text-lg shadow-inner"
                                        placeholder="********"
                                        autoFocus
                                        required
                                    />
                                    <p className="text-sm text-muted-foreground font-sans flex items-center gap-2 mt-4">
                                        <ShieldCheckIcon className="w-4 h-4 text-primary" /> {steps[0].desc}
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
                                    <label className="text-sm font-medium text-foreground font-sans">Create Master Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-background border-2 border-primary rounded-lg px-4 py-4 outline-none focus:ring-4 focus:ring-ring/20 transition-all font-sans text-foreground text-lg shadow-inner"
                                        placeholder="********"
                                        autoFocus
                                        required
                                    />
                                    <p className="text-sm text-muted-foreground font-sans flex items-center gap-2 mt-4">
                                        <KeySquareIcon className="w-4 h-4 text-primary" /> {steps[1].desc}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-auto pt-12 flex justify-between items-center">
                            {step === 1 ? (
                                <button type="button" onClick={() => setStep(0)} className="text-sm text-muted-foreground hover:text-foreground font-sans">
                                    Back
                                </button>
                            ) : (
                                <div />
                            )}
                            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-[#b05637] transition-all rounded-full py-6 px-8 group self-end ml-auto">
                                <span className="font-medium text-base ml-2">{loading ? "Wait..." : (step === 0 || isGuardian ? "Continue" : "Create Vault")}</span>
                                {!loading && <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Right Side: Philosophy */}
                <div className="flex-1 bg-near-black p-12 text-primary-foreground flex flex-col justify-center relative overflow-hidden hidden md:flex lg:w-1/2">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <span className="text-[200px] font-sans text-parchment border-b-2">P</span>
                    </div>
                    <div className="z-10 relative space-y-12 max-w-[280px] mx-auto">
                        <div className="flex gap-4 items-start">
                            <EyeOffIcon className="w-8 h-8 text-primary shrink-0" />
                            <div>
                                <h3 className="font-sans text-lg mb-2">Zero Knowledge</h3>
                                <p className="text-sm font-sans text-muted-foreground opacity-80 leading-relaxed">Your data is encrypted locally. We literally cannot see your passwords or private keys.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <ShieldCheckIcon className="w-8 h-8 text-primary shrink-0" />
                            <div>
                                <h3 className="font-sans text-lg mb-2">Verified Triggers</h3>
                                <p className="text-sm font-sans text-muted-foreground opacity-80 leading-relaxed">No timers. No guesses. Only a government death certificate unlocks the vault.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <p className="text-center mt-8 text-muted-foreground font-sans text-sm">
                Already have a vault? <Link href={isGuardian ? "/auth/signin?role=guardian" : "/auth/signin"} className="text-primary font-medium hover:underline">Sign into Paradosis</Link>
            </p>
        </div>
    );
}
