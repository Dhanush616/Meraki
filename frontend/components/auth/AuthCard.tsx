"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export function AuthCard({
    children,
    title,
    description,
    headerLogo = true,
    backLink,
}: {
    children: React.ReactNode;
    title: string;
    description?: string;
    headerLogo?: boolean;
    backLink?: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-[420px] mx-auto"
        >
            <div className="flex flex-col items-center mb-8 text-center">
                {backLink && (
                    <div className="mb-4 w-full flex justify-start">
                        {backLink}
                    </div>
                )}
                {headerLogo && (
                    <Link href="/" className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                            <span className="w-4 h-4 bg-card rounded-full"></span>
                        </div>
                        <span className="font-sans text-3xl font-bold text-foreground">Paradosis</span>
                    </Link>
                )}
                <h1 className={`${headerLogo ? 'mt-6' : ''} text-2xl font-sans text-foreground`}>{title}</h1>
                {description && <p className="text-muted-foreground font-sans mt-2">{description}</p>}
            </div>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                {children}
            </div>
        </motion.div>
    );
}
