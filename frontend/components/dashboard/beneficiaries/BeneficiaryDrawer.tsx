"use client";
import React from "react";
import { ShieldIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { DisclosureBadge } from "./DisclosureBadge";
import type { Beneficiary } from "@/hooks/useBeneficiaries";

interface BeneficiaryDrawerProps {
    beneficiary: Beneficiary | null;
    onClose: () => void;
    allBeneficiaries: Beneficiary[];
}

function formatRelationship(r: string) {
    return r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function mask(value: string | null | undefined) {
    if (!value) return "—";
    if (value.length <= 4) return "••••";
    return "•••• " + value.slice(-4);
}

export function BeneficiaryDrawer({ beneficiary, onClose, allBeneficiaries }: BeneficiaryDrawerProps) {
    if (!beneficiary) return null;

    const trusteeName = beneficiary.trustee_id
        ? allBeneficiaries.find((b) => b.id === beneficiary.trustee_id)?.full_name ?? "Unknown"
        : null;

    const rows: { label: string; value: React.ReactNode; encrypted?: boolean }[] = [
        { label: "Relationship", value: formatRelationship(beneficiary.relationship) },
        { label: "Email", value: mask(beneficiary.email), encrypted: true },
        { label: "Phone", value: mask(beneficiary.phone), encrypted: true },
        { label: "Aadhaar", value: mask(beneficiary.aadhaar), encrypted: true },
        { label: "PAN", value: mask(beneficiary.pan), encrypted: true },
        { label: "Address", value: beneficiary.address ? "•••• (encrypted)" : "—", encrypted: true },
        { label: "Bank Account", value: mask(beneficiary.bank_account_number), encrypted: true },
        { label: "Bank IFSC", value: mask(beneficiary.bank_ifsc), encrypted: true },
        { label: "Crypto Wallet", value: mask(beneficiary.crypto_wallet_address), encrypted: true },
        {
            label: "Disclosure",
            value: <DisclosureBadge level={beneficiary.disclosure_level} />,
        },
        { label: "Minor", value: beneficiary.is_minor ? "Yes" : "No" },
    ];

    if (beneficiary.is_minor && trusteeName) {
        rows.push({ label: "Trustee", value: trusteeName });
    }

    rows.push({
        label: "Status",
        value: beneficiary.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    });
    rows.push({
        label: "Assets Assigned",
        value: String(beneficiary.assets_assigned_count),
    });

    return (
        <Dialog open={!!beneficiary} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-foreground/5 border border-border flex items-center justify-center">
                            <UsersIcon className="w-5 h-5 text-foreground" />
                        </div>
                        {beneficiary.full_name}
                    </DialogTitle>
                    <DialogDescription>Beneficiary details — sensitive data is masked.</DialogDescription>
                </DialogHeader>

                <div className="divide-y divide-border">
                    {rows.map(({ label, value, encrypted }) => (
                        <div key={label} className="flex justify-between items-center py-2.5 text-sm">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                                {label}
                                {encrypted && <ShieldIcon className="w-3 h-3 text-muted-foreground/50" />}
                            </span>
                            <span className="font-medium text-foreground">{value}</span>
                        </div>
                    ))}
                </div>

                {beneficiary.personal_message && (
                    <div className="mt-2 p-3 rounded-xl bg-muted/50 border border-border">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Personal Message</p>
                        <p className="text-sm text-foreground italic">&ldquo;{beneficiary.personal_message}&rdquo;</p>
                    </div>
                )}

                <DialogFooter className="mt-2">
                    <DialogClose asChild>
                        <Button variant="outline" onClick={onClose}>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
