"use client";
import Link from "next/link";
import {
    LandmarkIcon, BuildingIcon, ShieldIcon, TrendingUpIcon,
    BarChart2Icon, BitcoinIcon, CarIcon, PiggyBankIcon,
    GemIcon, BriefcaseIcon, PackageIcon
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { AssetTypeSummary } from "@/hooks/useVaultSummary";

const ASSET_META: Record<string, { label: string; icon: any }> = {
    bank_account:       { label: "Bank Accounts",     icon: LandmarkIcon },
    fixed_deposit:      { label: "Fixed Deposits",    icon: BuildingIcon },
    property:           { label: "Real Estate",       icon: BuildingIcon },
    insurance:          { label: "Insurance",        icon: ShieldIcon },
    mutual_fund:        { label: "Mutual Funds",      icon: TrendingUpIcon },
    stocks_demat:       { label: "Stocks & Equity",   icon: BarChart2Icon },
    crypto_wallet:      { label: "Crypto Wallets",    icon: BitcoinIcon },
    vehicle:            { label: "Vehicles",          icon: CarIcon },
    ppf_epf:            { label: "Retirement (PPF)",  icon: PiggyBankIcon },
    gold_jewellery:     { label: "Gold & Assets",     icon: GemIcon },
    business_ownership: { label: "Business Equity",   icon: BriefcaseIcon },
    other:              { label: "Other Assets",      icon: PackageIcon },
};

function formatINR(v: number) {
    if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(1)} Cr`;
    if (v >= 100_000)    return `₹${(v / 100_000).toFixed(1)} L`;
    return `₹${v.toLocaleString('en-IN')}`;
}

interface Props { assetsByType: AssetTypeSummary[]; isLoading: boolean; }

export function AssetSummaryCards({ assetsByType, isLoading }: Props) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
            </div>
        );
    }

    if (assetsByType.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No assets in your vault yet.</p>
                <Link href="/dashboard/vault/add" className="text-primary text-sm font-medium hover:underline mt-2 inline-block">
                    Add your first asset
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assetsByType.map((item) => {
                const meta = ASSET_META[item.asset_type] ?? ASSET_META.other;
                const Icon = meta.icon;
                return (
                    <Link 
                        key={item.asset_type} 
                        href={`/dashboard/vault?type=${item.asset_type}`} 
                        className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors bg-background"
                    >
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{meta.label}</p>
                            <p className="text-xs text-muted-foreground">{item.count} items</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-foreground">
                                {item.total_value > 0 ? formatINR(item.total_value) : "—"}
                            </p>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
