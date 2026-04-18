"use client";
import Link from "next/link";
import { ActivityIcon } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActivityLog } from "@/hooks/useVaultSummary";

function formatAction(action: string) {
    return action.split(".").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function timeAgo(iso: string) {
    try { return formatDistanceToNow(parseISO(iso), { addSuffix: true }); }
    catch { return iso; }
}

interface Props { activities: ActivityLog[]; isLoading: boolean; }

export function ActivityFeed({ activities, isLoading }: Props) {
    return (
        <div className="bg-card rounded-2xl p-5 border border-oat-border">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <ActivityIcon className="w-4 h-4" /> Recent Activity
                </h3>
                <Link href="/dashboard/activity" className="text-xs text-primary hover:underline font-medium">View all</Link>
            </div>
            {isLoading ? (
                <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="flex gap-3 items-start">
                            <Skeleton className="w-2 h-2 mt-1.5 rounded-full shrink-0" />
                            <div className="flex-1 space-y-1.5">
                                <Skeleton className="h-3 w-3/4" />
                                <Skeleton className="h-3 w-1/3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : activities.length > 0 ? (
                <div className="space-y-3">
                    {activities.map((log) => (
                        <div key={log.id} className="flex gap-3 text-sm">
                            <div className="w-2 h-2 mt-1.5 rounded-full bg-oat-border shrink-0" />
                            <div>
                                <p className="text-foreground font-medium">{formatAction(log.action)}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(log.created_at)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground py-4 text-center bg-background rounded-lg border border-dashed border-oat-border">
                    No activity yet.
                </p>
            )}
        </div>
    );
}
