"use client";
import Link from "next/link";
import { AlertCircleIcon, ArrowRightIcon } from "lucide-react";

interface Props {
    hasUnassignedAssets: boolean;
    hasOverdueCheckIn: boolean;
}

export function PendingActionBanner({ hasUnassignedAssets, hasOverdueCheckIn }: Props) {
    if (!hasUnassignedAssets && !hasOverdueCheckIn) return null;

    let message = "";
    let link = "";
    
    if (hasUnassignedAssets) {
        message = "You have assets missing beneficiary assignments. This exposes them to default residual routing.";
        link = "/dashboard/vault";
    } else if (hasOverdueCheckIn) {
        message = "Your periodic vault check-in is overdue. Please verify your status to prevent escalation.";
        link = "/dashboard/escalation";
    }

    return (
        <div className="bg-foreground text-background rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-black/5">
            <div className="flex items-center gap-3">
                <AlertCircleIcon className="w-5 h-5 text-background" />
                <p className="text-sm font-medium">{message}</p>
            </div>
            <Link 
                href={link}
                className="shrink-0 bg-background text-foreground text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-2 hover:bg-muted transition-colors"
            >
                Resolve Now <ArrowRightIcon className="w-3 h-3" />
            </Link>
        </div>
    );
}
