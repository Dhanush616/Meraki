"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    PlusIcon, WalletIcon, AlertTriangleIcon, ChevronDownIcon,
    SearchIcon, DownloadIcon, EyeIcon, PencilIcon, Trash2Icon,
    ShieldIcon, XIcon, CheckCircle2Icon, Loader2Icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface Asset {
    id: string;
    nickname: string;
    asset_type: string;
    institution_name: string | null;
    account_identifier: string | null;
    estimated_value_inr: string | null;
    status: string;
    nominee_registered: boolean;
    primary_total_pct: number;
    primary_beneficiary_count: number;
    backup_beneficiary_count: number;
}

// ── Field config (same as add page) ────────────────────────────────────────
const ASSET_FIELD_CONFIG: Record<string, {
    institutionLabel: string;
    identifierLabel: string;
    extraFields?: { id: string; label: string; placeholder: string }[];
}> = {
    bank_account: { institutionLabel: "Institution / Bank Name", identifierLabel: "Account / Identifier" },
    fixed_deposit: { institutionLabel: "Bank / Issuer", identifierLabel: "FD Receipt Number", extraFields: [{ id: "maturity_date", label: "Maturity Date", placeholder: "YYYY-MM-DD" }, { id: "interest_rate", label: "Interest Rate (%)", placeholder: "e.g. 7.5" }] },
    property: { institutionLabel: "Property Type", identifierLabel: "Registry Number", extraFields: [{ id: "address", label: "Complete Address", placeholder: "e.g. 123 Main St, City" }] },
    insurance: { institutionLabel: "Insurance Provider", identifierLabel: "Policy Number", extraFields: [{ id: "policy_type", label: "Policy Type", placeholder: "e.g. Term Life, Health" }, { id: "premium_amount", label: "Premium Amount / Year (₹)", placeholder: "e.g. 25000" }] },
    mutual_fund: { institutionLabel: "Fund House", identifierLabel: "Folio Number", extraFields: [{ id: "total_units", label: "Total Units", placeholder: "e.g. 1500" }] },
    stocks_demat: { institutionLabel: "Broker Name", identifierLabel: "Demat Account ID" },
    crypto_wallet: { institutionLabel: "Exchange / Wallet Provider", identifierLabel: "Wallet Address" },
    vehicle: { institutionLabel: "Vehicle Type", identifierLabel: "Registration Number", extraFields: [{ id: "chassis_number", label: "Chassis Number (Optional)", placeholder: "e.g. MA1ZA..." }] },
    ppf_epf: { institutionLabel: "Provider (e.g. EPFO)", identifierLabel: "UAN / Account No." },
    gold_jewellery: { institutionLabel: "Location Stored", identifierLabel: "Locker / Receipt No.", extraFields: [{ id: "weight_grams", label: "Weight (Grams)", placeholder: "e.g. 50" }, { id: "purity_karat", label: "Purity (Karat)", placeholder: "e.g. 24K" }] },
};

function getConfig(type: string) {
    return ASSET_FIELD_CONFIG[type] ?? ASSET_FIELD_CONFIG.bank_account;
}

function statusDot(asset: Asset) {
    if (asset.primary_total_pct !== 100)
        return "bg-foreground text-background";
    return "bg-muted text-foreground";
}

function getCategory(type: string) {
    if (["crypto_wallet", "other"].includes(type)) return "Digital";
    if (["property", "vehicle", "gold_jewellery"].includes(type)) return "Physical";
    return "Finance";
}

// ── View Modal ──────────────────────────────────────────────────────────────
function ViewModal({ asset, onClose }: { asset: Asset | null; onClose: () => void }) {
    if (!asset) return null;
    const cfg = getConfig(asset.asset_type);
    const rows = [
        { label: "Asset Type", value: asset.asset_type.replace(/_/g, " ") },
        { label: cfg.institutionLabel, value: asset.institution_name || "—" },
        { label: cfg.identifierLabel, value: asset.account_identifier ? `•••• ${asset.account_identifier.slice(-4)}` : "—" },
        { label: "Estimated Value", value: asset.estimated_value_inr ? `₹${asset.estimated_value_inr}` : "—" },
        { label: "Allocation", value: `${asset.primary_total_pct}%` },
        { label: "Primary Nominees", value: String(asset.primary_beneficiary_count) },
        { label: "Backup Nominees", value: String(asset.backup_beneficiary_count) },
        { label: "Nominee Registered", value: asset.nominee_registered ? "Yes" : "No" },
        { label: "Status", value: asset.status },
    ];

    return (
        <Dialog open={!!asset} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${statusDot(asset)}`}>
                            <WalletIcon className="w-4 h-4" />
                        </div>
                        {asset.nickname}
                    </DialogTitle>
                    <DialogDescription>Asset details — sensitive identifiers are masked.</DialogDescription>
                </DialogHeader>

                <div className="divide-y divide-border">
                    {rows.map(({ label, value }) => (
                        <div key={label} className="flex justify-between py-2.5 text-sm">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-medium text-foreground capitalize">{value}</span>
                        </div>
                    ))}
                </div>

                <DialogFooter className="mt-2">
                    <DialogClose asChild>
                        <Button variant="outline" onClick={onClose}>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Edit Modal ──────────────────────────────────────────────────────────────
function EditModal({ asset, onClose, onSaved }: { asset: Asset | null; onClose: () => void; onSaved: (updated: Asset) => void }) {
    const [nickname, setNickname] = useState(asset?.nickname ?? "");
    const [institution, setInstitution] = useState(asset?.institution_name ?? "");
    const [identifier, setIdentifier] = useState(asset?.account_identifier ?? "");
    const [value, setValue] = useState(asset?.estimated_value_inr ?? "");
    const [nominee, setNominee] = useState(asset?.nominee_registered ?? false);

    // Beneficiary Logic
    const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
    const [allocations, setAllocations] = useState<{ beneficiary_id: string, percentage: number }[]>([]);
    const [allocationsFetched, setAllocationsFetched] = useState(false);

    const [activeTab, setActiveTab] = useState("details");
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Sync when asset changes
    useEffect(() => {
        setNickname(asset?.nickname ?? "");
        setInstitution(asset?.institution_name ?? "");
        setIdentifier(asset?.account_identifier ?? "");
        setValue(asset?.estimated_value_inr ?? "");
        setNominee(asset?.nominee_registered ?? false);
        setSaveError(null);
        setAllocationsFetched(false);
        setAllocations([]);
        setActiveTab("details");

        if (asset) {
            const token = localStorage.getItem("paradosis_access_token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            fetch(`${apiUrl}/api/beneficiaries`, { headers: { "Authorization": `Bearer ${token}` } }).then(r => r.json()).then(setBeneficiaries);
            fetch(`${apiUrl}/api/assets/${asset.id}/allocations`, { headers: { "Authorization": `Bearer ${token}` } }).then(r => r.json()).then(data => {
                setAllocations(data.map((d: any) => ({ beneficiary_id: d.beneficiary_id, percentage: d.percentage })));
                setAllocationsFetched(true);
            });
        }
    }, [asset]);

    if (!asset) return null;
    const cfg = getConfig(asset.asset_type);

    const addAllocation = (beneId: string) => {
        if (!allocations.find(a => a.beneficiary_id === beneId)) {
            setAllocations([...allocations, { beneficiary_id: beneId, percentage: 0 }]);
        }
    };
    const updateAllocation = (beneId: string, percentage: number) => {
        setAllocations(allocations.map(a => a.beneficiary_id === beneId ? { ...a, percentage } : a));
    };
    const removeAllocation = (beneId: string) => {
        setAllocations(allocations.filter(a => a.beneficiary_id !== beneId));
    };
    const totalPercentage = allocations.reduce((sum, a) => sum + (a.percentage || 0), 0);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveError(null);
        try {
            const token = localStorage.getItem("paradosis_access_token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiUrl}/api/assets/${asset.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    nickname,
                    institution_name: institution,
                    account_identifier: identifier,
                    estimated_value_inr: value ? parseFloat(value.toString().replaceAll(",", "")) : null,
                    nominee_registered: nominee,
                    allocations: allocations.length > 0 ? allocations.map(a => ({ ...a, role: "primary", priority_order: 1 })) : []
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Failed to update asset");
            }
            const updated: Asset = await res.json();
            onSaved(updated);
            onClose();
        } catch (err: any) {
            setSaveError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={!!asset} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl px-2 sm:px-6 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="px-4 sm:px-0">
                    <DialogTitle>Edit Asset</DialogTitle>
                    <DialogDescription>Updating details and beneficiary allocations for {asset.asset_type.replace(/_/g, " ")}</DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-4 border-b border-border mt-4 mb-4 px-4 sm:px-0">
                    <button onClick={() => setActiveTab('details')} className={`pb-2 text-sm font-medium ${activeTab === 'details' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}>Basic Details</button>
                    <button onClick={() => setActiveTab('allocations')} className={`pb-2 text-sm font-medium ${activeTab === 'allocations' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}>Allocations</button>
                </div>

                <div className="px-4 sm:px-0">
                    {activeTab === 'details' && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Asset Nickname</label>
                                <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">{cfg.institutionLabel}</label>
                                <input type="text" value={institution} onChange={e => setInstitution(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Value (₹)</label>
                                <input type="number" value={value} onChange={e => setValue(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2" />
                            </div>
                        </div>
                    )}
                    {activeTab === 'allocations' && (
                        <div className="space-y-4">
                            {beneficiaries.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No beneficiaries to select.</p>
                            ) : (
                                <>
                                    <div className="flex flex-wrap gap-2">
                                        {beneficiaries.filter(b => !allocations.find(a => a.beneficiary_id === b.id)).map(b => (
                                            <button key={b.id} onClick={() => addAllocation(b.id)} className="bg-muted border border-border px-3 py-1.5 rounded-full text-sm">+ {b.full_name}</button>
                                        ))}
                                    </div>
                                    <div className="space-y-3 mt-4">
                                        {allocations.map(alloc => {
                                            const bene = beneficiaries.find(b => b.id === alloc.beneficiary_id);
                                            return (
                                                <div key={alloc.beneficiary_id} className="flex items-center gap-3 bg-muted/50 p-2 rounded-lg border border-border">
                                                    <span className="flex-1">{bene?.full_name}</span>
                                                    <input type="number" value={alloc.percentage === 0 ? '' : alloc.percentage} onChange={(e) => updateAllocation(alloc.beneficiary_id, parseFloat(e.target.value) || 0)} className="w-16 border rounded px-2 py-1 bg-background text-sm" />
                                                    <span>%</span>
                                                    <button onClick={() => removeAllocation(alloc.beneficiary_id)} className="text-red-500 hover:opacity-80 font-bold ml-1">X</button>
                                                </div>
                                            );
                                        })}
                                        <div className="text-sm font-medium mt-2">Total: {totalPercentage}%</div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {saveError && <p className="text-red-500 text-sm mt-2 px-4 sm:px-0">{saveError}</p>}

                <DialogFooter className="px-4 sm:px-0 pt-4">
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-primary-foreground">{isSaving ? "Saving..." : "Save Changes"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Delete Confirm Dialog ───────────────────────────────────────────────────
function DeleteDialog({ asset, onClose, onConfirm, isDeleting }: {
    asset: Asset | null;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}) {
    return (
        <Dialog open={!!asset} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Trash2Icon className="w-5 h-5 text-foreground" />
                        </div>
                        <DialogTitle className="text-foreground">Delete Asset?</DialogTitle>
                    </div>
                    <DialogDescription>
                        You are about to permanently remove <span className="font-semibold text-foreground">{asset?.nickname}</span> from your vault. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-2 gap-2">
                    <DialogClose asChild>
                        <Button variant="outline" onClick={onClose} disabled={isDeleting}>Cancel</Button>
                    </DialogClose>
                    <Button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="bg-foreground text-background hover:bg-foreground/90"
                    >
                        {isDeleting ? (
                            <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> Deleting…</>
                        ) : (
                            <><Trash2Icon className="w-4 h-4 mr-2" /> Delete Asset</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function MyVaultPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");

    // Modal state
    const [viewAsset, setViewAsset] = useState<Asset | null>(null);
    const [editAsset, setEditAsset] = useState<Asset | null>(null);
    const [deleteAsset, setDeleteAsset] = useState<Asset | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                // Instantly load from cache for better UX when navigating back
                const cached = sessionStorage.getItem("vault_assets_cache");
                if (cached) {
                    setAssets(JSON.parse(cached));
                    setIsLoading(false);
                }

                const token = localStorage.getItem("paradosis_access_token");
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const res = await fetch(`${apiUrl}/api/assets`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Failed to fetch assets from database");

                const data = await res.json();
                setAssets(data);
                sessionStorage.setItem("vault_assets_cache", JSON.stringify(data));
            } catch (err: any) {
                setAssets(prev => {
                    if (prev.length === 0) setError(err.message);
                    return prev;
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchAssets();
    }, []);

    // Derived State
    const activeAssets = assets.filter(a => a.status === "active");
    const filteredAssets = activeAssets.filter(a => {
        const matchesSearch = a.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.asset_type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || getCategory(a.asset_type) === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    const hasAllocationWarning = activeAssets.some(a => a.primary_total_pct !== 100);

    // Grouping
    const groupedAssets = filteredAssets.reduce((acc, asset) => {
        if (!acc[asset.asset_type]) acc[asset.asset_type] = [];
        acc[asset.asset_type].push(asset);
        return acc;
    }, {} as Record<string, Asset[]>);

    const pieDataMap = activeAssets.reduce((acc, a) => {
        const cat = getCategory(a.asset_type);
        acc[cat] = (acc[cat] || 0) + (a.estimated_value_inr || 0);
        return acc;
    }, {} as Record<string, number>);

    const allZeroValue = Object.values(pieDataMap).every(v => v === 0);
    const pieData = ["Finance", "Physical", "Digital"].map(cat => {
        let val = allZeroValue ? activeAssets.filter(a => getCategory(a.asset_type) === cat).length : (pieDataMap[cat] || 0);
        return { name: cat, value: val };
    }).filter(d => d.value > 0);

    const totalValue = pieData.reduce((sum, d) => sum + d.value, 0);

    const COLORS = ["#171717", "#737373", "#d4d4d4"];

    // Handlers
    const handleConfirmDelete = async () => {
        if (!deleteAsset) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem("paradosis_access_token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiUrl}/api/assets/${deleteAsset.id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to delete asset");

            setAssets(prev => {
                const next = prev.filter(a => a.id !== deleteAsset.id);
                sessionStorage.setItem("vault_assets_cache", JSON.stringify(next));
                return next;
            });
            setDeleteAsset(null);
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleAssetUpdated = (updated: Asset) => {
        setAssets(prev => {
            const next = prev.map(a => a.id === updated.id ? updated : a);
            sessionStorage.setItem("vault_assets_cache", JSON.stringify(next));
            return next;
        });
    };

    const handleExport = () => {
        if (activeAssets.length === 0) {
            alert("No active assets to export");
            return;
        }

        const headers = [
            "Asset Nickname",
            "Asset Type",
            "Institution",
            "Account Identifier",
            "Estimated Value (INR)",
            "Allocation (%)",
            "Nominee Registered"
        ];

        const csvRows = activeAssets.map(a => [
            `"${a.nickname}"`,
            `"${a.asset_type.replace(/_/g, " ")}"`,
            `"${a.institution_name || ""}"`,
            `"****${a.account_identifier ? a.account_identifier.slice(-4) : ""}"`,
            `"${a.estimated_value_inr || ""}"`,
            `"${a.primary_total_pct}"`,
            `"${a.nominee_registered ? "Yes" : "No"}"`
        ]);

        const csvContent = [
            headers.join(","),
            ...csvRows.map(r => r.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "My_Vault_Assets.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Modals */}
            <ViewModal asset={viewAsset} onClose={() => setViewAsset(null)} />
            <EditModal asset={editAsset} onClose={() => setEditAsset(null)} onSaved={handleAssetUpdated} />
            <DeleteDialog
                asset={deleteAsset}
                onClose={() => setDeleteAsset(null)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
            />

            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-sans font-bold text-foreground">My Vault</h1>
                    <p className="text-muted-foreground mt-2">Securely view and manage all your assets.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-border text-foreground hover:bg-background" onClick={handleExport}>
                        <DownloadIcon className="w-4 h-4 mr-2" /> Export
                    </Button>
                    <Link href="/dashboard/vault/add">
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                            <PlusIcon className="w-4 h-4 mr-2" /> Add Asset
                        </Button>
                    </Link>
                </div>
            </header>

            {pieData.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-4 mb-6 flex items-center justify-between gap-4 max-w-2xl mx-auto">
                    <div className="w-32 h-32 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={35}
                                    outerRadius={55}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value: number) => {
                                        const pct = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) + "%" : "0%";
                                        return allZeroValue
                                            ? [`${value} (${pct})`, "Assets"]
                                            : [`${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)} (${pct})`, "Value"];
                                    }}
                                    allowEscapeViewBox={{ x: true, y: true }}
                                    wrapperStyle={{ zIndex: 100 }}
                                    offset={25}
                                    contentStyle={{ backgroundColor: '#171717', borderColor: '#171717', color: '#ffffff', borderRadius: '8px', fontSize: '12px', padding: '6px 10px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)' }}
                                    itemStyle={{ color: '#ffffff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-sm font-semibold text-foreground mb-3">Asset Distribution</h2>
                        <div className="space-y-2">
                            {pieData.map((entry, i) => (
                                <div key={entry.name} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-muted-foreground font-medium">{entry.name}</span>
                                    </div>
                                    <span className="font-semibold text-foreground">
                                        {allZeroValue ? entry.value : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 3 }).format(entry.value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {hasAllocationWarning && (
                <div className="bg-muted border border-border p-4 rounded-xl flex items-start gap-3">
                    <AlertTriangleIcon className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-foreground">Action Required: Unassigned Assets</h3>
                        <p className="text-muted-foreground text-sm mt-1 mb-2">Some of your assets do not have 100% primary beneficiary allocation. Unassigned portions will trigger default residual routing.</p>
                        <Button variant="outline" size="sm" className="bg-background border-border text-foreground hover:bg-muted">Review Allocations</Button>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="bg-card border border-border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm mb-6">
                <div className="relative w-full max-w-md">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-foreground/20 transition-all focus:border-foreground/40"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                    {["All", "Finance", "Physical", "Digital"].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${selectedCategory === cat ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground border-border hover:bg-muted"}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Asset List */}
            {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <div className="p-4 text-foreground bg-muted border border-border rounded-xl">{error}</div>
            ) : Object.keys(groupedAssets).length === 0 ? (
                <div className="text-center py-16 bg-card rounded-2xl border border-border">
                    <WalletIcon className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground">No assets found</h3>
                    <p className="text-muted-foreground text-sm mt-1 mb-6">You haven't added any assets to your vault yet.</p>
                    <Link href="/dashboard/vault/add">
                        <Button className="bg-primary text-primary-foreground">Add Your First Asset</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedAssets).map(([type, groupAssets]) => (
                        <div key={type} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-background/50 border-b border-border px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-background transition-colors">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-foreground capitalize">{type.replace(/_/g, " ")}</h3>
                                    <span className="text-xs font-medium bg-white text-muted-foreground border border-border px-2 py-0.5 rounded-full">{groupAssets.length}</span>
                                </div>
                                <ChevronDownIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="p-6 space-y-4">
                                {groupAssets.map(asset => (
                                    <div
                                        key={asset.id}
                                        className="group border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/50 transition-all bg-card"
                                    >
                                        {/* Left: icon + name */}
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${statusDot(asset)}`}>
                                                <WalletIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-foreground font-sans">{asset.nickname}</h4>
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

                                        {/* Right: value + actions */}
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-foreground">{asset.estimated_value_inr ? `₹${asset.estimated_value_inr}` : "—"}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{asset.primary_total_pct}% Allocated</p>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1 border-l border-border pl-4 ml-2">
                                                {/* View */}
                                                <button
                                                    onClick={() => setViewAsset(asset)}
                                                    title="View details"
                                                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                </button>
                                                {/* Edit */}
                                                <button
                                                    onClick={() => setEditAsset(asset)}
                                                    title="Edit asset"
                                                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </button>
                                                {/* Delete */}
                                                <button
                                                    onClick={() => setDeleteAsset(asset)}
                                                    title="Delete asset"
                                                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                                >
                                                    <Trash2Icon className="w-4 h-4" />
                                                </button>
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