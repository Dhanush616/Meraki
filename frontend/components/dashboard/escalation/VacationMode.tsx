"use client";
import React, { useState, useEffect } from "react";
import {
    PalmtreeIcon, AlertTriangleIcon, Loader2Icon,
    CalendarIcon, XIcon, CheckCircleIcon,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface VacationModeProps {
    isActive: boolean;
    startDate: string | null;
    endDate: string | null;
    onActivate: (startDate: string, endDate: string) => Promise<void>;
    onDeactivate: () => Promise<void>;
}

function formatDate(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function daysBetween(start: string, end: string) {
    const s = new Date(start);
    const e = new Date(end);
    return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

export function VacationMode({
    isActive,
    startDate,
    endDate,
    onActivate,
    onDeactivate,
}: VacationModeProps) {
    const today = new Date().toISOString().split("T")[0];
    const [localStart, setLocalStart] = useState(startDate?.split("T")[0] ?? today);
    const [localEnd, setLocalEnd] = useState(
        endDate?.split("T")[0] ?? new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
    );
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (startDate) setLocalStart(startDate.split("T")[0]);
        if (endDate) setLocalEnd(endDate.split("T")[0]);
    }, [startDate, endDate]);

    const duration = daysBetween(localStart, localEnd);
    const tooLong = duration > 180;
    const invalidRange = duration < 1;

    const handleToggle = async (checked: boolean) => {
        setIsSaving(true);
        setError(null);
        try {
            if (checked) {
                if (invalidRange) {
                    setError("End date must be after start date.");
                    return;
                }
                await onActivate(localStart, localEnd);
            } else {
                await onDeactivate();
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Vacation Mode</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Pause all check-ins while you&apos;re away.
                    </p>
                </div>
                {isActive && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                        <PalmtreeIcon className="w-3.5 h-3.5" /> Active
                    </span>
                )}
            </div>

            <div className="px-6 py-5 space-y-4">
                {/* Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background">
                    <div className="flex items-center gap-3">
                        <PalmtreeIcon className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {isActive ? "Vacation mode is on" : "Enable vacation mode"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {isActive
                                    ? `${formatDate(startDate)} — ${formatDate(endDate)}`
                                    : "All check-ins and escalations will be paused."}
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={isActive}
                        onCheckedChange={handleToggle}
                        disabled={isSaving}
                    />
                </div>

                {/* Date pickers — show only when not active (configuring) or active (viewing) */}
                {!isActive && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" /> Start Date
                            </label>
                            <input
                                type="date"
                                value={localStart}
                                min={today}
                                onChange={(e) => setLocalStart(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" /> End Date
                            </label>
                            <input
                                type="date"
                                value={localEnd}
                                min={localStart}
                                onChange={(e) => setLocalEnd(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                            />
                        </div>
                    </div>
                )}

                {/* Duration badge */}
                {!isActive && !invalidRange && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">{duration} days</span>
                        {tooLong && (
                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                <AlertTriangleIcon className="w-3 h-3" />
                                Exceeds 180-day recommended limit
                            </span>
                        )}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs">
                        <XIcon className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {error}
                    </div>
                )}

                {/* Active state info */}
                {isActive && (
                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs">
                        <CheckCircleIcon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>
                            All check-ins are paused until <span className="font-semibold">{formatDate(endDate)}</span>.
                            Toggle off to resume monitoring.
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
