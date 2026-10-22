"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon, CheckCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function TwoFAVerifyPage() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Prefill the email from ?email=... passed by the sign-in flow.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const prefill = params.get("email");
        if (prefill) setEmail(prefill);
    }, []);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/auth/verify-2fa`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, token: code }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Invalid verification code");
            setVerified(true);
        } catch (err: any) {
            setError(err.message || "Invalid verification code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-[420px]"
            >
                <div className="flex flex-col items-center mb-8">
                    <Logo className="flex-col gap-4" iconClassName="w-14 h-14" textClassName="text-3xl" />
                    <h1 className="mt-8 text-2xl font-sans text-foreground">Two-factor verification</h1>
                    <p className="text-muted-foreground font-sans mt-2 text-center">
                        Enter the 6-digit code from your authenticator app
                    </p>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    {error && (
                        <div className="p-3 mb-6 rounded-lg bg-red-50 text-red-600 text-sm font-sans border border-red-100">
                            {error}
                        </div>
                    )}

                    {verified ? (
                        <div className="text-center">
                            <CheckCircleIcon className="w-12 h-12 text-green-600 mx-auto" />
                            <p className="mt-4 text-foreground font-sans">Identity verified.</p>
                            <Link href="/dashboard" className="mt-6 inline-block">
                                <Button className="bg-primary text-primary-foreground hover:bg-zinc-800 rounded-lg px-6 py-3">
                                    Continue to dashboard
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-5" onSubmit={handleVerify}>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground font-sans">Email address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all font-sans text-foreground"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground font-sans">Verification code</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all font-sans text-foreground tracking-[0.5em] text-center font-mono"
                                    placeholder="000000"
                                    required
                                />
                            </div>

                            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-zinc-800 transition-all rounded-lg py-6 mt-4 group">
                                <span className="font-medium text-base">{loading ? "Verifying..." : "Verify"}</span>
                                {!loading && <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                            </Button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
