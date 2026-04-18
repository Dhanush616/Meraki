"use client";
import Link from "next/link";
import { UsersIcon, AlertCircleIcon, ChevronRightIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
    count: number;
    hasUnassignedAssets: boolean;
    isLoading: boolean;
}

export function BeneficiarySummary({ count, hasUnassignedAssets, isLoading }: Props) {
    if (isLoading) return <Skeleton className="h-32 w-full rounded-xl" />;

    return (
        <Link
            href="/dashboard/beneficiaries"
            className="bg-card border border-border rounded-xl p-6 hover:bg-muted/50 transition-all shadow-sm group flex flex-col justify-between"
        >
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-muted text-foreground flex items-center justify-center">
                        <UsersIcon className="w-5 h-5" />
                    </div>
                    {hasUnassignedAssets && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold bg-muted border border-border uppercase tracking-wider">
                            <AlertCircleIcon className="w-3 h-3 text-foreground" /> Alert
                        </span>
                    )}
                </div>
                <h3 className="text-3xl font-bold text-foreground leading-none">{count}</h3>
                <p className="text-muted-foreground text-sm font-medium mt-1">Beneficiaries</p>
            </div>
            
            <div className="mt-6 flex items-center text-xs font-semibold text-foreground group-hover:translate-x-1 transition-transform uppercase tracking-wider">
                Manage Network <ChevronRightIcon className="w-3.5 h-3.5 ml-1" />
            </div>
        </Link>
    );
}
