"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon, ShieldCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function TwoFASetupPage() {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(true);
    const [enabling, setEnabling] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("paradosis_access_token");
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_URL}/api/security/2fa/totp/setup`, {
                    headers: getAuthHeaders(),
                });
                if (!res.ok) throw new Error("Sign in first to set up 2FA.");
                const data = await res.json();
                setQrCode(data.qr_code);
                setSecret(data.secret);
            } catch (err: any) {
                setError(err.message || "Failed to start 2FA setup");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleEnable = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setEnabling(true);

        try {
            const res = await fetch(`${API_URL}/api/security/2fa/totp/enable`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ secret, code }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Invalid code — try again");
            setEnabled(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setEnabling(false);
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
                    <h1 className="mt-8 text-2xl font-sans text-foreground">Set up two-factor auth</h1>
                    <p className="text-muted-foreground font-sans mt-2 text-center">
                        Scan the QR code with Google Authenticator, Authy, or any TOTP app
                    </p>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    {error && (
                        <div className="p-3 mb-6 rounded-lg bg-red-50 text-red-600 text-sm font-sans border border-red-100">
                            {error}{" "}
                            <Link href="/auth/signin" className="underline">
                                Sign in
                            </Link>
                        </div>
                    )}

                    {loading ? (
                        <div className="py-10 text-center text-muted-foreground font-sans text-sm">
                            Generating your QR code...
                        </div>
                    ) : enabled ? (
                        <div className="text-center">
                            <ShieldCheckIcon className="w-12 h-12 text-green-600 mx-auto" />
                            <p className="mt-4 text-foreground font-sans">
                                Two-factor authentication is now active on your vault.
                            </p>
                            <Link href="/dashboard/settings" className="mt-6 inline-block">
                                <Button className="bg-primary text-primary-foreground hover:bg-zinc-800 rounded-lg px-6 py-3">
                                    Go to settings
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        qrCode && (
                            <form className="space-y-5" onSubmit={handleEnable}>
                                <div className="flex flex-col items-center">
                                    {/* Backend returns a data-URL PNG QR code */}
                                    <img
                                        src={qrCode}
                                        alt="TOTP QR code"
                                        className="w-48 h-48 rounded-lg border border-border bg-white p-2"
                                    />
                                    <p className="mt-3 text-xs text-muted-foreground font-sans text-center break-all">
                                        Or enter this key manually:{" "}
                                        <span className="font-mono text-foreground">{secret}</span>
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground font-sans">
                                        6-digit code from your app
                                    </label>
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

                                <Button type="submit" disabled={enabling} className="w-full bg-primary text-primary-foreground hover:bg-zinc-800 transition-all rounded-lg py-6 mt-4 group">
                                    <span className="font-medium text-base">{enabling ? "Verifying..." : "Enable 2FA"}</span>
                                    {!enabling && <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                                </Button>
                            </form>
                        )
                    )}
                </div>
            </motion.div>
        </div>
    );
}
