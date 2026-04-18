"use client";
import React from "react";
import { AlertTriangleIcon } from "lucide-react";

interface MinorWarningProps {
    trusteeName?: string | null;
}

export function MinorWarning({ trusteeName }: MinorWarningProps) {
    return (
        <div className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
            <AlertTriangleIcon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
                <span className="font-semibold">Minor beneficiary</span>
                {trusteeName ? (
                    <> — assets managed by <span className="font-medium">{trusteeName}</span> until adulthood.</>
                ) : (
                    <> — no trustee assigned. Please assign a trustee.</>
                )}
            </span>
        </div>
    );
}
