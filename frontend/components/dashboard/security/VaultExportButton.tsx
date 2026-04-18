"use client";

import React, { useState } from "react";
import { DownloadIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface VaultExportButtonProps {
    onExport: () => Promise<boolean>;
}

export function VaultExportButton({ onExport }: VaultExportButtonProps) {
    const [busy, setBusy] = useState(false);

    async function handleExport() {
        setBusy(true);
        const success = await onExport();
        if (success) {
            toast.success("Vault export complete. Keep this file safe.");
        } else {
            toast.error("Failed to generate vault export.");
        }
        setBusy(false);
    }

    return (
        <Card className="border border-border rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
            <CardHeader className="bg-muted/30 border-b border-border py-4 px-6">
                <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <DownloadIcon className="w-4 h-4" />
                    Offline Backup
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col justify-between flex-1">
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                    Download an encrypted archive of your entire vault. This file can be used to recover your data even if our servers are offline.
                </p>
                <Button
                    onClick={handleExport}
                    disabled={busy}
                    className="w-full h-11 rounded-full bg-black text-white hover:bg-zinc-800 font-bold uppercase tracking-widest text-[10px]"
                >
                    {busy ? (
                        <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <DownloadIcon className="mr-2 h-3 w-3" />
                            Export Encrypted Vault
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
