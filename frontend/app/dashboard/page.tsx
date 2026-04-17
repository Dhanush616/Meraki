"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ActivityIcon, AlertCircleIcon, ShieldAlertIcon,
    WalletIcon, UsersIcon, CheckCircle2Icon,
    PlusCircleIcon, VideoIcon, ChevronRightIcon,
    CalendarIcon, ShieldCheckIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityLog {
    id: string;
    action_type: string;
    entity_type: string;
    entity_name: string;
    created_at: string;
}

interface VaultSummary {
    health_score: number;
    asset_count: number;
    beneficiary_count: number;
    escalation_level: string;
    last_check_in: string;
    recent_activity: ActivityLog[];
    onboarding_step: number;
}

export default function DashboardOverview() {
    const [summary, setSummary] = useState<VaultSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const token = localStorage.getItem("paradosis_access_token");
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const res = await fetch(`${apiUrl}/api/vault/summary`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    }
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch vault summary. Please log in again.");
                }

                const data = await res.json();
                setSummary(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSummary();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-start gap-4">
                <ShieldAlertIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-red-800">Connection Error</h3>
                    <p className="text-red-600 mt-1">{error}</p>
                </div>
            </div>
        );
    }

    const {
        health_score = 0,
        asset_count = 0,
        beneficiary_count = 0,
        escalation_level = "level_0_normal",
        last_check_in,
        recent_activity = [],
        onboarding_step = 7
    } = summary || {};

    // Health Score Color Logic
    const healthColor = health_score > 70 ? "text-emerald-500" : health_score > 40 ? "text-amber-500" : "text-rose-500";
    const healthStroke = health_score > 70 ? "stroke-emerald-500" : health_score > 40 ? "stroke-amber-500" : "stroke-rose-500";

    // Formatting Esc Level
    const formatEscalation = (level: string) => {
        return level.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <header className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-near-black">Dashboard Overview</h1>
                <p className="text-olive-gray mt-2">Welcome back to your secure vault.</p>
            </header>

            {/* Onboarding Checklist */}
            {onboarding_step < 7 && (
                <div className="bg-brand/10 border border-brand/20 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-brand font-semibold font-serif text-lg tracking-wide">Vault Setup: Step {onboarding_step} of 7</h3>
                        <p className="text-olive-gray text-sm mt-1">Complete your vault configuration to ensure your family is fully protected.</p>
                    </div>
                    <Button className="bg-brand text-ivory hover:bg-[#b05637]">
                        Continue Setup <ChevronRightIcon className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Vault Health Ring */}
                <Link href="/dashboard/health" className="col-span-1 bg-ivory rounded-2xl p-6 border border-border-cream shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <h3 className="font-semibold text-near-black flex items-center justify-between mb-4">
                        Vault Health
                        <ChevronRightIcon className="w-5 h-5 text-olive-gray group-hover:text-brand transition-colors" />
                    </h3>
                    <div className="flex flex-col items-center justify-center py-4">
                        <div className="relative w-32 h-32">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="64" cy="64" r="56" className="stroke-parchment fill-none" strokeWidth="12" />
                                <motion.circle
                                    cx="64" cy="64" r="56"
                                    className={`${healthStroke} fill-none`} strokeWidth="12"
                                    strokeDasharray="351.8"
                                    initial={{ strokeDashoffset: 351.8 }}
                                    animate={{ strokeDashoffset: 351.8 - (351.8 * health_score) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className={`text-3xl font-bold font-serif ${healthColor}`}>{health_score}</span>
                            </div>
                        </div>
                        <p className="text-sm text-olive-gray mt-4 text-center">Score based on assigned backups and updated documents.</p>
                    </div>
                </Link>

                {/* Main Metrics (Assets & Beneficiaries) */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Assets Summary */}
                    <Link href="/dashboard/vault" className="bg-ivory rounded-2xl p-6 border border-border-cream shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
                        <div>
                            <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-4">
                                <WalletIcon className="w-5 h-5" />
                            </div>
                            <h3 className="text-3xl font-serif font-bold text-near-black mb-1">{asset_count}</h3>
                            <p className="text-olive-gray font-medium">Secured Assets</p>
                        </div>
                        <div className="mt-6 flex items-center text-sm text-brand font-medium group-hover:translate-x-1 transition-transform">
                            Manage Vault <ChevronRightIcon className="w-4 h-4 ml-1" />
                        </div>
                    </Link>

                    {/* Beneficiary Summary */}
                    <Link href="/dashboard/beneficiaries" className="bg-ivory rounded-2xl p-6 border border-border-cream shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <UsersIcon className="w-5 h-5" />
                                </div>
                                {beneficiary_count > 0 && asset_count > 0 && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                        <AlertCircleIcon className="w-3.5 h-3.5" /> Backup needed
                                    </span>
                                )}
                            </div>
                            <h3 className="text-3xl font-serif font-bold text-near-black mb-1">{beneficiary_count}</h3>
                            <p className="text-olive-gray font-medium">Beneficiaries</p>
                        </div>
                        <div className="mt-6 flex items-center text-sm text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                            Manage People <ChevronRightIcon className="w-4 h-4 ml-1" />
                        </div>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

                {/* Escalation Status */}
                <div className="bg-ivory rounded-2xl p-6 border border-border-cream shadow-sm">
                    <h3 className="font-semibold text-near-black flex items-center gap-2 mb-6">
                        <ShieldCheckIcon className="w-5 h-5 text-emerald-500" /> Escalation Status
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-parchment rounded-xl border border-border-cream mb-4">
                        <div>
                            <p className="text-xs text-olive-gray uppercase tracking-wider font-semibold">Current State</p>
                            <p className="text-lg font-serif font-bold text-emerald-600 mt-1">{formatEscalation(escalation_level)}</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircle2Icon className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                    {last_check_in && (
                        <div className="flex items-center gap-3 text-sm text-near-black mb-2">
                            <CalendarIcon className="w-4 h-4 text-olive-gray" />
                            <span>Last check-in: <strong className="font-medium">{new Date(last_check_in).toLocaleDateString()}</strong></span>
                        </div>
                    )}
                    <p className="text-sm text-olive-gray mt-4">We actively monitor your presence to ensure timely execution only when necessary.</p>
                </div>

                {/* Quick Actions & Activity */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/dashboard/vault/add" className="flex flex-col items-center justify-center p-6 bg-ivory rounded-2xl border border-border-cream shadow-sm hover:border-brand/40 hover:bg-brand/5 transition-all text-center group">
                            <PlusCircleIcon className="w-8 h-8 text-brand mb-3 group-hover:scale-110 transition-transform" />
                            <span className="font-medium text-near-black">Add Asset</span>
                        </Link>
                        <Link href="/dashboard/intent" className="flex flex-col items-center justify-center p-6 bg-ivory rounded-2xl border border-border-cream shadow-sm hover:border-blue-600/40 hover:bg-blue-50 transition-all text-center group">
                            <VideoIcon className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                            <span className="font-medium text-near-black">Record Will</span>
                        </Link>
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-ivory rounded-2xl p-6 border border-border-cream shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-near-black flex items-center gap-2">
                                <ActivityIcon className="w-5 h-5 text-olive-gray" /> Recent Activity
                            </h3>
                            <Link href="/dashboard/activity" className="text-xs text-brand hover:underline font-medium">View all</Link>
                        </div>
                        {recent_activity.length > 0 ? (
                            <div className="space-y-4">
                                {recent_activity.map((log) => (
                                    <div key={log.id} className="flex gap-3 text-sm">
                                        <div className="w-2 h-2 mt-1.5 rounded-full bg-olive-gray opacity-40 shrink-0" />
                                        <div>
                                            <p className="text-near-black">
                                                <span className="font-medium">{log.action_type}</span>: {log.entity_name}
                                            </p>
                                            <p className="text-xs text-olive-gray mt-0.5">
                                                {new Date(log.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-olive-gray py-4 text-center bg-parchment rounded-lg border border-dashed border-border-cream">No recent activity found.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}