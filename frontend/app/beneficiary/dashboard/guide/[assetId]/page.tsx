"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeftIcon, BookOpenIcon, CheckCircle2Icon, AlertTriangleIcon,
    ScaleIcon, FileTextIcon, MapPinIcon, ClockIcon, ShieldCheckIcon,
    LandmarkIcon, DownloadIcon, InfoIcon, LightbulbIcon, GavelIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInheritancePath, InheritancePath } from "@/lib/utils/inheritance";
import { Badge } from "@/components/ui/badge";

export default function InheritanceGuidePage() {
    const router = useRouter();
    const params = useParams();
    const assetId = params.assetId as string;

    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("beneficiary_token");
                if (!token) {
                    router.push("/auth/signin");
                    return;
                }

                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const res = await fetch(`${apiUrl}/api/beneficiaries/portal/dashboard`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (!res.ok) throw new Error("Failed to load dashboard data");
                const json = await res.json();
                setData(json);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !data) {
        return <div className="text-center p-8 text-red-500">{error || "Failed to load."}</div>;
    }

    const asset = data.allocated_assets?.find((a: any) => a.id === assetId) ||
        data.other_assets?.find((a: any) => a.id === assetId);

    if (!asset) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
                <h1 className="text-xl font-bold mb-4">Asset not found.</h1>
                <Button onClick={() => router.push("/beneficiary/dashboard")}>Return to Dashboard</Button>
            </div>
        );
    }

    const religion = data.owner_religion || "Unknown";
    const relationship = data.beneficiary_relationship || "Unknown";
    const state = data.owner_state || "Unknown";
    const city = data.owner_city || "Unknown";

    const path: InheritancePath = getInheritancePath(asset, religion, relationship, state, city);

    return (
        <div className="min-h-screen bg-background flex flex-col px-4 py-8 pb-24 font-sans text-black">
            <header className="w-full max-w-4xl mx-auto flex items-center justify-between mb-8">
                <Button variant="ghost" onClick={() => router.push("/beneficiary/dashboard")} className="gap-2 text-slate-600 hover:text-black">
                    <ArrowLeftIcon className="w-4 h-4" /> Back to Dashboard
                </Button>
                <Badge variant="outline" className="px-3 py-1 border-slate-300 text-slate-700">
                    {path.complexity.toUpperCase()} PROCESS
                </Badge>
            </header>

            <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col space-y-8">
                {/* Hero Section */}
                <div className="bg-card border border-slate-200 shadow-sm rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <ScaleIcon className="w-32 h-32 text-black" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <BookOpenIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-black">Inheritance Guide</h1>
                                <p className="text-slate-600">Detailed process for claiming: <span className="text-black font-semibold">{asset.nickname}</span></p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                            <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <ShieldCheckIcon className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Route</p>
                                    <p className="text-sm font-semibold text-black">{path.primaryRoute}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <ClockIcon className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Estimated Time</p>
                                    <p className="text-sm font-semibold text-black">{path.timeEstimate}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <LandmarkIcon className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Governing Law</p>
                                    <p className="text-sm font-semibold text-black">{path.governingLaw}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legal Standing */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                    <div className="flex gap-4">
                        <InfoIcon className="w-6 h-6 text-primary shrink-0" />
                        <div>
                            <h2 className="font-bold text-black mb-1">Your Legal Position</h2>
                            <p className="text-sm text-slate-700 leading-relaxed">
                                {path.positionNote}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Steps List */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-black">
                            <CheckCircle2Icon className="w-5 h-5 text-primary" />
                            Step-by-Step Instructions
                        </h2>
                        <div className="space-y-6">
                            {path.steps.map((step, idx) => (
                                <div key={idx} className="relative pl-10">
                                    {idx !== path.steps.length - 1 && (
                                        <div className="absolute left-4 top-8 bottom-0 w-[2px] bg-slate-200" />
                                    )}
                                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white border-2 border-primary flex items-center justify-center text-xs font-bold text-primary shadow-sm">
                                        {idx + 1}
                                    </div>
                                    <h3 className="font-bold text-black mb-1">{step.title}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed mb-2">{step.detail}</p>
                                    {step.citation && (
                                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 italic">
                                            <GavelIcon className="w-3 h-3" />
                                            Citation: {step.citation}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Suggestions Section */}
                        <div className="mt-8 p-6 bg-amber-50 border border-amber-100 rounded-2xl">
                            <h3 className="font-bold text-black flex items-center gap-2 mb-3 text-sm">
                                <LightbulbIcon className="w-4 h-4 text-amber-500" />
                                Pro-Tips & Suggestions
                            </h3>
                            <ul className="space-y-2">
                                {path.suggestions.map((suggestion, idx) => (
                                    <li key={idx} className="text-xs text-slate-700 flex gap-2">
                                        <span className="text-amber-500 font-bold">•</span>
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Documents Checklist */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-black">
                            <FileTextIcon className="w-5 h-5 text-primary" />
                            Document Checklist
                        </h2>
                        <div className="bg-card border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-4 space-y-4">
                                {path.documents.length > 0 ? path.documents.map((doc, idx) => (
                                    <div key={idx} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                        <div className="mt-1">
                                            {doc.status === 'pre-filled' ? (
                                                <DownloadIcon className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <div className="w-5 h-5 rounded border-2 border-slate-300 group-hover:border-primary/50 transition-colors" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-semibold text-sm text-black">{doc.name}</p>
                                                {doc.status === 'pre-filled' && (
                                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">Pre-filled</span>
                                                )}
                                            </div>
                                            {doc.description && <p className="text-[11px] text-slate-500 mt-0.5">{doc.description}</p>}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-slate-500 italic p-4 text-center">No physical documents required for this digital asset.</p>
                                )}
                            </div>
                        </div>

                        {/* Office Location */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                            <h3 className="font-bold flex items-center gap-2 mb-3 text-black">
                                <MapPinIcon className="w-4 h-4 text-primary" />
                                Where to go
                            </h3>
                            <p className="text-sm text-slate-700 leading-relaxed italic">
                                "{path.officeInfo}"
                            </p>
                            {path.stateNotes && (
                                <div className="mt-4 flex gap-2 p-3 bg-amber-100 border border-amber-200 rounded-xl text-amber-800 text-[11px]">
                                    <AlertTriangleIcon className="w-4 h-4 shrink-0" />
                                    <span><strong>State Variation:</strong> {path.stateNotes}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Costs & Support */}
                <div className="mt-8 p-8 border border-slate-200 rounded-3xl bg-card shadow-sm flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-xl font-bold mb-2 text-black">Need professional help?</h2>
                        <p className="text-slate-600 text-sm">
                            The estimated cost for this process is <span className="text-black font-semibold">{path.costs}</span>.
                            If you find the process overwhelming, our partner lawyers and CAs can assist you.
                        </p>
                    </div>
                    <Button className="rounded-full px-8 shadow-lg shadow-primary/20 bg-primary text-white hover:bg-primary/90">
                        Connect with Expert
                    </Button>
                </div>
            </main>
        </div>
    );
}
