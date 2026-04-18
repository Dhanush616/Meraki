"use client";
import Link from "next/link";
import { UsersIcon, AlertCircleIcon, ArrowRightIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
    count: number;
    hasUnassignedAssets: boolean;
    isLoading: boolean;
}

export function BeneficiarySummary({ count, hasUnassignedAssets, isLoading }: Props) {
    return (
        <Link
            href="/dashboard/beneficiaries"
            className="bg-card rounded-lg p-6 border border-border hover:bg-muted/30 transition-colors group flex flex-col justify-between"
        >
            {isLoading ? (
                <div className="space-y-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="w-12 h-8" />
                    <Skeleton className="w-24 h-4" />
                </div>
            ) : (
                <>
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <UsersIcon className="w-4 h-4" /> Beneficiaries
                            </h3>
                            {hasUnassignedAssets && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-foreground text-background">
                                    <AlertCircleIcon className="w-3 h-3" /> Backup needed
                                </span>
                            )}
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight text-foreground mb-1">{count}</h3>
                        <p className="text-muted-foreground text-xs mt-1">Total people assigned</p>
                    </div>
                    <div className="mt-6 flex items-center text-xs text-primary font-semibold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                        Manage People <ArrowRightIcon className="w-3 h-3 ml-1" />
                    </div>
                </>
            )}
        </Link>
    );
}
