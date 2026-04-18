"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRightIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CIRCUMFERENCE = 2 * Math.PI * 56;

function healthLabel(score: number) {
    if (score > 70) return "Good";
    if (score > 40) return "Fair";
    return "Poor";
}

function healthColors(score: number) {
    if (score > 70) return { text: "text-emerald-500", stroke: "stroke-emerald-500", bg: "bg-emerald-50", badge: "text-emerald-700" };
    if (score > 40) return { text: "text-amber-500",  stroke: "stroke-amber-500",  bg: "bg-amber-50",   badge: "text-amber-700" };
    return           { text: "text-rose-500",   stroke: "stroke-rose-500",   bg: "bg-rose-50",    badge: "text-rose-700" };
}

interface Props { score: number; isLoading: boolean; }

export function VaultHealthRing({ score, isLoading }: Props) {
    const colors = healthColors(score);
    return (
        <Link href="/dashboard/health" className="col-span-1 bg-card rounded-2xl p-6 border border-oat-border shadow-sm hover:shadow-md transition-shadow group flex flex-col">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center justify-between mb-4">
                Vault Health
                <ChevronRightIcon className="w-4 h-4 group-hover:text-primary transition-colors" />
            </h3>
            {isLoading ? (
                <div className="flex flex-col items-center py-4 gap-4">
                    <Skeleton className="w-32 h-32 rounded-full" />
                    <Skeleton className="w-16 h-5 rounded-full" />
                </div>
            ) : (
                <div className="flex flex-col items-center py-4">
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                            <circle cx="64" cy="64" r="56" className="stroke-parchment fill-none" strokeWidth="12" />
                            <motion.circle
                                cx="64" cy="64" r="56"
                                className={`${colors.stroke} fill-none`}
                                strokeWidth="12"
                                strokeDasharray={CIRCUMFERENCE}
                                initial={{ strokeDashoffset: CIRCUMFERENCE }}
                                animate={{ strokeDashoffset: CIRCUMFERENCE - (CIRCUMFERENCE * score) / 100 }}
                                transition={{ duration: 1.4, ease: "easeOut" }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.span className={`text-3xl font-bold font-sans ${colors.text}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                                {score}
                            </motion.span>
                        </div>
                    </div>
                    <span className={`mt-3 text-xs font-semibold px-3 py-1 rounded-full ${colors.bg} ${colors.badge}`}>
                        {healthLabel(score)}
                    </span>
                    <p className="text-xs text-muted-foreground mt-3 text-center">Click to see full breakdown</p>
                </div>
            )}
        </Link>
    );
}
