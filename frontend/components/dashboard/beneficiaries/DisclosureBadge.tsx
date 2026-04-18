"use client";
import React from "react";

type DisclosureLevel = "total_secrecy" | "partial_awareness" | "full_transparency";

interface DisclosureBadgeProps {
    level: DisclosureLevel;
    compact?: boolean;
}

const CONFIG: Record<DisclosureLevel, { label: string; dotColor: string; bgColor: string; textColor: string }> = {
    total_secrecy: {
        label: "Total Secrecy",
        dotColor: "bg-red-500",
        bgColor: "bg-red-500/10",
        textColor: "text-red-700 dark:text-red-400",
    },
    partial_awareness: {
        label: "Partial Awareness",
        dotColor: "bg-amber-500",
        bgColor: "bg-amber-500/10",
        textColor: "text-amber-700 dark:text-amber-400",
    },
    full_transparency: {
        label: "Full Transparency",
        dotColor: "bg-emerald-500",
        bgColor: "bg-emerald-500/10",
        textColor: "text-emerald-700 dark:text-emerald-400",
    },
};

export function DisclosureBadge({ level, compact = false }: DisclosureBadgeProps) {
    const cfg = CONFIG[level] ?? CONFIG.total_secrecy;

    if (compact) {
        return (
            <span
                title={cfg.label}
                className={`inline-block w-2.5 h-2.5 rounded-full ${cfg.dotColor} ring-2 ring-background`}
            />
        );
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bgColor} ${cfg.textColor} transition-colors`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
            {cfg.label}
        </span>
    );
}
