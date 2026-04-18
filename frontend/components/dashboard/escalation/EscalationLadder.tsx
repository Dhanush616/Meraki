"use client";
import React from "react";
import {
    CheckCircleIcon, AlertTriangleIcon, ShieldAlertIcon,
    SkullIcon, PackageOpenIcon, HeartPulseIcon,
} from "lucide-react";

interface EscalationLadderProps {
    currentLevel: string;
}

const LEVELS = [
    {
        id: "level_0_normal",
        label: "Level 0 — Normal",
        icon: CheckCircleIcon,
        color: "emerald",
        trigger: "No issues detected",
        action: "Regular monitoring active. Check-ins sent per your schedule.",
    },
    {
        id: "level_1_concern",
        label: "Level 1 — Concern",
        icon: HeartPulseIcon,
        color: "amber",
        trigger: "Missed check-in or prolonged inactivity",
        action: "Increased check-in frequency. Email reminders sent.",
    },
    {
        id: "level_2_alert",
        label: "Level 2 — Alert",
        icon: AlertTriangleIcon,
        color: "orange",
        trigger: "Multiple missed check-ins, no login activity",
        action: "Emergency contact notified to verify your status.",
    },
    {
        id: "level_3_suspected_death",
        label: "Level 3 — Suspected Death",
        icon: ShieldAlertIcon,
        color: "red",
        trigger: "Emergency contact cannot reach you",
        action: "Beneficiaries notified. Death certificate submission opens.",
    },
    {
        id: "level_4_death_claimed",
        label: "Level 4 — Death Claimed",
        icon: SkullIcon,
        color: "red",
        trigger: "Death certificate submitted and verified",
        action: "15-day liveness window. Final 'Are you alive?' emails sent.",
    },
    {
        id: "level_5_executed",
        label: "Level 5 — Executed",
        icon: PackageOpenIcon,
        color: "neutral",
        trigger: "Liveness window expired with no response",
        action: "Vault unlocked. Execution packages delivered to beneficiaries.",
    },
];

const LEVEL_ORDER = LEVELS.map((l) => l.id);

function getColorClasses(color: string, isActive: boolean, isPast: boolean) {
    if (!isActive && !isPast)
        return {
            dot: "bg-border",
            line: "bg-border",
            bg: "bg-transparent",
            text: "text-muted-foreground",
            icon: "text-muted-foreground/50",
        };

    const map: Record<string, { dot: string; line: string; bg: string; text: string; icon: string }> = {
        emerald: {
            dot: "bg-emerald-500",
            line: "bg-emerald-500/40",
            bg: "bg-emerald-500/5",
            text: "text-emerald-700 dark:text-emerald-400",
            icon: "text-emerald-600 dark:text-emerald-400",
        },
        amber: {
            dot: "bg-amber-500",
            line: "bg-amber-500/40",
            bg: "bg-amber-500/5",
            text: "text-amber-700 dark:text-amber-400",
            icon: "text-amber-600 dark:text-amber-400",
        },
        orange: {
            dot: "bg-orange-500",
            line: "bg-orange-500/40",
            bg: "bg-orange-500/5",
            text: "text-orange-700 dark:text-orange-400",
            icon: "text-orange-600 dark:text-orange-400",
        },
        red: {
            dot: "bg-red-500",
            line: "bg-red-500/40",
            bg: "bg-red-500/5",
            text: "text-red-700 dark:text-red-400",
            icon: "text-red-600 dark:text-red-400",
        },
        neutral: {
            dot: "bg-foreground",
            line: "bg-foreground/40",
            bg: "bg-foreground/5",
            text: "text-foreground",
            icon: "text-foreground",
        },
    };

    return map[color] ?? map.neutral;
}

export function EscalationLadder({ currentLevel }: EscalationLadderProps) {
    const currentIdx = LEVEL_ORDER.indexOf(currentLevel);

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Escalation Ladder</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                    How Paradosis monitors and responds if something seems wrong.
                </p>
            </div>

            <div className="px-6 py-5">
                <div className="relative">
                    {LEVELS.map((level, idx) => {
                        const isActive = idx === currentIdx;
                        const isPast = idx < currentIdx;
                        const isLast = idx === LEVELS.length - 1;
                        const colors = getColorClasses(level.color, isActive, isPast);
                        const Icon = level.icon;

                        return (
                            <div key={level.id} className="relative flex gap-4">
                                {/* Vertical line + dot */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                                            isActive
                                                ? `${colors.dot} ring-4 ring-current/10 shadow-lg`
                                                : isPast
                                                ? colors.dot
                                                : "bg-muted border-2 border-border"
                                        }`}
                                    >
                                        <Icon
                                            className={`w-4 h-4 ${
                                                isActive || isPast ? "text-white" : colors.icon
                                            }`}
                                        />
                                    </div>
                                    {!isLast && (
                                        <div
                                            className={`w-0.5 flex-1 min-h-[2rem] transition-colors duration-500 ${
                                                isPast ? colors.line : "bg-border"
                                            }`}
                                        />
                                    )}
                                </div>

                                {/* Content */}
                                <div
                                    className={`flex-1 pb-6 ${isLast ? "pb-0" : ""}`}
                                >
                                    <div
                                        className={`rounded-xl p-3.5 transition-all duration-500 ${
                                            isActive
                                                ? `${colors.bg} border border-current/10`
                                                : ""
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4
                                                className={`text-sm font-semibold ${
                                                    isActive
                                                        ? colors.text
                                                        : isPast
                                                        ? "text-foreground"
                                                        : "text-muted-foreground"
                                                }`}
                                            >
                                                {level.label}
                                            </h4>
                                            {isActive && (
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors.dot} text-white`}>
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            <span className="font-medium">Trigger:</span> {level.trigger}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            <span className="font-medium">Action:</span> {level.action}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
