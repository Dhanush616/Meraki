"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PlusIcon, WalletIcon, AlertTriangleIcon, ChevronDownIcon, SearchIcon, DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VaultDistributionChart } from "@/components/dashboard/vault/VaultDistributionChart";

interface Asset {
    id: string;
    nickname: string;
    asset_type: string;
    institution_name: string | null;
    account_identifier: string | null;
    estimated_value_inr: string | number | null;
    status: string;
    nominee_registered: boolean;
    primary_total_pct: number;
    primary_beneficiary_count: number;
    backup_beneficiary_count: number;
}

const CATEGORY_MAP: Record<string, string> = {
    bank_account: "Financial",
    fixed_deposit: "Financial",
    mutual_fund: "Financial",
    stocks_demat: "Financial",
    ppf_epf: "Financial",
    insurance: "Financial",
    business_ownership: "Financial",
    property: "Physical",
    vehicle: "Physical",
    gold_jewellery: "Physical",
    other: "Physical",
    crypto_wallet: "Digital",
};

type TabType = "All" | "Financial" | "Physical" | "Digital";

export default function MyVaultPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<TabType>("All");

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const token = localStorage.getItem("paradosis_access_token");
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const res = await fetch(`${apiUrl}/api/assets`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Failed to fetch assets");
                const data = await res.json();
                setAssets(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAssets();
    }, []);

    const activeAssets = assets.filter(a => a.status === 'active');
    
    // Filter by search
    let filteredAssets = activeAssets.filter(a =>
        a.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.asset_type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter by tab
    if (activeTab !== "All") {
        filteredAssets = filteredAssets.filter(a => CATEGORY_MAP[a.asset_type] === activeTab);
    }

    const hasAllocationWarning = activeAssets.some(a => a.primary_total_pct !== 100);

    const groupedAssets = filteredAssets.reduce((acc, asset) => {
        if (!acc[asset.asset_type]) acc[asset.asset_type] = [];
        acc[asset.asset_type].push(asset);
        return acc;
    }, {} as Record<string, Asset[]>);

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">My Vault</h1>
                    <p className="text-muted-foreground mt-1">Securely view and manage all your assets.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-border text-foreground hover:bg-muted rounded-full">
                        <DownloadIcon className="w-4 h-4 mr-2" /> Export
                    </Button>
                    <Link href="/dashboard/vault/add">
                        <Button className="bg-primary text-primary-foreground hover:opacity-90 rounded-full">
                            <PlusIcon className="w-4 h-4 mr-2" /> Add Asset
                        </Button>
                    </Link>
                </div>
            </header>

            {hasAllocationWarning && (
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg flex items-start gap-3">
                    <AlertTriangleIcon className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-destructive">Action Required: Unassigned Assets</h3>
                        <p className="text-destructive/80 text-sm mt-1 mb-3">Some of your assets do not have 100% primary beneficiary allocation. Unassigned portions will trigger default residual routing.</p>
                        <Button variant="outline" size="sm" className="bg-background border-border text-foreground hover:bg-muted rounded-full">Review Allocations</Button>
                    </div>
                </div>
            )}

            {!isLoading && !error && activeAssets.length > 0 && (
                <VaultDistributionChart assets={activeAssets} />
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex p-1 bg-muted rounded-lg border border-border overflow-x-auto w-full sm:w-auto hide-scrollbar">
                    {(["All", "Financial", "Physical", "Digital"] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === tab ? "bg-background text-foreground border border-border shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:max-w-xs shrink-0">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <div className="p-4 text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">{error}</div>
            ) : Object.keys(groupedAssets).length === 0 ? (
                <div className="text-center py-16 bg-card rounded-lg border border-dashed border-border">
                    <WalletIcon className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground">No assets found</h3>
                    <p className="text-muted-foreground text-sm mt-1 mb-6">You haven't added any assets in this category yet.</p>
                    <Link href="/dashboard/vault/add">
                        <Button className="bg-primary text-primary-foreground rounded-full">Add Your First Asset</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {Object.entries(groupedAssets).map(([type, groupAssets]) => (
                        <div key={type} className="bg-card border border-border rounded-lg overflow-hidden">
                            <div className="bg-muted/30 border-b border-border px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-foreground capitalize tracking-tight">{type.replace(/_/g, ' ')}</h3>
                                    <span className="text-xs font-medium bg-muted text-foreground border border-border px-2 py-0.5 rounded-full">{groupAssets.length}</span>
                                </div>
                            </div>
                            <div className="p-6 space-y-3">
                                {groupAssets.map(asset => (
                                    <div key={asset.id} className="group border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-foreground/30 hover:bg-muted/10 transition-all cursor-pointer bg-background">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-muted text-foreground">
                                                <WalletIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground tracking-tight">{asset.nickname}</h4>
                                                <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                                    <span>{asset.institution_name || "Unknown Inst."}</span>
                                                    {asset.account_identifier && (
                                                        <>
                                                            <span className="w-1 h-1 bg-border rounded-full"></span>
                                                            <span className="font-mono text-xs">•••• {asset.account_identifier.slice(-4)}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-foreground">{asset.estimated_value_inr ? `₹${asset.estimated_value_inr}` : "--"}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{asset.primary_total_pct}% Allocated</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}