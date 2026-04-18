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
    Search
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ActionIcon = ({ action }: { action: string }) => {
    if (action.includes("created") || action.includes("added")) return <PlusCircle className="w-4 h-4 text-matcha-600" />;
    if (action.includes("updated") || action.includes("changed")) return <RefreshCcw className="w-4 h-4 text-slushie-600" />;
    if (action.includes("deleted") || action.includes("removed")) return <Trash2 className="w-4 h-4 text-pomegranate-400" />;
    if (action.includes("escalation")) return <AlertTriangle className="w-4 h-4 text-lemon-600" />;
    return <Activity className="w-4 h-4 text-muted-foreground" />;
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
        <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-matcha-100 text-matcha-700 shadow-sm border-2 border-matcha-200">
                            <Activity className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">Activity Log</h1>
                    </div>
                    <p className="text-muted-foreground text-lg max-w-2xl font-sans">
                        A real-time audit trail of all actions performed in your vault.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search activity..." 
                            className="pl-10 h-11 border-2 border-oat-border bg-white rounded-xl focus:ring-matcha-500"
                        />
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={() => refresh()}
                        className="h-11 border-2 border-oat-border px-5 rounded-xl bg-white hover:bg-oat-light transition-all"
                    >
                        Refresh
                    </Button>
                </div>
            </header>

            {/* Table Area */}
            <div className="bg-white border-2 border-oat-border rounded-3xl overflow-hidden shadow-clay">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-oat-light/50 border-b-2 border-oat-border">
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Action</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Resource</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Details</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y border-oat-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <Loader2 className="w-10 h-10 text-matcha-600 animate-spin mx-auto" />
                                        <p className="mt-4 text-muted-foreground font-medium">Loading audit trail...</p>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                        <p className="text-xl font-bold text-foreground">No activity found</p>
                                        <p className="text-muted-foreground mt-2">Actions like adding assets or updating beneficiaries will appear here.</p>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-oat-light/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-background border border-oat-border group-hover:border-matcha-200 group-hover:bg-matcha-50 transition-all">
                                                    <ActionIcon action={log.action} />
                                                </div>
                                                <span className="font-bold text-foreground">{getActionLabel(log.action)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="text-muted-foreground">
                                                    <EntityIcon type={log.entity_type || ""} />
                                                </div>
                                                <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 border-oat-border">
                                                    {log.entity_type || "System"}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="max-w-xs truncate text-sm text-muted-foreground font-medium">
                                                {Object.entries(log.metadata || {}).map(([key, value]) => (
                                                    <span key={key} className="mr-3">
                                                        <span className="text-xs uppercase text-muted-foreground/60 mr-1">{key}:</span>
                                                        <span className="text-foreground">{String(value)}</span>
                                                    </span>
                                                ))}
                                                {Object.keys(log.metadata || {}).length === 0 && (
                                                    <span className="italic opacity-50">No additional details</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-medium text-foreground">
                                                {format(new Date(log.created_at), "MMM d, yyyy")}
                                            </div>
                                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                                                {format(new Date(log.created_at), "HH:mm:ss O")}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Stat */}
            {!loading && logs.length > 0 && (
                <div className="flex justify-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-black bg-oat-light px-4 py-2 rounded-full border border-oat-border">
                        End of Log · Total Events: {logs.length}
                    </p>
                </div>
            )}
        </div>
    );
}
