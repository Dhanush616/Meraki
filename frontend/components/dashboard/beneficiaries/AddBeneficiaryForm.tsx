"use client";
import React, { useState, useEffect } from "react";
import { Loader2Icon, CheckCircle2Icon, XIcon, ShieldIcon, AlertTriangleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import type { Beneficiary, BeneficiaryFormData } from "@/hooks/useBeneficiaries";

interface AddBeneficiaryFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: BeneficiaryFormData) => Promise<void>;
    editingBeneficiary?: Beneficiary | null;
    allBeneficiaries: Beneficiary[];
}

const RELATIONSHIPS = [
    "spouse", "son", "daughter", "father", "mother",
    "brother", "sister", "grandfather", "grandmother",
    "grandson", "granddaughter", "uncle", "aunt",
    "nephew", "niece", "friend", "business_partner",
    "legal_advisor", "other",
];

const DISCLOSURE_LEVELS = [
    { value: "total_secrecy", label: "Total Secrecy", description: "Beneficiary doesn't know they are named", color: "border-red-300 bg-red-500/5 text-red-700 dark:text-red-400 dark:border-red-800" },
    { value: "partial_awareness", label: "Partial Awareness", description: "Knows they are named, not what they receive", color: "border-amber-300 bg-amber-500/5 text-amber-700 dark:text-amber-400 dark:border-amber-800" },
    { value: "full_transparency", label: "Full Transparency", description: "Knows everything upfront", color: "border-emerald-300 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 dark:border-emerald-800" },
];

function formatRelLabel(r: string) {
    return r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const EMPTY_FORM: BeneficiaryFormData = {
    full_name: "",
    relationship: "spouse",
    email: "",
    phone: "",
    aadhaar: "",
    pan: "",
    address: "",
    bank_account_number: "",
    bank_ifsc: "",
    crypto_wallet_address: "",
    disclosure_level: "total_secrecy",
    is_minor: false,
    trustee_id: null,
    personal_message: "",
};

export function AddBeneficiaryForm({
    open,
    onOpenChange,
    onSubmit,
    editingBeneficiary,
    allBeneficiaries,
}: AddBeneficiaryFormProps) {
    const [form, setForm] = useState<BeneficiaryFormData>(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const isEditing = !!editingBeneficiary;

    useEffect(() => {
        if (editingBeneficiary) {
            setForm({
                full_name: editingBeneficiary.full_name,
                relationship: editingBeneficiary.relationship,
                email: editingBeneficiary.email ?? "",
                phone: editingBeneficiary.phone ?? "",
                aadhaar: editingBeneficiary.aadhaar ?? "",
                pan: editingBeneficiary.pan ?? "",
                address: editingBeneficiary.address ?? "",
                bank_account_number: editingBeneficiary.bank_account_number ?? "",
                bank_ifsc: editingBeneficiary.bank_ifsc ?? "",
                crypto_wallet_address: editingBeneficiary.crypto_wallet_address ?? "",
                disclosure_level: editingBeneficiary.disclosure_level,
                is_minor: editingBeneficiary.is_minor,
                trustee_id: editingBeneficiary.trustee_id,
                personal_message: editingBeneficiary.personal_message ?? "",
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setSaveError(null);
    }, [editingBeneficiary, open]);

    const handleChange = (field: keyof BeneficiaryFormData, value: string | boolean | null) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.full_name.trim()) {
            setSaveError("Full name is required");
            return;
        }
        setIsSaving(true);
        setSaveError(null);
        try {
            // Clean empty strings to undefined so backend gets null
            const cleaned: BeneficiaryFormData = {
                ...form,
                email: form.email || undefined,
                phone: form.phone || undefined,
                aadhaar: form.aadhaar || undefined,
                pan: form.pan || undefined,
                address: form.address || undefined,
                bank_account_number: form.bank_account_number || undefined,
                bank_ifsc: form.bank_ifsc || undefined,
                crypto_wallet_address: form.crypto_wallet_address || undefined,
                personal_message: form.personal_message || undefined,
                trustee_id: form.is_minor ? form.trustee_id : null,
            };
            await onSubmit(cleaned);
            onOpenChange(false);
        } catch (err: unknown) {
            setSaveError(err instanceof Error ? err.message : "Failed to save");
        } finally {
            setIsSaving(false);
        }
    };

    // Potential trustees: all non-minor beneficiaries except the current one
    const potentialTrustees = allBeneficiaries.filter(
        (b) => !b.is_minor && b.id !== editingBeneficiary?.id
    );

    const inputClass =
        "w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 transition-all placeholder:text-muted-foreground/60";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Beneficiary" : "Add Beneficiary"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update this beneficiary's details. Encrypted fields are marked with a shield icon."
                            : "Add someone who will receive assets. Fields marked with a shield icon are encrypted at rest."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-2">
                    {/* ── Identity Section ─────────────────────────────── */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Identity</h4>

                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                Full Name <ShieldIcon className="w-3 h-3 text-muted-foreground" />
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={form.full_name}
                                onChange={(e) => handleChange("full_name", e.target.value)}
                                className={inputClass}
                                placeholder="e.g. Priya Sharma"
                                required
                            />
                        </div>

                        {/* Relationship */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Relationship <span className="text-red-500">*</span></label>
                            <select
                                value={form.relationship}
                                onChange={(e) => handleChange("relationship", e.target.value)}
                                className={inputClass}
                            >
                                {RELATIONSHIPS.map((r) => (
                                    <option key={r} value={r}>{formatRelLabel(r)}</option>
                                ))}
                            </select>
                        </div>

                        {/* Email & Phone (2-col) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                    Email <ShieldIcon className="w-3 h-3 text-muted-foreground" />
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    className={inputClass}
                                    placeholder="priya@example.com"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                    Phone <ShieldIcon className="w-3 h-3 text-muted-foreground" />
                                </label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    className={inputClass}
                                    placeholder="+91 9876543210"
                                />
                            </div>
                        </div>

                        {/* Aadhaar & PAN */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                    Aadhaar <ShieldIcon className="w-3 h-3 text-muted-foreground" />
                                </label>
                                <input
                                    value={form.aadhaar}
                                    onChange={(e) => handleChange("aadhaar", e.target.value)}
                                    className={inputClass}
                                    placeholder="XXXX XXXX XXXX"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                    PAN <ShieldIcon className="w-3 h-3 text-muted-foreground" />
                                </label>
                                <input
                                    value={form.pan}
                                    onChange={(e) => handleChange("pan", e.target.value)}
                                    className={inputClass}
                                    placeholder="ABCDE1234F"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                Address <ShieldIcon className="w-3 h-3 text-muted-foreground" />
                            </label>
                            <textarea
                                value={form.address}
                                onChange={(e) => handleChange("address", e.target.value)}
                                className={inputClass + " resize-none"}
                                rows={2}
                                placeholder="Full address"
                            />
                        </div>
                    </div>

                    {/* ── Financial Section ─────────────────────────────── */}
                    <div className="space-y-4 pt-2 border-t border-border">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">Financial Details</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                    Bank Account No. <ShieldIcon className="w-3 h-3 text-muted-foreground" />
                                </label>
                                <input
                                    value={form.bank_account_number}
                                    onChange={(e) => handleChange("bank_account_number", e.target.value)}
                                    className={inputClass}
                                    placeholder="Account number"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                    Bank IFSC <ShieldIcon className="w-3 h-3 text-muted-foreground" />
                                </label>
                                <input
                                    value={form.bank_ifsc}
                                    onChange={(e) => handleChange("bank_ifsc", e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g. HDFC0001234"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                Crypto Wallet Address <ShieldIcon className="w-3 h-3 text-muted-foreground" />
                            </label>
                            <input
                                value={form.crypto_wallet_address}
                                onChange={(e) => handleChange("crypto_wallet_address", e.target.value)}
                                className={inputClass}
                                placeholder="0x... or bc1..."
                            />
                        </div>
                    </div>

                    {/* ── Disclosure & Privacy ─────────────────────────── */}
                    <div className="space-y-4 pt-2 border-t border-border">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">Disclosure Level</h4>
                        <div className="grid grid-cols-1 gap-2.5">
                            {DISCLOSURE_LEVELS.map((dl) => (
                                <label
                                    key={dl.value}
                                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                        form.disclosure_level === dl.value
                                            ? dl.color + " ring-1 ring-current/20"
                                            : "border-border bg-background hover:bg-muted/50"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="disclosure_level"
                                        value={dl.value}
                                        checked={form.disclosure_level === dl.value}
                                        onChange={(e) => handleChange("disclosure_level", e.target.value)}
                                        className="mt-1 accent-foreground"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold">{dl.label}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{dl.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* ── Minor Toggle ────────────────────────────────── */}
                    <div className="space-y-4 pt-2 border-t border-border">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">Minor Status</h4>

                        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
                            <div>
                                <p className="text-sm font-medium text-foreground">Is this beneficiary a minor?</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Minor beneficiaries require a trustee to manage their assets.
                                </p>
                            </div>
                            <Switch
                                checked={form.is_minor}
                                onCheckedChange={(checked) => handleChange("is_minor", checked)}
                            />
                        </div>

                        {form.is_minor && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Select Trustee</label>
                                {potentialTrustees.length > 0 ? (
                                    <select
                                        value={form.trustee_id ?? ""}
                                        onChange={(e) => handleChange("trustee_id", e.target.value || null)}
                                        className={inputClass}
                                    >
                                        <option value="">Choose a trustee...</option>
                                        {potentialTrustees.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.full_name} ({formatRelLabel(t.relationship)})
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
                                        <AlertTriangleIcon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                        <span>No adult beneficiaries available as trustees. Add other beneficiaries first.</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Personal Message ────────────────────────────── */}
                    <div className="space-y-1.5 pt-2 border-t border-border">
                        <label className="text-sm font-medium text-foreground flex items-center gap-1.5 pt-2">
                            Personal Message <ShieldIcon className="w-3 h-3 text-muted-foreground" />
                        </label>
                        <p className="text-xs text-muted-foreground">This message will be shown in their execution package.</p>
                        <textarea
                            value={form.personal_message}
                            onChange={(e) => handleChange("personal_message", e.target.value)}
                            className={inputClass + " resize-none"}
                            rows={3}
                            placeholder="A personal message to this beneficiary..."
                        />
                    </div>

                    {/* Error */}
                    {saveError && (
                        <div className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-sm">
                            <XIcon className="w-4 h-4 mt-0.5 shrink-0" />
                            {saveError}
                        </div>
                    )}

                    {/* Footer */}
                    <DialogFooter className="pt-2">
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isSaving}>Cancel</Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={isSaving || !form.full_name.trim()}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {isSaving ? (
                                <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
                            ) : (
                                <><CheckCircle2Icon className="w-4 h-4 mr-2" /> {isEditing ? "Save Changes" : "Add Beneficiary"}</>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
