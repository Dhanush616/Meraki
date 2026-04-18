"use client";
import React from "react";
import { CheckCircleIcon, AlertCircleIcon, Loader2Icon, WalletIcon } from "lucide-react";
import { useAssets } from "@/hooks/useAssets";

export function AllocationOverview() {
    const { assets, isLoading, error } = useAssets();

    if (isLoading) {
        return (
            <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading asset allocations...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-card border border-border rounded-2xl p-6">
                <p className="text-sm text-muted-foreground">{error}</p>
            </div>
        );
    }

    const activeAssets = assets.filter((a) => a.status === "active");

    if (activeAssets.length === 0) {
        return (
            <div className="bg-card border border-border rounded-2xl p-6 text-center">
                <WalletIcon className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No active assets to check allocations for.</p>
            </div>
        );
    }

    const completeAssets = activeAssets.filter((a) => a.primary_total_pct === 100);
    const incompleteAssets = activeAssets.filter((a) => a.primary_total_pct !== 100);
    const allGood = incompleteAssets.length === 0;

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Asset Allocation Checker</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Verify primary beneficiary allocation totals 100% per asset.
                    </p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    allGood
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "bg-red-500/10 text-red-700 dark:text-red-400"
                }`}>
                    {allGood ? "All Good" : `${incompleteAssets.length} Need Attention`}
                </div>
            </div>

            {/* Asset List */}
            <div className="divide-y divide-border">
                {/* Incomplete (red) first */}
                {incompleteAssets.map((asset) => (
                    <div
                        key={asset.id}
                        className="px-6 py-3.5 flex items-center justify-between bg-red-500/[0.03] hover:bg-red-500/[0.06] transition-colors"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                <AlertCircleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{asset.nickname}</p>
                                <p className="text-xs text-muted-foreground capitalize">{asset.asset_type.replace(/_/g, " ")}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                    {asset.primary_total_pct}%
                                </span>
                                <span className="text-xs text-muted-foreground"> / 100%</span>
                            </div>
                            {/* Progress bar */}
                            <div className="w-20 h-1.5 rounded-full bg-border overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-red-500 transition-all"
                                    style={{ width: `${Math.min(asset.primary_total_pct, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {/* Complete (green) */}
                {completeAssets.map((asset) => (
                    <div
                        key={asset.id}
                        className="px-6 py-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <CheckCircleIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{asset.nickname}</p>
                                <p className="text-xs text-muted-foreground capitalize">{asset.asset_type.replace(/_/g, " ")}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">100%</span>
                            <div className="w-20 h-1.5 rounded-full bg-border overflow-hidden">
                                <div className="h-full rounded-full bg-emerald-500 w-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
