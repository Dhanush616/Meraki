"use client";
import React, { useState, useEffect } from "react";
import {
    ShieldIcon, UserIcon, PhoneIcon, MailIcon,
    Loader2Icon, CheckCircle2Icon, XIcon,
} from "lucide-react";
import type { EmergencyContact } from "@/hooks/useEscalationSettings";

interface EmergencyContactFormProps {
    contact: EmergencyContact | null;
    onSave: (data: EmergencyContact) => Promise<void>;
}

const RELATIONSHIPS = [
    "spouse", "parent", "sibling", "child", "friend",
    "neighbour", "colleague", "lawyer", "doctor", "other",
];

function formatRelLabel(r: string) {
    return r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const EMPTY: EmergencyContact = {
    full_name: "",
    relationship: "friend",
    phone_number: "",
    email: null,
};

export function EmergencyContactForm({ contact, onSave }: EmergencyContactFormProps) {
    const [form, setForm] = useState<EmergencyContact>(contact ?? EMPTY);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (contact) setForm(contact);
    }, [contact]);

    const isDirty =
        form.full_name !== (contact?.full_name ?? "") ||
        form.relationship !== (contact?.relationship ?? "friend") ||
        form.phone_number !== (contact?.phone_number ?? "") ||
        form.email !== (contact?.email ?? null);

    const handleChange = (field: keyof EmergencyContact, value: string | null) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.full_name.trim() || !form.phone_number.trim()) {
            setError("Name and phone are required.");
            return;
        }
        setIsSaving(true);
        setError(null);
        try {
            await onSave({
                full_name: form.full_name,
                relationship: form.relationship,
                phone_number: form.phone_number,
                email: form.email || null,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to save");
        } finally {
            setIsSaving(false);
        }
    };

    const inputClass =
        "w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 transition-all placeholder:text-muted-foreground/60";

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Emergency Contact</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                    This person is contacted <span className="font-medium">before</span> your beneficiaries to check on your wellbeing.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <UserIcon className="w-3 h-3" /> Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        value={form.full_name}
                        onChange={(e) => handleChange("full_name", e.target.value)}
                        className={inputClass}
                        placeholder="e.g. Kavitha Iyer"
                        required
                    />
                </div>

                {/* Relationship */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Relationship</label>
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

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <PhoneIcon className="w-3 h-3" /> Phone
                            <ShieldIcon className="w-3 h-3 text-muted-foreground/50" />
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={form.phone_number}
                            onChange={(e) => handleChange("phone_number", e.target.value)}
                            className={inputClass}
                            placeholder="+91 9876543210"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <MailIcon className="w-3 h-3" /> Email
                            <ShieldIcon className="w-3 h-3 text-muted-foreground/50" />
                        </label>
                        <input
                            type="email"
                            value={form.email ?? ""}
                            onChange={(e) => handleChange("email", e.target.value || null)}
                            className={inputClass}
                            placeholder="kavitha@example.com"
                        />
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs">
                        <XIcon className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {error}
                    </div>
                )}

                {/* Save */}
                {isDirty && (
                    <div className="flex justify-end pt-1">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2Icon className="w-4 h-4 animate-spin" />
                            ) : saved ? (
                                <CheckCircle2Icon className="w-4 h-4" />
                            ) : (
                                <CheckCircle2Icon className="w-4 h-4" />
                            )}
                            {saved ? "Saved!" : "Save Contact"}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
