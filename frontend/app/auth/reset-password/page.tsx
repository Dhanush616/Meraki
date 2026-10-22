"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon, CheckCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [linkRestored, setLinkRestored] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Exchange the recovery `code` from the email link for a session so the
    // password can be updated.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (!params.get("code")) return;

        (async () => {
            try {
                const supabase = createClient();
                const { error } = await supabase.auth.exchangeCodeForSession(
                    window.location.href
                );
                if (error) throw error;
                setLinkRestored(true);
            } catch (err: any) {
                setError(
                    err.message ||
                        "This reset link is invalid or has expired. Please request a new one."
                );
            }
        })();
    }, []);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw new Error(error.message);
            setDone(true);
        } catch (err: any) {
            setError(err.message || "Failed to reset password");
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
                    <h1 className="mt-8 text-2xl font-sans text-foreground">Choose a new password</h1>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    {error && (
                        <div className="p-3 mb-6 rounded-lg bg-red-50 text-red-600 text-sm font-sans border border-red-100">
                            {error}{" "}
                            <Link href="/auth/forgot-password" className="underline">
                                Request a new link
                            </Link>
                        </div>
                    )}

                    {done ? (
                        <div className="text-center">
                            <CheckCircleIcon className="w-12 h-12 text-green-600 mx-auto" />
                            <p className="mt-4 text-foreground font-sans">
                                Your password has been updated.
                            </p>
                            <Link href="/auth/signin" className="mt-6 inline-block">
                                <Button className="bg-primary text-primary-foreground hover:bg-zinc-800 rounded-lg px-6 py-3">
                                    Back to sign in
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-5" onSubmit={handleReset}>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground font-sans">New password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all font-sans text-foreground"
                                    placeholder="At least 8 characters"
                                    disabled={!linkRestored}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground font-sans">Confirm new password</label>
                                <input
                                    type="password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all font-sans text-foreground"
                                    placeholder="Re-enter your password"
                                    disabled={!linkRestored}
                                    required
                                />
                            </div>

                            <Button type="submit" disabled={loading || !linkRestored} className="w-full bg-primary text-primary-foreground hover:bg-zinc-800 transition-all rounded-lg py-6 mt-4 group">
                                <span className="font-medium text-base">
                                    {!linkRestored ? "Validating reset link..." : loading ? "Updating..." : "Update password"}
                                </span>
                                {linkRestored && !loading && <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                            </Button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
