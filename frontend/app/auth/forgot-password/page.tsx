"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });
            if (error) throw new Error(error.message);
            setSent(true);
        } catch (err: any) {
            setError(err.message || "Failed to send reset email");
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
                    <h1 className="mt-8 text-2xl font-sans text-foreground">Reset your password</h1>
                    <p className="text-muted-foreground font-sans mt-2 text-center">
                        Enter your email and we&apos;ll send you a secure reset link
                    </p>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    {error && (
                        <div className="p-3 mb-6 rounded-lg bg-red-50 text-red-600 text-sm font-sans border border-red-100">
                            {error}
                        </div>
                    )}

                    {sent ? (
                        <div className="text-center">
                            <div className="p-3 mb-6 rounded-lg bg-green-50 text-green-700 text-sm font-sans border border-green-100">
                                If an account exists for that email, a password reset link
                                is on its way. Check your inbox (and spam folder).
                            </div>
                            <Link
                                href="/auth/signin"
                                className="text-sm text-primary hover:underline font-sans"
                            >
                                Back to sign in
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-5" onSubmit={handleResetRequest}>
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

                            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-zinc-800 transition-all rounded-lg py-6 mt-4 group">
                                <span className="font-medium text-base">{loading ? "Sending..." : "Send reset link"}</span>
                                {!loading && <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                            </Button>
                        </form>
                    )}
                </div>

                <p className="text-center mt-8 text-muted-foreground font-sans text-sm">
                    Remembered it? <Link href="/auth/signin" className="text-zinc-600 font-medium hover:underline">Sign in</Link>
                </p>
            </motion.div>
        </div>
    );
}
