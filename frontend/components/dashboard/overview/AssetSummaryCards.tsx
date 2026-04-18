"use client";
import Link from "next/link";
import {
    LandmarkIcon, BuildingIcon, ShieldIcon, TrendingUpIcon,
    BarChart2Icon, BitcoinIcon, CarIcon, PiggyBankIcon,
    GemIcon, BriefcaseIcon, PackageIcon, PlusCircleIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { AssetTypeSummary } from "@/hooks/useVaultSummary";

const ASSET_META: Record<string, { label: string; icon: React.ReactNode }> = {
    bank_account:       { label: "Bank Account",     icon: <LandmarkIcon className="w-4 h-4" /> },
    fixed_deposit:      { label: "Fixed Deposit",    icon: <BuildingIcon className="w-4 h-4" /> },
    property:           { label: "Property",         icon: <BuildingIcon className="w-4 h-4" /> },
    insurance:          { label: "Insurance",        icon: <ShieldIcon className="w-4 h-4" /> },
    mutual_fund:        { label: "Mutual Fund",      icon: <TrendingUpIcon className="w-4 h-4" /> },
    stocks_demat:       { label: "Stocks / Demat",   icon: <BarChart2Icon className="w-4 h-4" /> },
    crypto_wallet:      { label: "Crypto Wallet",    icon: <BitcoinIcon className="w-4 h-4" /> },
    vehicle:            { label: "Vehicle",          icon: <CarIcon className="w-4 h-4" /> },
    ppf_epf:            { label: "PPF / EPF",        icon: <PiggyBankIcon className="w-4 h-4" /> },
    gold_jewellery:     { label: "Gold & Jewellery", icon: <GemIcon className="w-4 h-4" /> },
    business_ownership: { label: "Business",         icon: <BriefcaseIcon className="w-4 h-4" /> },
    other:              { label: "Other",            icon: <PackageIcon className="w-4 h-4" /> },
};

function formatINR(v: number) {
    if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(1)}Cr`;
    if (v >= 100_000)    return `₹${(v / 100_000).toFixed(1)}L`;
    if (v >= 1_000)      return `₹${(v / 1_000).toFixed(0)}K`;
    return `₹${v.toFixed(0)}`;
}

interface Props { assetsByType: AssetTypeSummary[]; isLoading: boolean; }

export function AssetSummaryCards({ assetsByType, isLoading }: Props) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
            </div>
        );
    }
    if (assetsByType.length === 0) {
        return (
            <Link href="/dashboard/vault/add" className="bg-card rounded-lg p-6 border border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-foreground/40 hover:bg-muted/30 transition-all group">
                <PlusCircleIcon className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Add your first asset</span>
            </Link>
        );
    }
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {assetsByType.map((item) => {
                const meta = ASSET_META[item.asset_type] ?? ASSET_META.other;
                return (
                    <Link key={item.asset_type} href={`/dashboard/vault?type=${item.asset_type}`} className="bg-card rounded-lg p-4 border border-border hover:border-foreground/30 hover:bg-muted/10 transition-all flex flex-col justify-between">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-3 text-foreground">{meta.icon}</div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium truncate mb-1">{meta.label}</p>
                            <div className="flex items-end justify-between">
                                <p className="text-2xl font-bold tracking-tight text-foreground">{item.count}</p>
                                {item.total_value > 0 && <p className="text-xs font-semibold text-foreground bg-muted px-2 py-0.5 rounded-full mb-1">{formatINR(item.total_value)}</p>}
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
