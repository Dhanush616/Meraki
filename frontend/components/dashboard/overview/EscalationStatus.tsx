"use client";
import Link from "next/link";
import { ShieldCheckIcon, CalendarIcon, ArrowRightIcon } from "lucide-react";
import { addDays, format, parseISO, isValid } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface LevelInfo {
    label: string;
    badgeClass: string;
    iconClass: string;
}

const LEVEL_INFO: Record<string, LevelInfo> = {
    level_0_normal:             { label: "All Clear",          badgeClass: "bg-muted text-foreground border-border",  iconClass: "text-foreground" },
    level_1_concern:            { label: "Concern",            badgeClass: "bg-muted text-muted-foreground border-border",        iconClass: "text-muted-foreground" },
    level_2_alert:              { label: "Alert",              badgeClass: "bg-muted text-muted-foreground border-border",        iconClass: "text-muted-foreground" },
    level_3_suspected_death:    { label: "Suspected Death",    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",           iconClass: "text-destructive" },
    level_4_death_claimed:      { label: "Death Claimed",      badgeClass: "bg-destructive/10 text-destructive border-destructive/20",           iconClass: "text-destructive" },
    level_5_executed:           { label: "Vault Executed",     badgeClass: "bg-muted text-muted-foreground border-border",          iconClass: "text-muted-foreground" },
};

function formatDate(iso: string | null): string {
    if (!iso) return "Never";
    try {
        const d = parseISO(iso);
        return isValid(d) ? format(d, "d MMM yyyy") : "—";
    } catch {
        return "—";
    }
}

function nextCheckInDate(lastCheckIn: string | null, frequencyDays: number): string {
    if (!lastCheckIn) return "—";
    try {
        const base = parseISO(lastCheckIn);
        if (!isValid(base)) return "—";
        return format(addDays(base, frequencyDays), "d MMM yyyy");
    } catch {
        return "—";
    }
}

interface Props {
    level: string;
    lastCheckIn: string | null;
    checkInFrequencyDays: number;
    isLoading: boolean;
}

export function EscalationStatus({ level, lastCheckIn, checkInFrequencyDays, isLoading }: Props) {
    const info = LEVEL_INFO[level] ?? LEVEL_INFO.level_0_normal;

    return (
        <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-5">
                <ShieldCheckIcon className={`w-4 h-4 ${info.iconClass}`} /> Escalation Status
            </h3>

            {isLoading ? (
                <div className="space-y-3">
                    <Skeleton className="h-14 rounded-lg" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-40" />
                </div>
            ) : (
                <>
                    <div className={`flex items-center justify-between p-4 rounded-lg border mb-4 ${info.badgeClass}`}>
                        <div>
                            <p className="text-[10px] opacity-70 uppercase tracking-wider font-bold mb-1">Current State</p>
                            <p className="text-xl font-bold tracking-tight">{info.label}</p>
                        </div>
                        <ShieldCheckIcon className={`w-8 h-8 opacity-40`} />
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-foreground">
                            <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span>Last check-in: <strong className="font-semibold">{formatDate(lastCheckIn)}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground">
                            <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span>Next check-in: <strong className="font-semibold">{nextCheckInDate(lastCheckIn, checkInFrequencyDays)}</strong></span>
                        </div>
                    </div>

                    <Link
                        href="/dashboard/escalation"
                        className="mt-5 flex items-center gap-1 text-xs text-primary font-semibold uppercase tracking-wider hover:underline"
                    >
                        Configure monitoring <ArrowRightIcon className="w-3 h-3" />
                    </Link>
                </>
            )}
        </div>
    );
}
