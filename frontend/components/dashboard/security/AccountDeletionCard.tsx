"use client";

import React, { useState } from "react";
import { AlertTriangleIcon, Loader2, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AccountDeletionCardProps {
    onDelete: () => Promise<boolean>;
}

export function AccountDeletionCard({ onDelete }: AccountDeletionCardProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [busy, setBusy] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        setBusy(true);
        const success = await onDelete();
        if (success) {
            toast.success("Account permanently deleted.");
            localStorage.clear();
            router.push("/");
        } else {
            toast.error("Failed to delete account.");
        }
        setBusy(false);
    }

    return (
        <>
            <Card className="border-red-100 border-2 rounded-xl bg-red-50/30 overflow-hidden">
                <CardHeader className="bg-red-50 border-b border-red-100 py-4 px-6">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-red-900">
                        <AlertTriangleIcon className="w-4 h-4" />
                        Danger Zone
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <p className="text-xs text-red-800 font-medium leading-relaxed mb-6">
                        Permanently delete your account and all associated vault data. This action is irreversible. All assets, beneficiaries, and documents will be purged.
                    </p>
                    <Button
                        variant="destructive"
                        onClick={() => setShowConfirm(true)}
                        className="w-full h-11 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-[10px]"
                    >
                        <Trash2Icon className="mr-2 h-3 w-3" />
                        Delete Account Permanently
                    </Button>
                </CardContent>
            </Card>

            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <AlertTriangleIcon className="w-5 h-5" />
                            Irreversible Action
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Are you absolutely sure? This will permanently delete your Paradosis account and all encrypted data. This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 mt-4">
                        <DialogClose asChild>
                            <Button variant="outline" className="flex-1 rounded-full">Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={handleDelete}
                            disabled={busy}
                            className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white"
                        >
                            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Delete Everything"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
