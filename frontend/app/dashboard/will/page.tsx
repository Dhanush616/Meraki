"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
    FileTextIcon, RefreshCwIcon, DownloadIcon, CheckCircle2Icon,
    ClockIcon, Loader2Icon, AlertTriangleIcon, ChevronRightIcon,
    PrinterIcon, PenLineIcon, UsersIcon, ArchiveIcon, ShieldCheckIcon,
    EyeIcon, XIcon, InfoIcon, CheckIcon, ScrollTextIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose,
} from "@/components/ui/dialog";
// ── Types ────────────────────────────────────────────────────────────────────

interface WillDocument {
    will_id: string | null;
    version: number;
    storage_path?: string;
    signed_url?: string;
    is_signed: boolean;
    is_witnessed: boolean;
    is_printed: boolean;
    witness_1_name?: string;
    witness_2_name?: string;
    executor_name?: string;
    special_instructions?: string;
    trigger_event?: string;
    created_at?: string;
}

interface HistoryRow {
    id: string;
    version: number;
    created_at: string;
    is_current: boolean;
    trigger_event?: string;
    is_signed: boolean;
    is_witnessed: boolean;
    signed_url?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function apiUrl() {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

function authHeaders(): Record<string, string> {
    const token = localStorage.getItem("paradosis_access_token");
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function fmtDate(iso?: string) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
    });
}

function triggerLabel(event?: string) {
    const map: Record<string, string> = {
        manual_generate: "Manual regeneration",
        asset_added: "Asset added",
        beneficiary_changed: "Beneficiary updated",
        asset_removed: "Asset removed",
    };
    return event ? (map[event] ?? event.replace(/_/g, " ")) : "Generated";
}

// ── Generate Modal ────────────────────────────────────────────────────────────

function GenerateModal({
    open,
    defaultExecutor,
    defaultInstructions,
    onClose,
    onGenerated,
}: {
    open: boolean;
    defaultExecutor?: string;
    defaultInstructions?: string;
    onClose: () => void;
    onGenerated: (will: WillDocument) => void;
}) {
    const [step, setStep] = useState(1);
    const [executorName, setExecutorName] = useState(defaultExecutor ?? "");
    const [specialInstructions, setSpecialInstructions] = useState(defaultInstructions ?? "");
    const [witness1Name, setWitness1Name] = useState("");
    const [witness2Name, setWitness2Name] = useState("");
    const [isSoundMind, setIsSoundMind] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setStep(1);
            setExecutorName(defaultExecutor ?? "");
            setSpecialInstructions(defaultInstructions ?? "");
            setWitness1Name("");
            setWitness2Name("");
            setIsSoundMind(false);
            setError(null);
        }
    }, [open, defaultExecutor, defaultInstructions]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const res = await fetch(`${apiUrl()}/api/documents/will/generate`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({
                    executor_name: executorName,
                    special_instructions: specialInstructions,
                    witness_1_name: witness1Name,
                    witness_2_name: witness2Name
                }),
            });
            if (!res.ok) {
                const e = await res.json();
                throw new Error(e.detail || "Generation failed");
            }
            const currentRes = await fetch(`${apiUrl()}/api/documents/will/current`, {
                headers: authHeaders(),
            });
            const current = await currentRes.json();
            onGenerated(current);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unknown error");
            setStep(1); // Go back if error
        } finally {
            setIsGenerating(false);
        }
    };

    const canProceedToStep2 = executorName.trim() !== "" && witness1Name.trim() !== "" && witness2Name.trim() !== "" && isSoundMind;

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-lg h-[90vh] flex flex-col md:h-auto md:max-h-[85vh] overflow-hidden">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <ScrollTextIcon className="w-5 h-5 text-primary" />
                        Generate Will Document
                    </DialogTitle>
                    <DialogDescription>
                        {step === 1 ? "Provide mandatory details required for a valid Will in India." : "Review and confirm your vault configuration."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-2 space-y-4 pr-1">
                    {step === 1 && (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Executor Name <span className="text-red-500">*</span></label>
                                <input
                                    value={executorName}
                                    onChange={(e) => setExecutorName(e.target.value)}
                                    placeholder="Full name of your nominated executor"
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
                                />
                                <p className="text-xs text-muted-foreground">
                                    The person you appoint to carry out the instructions of your will.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-foreground">Witness 1 Name <span className="text-red-500">*</span></label>
                                    <input
                                        value={witness1Name}
                                        onChange={(e) => setWitness1Name(e.target.value)}
                                        placeholder="First witness name"
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-foreground">Witness 2 Name <span className="text-red-500">*</span></label>
                                    <input
                                        value={witness2Name}
                                        onChange={(e) => setWitness2Name(e.target.value)}
                                        placeholder="Second witness name"
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground col-span-2 -mt-1.5">
                                    A Will must be attested by at least two independent witnesses.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">
                                    Special Instructions{" "}
                                    <span className="text-muted-foreground font-normal">(optional)</span>
                                </label>
                                <textarea
                                    value={specialInstructions}
                                    onChange={(e) => setSpecialInstructions(e.target.value)}
                                    rows={3}
                                    placeholder="Any specific wishes, funeral arrangements, messages..."
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all resize-none"
                                />
                            </div>

                            <div className="bg-muted border border-border rounded-xl p-4 flex items-start gap-3 mt-4">
                                <input
                                    type="checkbox"
                                    id="sound-mind"
                                    checked={isSoundMind}
                                    onChange={(e) => setIsSoundMind(e.target.checked)}
                                    className="mt-1"
                                />
                                <label htmlFor="sound-mind" className="text-sm text-foreground leading-relaxed cursor-pointer">
                                    <span className="font-semibold text-primary block mb-1">Sound Mind Declaration</span>
                                    I declare that I am of sound mind, and I am making this Will voluntarily, without any coercion or undue influence.
                                </label>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="bg-[#fffbeb] border border-[#fef3c7] text-[#92400e] rounded-xl p-4 flex items-start gap-3">
                                <InfoIcon className="w-5 h-5 shrink-0 mt-0.5" />
                                <div className="text-sm leading-relaxed">
                                    <p className="font-bold mb-1">Confirm Vault Configuration</p>
                                    <p>Your Last Will & Testament will be generated based on your <strong>current Vault Assets</strong> and their <strong>Beneficiary Allocations</strong>.</p>
                                </div>
                            </div>

                            <p className="text-sm text-foreground">
                                If you need to make any changes to your assets or beneficiaries, please close this window and update your Vault first.
                                Otherwise, click Generate to create the final, legally binding PDF document using AI.
                            </p>

                            {error && (
                                <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 rounded-lg px-3 py-2 text-sm mt-4">
                                    <AlertTriangleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                                    {error}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border mt-2 shrink-0">
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isGenerating} onClick={onClose}>Cancel</Button>
                    </DialogClose>
                    {step === 1 ? (
                        <Button
                            onClick={() => setStep(2)}
                            disabled={!canProceedToStep2}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            Next Step <ChevronRightIcon className="w-4 h-4 ml-1" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {isGenerating ? (
                                <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" />Generating using AI…</>
                            ) : (
                                <><RefreshCwIcon className="w-4 h-4 mr-2" />Generate Will</>
                            )}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ── Signing Checklist ─────────────────────────────────────────────────────────

interface ChecklistState {
    is_printed: boolean;
    is_signed: boolean;
    is_witnessed: boolean;
    is_stored: boolean;
    witness_1_name: string;
    witness_2_name: string;
}

function SigningChecklist({
    willId,
    initial,
    onUpdated,
}: {
    willId: string;
    initial: Partial<ChecklistState>;
    onUpdated: (data: Partial<ChecklistState>) => void;
}) {
    const [state, setState] = useState<ChecklistState>({
        is_printed: initial.is_printed ?? false,
        is_signed: initial.is_signed ?? false,
        is_witnessed: initial.is_witnessed ?? false,
        is_stored: false,
        witness_1_name: initial.witness_1_name ?? "",
        witness_2_name: initial.witness_2_name ?? "",
    });
    const [isSaving, setIsSaving] = useState(false);

    const allDone = state.is_printed && state.is_signed && state.is_witnessed && state.is_stored;

    const toggle = (key: keyof ChecklistState) => {
        if (typeof state[key] === "boolean") {
            setState((prev) => ({ ...prev, [key]: !prev[key] }));
        }
    };

    const save = useCallback(async (next: ChecklistState) => {
        setIsSaving(true);
        try {
            await fetch(`${apiUrl()}/api/documents/will/${willId}/signing-status`, {
                method: "PUT",
                headers: authHeaders(),
                body: JSON.stringify({
                    is_printed: next.is_printed,
                    is_signed: next.is_signed,
                    is_witnessed: next.is_witnessed,
                    witness_1_name: next.witness_1_name,
                    witness_2_name: next.witness_2_name,
                }),
            });
            onUpdated({ is_printed: next.is_printed, is_signed: next.is_signed, is_witnessed: next.is_witnessed });
        } catch { /* silent */ } finally {
            setIsSaving(false);
        }
    }, [willId, onUpdated]);

    useEffect(() => {
        const t = setTimeout(() => save(state), 800);
        return () => clearTimeout(t);
    }, [state, save]);

    const steps = [
        {
            key: "is_printed" as const,
            icon: <PrinterIcon className="w-4 h-4" />,
            label: "Print this document",
            desc: "Download and print a physical copy of your will.",
        },
        {
            key: "is_signed" as const,
            icon: <PenLineIcon className="w-4 h-4" />,
            label: "Sign in presence of two witnesses",
            desc: "Your signature must be witnessed by two independent adults.",
        },
        {
            key: "is_witnessed" as const,
            icon: <UsersIcon className="w-4 h-4" />,
            label: "Both witnesses have signed",
            desc: "Each witness signs and prints their name on the document.",
        },
        {
            key: "is_stored" as const,
            icon: <ArchiveIcon className="w-4 h-4" />,
            label: "Store a physical copy safely",
            desc: "Keep the signed original in a secure location known to your executor.",
        },
    ];

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CheckCircle2Icon className="w-5 h-5 text-primary" />
                    <h2 className="text-base font-semibold text-foreground">Signing Checklist</h2>
                </div>
                <div className="flex items-center gap-2">
                    {isSaving && <Loader2Icon className="w-4 h-4 animate-spin text-muted-foreground" />}
                    {allDone && (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full">
                            <ShieldCheckIcon className="w-3.5 h-3.5" />
                            Will is Active
                        </span>
                    )}
                </div>
            </div>

            <div className="p-6 space-y-3">
                {steps.map((step, i) => {
                    const checked = state[step.key] as boolean;
                    return (
                        <button
                            key={step.key}
                            onClick={() => toggle(step.key)}
                            className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all ${checked
                                ? "bg-emerald-50 border-emerald-200"
                                : "bg-background border-border hover:bg-muted/50"
                                }`}
                        >
                            <div
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${checked
                                    ? "bg-emerald-600 border-emerald-600 text-white"
                                    : "border-border text-muted-foreground"
                                    }`}
                            >
                                {checked ? (
                                    <CheckIcon className="w-4 h-4" />
                                ) : (
                                    <span className="text-xs font-bold">{i + 1}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${checked ? "text-emerald-800" : "text-foreground"}`}>
                                    {step.label}
                                </p>
                                <p className={`text-xs mt-0.5 ${checked ? "text-emerald-600" : "text-muted-foreground"}`}>
                                    {step.desc}
                                </p>
                            </div>
                        </button>
                    );
                })}

                {(state.is_witnessed || state.witness_1_name || state.witness_2_name) && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        {(
                            [
                                { key: "witness_1_name" as const, label: "Witness 1 Name" },
                                { key: "witness_2_name" as const, label: "Witness 2 Name" },
                            ] as const
                        ).map(({ key, label }) => (
                            <div key={key} className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">{label}</label>
                                <input
                                    value={state[key] as string}
                                    onChange={(e) => setState((prev) => ({ ...prev, [key]: e.target.value }))}
                                    placeholder="Full name"
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Version History ───────────────────────────────────────────────────────────

function WillVersionHistory({
    history,
}: {
    history: HistoryRow[];
}) {
    if (history.length === 0) return null;

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Version History</h2>
                <span className="ml-auto text-xs text-muted-foreground">
                    {history.length} version{history.length !== 1 ? "s" : ""}
                </span>
            </div>
            <div className="divide-y divide-border">
                {history.map((row) => (
                    <div
                        key={row.id}
                        className="flex items-center justify-between px-6 py-4 hover:bg-muted/40 transition-colors"
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${row.is_current
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                    }`}
                            >
                                v{row.version}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                                    Version {row.version}
                                    {row.is_current && (
                                        <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                                            Current
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {fmtDate(row.created_at)} · {triggerLabel(row.trigger_event)}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    {row.is_signed && (
                                        <span className="text-[10px] text-emerald-600 font-medium">✓ Signed</span>
                                    )}
                                    {row.is_witnessed && (
                                        <span className="text-[10px] text-emerald-600 font-medium">✓ Witnessed</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {row.signed_url && (
                                <a
                                    href={row.signed_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border hover:bg-muted px-3 py-1.5 rounded-lg"
                                >
                                    <EyeIcon className="w-3.5 h-3.5" />
                                    View
                                </a>
                            )}
                            <button
                                onClick={async () => {
                                    if (!row.id) return;
                                    try {
                                        const token = localStorage.getItem("paradosis_access_token");
                                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                                        const res = await fetch(`${apiUrl}/api/documents/will/${row.id}/download`, {
                                            headers: { Authorization: `Bearer ${token}` },
                                        });
                                        if (!res.ok) throw new Error("Download failed");
                                        const blob = await res.blob();
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = `Will_v${row.version}.pdf`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                    } catch (e: any) {
                                        if (row.signed_url) {
                                            const a = document.createElement("a");
                                            a.href = row.signed_url;
                                            a.download = `Will_v${row.version}.pdf`;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                        }
                                    }
                                }}
                                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border hover:bg-muted px-3 py-1.5 rounded-lg"
                            >
                                <DownloadIcon className="w-3.5 h-3.5" />
                                Download
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function WillPage() {
    const [will, setWill] = useState<WillDocument | null>(null);
    const [history, setHistory] = useState<HistoryRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showGenerate, setShowGenerate] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [willRes, histRes] = await Promise.all([
                fetch(`${apiUrl()}/api/documents/will/current`, { headers: authHeaders() }),
                fetch(`${apiUrl()}/api/documents/will/history`, { headers: authHeaders() }),
            ]);
            if (!willRes.ok || !histRes.ok) throw new Error("Failed to fetch will data");
            const [willData, histData] = await Promise.all([willRes.json(), histRes.json()]);
            setWill(willData);
            setHistory(histData);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleGenerated = (newWill: WillDocument) => {
        setWill(newWill);
        fetchData();
    };

    const handleDownload = async () => {
        if (!will?.will_id) return;
        setIsDownloading(true);
        try {
            const token = localStorage.getItem("paradosis_access_token");
            const res = await fetch(`${apiUrl()}/api/documents/will/${will.will_id}/download`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Download failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Will_v${will.version}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Download failed");
        } finally {
            setIsDownloading(false);
        }
    };

    const willData: WillData = {
        testatorName: "",
        address: "",
        religion: "",
        executorName: will?.executor_name ?? "",
        specialInstructions: will?.special_instructions ?? "",
        generatedDate: will?.created_at ?? "",
        version: will?.version ?? 1,
    };

    const hasWill = will?.will_id != null;

    if (isLoading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-sans font-bold text-foreground">Will Document</h1>
                    <p className="text-muted-foreground mt-1.5">
                        Generate, sign, and manage your legal Last Will &amp; Testament.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {hasWill && (
                        <Button
                            variant="outline"
                            className="border-border text-foreground hover:bg-background"
                            onClick={handleDownload}
                            disabled={isDownloading}
                            id="download-will-btn"
                        >
                            {isDownloading ? (
                                <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" />Downloading…</>
                            ) : (
                                <><DownloadIcon className="w-4 h-4 mr-2" />Download PDF</>
                            )}
                        </Button>
                    )}
                    <Button
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => setShowGenerate(true)}
                        id="generate-will-btn"
                    >
                        <RefreshCwIcon className="w-4 h-4 mr-2" />
                        {hasWill ? "Regenerate Will" : "Generate Will"}
                    </Button>
                </div>
            </header>

            {error && (
                <div className="bg-muted border border-border rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangleIcon className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{error}</p>
                </div>
            )}

            {/* Empty state */}
            {!hasWill && !error && (
                <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
                    <FileTextIcon className="w-14 h-14 text-muted-foreground/40 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-foreground mb-2">No will generated yet</h2>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8">
                        Click <strong>Generate Will</strong> to create your Last Will &amp; Testament PDF
                        based on your current vault assets and beneficiary configuration.
                    </p>
                    <Button
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => setShowGenerate(true)}
                    >
                        <RefreshCwIcon className="w-4 h-4 mr-2" />
                        Generate Will
                    </Button>
                    <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <InfoIcon className="w-3.5 h-3.5" />
                        <span>Requires at least one asset and one beneficiary mapping</span>
                    </div>
                </div>
            )}

            {/* Main content */}
            {hasWill && (
                <div className="space-y-6">
                    {/* Status bar */}
                    <div className="bg-card border border-border rounded-xl px-6 py-4 flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <ClockIcon className="w-4 h-4" />
                            <span>Generated {fmtDate(will?.created_at)}</span>
                        </div>
                        <div className="w-px h-4 bg-border hidden sm:block" />
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <FileTextIcon className="w-4 h-4" />
                            <span>Version {will?.version}</span>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            {will?.is_signed && will?.is_witnessed ? (
                                <span className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs">
                                    <ShieldCheckIcon className="w-4 h-4" /> Signed &amp; Witnessed
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-amber-600 font-medium text-xs">
                                    <AlertTriangleIcon className="w-4 h-4" /> Awaiting signature
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Two-column layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
                        {/* Left: Version History */}
                        <div className="space-y-4">
                            <WillVersionHistory history={history} />
                        </div>

                        {/* Right: Signing Checklist + Legal notice */}
                        <div className="space-y-4">
                            <SigningChecklist
                                willId={will!.will_id!}
                                initial={{
                                    is_printed: will?.is_printed,
                                    is_signed: will?.is_signed,
                                    is_witnessed: will?.is_witnessed,
                                    witness_1_name: will?.witness_1_name,
                                    witness_2_name: will?.witness_2_name,
                                }}
                                onUpdated={(data) =>
                                    setWill((prev) => (prev ? { ...prev, ...data } : prev))
                                }
                            />

                            <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-2">
                                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                                    Legal Notice
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    This document is a draft will generated by Paradosis Vault. For it to be
                                    legally valid, it must be printed, signed by you, and counter-signed by two
                                    adult witnesses who are not beneficiaries. Consult a lawyer for
                                    jurisdiction-specific requirements.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* Modals */}
            <GenerateModal
                open={showGenerate}
                defaultExecutor={will?.executor_name}
                defaultInstructions={will?.special_instructions}
                onClose={() => setShowGenerate(false)}
                onGenerated={handleGenerated}
            />
        </div>
    );
}
