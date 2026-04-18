"use client";

import React from "react";
import { ShieldCheckIcon, Loader2 } from "lucide-center";
import { ShieldCheckIcon as ShieldIcon, Loader2 as LoaderIcon } from "lucide-react";
import { useSecurity } from "@/hooks/useSecurity";
import { TwoFactorManager } from "@/components/dashboard/security/TwoFactorManager";
import { VaultExportButton } from "@/components/dashboard/security/VaultExportButton";
import { PasswordManager } from "@/components/dashboard/security/PasswordManager";
import { AccountDeletionCard } from "@/components/dashboard/security/AccountDeletionCard";

export default function SecurityPage() {
    const {
        twoFA,
        loading,
        error,
        toggle2FA,
        disableTOTP,
        changePassword,
        deleteAccount,
        exportVault,
        refresh
    } = useSecurity();

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <LoaderIcon className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto pb-20">
            {/* Standard Header - Single Column Style */}
            <header className="space-y-2 pb-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-black text-white">
                        <ShieldIcon className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold text-foreground tracking-tight">Security Command</h1>
                </div>
                <p className="text-muted-foreground text-xs font-medium max-w-xl uppercase tracking-widest">
                    Manage authentication protocols and encryption keys.
                </p>
            </header>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                    SYSTEM_ALERT: {error}
                </div>
            )}

            <div className="space-y-10">
                {/* 1. Identity Verification */}
                <section className="space-y-4">
                    <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] px-1">
                        // Identity_Verification
                    </h2>
                    <TwoFactorManager 
                        settings={twoFA} 
                        loading={loading} 
                        onToggle={toggle2FA} 
                        onDisableTOTP={disableTOTP} 
                        onRefresh={refresh} 
                    />
                </section>

                {/* 2. Vault Maintenance */}
                <section className="space-y-4">
                    <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] px-1">
                        // Access_&_Backups
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PasswordManager onChangePassword={changePassword} />
                        <VaultExportButton onExport={exportVault} />
                    </div>
                </section>

                {/* 3. Termination */}
                <section className="space-y-4">
                    <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] px-1">
                        // Termination_Protocols
                    </h2>
                    <AccountDeletionCard onDelete={deleteAccount} />
                </section>
            </div>
        </div>
    );
}
