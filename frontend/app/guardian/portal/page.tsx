"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ShieldIcon, AlertTriangleIcon, CheckCircle2Icon,
    XCircleIcon, LogOutIcon, ChevronRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const LEVEL_INFO: Record<string, { label: string; color: string; description: string }> = {
    level_0_normal:          { label: "All Clear",        color: "text-emerald-600 bg-emerald-50 border-emerald-200", description: "The vault owner is active and all systems are normal." },
    level_1_concern:         { label: "Concern",          color: "text-amber-600 bg-amber-50 border-amber-200",       description: "The vault owner has not checked in for longer than usual." },
    level_2_alert:           { label: "Alert",            color: "text-amber-600 bg-amber-50 border-amber-200",       description: "The owner has missed multiple check-ins. Monitoring is active." },
    level_3_suspected_death: { label: "Suspected Death",  color: "text-rose-600 bg-rose-50 border-rose-200",          description: "A guardian has reported a suspected death. Verification is in progress." },
    level_4_death_claimed:   { label: "Death Claimed",    color: "text-rose-600 bg-rose-50 border-rose-200",          description: "A death certificate has been submitted. The liveness window is open." },
    level_5_executed:        { label: "Vault Executed",   color: "text-gray-600 bg-gray-100 border-gray-200",         description: "The vault has been executed and packages delivered to beneficiaries." },
};

interface GuardianContext {
    guardian_name: string;
    owner_first_name: string;
    owner_last_name: string;
    escalation_level: string;
}

type DialogStep = 0 | 1 | 2 | 3;

export default function GuardianPortalPage() {
    const router = useRouter();
    const [ctx, setCtx] = useState<GuardianContext | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [dialogStep, setDialogStep] = useState<DialogStep>(0);
    const [reporting, setReporting] = useState(false);
    const [reported, setReported] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("guardian_token") : null;

    useEffect(() => {
        if (!token) { router.replace("/guardian/login"); return; }
        fetch(`${API}/api/guardian/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => {
                if (r.status === 401) { router.replace("/guardian/login"); throw new Error("Unauthorized"); }
                return r.json();
            })
            .then(setCtx)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [token, router]);

    async function submitReport() {
        setReporting(true);
        try {
            const res = await fetch(`${API}/api/guardian/report`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Report failed");
            setReported(true);
            setDialogStep(0);
            setCtx(prev => prev ? { ...prev, escalation_level: "level_3_suspected_death" } : prev);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setReporting(false);
        }
    }

    function signOut() {
        localStorage.removeItem("guardian_token");
        router.push("/guardian/login");
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error && !ctx) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-ivory rounded-2xl p-8 border border-rose-200 text-center max-w-sm">
                    <XCircleIcon className="w-8 h-8 text-rose-500 mx-auto mb-3" />
                    <p className="text-rose-700 text-sm">{error}</p>
                    <Button className="mt-4 bg-brand text-ivory hover:bg-[#b05637]" onClick={() => router.push("/guardian/login")}>
                        Back to Login
                    </Button>
                </div>
            </div>
        );
    }

    const level = ctx?.escalation_level ?? "level_0_normal";
    const info = LEVEL_INFO[level] ?? LEVEL_INFO.level_0_normal;
    const canReport = !reported && !["level_3_suspected_death", "level_4_death_claimed", "level_5_executed"].includes(level);

    return (
        <div className="min-h-screen flex flex-col">
            {/* Multi-step confirm dialog */}
            {dialogStep > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-ivory rounded-2xl p-6 w-full max-w-sm shadow-xl border border-oat-border">
                        {dialogStep === 1 && (
                            <>
                                <AlertTriangleIcon className="w-8 h-8 text-amber-500 mx-auto mb-4" />
                                <h3 className="font-semibold text-near-black text-center mb-2">Are you sure?</h3>
                                <p className="text-sm text-olive-gray text-center mb-6">
                                    This will begin the death verification process for{" "}
                                    <strong className="text-near-black">{ctx?.owner_first_name} {ctx?.owner_last_name}</strong>.
                                    This action cannot be undone.
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1" onClick={() => setDialogStep(0)}>Cancel</Button>
                                    <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white" onClick={() => setDialogStep(2)}>
                                        Yes, continue <ChevronRightIcon className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </>
                        )}
                        {dialogStep === 2 && (
                            <>
                                <AlertTriangleIcon className="w-8 h-8 text-rose-500 mx-auto mb-4" />
                                <h3 className="font-semibold text-near-black text-center mb-2">Confirm Extended Absence</h3>
                                <p className="text-sm text-olive-gray text-center mb-6">
                                    Have you been unable to reach{" "}
                                    <strong className="text-near-black">{ctx?.owner_first_name}</strong>{" "}
                                    for an extended period and have genuine reason to believe something may have happened?
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1" onClick={() => setDialogStep(0)}>No, go back</Button>
                                    <Button className="flex-1 bg-rose-600 hover:bg-rose-700 text-white" onClick={() => setDialogStep(3)}>
                                        Yes <ChevronRightIcon className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </>
                        )}
                        {dialogStep === 3 && (
                            <>
                                <AlertTriangleIcon className="w-8 h-8 text-rose-600 mx-auto mb-4" />
                                <h3 className="font-semibold text-rose-700 text-center mb-2">Final Confirmation</h3>
                                <p className="text-sm text-olive-gray text-center mb-6">
                                    By confirming, you are officially triggering the suspected death protocol.
                                    Notifications will be sent to all relevant parties.
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1" onClick={() => setDialogStep(0)}>Cancel</Button>
                                    <Button
                                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
                                        onClick={submitReport}
                                        disabled={reporting}
                                    >
                                        {reporting ? "Submitting…" : "Confirm Report"}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="border-b border-oat-border bg-ivory px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShieldIcon className="w-5 h-5 text-brand" />
                    <span className="font-semibold text-near-black">Amaanat Guardian Portal</span>
                </div>
                <button onClick={signOut} className="flex items-center gap-1.5 text-xs text-olive-gray hover:text-near-black transition-colors">
                    <LogOutIcon className="w-3.5 h-3.5" /> Sign out
                </button>
            </header>

            {/* Body */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md space-y-5">

                    {/* Identity card */}
                    <div className="bg-ivory rounded-2xl p-6 border border-oat-border">
                        <p className="text-xs font-medium uppercase tracking-wider text-olive-gray mb-1">You are a guardian for</p>
                        <p className="text-2xl font-serif font-bold text-near-black">
                            {ctx?.owner_first_name}{" "}
                            <span className="text-olive-gray">{ctx?.owner_last_name}</span>
                        </p>
                        {ctx?.guardian_name && (
                            <p className="text-sm text-olive-gray mt-1">Signed in as {ctx.guardian_name}</p>
                        )}
                    </div>

                    {/* Escalation level */}
                    <div className={`rounded-2xl p-5 border ${info.color}`}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Current Status</p>
                        <p className="text-lg font-serif font-bold">{info.label}</p>
                        <p className="text-sm mt-1 opacity-80">{info.description}</p>
                    </div>

                    {/* Success */}
                    {reported && (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-3">
                            <CheckCircle2Icon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-rose-800 text-sm">Report submitted</p>
                                <p className="text-xs text-rose-600 mt-0.5">The verification process has been triggered. All relevant parties have been notified.</p>
                            </div>
                        </div>
                    )}

                    {/* Report button */}
                    {canReport && (
                        <Button
                            onClick={() => setDialogStep(1)}
                            className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 text-base"
                        >
                            <AlertTriangleIcon className="w-5 h-5 mr-2" />
                            Report Suspected Death
                        </Button>
                    )}

                    {!canReport && !reported && (
                        <div className="bg-parchment rounded-2xl p-4 border border-oat-border text-center">
                            <p className="text-sm text-olive-gray">
                                A report is already in progress. No further action is needed from you at this time.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
