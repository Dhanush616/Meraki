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
    return (
        <Link
            href="/dashboard/beneficiaries"
            className="bg-ivory rounded-2xl p-6 border border-oat-border shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
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
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                <UsersIcon className="w-5 h-5" />
                            </div>
                            {hasUnassignedAssets && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                    <AlertCircleIcon className="w-3 h-3" /> Backup needed
                                </span>
                            )}
                        </div>
                        <h3 className="text-3xl font-serif font-bold text-near-black mb-1">{count}</h3>
                        <p className="text-olive-gray text-sm font-medium">Beneficiaries</p>
                    </div>
                    <div className="mt-6 flex items-center text-sm text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                        Manage People <ChevronRightIcon className="w-4 h-4 ml-1" />
                    </div>
                </>
            )}
        </Link>
    );
}
