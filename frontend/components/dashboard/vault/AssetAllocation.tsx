"use client";
import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PlusIcon, MinusIcon, UsersIcon, AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Beneficiary } from "@/hooks/useBeneficiaries";

interface AssetAllocationProps {
    assetNickname: string;
    beneficiaries: Beneficiary[];
    initialMappings?: { beneficiary_id: string; percentage: number }[];
    onSave: (mappings: { beneficiary_id: string; percentage: number }[]) => void;
    onSkip?: () => void;
    isSaving?: boolean;
}

const COLORS = [
    "hsl(var(--primary))",
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#3b82f6", // Blue
    "#8b5cf6", // Violet
    "#ec4899", // Pink
];

export function AssetAllocation({
    assetNickname,
    beneficiaries,
    initialMappings = [],
    onSave,
    onSkip,
    isSaving = false,
}: AssetAllocationProps) {
    const [allocations, setAllocations] = useState<{ beneficiary_id: string; percentage: number }[]>(
        initialMappings.length > 0 ? initialMappings : []
    );

    const totalAllocated = allocations.reduce((sum, a) => sum + a.percentage, 0);
    const remaining = 100 - totalAllocated;

    const handleAddBeneficiary = (id: string) => {
        if (allocations.find((a) => a.beneficiary_id === id)) return;
        const remainingPct = Math.max(0, remaining);
        setAllocations([...allocations, { beneficiary_id: id, percentage: remainingPct > 0 ? remainingPct : 0 }]);
    };

    const handleRemoveBeneficiary = (id: string) => {
        setAllocations(allocations.filter((a) => a.beneficiary_id !== id));
    };

    const handleUpdatePercentage = (id: string, value: string) => {
        const num = parseFloat(value) || 0;
        setAllocations(
            allocations.map((a) => (a.beneficiary_id === id ? { ...a, percentage: num } : a))
        );
    };

    const pieData = [
        ...allocations.map((a) => ({
            name: beneficiaries.find((b) => b.id === a.beneficiary_id)?.full_name || "Unknown",
            value: a.percentage,
        })),
        ...(remaining > 0 ? [{ name: "Unallocated", value: remaining }] : []),
    ].filter((d) => d.value > 0);

    const availableBeneficiaries = beneficiaries.filter(
        (b) => !allocations.find((a) => a.beneficiary_id === b.id)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* Pie Chart */}
                <div className="w-48 h-48 shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.name === "Unallocated" ? "hsl(var(--muted))" : COLORS[index % COLORS.length]} 
                                    />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-foreground">{totalAllocated}%</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">Allocated</span>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-4 w-full">
                    <div>
                        <h3 className="font-bold text-lg text-foreground">{assetNickname}</h3>
                        <p className="text-sm text-muted-foreground">Distribute ownership among your beneficiaries.</p>
                    </div>

                    {totalAllocated !== 100 && (
                        <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg ${remaining > 0 ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"}`}>
                            <AlertCircleIcon className="w-4 h-4" />
                            {remaining > 0 
                                ? `${remaining}% remaining to be allocated.` 
                                : `Over-allocated by ${Math.abs(remaining)}%. Total must be exactly 100%.`}
                        </div>
                    )}
                    {totalAllocated === 100 && (
                        <div className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                            <CheckCircle2Icon className="w-4 h-4" />
                            Perfect! 100% of the asset is allocated.
                        </div>
                    )}
                </div>
            </div>

            {/* Allocation List */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <UsersIcon className="w-4 h-4" /> Beneficiary Splits
                </h4>
                <div className="space-y-2">
                    {allocations.map((a, i) => {
                        const bene = beneficiaries.find((b) => b.id === a.beneficiary_id);
                        return (
                            <div key={a.beneficiary_id} className="flex items-center gap-3 bg-muted/30 p-3 rounded-xl border border-border">
                                <div className="w-2 h-8 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{bene?.full_name}</p>
                                    <p className="text-xs text-muted-foreground">{bene?.relationship}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={a.percentage}
                                            onChange={(e) => handleUpdatePercentage(a.beneficiary_id, e.target.value)}
                                            className="w-20 bg-background border border-border rounded-lg px-2 py-1.5 text-sm text-right pr-6 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                                    </div>
                                    <button 
                                        onClick={() => handleRemoveBeneficiary(a.beneficiary_id)}
                                        className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <MinusIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {availableBeneficiaries.length > 0 && (
                        <div className="pt-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Available Beneficiaries</p>
                            <div className="flex flex-wrap gap-2">
                                {availableBeneficiaries.map((b) => (
                                    <button
                                        key={b.id}
                                        onClick={() => handleAddBeneficiary(b.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                                    >
                                        <PlusIcon className="w-3 h-3" /> {b.full_name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {beneficiaries.length === 0 && (
                        <p className="text-sm text-muted-foreground italic py-4 text-center border border-dashed border-border rounded-xl">
                            No beneficiaries found. Please add beneficiaries first.
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
                {onSkip && (
                    <Button variant="ghost" onClick={onSkip} className="text-muted-foreground hover:text-foreground">
                        Skip for now
                    </Button>
                )}
                <Button 
                    onClick={() => onSave(allocations)} 
                    disabled={totalAllocated !== 100 || isSaving}
                    className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    {isSaving ? "Saving..." : "Save Allocation"}
                </Button>
            </div>
        </div>
    );
}
