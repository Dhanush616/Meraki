"use client";

import React, { useState } from "react";
import { ShieldCheckIcon, MailIcon, MessageSquareIcon, QrCodeIcon, XIcon, CheckCircle2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TwoFASettings {
    email_otp_enabled: boolean;
    sms_otp_enabled: boolean;
    totp_enabled: boolean;
    preferred_method: string | null;
}

interface TwoFactorManagerProps {
    settings: TwoFASettings | null;
    loading: boolean;
    onToggle: (method: "email_otp" | "sms_otp", enabled: boolean) => Promise<boolean>;
    onDisableTOTP: () => Promise<boolean>;
    onRefresh: () => void;
}

function TOTPSetupModal({ onClose, onEnabled }: { onClose: () => void; onEnabled: () => void }) {
    const [step, setStep] = useState<"loading" | "scan" | "verify" | "done">("loading");
    const [secret, setSecret] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    React.useEffect(() => {
        const token = localStorage.getItem("paradosis_access_token");
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        fetch(`${baseUrl}/api/security/2fa/totp/setup`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(d => { setSecret(d.secret); setQrCode(d.qr_code); setStep("scan"); })
            .catch(() => setStep("scan"));
    }, []);

    async function verify() {
        setBusy(true); setError("");
        try {
            const token = localStorage.getItem("paradosis_access_token");
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
            const res = await fetch(`${baseUrl}/api/security/2fa/totp/enable`, {
                method: "POST",
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ secret, code }),
            });
            if (!res.ok) throw new Error("Invalid code");
            setStep("done");
            setTimeout(() => { onEnabled(); onClose(); }, 1500);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-border">
                <div className="flex items-start justify-between mb-6">
                    <h3 className="font-bold text-black text-lg">Authenticator Setup</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-black transition-colors">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {step === "loading" && <Skeleton className="h-48 w-full rounded-xl" />}

                {step === "scan" && (
                    <div className="space-y-6">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest leading-relaxed">
                            Scan this QR code with Google Authenticator or Authy.
                        </p>
                        {qrCode && <img src={qrCode} alt="TOTP QR" className="w-48 h-48 mx-auto rounded-xl border-2 border-border p-2" />}
                        <div className="space-y-2">
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest text-center">Manual Secret Key</p>
                            <p className="text-xs font-mono text-center bg-muted rounded-lg px-3 py-2 text-black font-bold break-all select-all">{secret}</p>
                        </div>
                        <Button className="w-full h-11 rounded-full bg-black text-white hover:bg-zinc-800 font-bold uppercase tracking-widest text-[10px]" onClick={() => setStep("verify")}>
                            I&apos;ve Scanned the Code
                        </Button>
                    </div>
                )}

                {step === "verify" && (
                    <div className="space-y-6">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest leading-relaxed">
                            Enter the 6-digit code from your app to finalize setup.
                        </p>
                        <Input
                            placeholder="000000"
                            maxLength={6}
                            value={code}
                            onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                            className="text-center text-2xl tracking-[0.5em] font-mono h-14 border-2 focus:ring-black/5"
                        />
                        {error && <p className="text-[10px] font-black uppercase text-red-600 text-center">{error}</p>}
                        <Button
                            className="w-full h-11 rounded-full bg-black text-white hover:bg-zinc-800 font-bold uppercase tracking-widest text-[10px]"
                            onClick={verify}
                            disabled={code.length !== 6 || busy}
                        >
                            {busy ? "Verifying..." : "Verify & Enable"}
                        </Button>
                    </div>
                )}

                {step === "done" && (
                    <div className="flex flex-col items-center py-8 gap-4">
                        <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center">
                            <CheckCircle2Icon className="w-8 h-8 text-white" />
                        </div>
                        <p className="font-black uppercase tracking-[0.2em] text-[10px] text-black">Protocol Enabled</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export function TwoFactorManager({ settings, loading, onToggle, onDisableTOTP, onRefresh }: TwoFactorManagerProps) {
    const [toggling, setToggling] = useState<string | null>(null);
    const [showTOTPModal, setShowTOTPModal] = useState(false);

    const methods = [
        {
            key: "email_otp" as const,
            icon: <MailIcon className="w-4 h-4" />,
            label: "Email Authentication",
            description: "Receive unique codes via your registered email.",
            enabled: settings?.email_otp_enabled ?? false,
        },
        {
            key: "sms_otp" as const,
            icon: <MessageSquareIcon className="w-4 h-4" />,
            label: "SMS Authentication",
            description: "Verification codes sent to your phone number.",
            enabled: settings?.sms_otp_enabled ?? false,
        },
    ];

    async function handleToggle(method: "email_otp" | "sms_otp", current: boolean) {
        setToggling(method);
        await onToggle(method, !current);
        setToggling(null);
    }

    return (
        <Card className="border border-border rounded-xl shadow-sm overflow-hidden">
            {showTOTPModal && (
                <TOTPSetupModal
                    onClose={() => setShowTOTPModal(false)}
                    onEnabled={onRefresh}
                />
            )}
            <CardHeader className="bg-muted/30 border-b border-border py-4 px-6">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                    <ShieldCheckIcon className="w-4 h-4" />
                    Multi-Factor Authentication
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                {methods.map(m => (
                    <div key={m.key} className="flex items-center justify-between p-5 border border-border rounded-xl bg-background hover:bg-muted/10 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-black border border-border">
                                {m.icon}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-black">{m.label}</p>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight mt-0.5">{m.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${m.enabled ? "bg-black text-white border-black" : "bg-muted text-muted-foreground border-border"}`}>
                                {m.enabled ? "Active" : "Disabled"}
                            </span>
                            <Switch
                                checked={m.enabled}
                                onCheckedChange={() => handleToggle(m.key, m.enabled)}
                                disabled={loading || toggling === m.key}
                                className="scale-90 data-[state=checked]:bg-black"
                            />
                        </div>
                    </div>
                ))}

                {/* TOTP */}
                <div className="flex items-center justify-between p-5 border border-border rounded-xl bg-background hover:bg-muted/10 transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-black border border-border">
                            <QrCodeIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-black">Authenticator App (TOTP)</p>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight mt-0.5">High-security software-based authentication.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${settings?.totp_enabled ? "bg-black text-white border-black" : "bg-muted text-muted-foreground border-border"}`}>
                            {settings?.totp_enabled ? "Active" : "Disabled"}
                        </span>
                        {settings?.totp_enabled ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDisableTOTP()}
                                className="h-8 rounded-full text-[10px] font-bold uppercase tracking-widest px-4 border-2 border-border hover:bg-black hover:text-white transition-all"
                            >
                                Disable
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                onClick={() => setShowTOTPModal(true)}
                                className="h-8 rounded-full text-[10px] font-bold uppercase tracking-widest px-4 bg-black text-white hover:bg-zinc-800 transition-all"
                            >
                                Setup
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
