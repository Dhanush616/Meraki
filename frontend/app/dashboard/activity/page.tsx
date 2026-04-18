"use client";

import React from "react";
import { useActivityLog } from "@/hooks/useActivityLog";
import { 
    Activity, 
    PlusCircle, 
    RefreshCcw, 
    Trash2, 
    AlertTriangle, 
    User, 
    ShieldCheck, 
    FileText,
    Wallet,
    Loader2,
    Search,
    ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ActionIcon = ({ action }: { action: string }) => {
    // Grayscale icons for consistent Bento feel
    if (action.includes("created") || action.includes("added")) return <PlusCircle className="w-4 h-4 text-black" />;
    if (action.includes("updated") || action.includes("changed")) return <RefreshCcw className="w-4 h-4 text-black" />;
    if (action.includes("deleted") || action.includes("removed")) return <Trash2 className="w-4 h-4 text-zinc-400" />;
    if (action.includes("escalation")) return <AlertTriangle className="w-4 h-4 text-black" />;
    return <Activity className="w-4 h-4 text-zinc-400" />;
};

const EntityIcon = ({ type }: { type: string }) => {
    switch (type) {
        case "asset": return <Wallet className="w-4 h-4" />;
        case "beneficiary": return <User className="w-4 h-4" />;
        case "escalation": return <ShieldCheck className="w-4 h-4" />;
        case "document": return <FileText className="w-4 h-4" />;
        default: return <Activity className="w-4 h-4" />;
    }
};

export default function ActivityLogPage() {
    const { logs, loading, error, refresh } = useActivityLog();

    const getActionLabel = (action: string) => {
        return action.split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto pb-20">
            {/* Standard Header - Single Column Style */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-black text-white">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold text-foreground tracking-tight uppercase">Audit_Trail</h1>
                    </div>
                    <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
                        Full telemetry of secure vault operations.
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="relative w-48 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input 
                            placeholder="Filter events..." 
                            className="pl-9 h-9 border rounded-lg bg-background text-xs focus:ring-black/5"
                        />
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => refresh()}
                        className="h-9 border rounded-lg px-4 text-xs font-bold uppercase tracking-widest hover:bg-muted"
                    >
                        Sync
                    </Button>
                </div>
            </header>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                    TELEMETRY_ERROR: {error}
                </div>
            )}

            <div className="space-y-6">
                 <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] px-1">
                    // Historical_Logs
                </h2>

                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/30 border-b border-border">
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Action</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Resource</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Details</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center">
                                            <Loader2 className="w-6 h-6 text-black animate-spin mx-auto" />
                                            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fetching_Data...</p>
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center">
                                            <Activity className="w-8 h-8 text-muted-foreground/20 mx-auto mb-4" />
                                            <p className="text-xs font-bold text-foreground uppercase tracking-widest">No_Active_Logs</p>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-muted/20 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-black border border-border group-hover:bg-black group-hover:text-white transition-all">
                                                        <ActionIcon action={log.action} />
                                                    </div>
                                                    <span className="text-xs font-bold text-black uppercase tracking-tight">{getActionLabel(log.action).replace(' ', '_')}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-muted-foreground">
                                                        <EntityIcon type={log.entity_type || ""} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                        {log.entity_type || "SYSTEM"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs truncate text-[10px] text-zinc-500 font-bold uppercase tracking-tight">
                                                    {Object.entries(log.metadata || {}).map(([key, value]) => (
                                                        <span key={key} className="mr-3">
                                                            <span className="opacity-40 mr-1">{key}:</span>
                                                            <span className="text-black">{String(value)}</span>
                                                        </span>
                                                    ))}
                                                    {Object.keys(log.metadata || {}).length === 0 && (
                                                        <span className="opacity-30 italic">NONE</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-[10px] font-mono font-black text-black">
                                                    {format(new Date(log.created_at), "dd.MM.yy HH:mm")}
                                                </div>
                                                <div className="text-[8px] uppercase tracking-tighter text-zinc-400 font-bold">
                                                    UTC_{format(new Date(log.created_at), "O").replace('GMT', '')}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {!loading && logs.length > 0 && (
                    <div className="flex justify-center pt-4">
                        <div className="px-4 py-2 rounded-full border border-border bg-muted/30 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
                            Telemetry_End <span className="mx-2 opacity-20">|</span> Total_Events: {logs.length}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
