"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldIcon, MailIcon, ArrowRightIcon } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function BeneficiaryLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
            const res = await fetch(`${API}/api/auth/beneficiary-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Login failed");
            }
            const data = await res.json();
            localStorage.setItem("beneficiary_token", data.token);
            localStorage.setItem("beneficiary_id", data.beneficiary_id);
            router.push("/beneficiary/locked");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                        <ShieldIcon className="w-6 h-6 text-white/80" />
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-white">Amaanat</h1>
                    <p className="text-sm text-white/50 mt-1">Beneficiary Portal</p>
                </div>

                <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                    <h2 className="text-lg font-semibold text-white mb-1">Sign in</h2>
                    <p className="text-sm text-white/50 mb-6">
                        Enter the email address you were registered with.
                    </p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-white/50 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full h-9 rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={!email || busy}
                            className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {busy ? "Signing in…" : "Continue"}
                            {!busy && <ArrowRightIcon className="w-4 h-4" />}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-white/30 mt-6">
                    This portal is for registered beneficiaries only.
                </p>
            </div>
        </div>
    );
}
