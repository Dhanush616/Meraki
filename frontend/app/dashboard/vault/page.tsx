"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PlusIcon, WalletIcon, AlertTriangleIcon, ChevronDownIcon, SearchIcon, DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Asset {
    id: string;
    nickname: string;
    asset_type: string;
    institution_name: string | null;
    account_identifier: string | null; // encrypted in prod, raw here for demo
    estimated_value_inr: string | null; // encrypted in prod
    status: string;
    nominee_registered: boolean;
    primary_total_pct: number;
    primary_beneficiary_count: number;
    backup_beneficiary_count: number;
}

export default function MyVaultPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

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

    // Derived State
    const activeAssets = assets.filter(a => a.status === 'active');
    const filteredAssets = activeAssets.filter(a =>
        a.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.asset_type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const hasAllocationWarning = activeAssets.some(a => a.primary_total_pct !== 100);

    // Grouping
    const groupedAssets = filteredAssets.reduce((acc, asset) => {
        if (!acc[asset.asset_type]) acc[asset.asset_type] = [];
        acc[asset.asset_type].push(asset);
        return acc;
    }, {} as Record<string, Asset[]>);

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-near-black">My Vault</h1>
                    <p className="text-olive-gray mt-2">Securely view and manage all your assets.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-border-cream text-near-black hover:bg-parchment">
                        <DownloadIcon className="w-4 h-4 mr-2" /> Export
                    </Button>
                    <Link href="/dashboard/vault/add">
                        <Button className="bg-brand text-ivory hover:bg-[#b05637]">
                            <PlusIcon className="w-4 h-4 mr-2" /> Add Asset
                        </Button>
                    </Link>
                </div>
            </header>

            {hasAllocationWarning && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                    <AlertTriangleIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-amber-800">Action Required: Unassigned Assets</h3>
                        <p className="text-amber-700 text-sm mt-1 mb-2">Some of your assets do not have 100% primary beneficiary allocation. Unassigned portions will trigger default residual routing.</p>
                        <Button variant="outline" size="sm" className="bg-white border-amber-200 text-amber-800 hover:bg-amber-100">Review Allocations</Button>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="bg-ivory border border-border-cream rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div className="relative w-full max-w-md">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-gray" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-parchment border border-border-cream rounded-lg text-sm text-near-black outline-none focus:ring-2 focus:ring-brand/20 transition-all focus:border-brand/40"
                    />
                </div>
            </div>

            {/* Asset List */}
            {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <div className="p-4 text-red-600 bg-red-50 rounded-xl">{error}</div>
            ) : Object.keys(groupedAssets).length === 0 ? (
                <div className="text-center py-16 bg-ivory rounded-2xl border border-dashed border-border-cream">
                    <WalletIcon className="w-12 h-12 text-olive-gray opacity-50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-near-black">No assets found</h3>
                    <p className="text-olive-gray text-sm mt-1 mb-6">You haven't added any assets to your vault yet.</p>
                    <Link href="/dashboard/vault/add">
                        <Button className="bg-brand text-ivory">Add Your First Asset</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedAssets).map(([type, groupAssets]) => (
                        <div key={type} className="bg-ivory border border-border-cream rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-parchment/50 border-b border-border-cream px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-parchment transition-colors">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-near-black capitalize">{type.replace(/_/g, ' ')}</h3>
                                    <span className="text-xs font-medium bg-white text-olive-gray border border-border-cream px-2 py-0.5 rounded-full">{groupAssets.length}</span>
                                </div>
                                <ChevronDownIcon className="w-5 h-5 text-olive-gray" />
                            </div>
                            <div className="p-6 space-y-4">
                                {groupAssets.map(asset => (
                                    <div key={asset.id} className="group border border-border-cream rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand/30 hover:shadow-sm transition-all cursor-pointer bg-white">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${asset.primary_total_pct === 100 && asset.backup_beneficiary_count > 0 ? "bg-emerald-50 text-emerald-600" : asset.primary_total_pct === 100 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
                                                <WalletIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-near-black font-serif">{asset.nickname}</h4>
                                                <div className="text-sm text-olive-gray mt-1 flex items-center gap-2">
                                                    <span>{asset.institution_name || "Unknown Inst."}</span>
                                                    {asset.account_identifier && (
                                                        <>
                                                            <span className="w-1 h-1 bg-border-cream rounded-full"></span>
                                                            <span className="font-mono text-xs">•••• {asset.account_identifier.slice(-4)}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-near-black">{asset.estimated_value_inr ? `₹${asset.estimated_value_inr}` : "--"}</p>
                                                <p className="text-xs text-olive-gray mt-0.5">{asset.primary_total_pct}% Allocated</p>
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