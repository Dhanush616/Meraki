"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlertIcon, CheckCircle2Icon, ActivityIcon, UploadCloudIcon, LoaderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";

import { EscalationLadder } from "@/components/dashboard/escalation/EscalationLadder";
import { toast } from "sonner";

export default function GuardianPortalPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [escalationLevel, setEscalationLevel] = useState("level_0_normal");
    const [guardianData, setGuardianData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [reason, setReason] = useState("");

    const token = typeof window !== "undefined" ? localStorage.getItem("guardian_token") : null;
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const fetchData = async () => {
        try {
            const res = await fetch(`${API}/api/guardian/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setGuardianData(data);
            setEscalationLevel(data.escalation_level);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (!token) {
            router.push("/auth/signin?role=guardian");
            return;
        }
        fetchData();
    }, [token, router, API]);

    const handleProvideReason = async () => {
        if (!reason.trim()) {
            toast.error("Please provide a reason.");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API}/api/guardian/provide-reason`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ reason })
            });
            if (!res.ok) throw new Error("Update failed");
            toast.success("Reason recorded. Escalation level reset to Level 0.");
            setReason("");
            fetchData(); // Refresh ladder
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><LoaderIcon className="w-8 h-8 animate-spin text-primary" /></div>;

    const isExecuted = escalationLevel === "level_5_executed";
    const isClaimed = escalationLevel === "level_4_death_claimed";
    const canProvideReason = ["level_1_concern", "level_2_alert", "level_3_suspected_death"].includes(escalationLevel);

    return (
        <div className="min-h-screen bg-background flex flex-col p-4 md:p-8">
            <header className="w-full max-w-5xl mx-auto flex items-center justify-between mb-12">
                <Logo />
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground bg-white px-4 py-2 rounded-full border border-border shadow-sm">
                        Guardian Portal
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => {
                        localStorage.removeItem("guardian_token");
                        localStorage.removeItem("beneficiary_token");
                        localStorage.removeItem("beneficiary_id");
                        localStorage.removeItem("paradosis_access_token");
                        router.push("/auth/signin?role=guardian");
                    }}>Logout</Button>
                </div>
            </header>

            <main className="w-full max-w-5xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-20">
                {/* Left: System Progression */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm">
                        <h2 className="text-lg font-bold text-foreground mb-8 flex items-center gap-2">
                            <ActivityIcon className="w-5 h-5 text-primary" />
                            System Progression
                        </h2>
                        <EscalationLadder currentLevel={escalationLevel} />
                    </div>

                    {/* Death Certificate Section - Bottom */}
                    {!isExecuted && !isClaimed && (
                        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 md:p-10">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <UploadCloudIcon className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Initiate Level 4 Activation</h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Upload an official death certificate to immediately verify the claim and notify beneficiaries.
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={() => router.push(`/guardian/verify?ownerId=${guardianData?.owner_id || ""}`)}
                                className="w-full py-6 rounded-2xl text-base font-medium bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                            >
                                <UploadCloudIcon className="w-5 h-5 mr-2" />
                                Upload Death Certificate
                            </Button>
                        </div>
                    )}

                    {(isExecuted || isClaimed) && (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-10 text-center">
                            <CheckCircle2Icon className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-foreground">
                                {isClaimed ? "Level 4 Activated" : "Level 5 Activated"}
                            </h2>
                            <p className="text-muted-foreground mt-2 max-w-md mx-auto font-medium">
                                All mails to beneficiaries initiated.
                            </p>
                            <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto leading-relaxed">
                                {isClaimed 
                                    ? "The certificate has been analyzed. Beneficiaries have been notified and the final claim record is active."
                                    : "The vault has been fully executed. Access has been granted to all verified beneficiaries."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right: Context & Actions */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                        <ShieldAlertIcon className="w-10 h-10 text-primary mb-6 opacity-90" />
                        <h1 className="text-2xl font-sans text-foreground mb-4">
                            Guardian for <span className="font-bold">{guardianData?.owner_first_name} {guardianData?.owner_last_name}</span>
                        </h1>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            You are the primary emergency point. Your role is to notify us if you suspect the owner has passed away or to provide updates if they are temporarily unreachable.
                        </p>
                    </div>

                    {/* Reason/Reset Logic */}
                    {canProvideReason && (
                        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-4">
                            <h3 className="font-bold text-foreground">Provide Update / Reason</h3>
                            <p className="text-xs text-muted-foreground">
                                If you have spoken to the owner or have a reason for their inactivity (e.g., travel, hospitalization), providing a reason will reset the system to Level 0.
                            </p>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Enter reason for reset..."
                                className="w-full min-h-[100px] bg-background border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <Button 
                                onClick={handleProvideReason}
                                disabled={isSubmitting}
                                className="w-full bg-black text-white hover:bg-zinc-800 rounded-xl py-4"
                            >
                                {isSubmitting ? "Updating..." : "Reset to Level 0 (Normal)"}
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
