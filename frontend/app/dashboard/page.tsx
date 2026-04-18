"use client";
import React from "react";
import { ShieldAlertIcon, LayoutDashboardIcon } from "lucide-react";
import { useVaultSummary } from "@/hooks/useVaultSummary";
import { OnboardingChecklist } from "@/components/dashboard/overview/OnboardingChecklist";
import { AssetSummaryCards } from "@/components/dashboard/overview/AssetSummaryCards";
import { BeneficiarySummary } from "@/components/dashboard/overview/BeneficiarySummary";
import { EscalationStatus } from "@/components/dashboard/overview/EscalationStatus";
import { QuickActions } from "@/components/dashboard/overview/QuickActions";
import { ActivityFeed } from "@/components/dashboard/overview/ActivityFeed";

export default function DashboardOverview() {
    const { data, isLoading, error } = useVaultSummary();

    if (error) {
        return (
            <div className="p-6 bg-muted/50 border border-border rounded-xl flex items-start gap-4 max-w-2xl mx-auto mt-10">
                <ShieldAlertIcon className="w-6 h-6 text-foreground shrink-0" />
                <div>
                    <h3 className="font-semibold text-foreground">Connection Error</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    const hasUnassignedAssets = (data?.asset_count ?? 0) > 0 && (data?.beneficiary_count ?? 0) === 0;

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12 px-4 sm:px-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <LayoutDashboardIcon className="w-6 h-6" />
                        Dashboard Overview
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Secure snapshot of your protection status and assets.
                    </p>
                </div>
            </header>

            {!data?.onboarding_done && (
                <OnboardingChecklist
                    step={data?.onboarding_step ?? 0}
                    onboardingDone={data?.onboarding_done ?? false}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Assets Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-border bg-muted/30">
                            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Asset Inventory</h2>
                        </div>
                        <div className="p-6">
                            <AssetSummaryCards assetsByType={data?.assets_by_type ?? []} isLoading={isLoading} />
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-border bg-muted/30">
                            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Recent Activity</h2>
                        </div>
                        <ActivityFeed activities={data?.recent_activity ?? []} isLoading={isLoading} />
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    <EscalationStatus
                        level={data?.escalation_level ?? "level_0_normal"}
                        lastCheckIn={data?.last_check_in ?? null}
                        checkInFrequencyDays={data?.check_in_frequency_days ?? 90}
                        isLoading={isLoading}
                    />

                    <BeneficiarySummary
                        count={data?.beneficiary_count ?? 0}
                        hasUnassignedAssets={hasUnassignedAssets}
                        isLoading={isLoading}
                    />

                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Quick Actions</h2>
                        <QuickActions />
                    </div>
                </div>
            </div>
        </div>
    );
}
