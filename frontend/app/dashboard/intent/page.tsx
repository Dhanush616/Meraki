"use client";

import React from "react";
import { VideoIcon } from "lucide-react";

export default function IntentDeclarationPage() {
    return (
        <div className="p-6 md:p-10 space-y-12 max-w-7xl mx-auto pb-20">
            <header className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-ube-100 text-ube-800 shadow-sm border-2 border-ube-200">
                        <VideoIcon className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">Intent Declaration</h1>
                </div>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Record a video will or write a personal message to your beneficiaries.
                </p>
            </header>

            <div className="p-20 border-2 border-dashed border-muted rounded-3xl text-center">
                <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">The AI Video Will and Intent Declaration module is currently under development.</p>
            </div>
        </div>
    );
}
