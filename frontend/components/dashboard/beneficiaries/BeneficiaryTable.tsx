"use client";
import React, { useState, useMemo } from "react";
import {
    PencilIcon, Trash2Icon, ChevronUpIcon, ChevronDownIcon,
    UsersIcon, SearchIcon, ArrowUpDownIcon
} from "lucide-react";
import { DisclosureBadge } from "./DisclosureBadge";
import { MinorWarning } from "./MinorWarning";
import type { Beneficiary } from "@/hooks/useBeneficiaries";

type SortKey = "full_name" | "relationship" | "disclosure_level" | "status" | "assets_assigned_count";
type SortDir = "asc" | "desc";

interface BeneficiaryTableProps {
    beneficiaries: Beneficiary[];
    allBeneficiaries: Beneficiary[];
    isLoading: boolean;
    onEdit: (beneficiary: Beneficiary) => void;
    onDelete: (beneficiary: Beneficiary) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

function formatRelationship(r: string) {
    return r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatStatus(s: string) {
    return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function BeneficiaryTable({
    beneficiaries,
    allBeneficiaries,
    isLoading,
    onEdit,
    onDelete,
    searchQuery,
    onSearchChange,
}: BeneficiaryTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>("full_name");
    const [sortDir, setSortDir] = useState<SortDir>("asc");

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const sorted = useMemo(() => {
        return [...beneficiaries].sort((a, b) => {
            const aVal = a[sortKey] ?? "";
            const bVal = b[sortKey] ?? "";
            if (typeof aVal === "number" && typeof bVal === "number") {
                return sortDir === "asc" ? aVal - bVal : bVal - aVal;
            }
            const cmp = String(aVal).localeCompare(String(bVal));
            return sortDir === "asc" ? cmp : -cmp;
        });
    }, [beneficiaries, sortKey, sortDir]);

    const SortIcon = ({ col }: { col: SortKey }) => {
        if (sortKey !== col) return <ArrowUpDownIcon className="w-3.5 h-3.5 opacity-30" />;
        return sortDir === "asc" ? (
            <ChevronUpIcon className="w-3.5 h-3.5" />
        ) : (
            <ChevronDownIcon className="w-3.5 h-3.5" />
        );
    };

    const getTrusteeName = (trusteeId: string | null) => {
        if (!trusteeId) return null;
        const trustee = allBeneficiaries.find((b) => b.id === trusteeId);
        return trustee?.full_name ?? null;
    };

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-6">
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Empty state
    if (beneficiaries.length === 0 && !searchQuery) {
        return (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <UsersIcon className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No beneficiaries yet</h3>
                <p className="text-muted-foreground text-sm mt-1">
                    Add your first beneficiary to start assigning assets.
                </p>
            </div>
        );
    }

    const columns: { key: SortKey; label: string; className?: string }[] = [
        { key: "full_name", label: "Name" },
        { key: "relationship", label: "Relationship" },
        { key: "disclosure_level", label: "Disclosure" },
        { key: "status", label: "Status" },
        { key: "assets_assigned_count", label: "Assets", className: "text-center" },
    ];

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {/* Search toolbar */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search beneficiaries..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-foreground/20 transition-all focus:border-foreground/40"
                    />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {beneficiaries.length} beneficiar{beneficiaries.length === 1 ? "y" : "ies"}
                </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={() => handleSort(col.key)}
                                    className={`px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none ${col.className ?? ""}`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {col.label}
                                        <SortIcon col={col.key} />
                                    </div>
                                </th>
                            ))}
                            <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sorted.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <p className="text-muted-foreground text-sm">No beneficiaries match your search.</p>
                                </td>
                            </tr>
                        ) : (
                            sorted.map((b) => (
                                <tr
                                    key={b.id}
                                    className="group hover:bg-muted/40 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-foreground/5 border border-border flex items-center justify-center shrink-0">
                                                <span className="text-sm font-semibold text-foreground">
                                                    {b.full_name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-foreground truncate">
                                                    {b.full_name}
                                                </p>
                                                {b.is_minor && (
                                                    <MinorWarning trusteeName={getTrusteeName(b.trustee_id)} />
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-foreground">{formatRelationship(b.relationship)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <DisclosureBadge level={b.disclosure_level} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${
                                                    b.status === "registered" || b.status === "active"
                                                        ? "bg-emerald-500"
                                                        : b.status === "unlocked"
                                                        ? "bg-blue-500"
                                                        : "bg-muted-foreground"
                                                }`}
                                            />
                                            {formatStatus(b.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-xs font-semibold text-foreground">
                                            {b.assets_assigned_count}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => onEdit(b)}
                                                title="Edit beneficiary"
                                                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(b)}
                                                title="Delete beneficiary"
                                                className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                            >
                                                <Trash2Icon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
