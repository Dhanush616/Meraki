"use client";
import { ShieldAlertIcon } from "lucide-react";
import { useVaultSummary } from "@/hooks/useVaultSummary";
import { VaultHealthRing } from "@/components/dashboard/overview/VaultHealthRing";
import { OnboardingChecklist } from "@/components/dashboard/overview/OnboardingChecklist";
import { AssetSummaryCards } from "@/components/dashboard/overview/AssetSummaryCards";
import { BeneficiarySummary } from "@/components/dashboard/overview/BeneficiarySummary";
import { EscalationStatus } from "@/components/dashboard/overview/EscalationStatus";
import { QuickActions } from "@/components/dashboard/overview/QuickActions";
import { ActivityFeed } from "@/components/dashboard/overview/ActivityFeed";
import { PendingActionBanner } from "@/components/dashboard/overview/PendingActionBanner";
import { NetWorthTrend } from "@/components/dashboard/overview/NetWorthTrend";

export default function DashboardOverview() {
    const { data, isLoading, error } = useVaultSummary();

    if (error) {
        return (
            <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-4">
                <ShieldAlertIcon className="w-6 h-6 text-destructive shrink-0" />
                <div>
                    <h3 className="font-semibold text-destructive">Connection Error</h3>
                    <p className="text-destructive mt-1">{error}</p>
                </div>
            </div>
        );
    }

    const hasUnassignedAssets = (data?.asset_count ?? 0) > 0 && (data?.beneficiary_count ?? 0) === 0;
    
    // We mock check-in overdue logic for demo purposes
    const hasOverdueCheckIn = false; 

    const totalVaultValue = data?.assets_by_type?.reduce((acc, curr) => acc + curr.total_value, 0) || 0;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dashboard Overview</h1>
                    <p className="text-muted-foreground mt-1">Welcome back to your secure vault.</p>
                </div>
            </header>

            <PendingActionBanner 
                hasUnassignedAssets={hasUnassignedAssets} 
                hasOverdueCheckIn={hasOverdueCheckIn} 
            />

            <OnboardingChecklist
                step={data?.onboarding_step ?? 0}
                onboardingDone={data?.onboarding_done ?? false}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <VaultHealthRing score={data?.health_score ?? 0} isLoading={isLoading} />
                <NetWorthTrend totalValue={totalVaultValue} />
                <BeneficiarySummary
                    count={data?.beneficiary_count ?? 0}
                    hasUnassignedAssets={hasUnassignedAssets}
                    isLoading={isLoading}
                />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <AssetSummaryCards assetsByType={data?.assets_by_type ?? []} isLoading={isLoading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EscalationStatus
                    level={data?.escalation_level ?? "level_0_normal"}
                    lastCheckIn={data?.last_check_in ?? null}
                    checkInFrequencyDays={data?.check_in_frequency_days ?? 90}
                    isLoading={isLoading}
                />
                <div className="space-y-6">
                    <QuickActions />
                    <ActivityFeed activities={data?.recent_activity ?? []} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
}
