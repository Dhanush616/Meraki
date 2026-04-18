"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldIcon, LogOutIcon, ArrowRightIcon } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const DISCLOSURE_TEXT: Record<string, string> = {
    total_secrecy:      "This vault is currently active and protected. You will be notified if anything changes.",
    partial_awareness:  "You have been named as a beneficiary. This vault is currently active.",
    full_transparency:  "You are named as a beneficiary. This vault is currently active and secure.",
};

interface BeneficiaryContext {
    beneficiary_name: string;
    disclosure_level: string;
    owner_name?: string;
    status: string;
}

export default function BeneficiaryLockedPage() {
    const router = useRouter();
    const [ctx, setCtx] = useState<BeneficiaryContext | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("beneficiary_token");
        if (!token) { router.replace("/beneficiary/login"); return; }

        fetch(`${API}/api/auth/beneficiary-me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => {
                if (r.status === 401) { router.replace("/beneficiary/login"); throw new Error(); }
                return r.json();
            })
            .then(setCtx)
            .catch(() => null)
            .finally(() => setLoading(false));
    }, [router]);

    function signOut() {
        localStorage.removeItem("beneficiary_token");
        localStorage.removeItem("beneficiary_id");
        router.push("/beneficiary/login");
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    const disclosureLevel = ctx?.disclosure_level ?? "total_secrecy";
    const subtext = disclosureLevel === "full_transparency" && ctx?.owner_name
        ? `You are named as a beneficiary by ${ctx.owner_name}. This vault is currently active.`
        : DISCLOSURE_TEXT[disclosureLevel] ?? DISCLOSURE_TEXT.total_secrecy;

    return (
        <div className="min-h-screen flex flex-col">
            {/* Minimal header */}
            <header className="px-6 py-5 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                    <ShieldIcon className="w-5 h-5 text-white/40" />
                    <span className="text-sm font-medium text-white/60">Amaanat</span>
                </div>
                <button onClick={signOut} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
                    <LogOutIcon className="w-3.5 h-3.5" /> Sign out
                </button>
            </header>

            {/* Main content — centered, calm */}
            <main className="flex-1 flex items-center justify-center px-6 py-16">
                <div className="max-w-md w-full text-center space-y-8">
                    {/* Lock icon */}
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <ShieldIcon className="w-8 h-8 text-white/40" />
                        </div>
                    </div>

                    {/* Primary message */}
                    <div className="space-y-3">
                        <h1 className="text-2xl font-serif font-medium text-white leading-snug">
                            You have been registered in someone&apos;s{" "}
                            <span className="text-white/60">Amaanat</span> vault.
                        </h1>
                        <p className="text-white/50 text-base leading-relaxed">
                            {subtext}
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/10" />

                    {/* CTA */}
                    <div className="space-y-3">
                        <p className="text-sm text-white/30">
                            If you believe the vault owner may have passed away, you can begin the verification process.
                        </p>
                        <button
                            onClick={() => router.push("/beneficiary/verify")}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-medium transition-colors"
                        >
                            Report a suspected death
                            <ArrowRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
