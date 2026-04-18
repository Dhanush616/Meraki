"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ShieldAlertIcon, CheckCircle2Icon, AlertTriangleIcon,
    ActivityIcon, XCircleIcon, LogOutIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const LEVEL_INFO: Record<string, { label: string; badgeColor: string; description: string }> = {
    level_0_normal:          { label: "Level 0: Normal",          badgeColor: "bg-green-100 text-green-800",  description: "The vault is safely secured. Their normal check-in schedule is active." },
    level_1_concern:         { label: "Level 1: Concern",         badgeColor: "bg-amber-100 text-amber-800",  description: "The vault owner has not checked in for longer than usual." },
    level_2_alert:           { label: "Level 2: Alert",           badgeColor: "bg-amber-100 text-amber-800",  description: "The owner has missed multiple check-ins. Monitoring is active." },
    level_3_suspected_death: { label: "Level 3: Suspected Death", badgeColor: "bg-red-100 text-red-800",      description: "A guardian has reported a suspected death. Verification is in progress." },
    level_4_death_claimed:   { label: "Level 4: Death Claimed",   badgeColor: "bg-red-100 text-red-800",      description: "A death certificate has been submitted. The liveness window is open." },
    level_5_executed:        { label: "Level 5: Vault Executed",  badgeColor: "bg-gray-100 text-gray-600",    description: "The vault has been executed and packages delivered to beneficiaries." },
};

interface GuardianContext {
    guardian_name: string;
    owner_first_name: string;
    owner_last_name: string;
    escalation_level: string;
}

export default function GuardianPortalPage() {
    const router = useRouter();
    const [ctx, setCtx] = useState<GuardianContext | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const [reportStep, setReportStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    async function handleReport() {
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API}/api/guardian/report`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Report failed");
            setReported(true);
            setIsReportDialogOpen(false);
            setReportStep(1);
            setCtx(prev => prev ? { ...prev, escalation_level: "level_3_suspected_death" } : prev);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsSubmitting(false);
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
    const firstName = ctx?.owner_first_name ?? "";
    const lastName = ctx?.owner_last_name ?? "";

    return (
        <div className="min-h-screen bg-parchment flex flex-col p-4 md:p-8">
            <header className="w-full max-w-4xl mx-auto flex items-center justify-between mb-12">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center shadow-lg">
                        <span className="w-2.5 h-2.5 bg-ivory rounded-full"></span>
                    </div>
                    <span className="font-serif text-xl font-bold text-near-black">Paradosis</span>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-olive-gray bg-white px-4 py-2 rounded-full border border-oat-border shadow-sm">
                        Guardian Portal
                    </div>
                    <button
                        onClick={signOut}
                        className="flex items-center gap-1.5 text-xs text-olive-gray hover:text-near-black transition-colors bg-white px-3 py-2 rounded-full border border-oat-border shadow-sm"
                    >
                        <LogOutIcon className="w-3.5 h-3.5" /> Sign out
                    </button>
                </div>
            </header>

            <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center text-center -mt-20">
                <div className="bg-ivory border border-oat-border rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-2xl">
                    <ShieldAlertIcon className="w-12 h-12 text-brand mx-auto mb-6 opacity-90" />
                    <h1 className="text-3xl font-serif text-near-black mb-4">
                        You are a guardian for{" "}
                        <span className="font-bold underline decoration-brand/30 underline-offset-4">{firstName}</span>{" "}
                        {lastName}.
                    </h1>
                    <p className="text-olive-gray font-sans mb-8 max-w-md mx-auto leading-relaxed">
                        Your role is to notify us only if you suspect {firstName} has passed away. You do not have access to view their assets or beneficiaries.
                    </p>

                    <div className="bg-parchment border border-oat-border rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center text-left gap-4">
                        <div className="flex items-center gap-4 w-full">
                            {level === "level_0_normal" ? (
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                    <ActivityIcon className="w-6 h-6 text-green-700" />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                    <AlertTriangleIcon className="w-6 h-6 text-red-600" />
                                </div>
                            )}
                            <div>
                                <h3 className="font-sans font-medium text-near-black flex items-center gap-2 flex-wrap">
                                    Current Status
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold tracking-wide uppercase ${info.badgeColor}`}>
                                        {info.label}
                                    </span>
                                </h3>
                                <p className="text-sm text-olive-gray mt-1">{info.description}</p>
                            </div>
                        </div>
                    </div>

                    {reported && (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 flex items-start gap-3 text-left">
                            <CheckCircle2Icon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-rose-800 text-sm">Report submitted</p>
                                <p className="text-xs text-rose-600 mt-0.5">
                                    The verification process has been triggered. All relevant parties have been notified.
                                </p>
                            </div>
                        </div>
                    )}

                    {canReport ? (
                        <Button
                            onClick={() => setIsReportDialogOpen(true)}
                            className="w-full sm:w-auto px-8 py-6 rounded-full text-base font-medium bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20"
                        >
                            Report Suspected Death
                        </Button>
                    ) : !reported && (
                        <p className="text-sm text-olive-gray bg-parchment rounded-xl p-4 border border-oat-border">
                            A report is already in progress. No further action is needed from you at this time.
                        </p>
                    )}
                </div>
            </main>

            <Dialog open={isReportDialogOpen} onOpenChange={(open) => {
                if (!isSubmitting) {
                    setIsReportDialogOpen(open);
                    if (!open) setTimeout(() => setReportStep(1), 300);
                }
            }}>
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-ivory border-none shadow-2xl">
                    <div className="p-8">
                        <DialogHeader className="mb-6">
                            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                                <AlertTriangleIcon className="w-6 h-6 text-red-600" />
                            </div>
                            <DialogTitle className="text-center font-serif text-2xl text-near-black">
                                {reportStep === 1 ? "Are you sure?" : "Final Confirmation"}
                            </DialogTitle>
                            <DialogDescription className="text-center text-olive-gray font-sans pt-2">
                                {reportStep === 1
                                    ? `This begins the formal death verification process for ${firstName} ${lastName}. An automated liveness check will be sent to the owner.`
                                    : `Have you been unable to reach ${firstName} for an extended period and have genuine reason to believe something may have happened?`}
                            </DialogDescription>
                        </DialogHeader>

                        {reportStep === 1 ? (
                            <div className="flex flex-col gap-3 mt-8">
                                <Button
                                    onClick={() => setReportStep(2)}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-6"
                                >
                                    Yes, I want to proceed
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsReportDialogOpen(false)}
                                    className="w-full text-olive-gray hover:text-near-black"
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 mt-8">
                                <Button
                                    onClick={handleReport}
                                    disabled={isSubmitting}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-6 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? "Processing..." : (
                                        <>
                                            <CheckCircle2Icon className="w-4 h-4" />
                                            Confirm Suspected Death
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setReportStep(1)}
                                    disabled={isSubmitting}
                                    className="w-full text-olive-gray hover:text-near-black"
                                >
                                    Go Back
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
