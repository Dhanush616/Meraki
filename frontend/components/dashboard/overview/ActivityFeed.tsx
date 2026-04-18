"use client";
import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityIcon, ChevronRightIcon } from "lucide-react";
import type { ActivityLog } from "@/hooks/useVaultSummary";

interface Props { activities: ActivityLog[]; isLoading: boolean; }

export function ActivityFeed({ activities, isLoading }: Props) {
    if (isLoading) {
        return (
            <div className="space-y-4 px-6 py-4">
                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="p-12 text-center">
                <p className="text-muted-foreground text-sm">No activity recorded yet.</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-border">
            {activities.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <ActivityIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground capitalize">
                                {log.action.replace(/\./g, " ").replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {log.entity_type} {Object.values(log.metadata || {})[0] ? `• ${String(Object.values(log.metadata || {})[0])}` : ""}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </p>
                    </div>
                </div>
            ))}
            <Link 
                href="/dashboard/activity" 
                className="flex items-center justify-center w-full py-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all border-t border-border"
            >
                View Audit Trail <ChevronRightIcon className="w-3 h-3 ml-1" />
            </Link>
        </div>
    );
}
