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

export default function DashboardOverview() {
    const { data, isLoading, error } = useVaultSummary();

    if (error) {
        return (
            <div className="p-6 bg-muted border border-border rounded-xl flex items-start gap-4">
                <ShieldAlertIcon className="w-6 h-6 text-foreground shrink-0" />
                <div>
                    <h3 className="font-semibold text-foreground">Connection Error</h3>
                    <p className="text-muted-foreground mt-1">{error}</p>
                </div>
            </div>
        );
    }

    const hasUnassignedAssets = (data?.asset_count ?? 0) > 0 && (data?.beneficiary_count ?? 0) === 0;

    return (
        <div className="space-y-6 max-w-[90rem] mx-auto pb-12 px-4 sm:px-6 lg:px-8">
            <header className="mb-8">
                <h1 className="text-3xl font-sans font-bold text-foreground">Dashboard Overview</h1>
                <p className="text-muted-foreground mt-2">Welcome back to your secure vault.</p>
            </header>

            <OnboardingChecklist
                step={data?.onboarding_step ?? 0}
                onboardingDone={data?.onboarding_done ?? false}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 auto-rows-min gap-6">
                <div className="flex flex-col gap-6 md:col-span-1 xl:col-span-1">
                    <VaultHealthRing score={data?.health_score ?? 0} isLoading={isLoading} />
                    <BeneficiarySummary
                        count={data?.beneficiary_count ?? 0}
                        hasUnassignedAssets={hasUnassignedAssets}
                        isLoading={isLoading}
                    />
                </div>

                <div className="flex flex-col gap-6 md:col-span-2 xl:col-span-2">
                    <AssetSummaryCards assetsByType={data?.assets_by_type ?? []} isLoading={isLoading} />
                    <ActivityFeed activities={data?.recent_activity ?? []} isLoading={isLoading} />
                </div>

                <div className="flex flex-col gap-6 md:col-span-3 xl:col-span-1">
                    <EscalationStatus
                        level={data?.escalation_level ?? "level_0_normal"}
                        lastCheckIn={data?.last_check_in ?? null}
                        checkInFrequencyDays={data?.check_in_frequency_days ?? 90}
                        isLoading={isLoading}
                    />
                    <QuickActions />
                </div>
            </div>
        </div>
    );
}
