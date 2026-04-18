"use client";
import React, { useState } from "react";
import { AlertCircleIcon, ArrowRightIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAssets } from "@/hooks/useAssets";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { AssetAllocation } from "@/components/dashboard/vault/AssetAllocation";

export function PendingAllocations() {
    const { assets, isLoading: assetsLoading, updateAssetMappings } = useAssets();
    const { beneficiaries, isLoading: benesLoading } = useBeneficiaries();
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const pendingAssets = assets.filter(a => a.status === "active" && a.primary_total_pct !== 100);

    if (assetsLoading || benesLoading) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground p-4">
                <Loader2Icon className="w-4 h-4 animate-spin" />
                <span className="text-sm">Checking for unallocated assets...</span>
            </div>
        );
    }

    if (pendingAssets.length === 0) return null;

    const selectedAsset = assets.find(a => a.id === selectedAssetId);

    const handleSave = async (mappings: { beneficiary_id: string; percentage: number }[]) => {
        if (!selectedAssetId) return;
        setIsSaving(true);
        try {
            await updateAssetMappings(selectedAssetId, mappings.map(m => ({
                beneficiary_id: m.beneficiary_id,
                role: "primary",
                percentage: m.percentage,
                priority_order: 1
            })));
            setSelectedAssetId(null);
        } catch (err) {
            alert("Failed to save allocation");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                        <AlertCircleIcon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground">Skipped Allocations</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            The following assets were added without a full beneficiary allocation. 
                            Portions not assigned to a primary beneficiary will follow default residual routing.
                        </p>

                        <div className="mt-6 grid gap-3">
                            {pendingAssets.map(asset => (
                                <div 
                                    key={asset.id} 
                                    className="flex items-center justify-between bg-background border border-border p-4 rounded-xl hover:border-amber-500/50 transition-colors"
                                >
                                    <div>
                                        <p className="font-semibold text-foreground text-sm">{asset.nickname}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{asset.asset_type.replace(/_/g, " ")} · {asset.primary_total_pct}% Allocated</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setSelectedAssetId(asset.id)}
                                        className="text-xs border-amber-500/30 text-amber-700 hover:bg-amber-500/5"
                                    >
                                        Allocate <ArrowRightIcon className="w-3 h-3 ml-2" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={!!selectedAssetId} onOpenChange={(open) => !open && setSelectedAssetId(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Complete Asset Allocation</DialogTitle>
                        <DialogDescription>Assign beneficiaries for {selectedAsset?.nickname}</DialogDescription>
                    </DialogHeader>
                    
                    {selectedAsset && (
                        <AssetAllocation 
                            assetNickname={selectedAsset.nickname}
                            beneficiaries={beneficiaries}
                            onSave={handleSave}
                            isSaving={isSaving}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
