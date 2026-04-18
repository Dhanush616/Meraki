"use client";
import Link from "next/link";
import { ShieldCheckIcon, CalendarIcon, ChevronRightIcon } from "lucide-react";
import { addDays, format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const LEVEL_INFO: Record<string, string> = {
    level_0_normal:             "Normal",
    level_1_concern:            "Concern",
    level_2_alert:              "Alert",
    level_3_suspected_death:    "Verification",
    level_4_death_claimed:      "Execution",
    level_5_executed:           "Executed",
};

interface Props {
    level: string;
    lastCheckIn: string | null;
    checkInFrequencyDays: number;
    isLoading: boolean;
}

export function EscalationStatus({ level, lastCheckIn, checkInFrequencyDays, isLoading }: Props) {
    const label = LEVEL_INFO[level] ?? "Normal";

    if (isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground uppercase tracking-wider mb-6">
                <ShieldCheckIcon className="w-4 h-4" />
                Escalation Status
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border border-border">
                    <span className="text-xs text-muted-foreground font-medium">Protection Level</span>
                    <span className="text-sm font-bold text-foreground">{label}</span>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                            <CalendarIcon className="w-3 h-3" /> Last check-in
                        </span>
                        <span className="font-semibold text-foreground">
                            {lastCheckIn ? format(parseISO(lastCheckIn), "MMM d, yyyy") : "Never"}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                            <CalendarIcon className="w-3 h-3" /> Next due
                        </span>
                        <span className="font-semibold text-foreground">
                            {lastCheckIn ? format(addDays(parseISO(lastCheckIn), checkInFrequencyDays), "MMM d, yyyy") : "Pending"}
                        </span>
                    </div>
                </div>
            </div>

            <Link href="/dashboard/escalation" className="mt-6 flex items-center text-xs font-semibold text-foreground hover:translate-x-1 transition-transform uppercase tracking-wider">
                Configure Protocol <ChevronRightIcon className="w-3.5 h-3.5 ml-1" />
            </Link>
        </div>
    );
}
