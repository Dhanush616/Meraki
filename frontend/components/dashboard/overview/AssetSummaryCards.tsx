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
    bank_account:       { label: "Bank Account",     icon: <LandmarkIcon className="w-4 h-4" />,   color: "text-blue-600 bg-blue-50" },
    fixed_deposit:      { label: "Fixed Deposit",    icon: <BuildingIcon className="w-4 h-4" />,   color: "text-indigo-600 bg-indigo-50" },
    property:           { label: "Property",         icon: <BuildingIcon className="w-4 h-4" />,   color: "text-orange-600 bg-orange-50" },
    insurance:          { label: "Insurance",        icon: <ShieldIcon className="w-4 h-4" />,     color: "text-emerald-600 bg-emerald-50" },
    mutual_fund:        { label: "Mutual Fund",      icon: <TrendingUpIcon className="w-4 h-4" />, color: "text-violet-600 bg-violet-50" },
    stocks_demat:       { label: "Stocks / Demat",   icon: <BarChart2Icon className="w-4 h-4" />,  color: "text-sky-600 bg-sky-50" },
    crypto_wallet:      { label: "Crypto Wallet",    icon: <BitcoinIcon className="w-4 h-4" />,    color: "text-amber-600 bg-amber-50" },
    vehicle:            { label: "Vehicle",          icon: <CarIcon className="w-4 h-4" />,        color: "text-rose-600 bg-rose-50" },
    ppf_epf:            { label: "PPF / EPF",        icon: <PiggyBankIcon className="w-4 h-4" />,  color: "text-teal-600 bg-teal-50" },
    gold_jewellery:     { label: "Gold & Jewellery", icon: <GemIcon className="w-4 h-4" />,        color: "text-yellow-600 bg-yellow-50" },
    business_ownership: { label: "Business",         icon: <BriefcaseIcon className="w-4 h-4" />,  color: "text-slate-600 bg-slate-50" },
    other:              { label: "Other",            icon: <PackageIcon className="w-4 h-4" />,    color: "text-gray-600 bg-gray-50" },
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
            <Link href="/dashboard/vault/add" className="col-span-2 bg-ivory rounded-2xl p-6 border border-dashed border-oat-border flex flex-col items-center justify-center gap-2 hover:border-brand/40 hover:bg-brand/5 transition-all group">
                <PlusCircleIcon className="w-8 h-8 text-olive-gray group-hover:text-brand transition-colors" />
                <span className="text-sm font-medium text-olive-gray group-hover:text-brand transition-colors">Add your first asset</span>
            </Link>
        );
    }
    return (
        <div className="col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {assetsByType.map((item) => {
                const meta = ASSET_META[item.asset_type] ?? ASSET_META.other;
                return (
                    <Link key={item.asset_type} href={`/dashboard/vault?type=${item.asset_type}`} className="bg-ivory rounded-2xl p-4 border border-oat-border hover:border-brand/30 hover:shadow-sm transition-all">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${meta.color}`}>{meta.icon}</div>
                        <p className="text-xs text-olive-gray font-medium truncate">{meta.label}</p>
                        <p className="text-xl font-bold text-near-black font-serif">{item.count}</p>
                        {item.total_value > 0 && <p className="text-xs text-olive-gray mt-0.5">{formatINR(item.total_value)}</p>}
                    </Link>
                );
            })}
        </div>
    );
}
