"use client";
import React from "react";
import Link from "next/link";
import { ShieldCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    iconClassName?: string;
    textClassName?: string;
    href?: string;
}

export function Logo({ className, iconClassName, textClassName, href = "/" }: LogoProps) {
    const content = (
        <div className={cn("flex items-center gap-2.5 group transition-all", className)}>
            <div className={cn(
                "w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300",
                iconClassName
            )}>
                <ShieldCheckIcon className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className={cn(
                "font-sans text-xl font-bold tracking-tight text-foreground",
                textClassName
            )}>
                Paradosis
            </span>
        </div>
    );

    if (href) {
        return (
            <Link href={href}>
                {content}
            </Link>
        );
    }

    return content;
}
