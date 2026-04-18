"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldIcon, LogOutIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const DISCLOSURE_TEXT: Record<string, string> = {
    total_secrecy: "This vault is currently active and protected. You will be notified if anything changes.",
    partial_awareness: "You have been named as a beneficiary. This vault is currently active.",
    full_transparency: "You are named as a beneficiary. This vault is currently active and secure.",
};

interface AllocatedAsset {
    nickname: string;
    asset_type: string;
    percentage: number;
}

interface BeneficiaryContext {
    beneficiary_name: string;
    disclosure_level: string;
    owner_name?: string;
    status: string;
    allocated_assets?: AllocatedAsset[];
}

export default function BeneficiaryLockedPage() {
    const router = useRouter();
    const [ctx, setCtx] = useState<BeneficiaryContext | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("beneficiary_token");
        // Send user to global sign in, as standalone beneficiary login is gone
        if (!token) { router.replace("/auth/signin"); return; }

        fetch(`${API}/api/auth/beneficiary-me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => {
                if (r.status === 401) { router.replace("/auth/signin"); throw new Error(); }
                return r.json();
            })
            .then(setCtx)
            .catch(() => null)
            .finally(() => setLoading(false));
    }, [router]);

    function signOut() {
        localStorage.removeItem("beneficiary_token");
        localStorage.removeItem("beneficiary_id");
        localStorage.removeItem("paradosis_access_token");
        localStorage.removeItem("guardian_token");
        router.push("/auth/signin");
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const disclosureLevel = ctx?.disclosure_level ?? "total_secrecy";
    const subtext = disclosureLevel === "full_transparency" && ctx?.owner_name
        ? `You are named as a beneficiary by ${ctx?.owner_name}. This vault is currently active.`
        : DISCLOSURE_TEXT[disclosureLevel] ?? DISCLOSURE_TEXT.total_secrecy;

    return (
        <div className="min-h-screen bg-background flex flex-col p-4 md:p-8">
            <header className="w-full max-w-4xl mx-auto flex items-center justify-between mb-12">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                        <span className="w-2.5 h-2.5 bg-card rounded-full"></span>
                    </div>
                    <span className="font-sans text-xl font-bold text-foreground">Paradosis</span>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-muted-foreground bg-white px-4 py-2 rounded-full border border-border shadow-sm hidden sm:block">
                        Beneficiary Portal
                    </div>
                    <button onClick={signOut} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                        <LogOutIcon className="w-4 h-4" /> <span className="hidden sm:inline">Sign out</span>
                    </button>
                </div>
            </header>

            <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center text-center -mt-20">
                <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-2xl">
                    <ShieldIcon className="w-12 h-12 text-primary mx-auto mb-6 opacity-90" />

                    <h1 className="text-3xl font-sans text-foreground mb-4 leading-snug">
                        You are registered in {" "}
                        {ctx?.owner_name ? (
                            <span className="font-bold underline decoration-primary/30 underline-offset-4">{ctx.owner_name}&apos;s</span>
                        ) : (
                            <span className="font-bold underline decoration-primary/30 underline-offset-4">someone&apos;s</span>
                        )}
                        {" "}vault.
                    </h1>
                    <p className="text-muted-foreground font-sans mb-8 max-w-md mx-auto leading-relaxed">
                        {subtext}
                    </p>

                    {disclosureLevel === "full_transparency" && ctx?.allocated_assets && ctx.allocated_assets.length > 0 && (
                        <div className="bg-background border border-border rounded-xl p-6 mb-10 text-left">
                            <h3 className="text-sm font-semibold text-foreground/90 mb-4">Your Allocated Assets</h3>
                            <ul className="space-y-4">
                                {ctx.allocated_assets.map((asset, i) => (
                                    <li key={i} className="flex flex-col gap-1 w-full pb-4 border-b border-border last:border-0 last:pb-0">
                                        <div className="flex w-full items-center justify-between">
                                            <span className="text-sm font-medium text-foreground">{asset.nickname}</span>
                                            <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded border border-primary/20 font-medium">
                                                {asset.percentage}% share
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider">{asset.asset_type.replace('_', ' ')}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="mt-8 pt-8 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-4">
                            If you believe the vault owner may have passed away, you can begin the verification process.
                        </p>
                        <Button
                            onClick={() => router.push("/beneficiary/verify")}
                            variant="outline"
                            className="bg-background w-full sm:w-auto border-border text-foreground hover:bg-muted font-medium transition-all inline-flex items-center gap-2 px-6 py-6 rounded-full"
                        >
                            Report a suspected death
                            <ArrowRightIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
