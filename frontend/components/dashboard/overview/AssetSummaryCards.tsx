"use client";
import Link from "next/link";
import {
    LandmarkIcon, BuildingIcon, ShieldIcon, TrendingUpIcon,
    BarChart2Icon, BitcoinIcon, CarIcon, PiggyBankIcon,
    GemIcon, BriefcaseIcon, PackageIcon, PlusCircleIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { AssetTypeSummary } from "@/hooks/useVaultSummary";

const ASSET_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    bank_account:       { label: "Bank Account",     icon: <LandmarkIcon className="w-4 h-4" />,   color: "text-foreground bg-muted" },
    fixed_deposit:      { label: "Fixed Deposit",    icon: <BuildingIcon className="w-4 h-4" />,   color: "text-foreground bg-muted" },
    property:           { label: "Property",         icon: <BuildingIcon className="w-4 h-4" />,   color: "text-foreground bg-muted" },
    insurance:          { label: "Insurance",        icon: <ShieldIcon className="w-4 h-4" />,     color: "text-foreground bg-muted" },
    mutual_fund:        { label: "Mutual Fund",      icon: <TrendingUpIcon className="w-4 h-4" />, color: "text-foreground bg-muted" },
    stocks_demat:       { label: "Stocks / Demat",   icon: <BarChart2Icon className="w-4 h-4" />,  color: "text-foreground bg-muted" },
    crypto_wallet:      { label: "Crypto Wallet",    icon: <BitcoinIcon className="w-4 h-4" />,    color: "text-foreground bg-muted" },
    vehicle:            { label: "Vehicle",          icon: <CarIcon className="w-4 h-4" />,        color: "text-foreground bg-muted" },
    ppf_epf:            { label: "PPF / EPF",        icon: <PiggyBankIcon className="w-4 h-4" />,  color: "text-foreground bg-muted" },
    gold_jewellery:     { label: "Gold & Jewellery", icon: <GemIcon className="w-4 h-4" />,        color: "text-foreground bg-muted" },
    business_ownership: { label: "Business",         icon: <BriefcaseIcon className="w-4 h-4" />,  color: "text-foreground bg-muted" },
    other:              { label: "Other",            icon: <PackageIcon className="w-4 h-4" />,    color: "text-foreground bg-muted" },
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
            <div className="col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
            </div>
        );
    }
    if (assetsByType.length === 0) {
        return (
            <Link href="/dashboard/vault/add" className="col-span-2 bg-card rounded-2xl p-6 border border-border flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-all group">
                <PlusCircleIcon className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Add your first asset</span>
            </Link>
        );
    }
    return (
        <div className="col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {assetsByType.map((item) => {
                const meta = ASSET_META[item.asset_type] ?? ASSET_META.other;
                return (
                    <Link key={item.asset_type} href={`/dashboard/vault?type=${item.asset_type}`} className="bg-card rounded-2xl p-4 border border-border hover:bg-muted/50 transition-all">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${meta.color}`}>{meta.icon}</div>
                        <p className="text-xs text-muted-foreground font-medium truncate">{meta.label}</p>
                        <p className="text-xl font-bold text-foreground font-sans">{item.count}</p>
                        {item.total_value > 0 && <p className="text-xs text-muted-foreground mt-0.5">{formatINR(item.total_value)}</p>}
                    </Link>
                );
            })}
        </div>
    );
}
