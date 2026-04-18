"use client";

import React, { useState } from "react";
import { KeyRoundIcon, EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface PasswordManagerProps {
    onChangePassword: (password: string) => Promise<boolean>;
}

export function PasswordManager({ onChangePassword }: PasswordManagerProps) {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [busy, setBusy] = useState(false);

    async function handleUpdate() {
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setBusy(true);
        const success = await onChangePassword(newPassword);
        if (success) {
            toast.success("Master password updated successfully.");
            setNewPassword("");
            setConfirmPassword("");
        }
        setBusy(false);
    }

    return (
        <Card className="border border-border rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
            <CardHeader className="bg-muted/30 border-b border-border py-4 px-6">
                <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <KeyRoundIcon className="w-4 h-4" />
                    Vault Access
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col justify-between flex-1">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">New Master Password</label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="h-10 border rounded-lg pr-10 focus:ring-black/5"
                                placeholder="Min. 8 characters"
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-muted-foreground hover:text-black transition-colors"
                            >
                                {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Confirm Password</label>
                        <Input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="h-10 border rounded-lg focus:ring-black/5"
                            placeholder="Re-enter password"
                        />
                    </div>
                </div>

                <Button
                    onClick={handleUpdate}
                    disabled={busy || !newPassword}
                    className="w-full h-11 mt-6 rounded-full bg-black text-white hover:bg-zinc-800 font-bold uppercase tracking-widest text-[10px]"
                >
                    {busy ? (
                        <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Updating...
                        </>
                    ) : (
                        "Update Master Password"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
