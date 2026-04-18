"use client";
import React, { useState } from "react";
import {
    PlusIcon, ShieldAlertIcon, Trash2Icon, Loader2Icon, UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";

import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import type { Beneficiary, BeneficiaryFormData } from "@/hooks/useBeneficiaries";

import { BeneficiaryTable } from "@/components/dashboard/beneficiaries/BeneficiaryTable";
import { AddBeneficiaryForm } from "@/components/dashboard/beneficiaries/AddBeneficiaryForm";
import { AllocationOverview } from "@/components/dashboard/beneficiaries/AllocationOverview";

export default function BeneficiariesPage() {
    const {
        beneficiaries,
        isLoading,
        error,
        createBeneficiary,
        updateBeneficiary,
        deleteBeneficiary,
    } = useBeneficiaries();

    const [searchQuery, setSearchQuery] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Beneficiary | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Derived: filtered beneficiaries
    const filtered = beneficiaries.filter((b) => {
        const q = searchQuery.toLowerCase();
        return (
            b.full_name.toLowerCase().includes(q) ||
            b.relationship.toLowerCase().includes(q) ||
            b.disclosure_level.toLowerCase().includes(q)
        );
    });

    // Handlers
    const handleOpenAdd = () => {
        setEditingBeneficiary(null);
        setFormOpen(true);
    };

    const handleEdit = (b: Beneficiary) => {
        setEditingBeneficiary(b);
        setFormOpen(true);
    };

    const handleFormSubmit = async (data: BeneficiaryFormData) => {
        if (editingBeneficiary) {
            await updateBeneficiary(editingBeneficiary.id, data);
        } else {
            await createBeneficiary(data);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        setDeleteError(null);
        try {
            await deleteBeneficiary(deleteTarget.id);
            setDeleteTarget(null);
        } catch (err: unknown) {
            setDeleteError(err instanceof Error ? err.message : "Failed to delete");
        } finally {
            setIsDeleting(false);
        }
    };

    // Stats
    const secrecyCount = beneficiaries.filter((b) => b.disclosure_level === "total_secrecy").length;
    const partialCount = beneficiaries.filter((b) => b.disclosure_level === "partial_awareness").length;
    const transparentCount = beneficiaries.filter((b) => b.disclosure_level === "full_transparency").length;
    const minorCount = beneficiaries.filter((b) => b.is_minor).length;

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

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Form Modal */}
            <AddBeneficiaryForm
                open={formOpen}
                onOpenChange={setFormOpen}
                onSubmit={handleFormSubmit}
                editingBeneficiary={editingBeneficiary}
                allBeneficiaries={beneficiaries}
            />

            {/* Delete Confirm Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                <Trash2Icon className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <DialogTitle className="text-foreground">Delete Beneficiary?</DialogTitle>
                        </div>
                        <DialogDescription>
                            You are about to remove <span className="font-semibold text-foreground">{deleteTarget?.full_name}</span> from your vault.
                            {deleteTarget && deleteTarget.assets_assigned_count > 0 && (
                                <span className="block mt-2 text-red-600 dark:text-red-400 font-medium">
                                    This beneficiary is assigned to {deleteTarget.assets_assigned_count} asset(s). You must remove those assignments first.
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {deleteError && (
                        <p className="text-sm text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{deleteError}</p>
                    )}

                    <DialogFooter className="mt-2 gap-2">
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isDeleting} onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            {isDeleting ? (
                                <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> Deleting…</>
                            ) : (
                                <><Trash2Icon className="w-4 h-4 mr-2" /> Delete</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Header */}
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-sans font-bold text-foreground">Beneficiaries</h1>
                    <p className="text-muted-foreground mt-2">Manage the people who will receive your assets.</p>
                </div>
                <Button
                    onClick={handleOpenAdd}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    <PlusIcon className="w-4 h-4 mr-2" /> Add Beneficiary
                </Button>
            </header>

            {/* Summary Cards */}
            {!isLoading && beneficiaries.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-card border border-border rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{beneficiaries.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {secrecyCount}S · {partialCount}P · {transparentCount}T
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{minorCount}</p>
                        <p className="text-xs text-muted-foreground mt-1">Minors</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">
                            {beneficiaries.reduce((sum, b) => sum + b.assets_assigned_count, 0)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Assignments</p>
                    </div>
                </div>
            )}

            {/* Beneficiary Table */}
            <BeneficiaryTable
                beneficiaries={filtered}
                allBeneficiaries={beneficiaries}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* Allocation Overview */}
            {!isLoading && beneficiaries.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">Allocation Overview</h2>
                    <AllocationOverview />
                </div>
            )}
        </div>
    );
}
