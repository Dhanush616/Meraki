"use client";
import { useState, useEffect, useCallback } from "react";
import {
    ActivityIcon, SearchIcon, FilterIcon, ChevronLeftIcon,
    ChevronRightIcon, PlusCircleIcon, PencilIcon, Trash2Icon,
    ShieldAlertIcon, LogInIcon, DownloadIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
    return typeof window !== "undefined" ? localStorage.getItem("paradosis_access_token") ?? "" : "";
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ActivityLog {
    id: string;
    action: string;
    entity_type: string | null;
    entity_id: string | null;
    ip_address: string | null;
    user_agent: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
}

interface ActivityResponse {
    logs: ActivityLog[];
    total: number;
    page: number;
    limit: number;
}

// ── Action metadata ───────────────────────────────────────────────────────────

type ActionMeta = { label: string; color: string; icon: React.ReactNode };

const ACTION_META: Record<string, ActionMeta> = {
    "asset.created":          { label: "Asset Added",          color: "bg-emerald-50 text-emerald-700", icon: <PlusCircleIcon className="w-3.5 h-3.5" /> },
    "asset.updated":          { label: "Asset Updated",        color: "bg-blue-50 text-blue-700",       icon: <PencilIcon className="w-3.5 h-3.5" /> },
    "asset.deleted":          { label: "Asset Deleted",        color: "bg-rose-50 text-rose-700",       icon: <Trash2Icon className="w-3.5 h-3.5" /> },
    "beneficiary.added":      { label: "Beneficiary Added",    color: "bg-emerald-50 text-emerald-700", icon: <PlusCircleIcon className="w-3.5 h-3.5" /> },
    "beneficiary.updated":    { label: "Beneficiary Updated",  color: "bg-blue-50 text-blue-700",       icon: <PencilIcon className="w-3.5 h-3.5" /> },
    "beneficiary.removed":    { label: "Beneficiary Removed",  color: "bg-rose-50 text-rose-700",       icon: <Trash2Icon className="w-3.5 h-3.5" /> },
    "will.generated":         { label: "Will Generated",       color: "bg-blue-50 text-blue-700",       icon: <PencilIcon className="w-3.5 h-3.5" /> },
    "will.updated":           { label: "Will Updated",         color: "bg-blue-50 text-blue-700",       icon: <PencilIcon className="w-3.5 h-3.5" /> },
    "2fa.enabled":            { label: "2FA Enabled",          color: "bg-amber-50 text-amber-700",     icon: <ShieldAlertIcon className="w-3.5 h-3.5" /> },
    "2fa.disabled":           { label: "2FA Disabled",         color: "bg-amber-50 text-amber-700",     icon: <ShieldAlertIcon className="w-3.5 h-3.5" /> },
    "session.revoked":        { label: "Session Revoked",      color: "bg-amber-50 text-amber-700",     icon: <ShieldAlertIcon className="w-3.5 h-3.5" /> },
    "vault.exported":         { label: "Vault Exported",       color: "bg-amber-50 text-amber-700",     icon: <DownloadIcon className="w-3.5 h-3.5" /> },
    "login.success":          { label: "Login",                color: "bg-emerald-50 text-emerald-700", icon: <LogInIcon className="w-3.5 h-3.5" /> },
    "password.changed":       { label: "Password Changed",     color: "bg-amber-50 text-amber-700",     icon: <ShieldAlertIcon className="w-3.5 h-3.5" /> },
};

const FALLBACK_META: ActionMeta = {
    label: "Action",
    color: "bg-oat-border/50 text-olive-gray",
    icon: <ActivityIcon className="w-3.5 h-3.5" />,
};

function getActionMeta(action: string): ActionMeta {
    if (ACTION_META[action]) return ACTION_META[action];
    // Derive from prefix
    if (action.includes("created") || action.includes("added")) return ACTION_META["asset.created"];
    if (action.includes("updated"))                               return ACTION_META["asset.updated"];
    if (action.includes("deleted") || action.includes("removed")) return ACTION_META["asset.deleted"];
    if (action.includes("2fa") || action.includes("session") || action.includes("password") || action.includes("vault"))
        return ACTION_META["2fa.enabled"];
    return FALLBACK_META;
}

function humanAction(action: string): string {
    const meta = ACTION_META[action];
    if (meta) return meta.label;
    return action.split(".").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// ── Filter Bar ────────────────────────────────────────────────────────────────

const ACTION_OPTIONS = [
    { value: "", label: "All Actions" },
    { value: "asset.created",       label: "Asset Added" },
    { value: "asset.updated",       label: "Asset Updated" },
    { value: "asset.deleted",       label: "Asset Deleted" },
    { value: "beneficiary.added",   label: "Beneficiary Added" },
    { value: "beneficiary.removed", label: "Beneficiary Removed" },
    { value: "will.generated",      label: "Will Generated" },
    { value: "2fa.enabled",         label: "2FA Enabled" },
    { value: "2fa.disabled",        label: "2FA Disabled" },
    { value: "session.revoked",     label: "Session Revoked" },
    { value: "vault.exported",      label: "Vault Exported" },
    { value: "login.success",       label: "Login" },
    { value: "password.changed",    label: "Password Changed" },
];

interface Filters {
    search: string;
    action: string;
    startDate: string;
    endDate: string;
}

function FilterBar({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
    return (
        <div className="bg-ivory rounded-2xl p-4 border border-oat-border">
            <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[160px]">
                    <label className="block text-xs font-medium text-olive-gray mb-1.5">Search</label>
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-olive-gray pointer-events-none" />
                        <Input
                            placeholder="Entity type…"
                            value={filters.search}
                            onChange={e => onChange({ ...filters, search: e.target.value })}
                            className="pl-8"
                        />
                    </div>
                </div>

                <div className="min-w-[180px]">
                    <label className="block text-xs font-medium text-olive-gray mb-1.5">Action Type</label>
                    <select
                        value={filters.action}
                        onChange={e => onChange({ ...filters, action: e.target.value })}
                        className="flex h-9 w-full rounded-lg border border-oat-border bg-ivory px-3 py-2 text-sm text-near-black focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                    >
                        {ACTION_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-olive-gray mb-1.5">From</label>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={e => onChange({ ...filters, startDate: e.target.value })}
                        className="flex h-9 rounded-lg border border-oat-border bg-ivory px-3 py-2 text-sm text-near-black focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-olive-gray mb-1.5">To</label>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={e => onChange({ ...filters, endDate: e.target.value })}
                        className="flex h-9 rounded-lg border border-oat-border bg-ivory px-3 py-2 text-sm text-near-black focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                    />
                </div>

                {(filters.search || filters.action || filters.startDate || filters.endDate) && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onChange({ search: "", action: "", startDate: "", endDate: "" })}
                        className="self-end text-xs"
                    >
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}

// ── Activity Table ────────────────────────────────────────────────────────────

function ActivityTable({ logs, loading }: { logs: ActivityLog[]; loading: boolean }) {
    if (loading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-ivory rounded-xl border border-oat-border">
                        <Skeleton className="w-20 h-5 rounded-full shrink-0" />
                        <Skeleton className="flex-1 h-4" />
                        <Skeleton className="w-24 h-4 shrink-0" />
                        <Skeleton className="w-28 h-4 shrink-0" />
                    </div>
                ))}
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 bg-ivory rounded-2xl border border-dashed border-oat-border">
                <ActivityIcon className="w-8 h-8 text-olive-gray/40 mb-3" />
                <p className="text-sm text-olive-gray">No activity matching your filters.</p>
            </div>
        );
    }

    return (
        <div className="bg-ivory rounded-2xl border border-oat-border overflow-hidden">
            {/* Header */}
            <div className="hidden sm:grid grid-cols-[1fr_2fr_1fr_1fr] gap-4 px-4 py-3 border-b border-oat-border bg-parchment">
                <span className="text-xs font-semibold text-olive-gray uppercase tracking-wider">Action</span>
                <span className="text-xs font-semibold text-olive-gray uppercase tracking-wider">Affected Item</span>
                <span className="text-xs font-semibold text-olive-gray uppercase tracking-wider">IP Address</span>
                <span className="text-xs font-semibold text-olive-gray uppercase tracking-wider">Timestamp</span>
            </div>

            <div className="divide-y divide-oat-border">
                {logs.map(log => {
                    const meta = getActionMeta(log.action);
                    const affected = log.entity_type
                        ? `${log.entity_type.charAt(0).toUpperCase() + log.entity_type.slice(1)}${log.entity_id ? ` · ${log.entity_id.slice(0, 8)}…` : ""}`
                        : "—";

                    return (
                        <div key={log.id} className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_1fr_1fr] gap-2 sm:gap-4 px-4 py-3 hover:bg-parchment/50 transition-colors">
                            <div>
                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${meta.color}`}>
                                    {meta.icon}
                                    {humanAction(log.action)}
                                </span>
                            </div>
                            <p className="text-sm text-near-black self-center truncate">{affected}</p>
                            <p className="text-xs text-olive-gray self-center font-mono">{log.ip_address ?? "—"}</p>
                            <p className="text-xs text-olive-gray self-center">
                                {format(parseISO(log.created_at), "d MMM yyyy, HH:mm")}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ page, total, limit, onChange }: { page: number; total: number; limit: number; onChange: (p: number) => void }) {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between">
            <p className="text-xs text-olive-gray">
                Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
                <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
                    <ChevronLeftIcon className="w-3.5 h-3.5" />
                </Button>
                <span className="text-xs text-near-black px-3">
                    {page} / {totalPages}
                </span>
                <Button variant="outline" size="icon-sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ActivityLogPage() {
    const [filters, setFilters] = useState<Filters>({ search: "", action: "", startDate: "", endDate: "" });
    const [page, setPage] = useState(1);
    const [result, setResult] = useState<ActivityResponse>({ logs: [], total: 0, page: 1, limit: 50 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchLogs = useCallback(async (f: Filters, p: number) => {
        setLoading(true); setError("");
        try {
            const params = new URLSearchParams({ page: String(p), limit: "50" });
            if (f.action)    params.set("action", f.action);
            if (f.startDate) params.set("start_date", f.startDate);
            if (f.endDate)   params.set("end_date", f.endDate);
            if (f.search)    params.set("search", f.search);

            const res = await fetch(`${API}/api/activity?${params}`, {
                headers: { "Authorization": `Bearer ${getToken()}` },
            });
            if (!res.ok) throw new Error("Failed to load activity");
            setResult(await res.json());
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounce filter changes
    useEffect(() => {
        const t = setTimeout(() => { setPage(1); fetchLogs(filters, 1); }, 300);
        return () => clearTimeout(t);
    }, [filters, fetchLogs]);

    useEffect(() => { fetchLogs(filters, page); }, [page]); // eslint-disable-line

    function handleFilterChange(f: Filters) {
        setFilters(f);
    }

    function handlePageChange(p: number) {
        setPage(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <div className="space-y-5 max-w-5xl mx-auto pb-12">
            <header className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-near-black">Activity Log</h1>
                <p className="text-olive-gray mt-2">Full audit trail of every action in your vault.</p>
            </header>

            <FilterBar filters={filters} onChange={handleFilterChange} />

            {error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
            ) : (
                <>
                    <div className="flex items-center justify-between px-1">
                        <p className="text-xs text-olive-gray">
                            {loading ? "Loading…" : `${result.total} event${result.total !== 1 ? "s" : ""}`}
                        </p>
                    </div>

                    <ActivityTable logs={result.logs} loading={loading} />

                    <Pagination
                        page={page}
                        total={result.total}
                        limit={result.limit}
                        onChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
}
