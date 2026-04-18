"use client";
import { useState, useEffect, useCallback } from "react";
import {
    ShieldCheckIcon, SmartphoneIcon, MonitorIcon, TabletIcon,
    KeyRoundIcon, DownloadIcon, Trash2Icon, MailIcon, MessageSquareIcon,
    QrCodeIcon, LogOutIcon, XIcon, CheckCircle2Icon, EyeIcon, EyeOffIcon,
    AlertTriangleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow, format, parseISO } from "date-fns";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
    return typeof window !== "undefined" ? localStorage.getItem("paradosis_access_token") ?? "" : "";
}

async function apiFetch(path: string, opts: RequestInit = {}) {
    const res = await fetch(`${API}${path}`, {
        ...opts,
        headers: {
            "Authorization": `Bearer ${getToken()}`,
            "Content-Type": "application/json",
            ...(opts.headers ?? {}),
        },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? "Request failed");
    }
    return res;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Session {
    id: string;
    device_type: string | null;
    location_city: string | null;
    location_country: string | null;
    last_active_at: string;
    created_at: string;
    is_current: boolean;
    user_agent: string | null;
}

interface TwoFASettings {
    email_otp_enabled: boolean;
    sms_otp_enabled: boolean;
    totp_enabled: boolean;
    preferred_method: string | null;
}

// ── Device icon ───────────────────────────────────────────────────────────────

function DeviceIcon({ type }: { type: string | null }) {
    if (type === "mobile") return <SmartphoneIcon className="w-4 h-4 text-olive-gray" />;
    if (type === "tablet") return <TabletIcon className="w-4 h-4 text-olive-gray" />;
    return <MonitorIcon className="w-4 h-4 text-olive-gray" />;
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────

function ConfirmModal({
    title, description, confirmLabel = "Confirm", danger = false,
    onConfirm, onCancel, children,
}: {
    title: string; description: string; confirmLabel?: string; danger?: boolean;
    onConfirm: () => void; onCancel: () => void; children?: React.ReactNode;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-ivory rounded-2xl p-6 w-full max-w-sm shadow-xl border border-oat-border">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-near-black text-base">{title}</h3>
                    <button onClick={onCancel} className="text-olive-gray hover:text-near-black transition-colors">
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-sm text-olive-gray mb-4">{description}</p>
                {children}
                <div className="flex gap-2 mt-5">
                    <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
                    <Button
                        onClick={onConfirm}
                        className={`flex-1 ${danger ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-brand hover:bg-[#b05637] text-ivory"}`}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ── TOTP Setup Modal ──────────────────────────────────────────────────────────

function TOTPSetupModal({ onClose, onEnabled }: { onClose: () => void; onEnabled: () => void }) {
    const [step, setStep] = useState<"loading" | "scan" | "verify" | "done">("loading");
    const [secret, setSecret] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        apiFetch("/api/security/2fa/totp/setup")
            .then(r => r.json())
            .then(d => { setSecret(d.secret); setQrCode(d.qr_code); setStep("scan"); })
            .catch(() => setStep("scan"));
    }, []);

    async function verify() {
        setBusy(true); setError("");
        try {
            await apiFetch("/api/security/2fa/totp/enable", {
                method: "POST",
                body: JSON.stringify({ secret, code }),
            });
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
            <div className="bg-ivory rounded-2xl p-6 w-full max-w-sm shadow-xl border border-oat-border">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-near-black">Set up Authenticator</h3>
                    <button onClick={onClose} className="text-olive-gray hover:text-near-black"><XIcon className="w-4 h-4" /></button>
                </div>

                {step === "loading" && <Skeleton className="h-48 w-full rounded-xl" />}

                {step === "scan" && (
                    <>
                        <p className="text-sm text-olive-gray mb-4">Scan this QR code with Google Authenticator, Authy, or any TOTP app.</p>
                        {qrCode && <img src={qrCode} alt="TOTP QR Code" className="w-48 h-48 mx-auto rounded-xl border border-oat-border mb-4" />}
                        <p className="text-xs text-olive-gray text-center mb-1">Or enter manually:</p>
                        <p className="text-xs font-mono text-center bg-parchment rounded-lg px-3 py-2 text-near-black select-all mb-5">{secret}</p>
                        <Button className="w-full bg-brand text-ivory hover:bg-[#b05637]" onClick={() => setStep("verify")}>
                            I&apos;ve scanned it
                        </Button>
                    </>
                )}

                {step === "verify" && (
                    <>
                        <p className="text-sm text-olive-gray mb-4">Enter the 6-digit code from your authenticator app to confirm setup.</p>
                        <Input
                            placeholder="000000"
                            maxLength={6}
                            value={code}
                            onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                            className="text-center text-xl tracking-widest font-mono mb-2"
                        />
                        {error && <p className="text-xs text-rose-600 mb-2">{error}</p>}
                        <Button
                            className="w-full mt-2 bg-brand text-ivory hover:bg-[#b05637]"
                            onClick={verify}
                            disabled={code.length !== 6 || busy}
                        >
                            {busy ? "Verifying…" : "Verify & Enable"}
                        </Button>
                    </>
                )}

                {step === "done" && (
                    <div className="flex flex-col items-center py-6 gap-3">
                        <CheckCircle2Icon className="w-12 h-12 text-emerald-500" />
                        <p className="font-medium text-near-black">TOTP enabled!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── TwoFactorManager ──────────────────────────────────────────────────────────

function TwoFactorManager() {
    const [settings, setSettings] = useState<TwoFASettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState<string | null>(null);
    const [showTOTPModal, setShowTOTPModal] = useState(false);

    useEffect(() => {
        apiFetch("/api/security/2fa").then(r => r.json()).then(setSettings).catch(() => null).finally(() => setLoading(false));
    }, []);

    async function toggleMethod(method: "email_otp" | "sms_otp", enabled: boolean) {
        setToggling(method);
        try {
            await apiFetch("/api/security/2fa/toggle", { method: "POST", body: JSON.stringify({ method, enabled }) });
            setSettings(prev => prev ? { ...prev, [`${method}_enabled`]: enabled } : prev);
        } catch { } finally { setToggling(null); }
    }

    async function disableTOTP() {
        setToggling("totp");
        try {
            await apiFetch("/api/security/2fa/totp/disable", { method: "POST" });
            setSettings(prev => prev ? { ...prev, totp_enabled: false } : prev);
        } catch { } finally { setToggling(null); }
    }

    const methods = [
        {
            key: "email_otp" as const,
            icon: <MailIcon className="w-5 h-5 text-brand" />,
            label: "Email OTP",
            description: "A one-time code is sent to your email on each login.",
            enabled: settings?.email_otp_enabled ?? false,
        },
        {
            key: "sms_otp" as const,
            icon: <MessageSquareIcon className="w-5 h-5 text-blue-600" />,
            label: "SMS OTP",
            description: "A one-time code is sent to your registered phone number.",
            enabled: settings?.sms_otp_enabled ?? false,
        },
    ];

    return (
        <div className="bg-ivory rounded-2xl p-6 border border-oat-border">
            {showTOTPModal && (
                <TOTPSetupModal
                    onClose={() => setShowTOTPModal(false)}
                    onEnabled={() => setSettings(prev => prev ? { ...prev, totp_enabled: true } : prev)}
                />
            )}
            <h2 className="text-sm font-medium uppercase tracking-wider text-olive-gray flex items-center gap-2 mb-5">
                <ShieldCheckIcon className="w-4 h-4" /> Two-Factor Authentication
            </h2>

            <div className="space-y-3">
                {methods.map(m => (
                    <div key={m.key} className="flex items-center justify-between p-4 bg-parchment rounded-xl border border-oat-border">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-ivory border border-oat-border flex items-center justify-center shrink-0">
                                {m.icon}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-near-black">{m.label}</p>
                                <p className="text-xs text-olive-gray mt-0.5">{m.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.enabled ? "bg-emerald-50 text-emerald-700" : "bg-oat-border/50 text-olive-gray"}`}>
                                {m.enabled ? "Enabled" : "Disabled"}
                            </span>
                            {loading ? (
                                <Skeleton className="w-9 h-5 rounded-full" />
                            ) : (
                                <Switch
                                    checked={m.enabled}
                                    onCheckedChange={v => toggleMethod(m.key, v)}
                                    disabled={toggling === m.key}
                                />
                            )}
                        </div>
                    </div>
                ))}

                {/* TOTP */}
                <div className="flex items-center justify-between p-4 bg-parchment rounded-xl border border-oat-border">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-ivory border border-oat-border flex items-center justify-center shrink-0">
                            <QrCodeIcon className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-near-black">Authenticator App (TOTP)</p>
                            <p className="text-xs text-olive-gray mt-0.5">Use Google Authenticator, Authy, or any TOTP app.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${settings?.totp_enabled ? "bg-emerald-50 text-emerald-700" : "bg-oat-border/50 text-olive-gray"}`}>
                            {settings?.totp_enabled ? "Enabled" : "Disabled"}
                        </span>
                        {loading ? (
                            <Skeleton className="w-20 h-7 rounded-lg" />
                        ) : settings?.totp_enabled ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={disableTOTP}
                                disabled={toggling === "totp"}
                                className="text-xs"
                            >
                                Disable
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                onClick={() => setShowTOTPModal(true)}
                                className="bg-brand text-ivory hover:bg-[#b05637] text-xs"
                            >
                                Set up
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── SessionTable ──────────────────────────────────────────────────────────────

function SessionTable() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [revoking, setRevoking] = useState<string | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);

    useEffect(() => {
        apiFetch("/api/security/sessions").then(r => r.json()).then(setSessions).catch(() => null).finally(() => setLoading(false));
    }, []);

    async function revoke(id: string) {
        setRevoking(id);
        try {
            await apiFetch(`/api/security/sessions/${id}`, { method: "DELETE" });
            setSessions(prev => prev.filter(s => s.id !== id));
        } catch { } finally { setRevoking(null); setConfirmId(null); }
    }

    return (
        <div className="bg-ivory rounded-2xl p-6 border border-oat-border">
            {confirmId && (
                <ConfirmModal
                    title="Revoke Session"
                    description="This will immediately sign out that device. Continue?"
                    confirmLabel="Revoke"
                    danger
                    onConfirm={() => revoke(confirmId)}
                    onCancel={() => setConfirmId(null)}
                />
            )}
            <h2 className="text-sm font-medium uppercase tracking-wider text-olive-gray flex items-center gap-2 mb-5">
                <LogOutIcon className="w-4 h-4" /> Active Sessions
            </h2>

            {loading ? (
                <div className="space-y-3">
                    {[0, 1, 2].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
                </div>
            ) : sessions.length === 0 ? (
                <p className="text-sm text-olive-gray text-center py-6 bg-parchment rounded-xl border border-dashed border-oat-border">
                    No active sessions found.
                </p>
            ) : (
                <div className="space-y-2">
                    {sessions.map(s => {
                        const location = [s.location_city, s.location_country].filter(Boolean).join(", ") || "Unknown location";
                        return (
                            <div key={s.id} className="flex items-center justify-between gap-3 p-3 bg-parchment rounded-xl border border-oat-border">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-ivory border border-oat-border flex items-center justify-center shrink-0">
                                        <DeviceIcon type={s.device_type} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-near-black truncate">{location}</p>
                                            {s.is_current && (
                                                <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Current</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-olive-gray mt-0.5">
                                            Active {formatDistanceToNow(parseISO(s.last_active_at), { addSuffix: true })} · Created {format(parseISO(s.created_at), "d MMM yyyy")}
                                        </p>
                                    </div>
                                </div>
                                {!s.is_current && (
                                    <button
                                        onClick={() => setConfirmId(s.id)}
                                        disabled={revoking === s.id}
                                        className="shrink-0 text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors disabled:opacity-50"
                                    >
                                        {revoking === s.id ? "Revoking…" : "Revoke"}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── ChangePasswordSection ─────────────────────────────────────────────────────

function ChangePasswordSection() {
    const [newPw, setNewPw] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [busy, setBusy] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const mismatch = confirm.length > 0 && newPw !== confirm;
    const tooShort = newPw.length > 0 && newPw.length < 8;
    const valid = newPw.length >= 8 && newPw === confirm;

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!valid) return;
        setBusy(true); setError(""); setSuccess(false);
        try {
            await apiFetch("/api/security/password", { method: "POST", body: JSON.stringify({ new_password: newPw }) });
            setSuccess(true);
            setNewPw(""); setConfirm("");
        } catch (e: any) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="bg-ivory rounded-2xl p-6 border border-oat-border">
            <h2 className="text-sm font-medium uppercase tracking-wider text-olive-gray flex items-center gap-2 mb-5">
                <KeyRoundIcon className="w-4 h-4" /> Change Password
            </h2>
            <form onSubmit={submit} className="space-y-4 max-w-sm">
                <div>
                    <label className="block text-xs font-medium text-olive-gray mb-1.5">New Password</label>
                    <div className="relative">
                        <Input
                            type={showNew ? "text" : "password"}
                            value={newPw}
                            onChange={e => setNewPw(e.target.value)}
                            placeholder="Min 8 characters"
                            className="pr-10"
                        />
                        <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-olive-gray hover:text-near-black">
                            {showNew ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                    </div>
                    {tooShort && <p className="text-xs text-rose-600 mt-1">Must be at least 8 characters</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-olive-gray mb-1.5">Confirm New Password</label>
                    <div className="relative">
                        <Input
                            type={showConfirm ? "text" : "password"}
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            placeholder="Re-enter password"
                            className={`pr-10 ${mismatch ? "border-rose-400 focus:border-rose-400 focus:ring-rose-200" : ""}`}
                        />
                        <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-olive-gray hover:text-near-black">
                            {showConfirm ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                    </div>
                    {mismatch && <p className="text-xs text-rose-600 mt-1">Passwords don&apos;t match</p>}
                </div>
                {error && <p className="text-xs text-rose-600">{error}</p>}
                {success && <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2Icon className="w-3.5 h-3.5" /> Password updated successfully</p>}
                <Button
                    type="submit"
                    disabled={!valid || busy}
                    className="bg-brand text-ivory hover:bg-[#b05637] disabled:opacity-40"
                >
                    {busy ? "Updating…" : "Update Password"}
                </Button>
            </form>
        </div>
    );
}

// ── VaultExportButton ─────────────────────────────────────────────────────────

function VaultExportButton() {
    const [busy, setBusy] = useState(false);

    async function downloadVault() {
        setBusy(true);
        try {
            const res = await fetch(`${API}/api/security/vault-export`, {
                headers: { "Authorization": `Bearer ${getToken()}` },
            });
            if (!res.ok) throw new Error("Export failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `vault-backup-${new Date().toISOString().slice(0, 10)}.vault`;
            a.click();
            URL.revokeObjectURL(url);
        } catch { } finally {
            setBusy(false);
        }
    }

    return (
        <div className="bg-ivory rounded-2xl p-6 border border-oat-border">
            <h2 className="text-sm font-medium uppercase tracking-wider text-olive-gray flex items-center gap-2 mb-4">
                <DownloadIcon className="w-4 h-4" /> Vault Backup
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-parchment rounded-xl border border-oat-border">
                <div>
                    <p className="text-sm font-medium text-near-black">Download Encrypted Vault Backup</p>
                    <p className="text-xs text-olive-gray mt-1 max-w-sm">
                        Store this <code className="font-mono bg-oat-border/40 px-1 rounded">.vault</code> file on a USB drive or DigiLocker.
                        If you ever lose access, it can be used to reconstruct your vault.
                    </p>
                </div>
                <Button
                    onClick={downloadVault}
                    disabled={busy}
                    className="bg-brand text-ivory hover:bg-[#b05637] shrink-0"
                >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    {busy ? "Generating…" : "Download"}
                </Button>
            </div>
        </div>
    );
}

// ── DangerZone ────────────────────────────────────────────────────────────────

function DangerZone() {
    const [showModal, setShowModal] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    async function deleteAccount() {
        if (confirmText !== "DELETE") return;
        setBusy(true); setError("");
        try {
            await apiFetch("/api/security/account", { method: "DELETE" });
            localStorage.clear();
            window.location.href = "/";
        } catch (e: any) {
            setError(e.message);
            setBusy(false);
        }
    }

    return (
        <div className="bg-ivory rounded-2xl p-6 border border-rose-200">
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-ivory rounded-2xl p-6 w-full max-w-sm shadow-xl border border-rose-200">
                        <div className="flex items-start gap-3 mb-4">
                            <AlertTriangleIcon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-near-black">Delete Account</h3>
                                <p className="text-sm text-olive-gray mt-1">
                                    This permanently deletes your account, all assets, beneficiary assignments,
                                    documents, and vault data. <strong className="text-near-black">This cannot be undone.</strong>
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-olive-gray mb-2">Type <strong className="font-mono text-rose-600">DELETE</strong> to confirm:</p>
                        <Input
                            value={confirmText}
                            onChange={e => setConfirmText(e.target.value)}
                            placeholder="DELETE"
                            className="font-mono"
                        />
                        {error && <p className="text-xs text-rose-600 mt-2">{error}</p>}
                        <div className="flex gap-2 mt-4">
                            <Button variant="outline" className="flex-1" onClick={() => { setShowModal(false); setConfirmText(""); }}>
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
                                disabled={confirmText !== "DELETE" || busy}
                                onClick={deleteAccount}
                            >
                                {busy ? "Deleting…" : "Delete Forever"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <h2 className="text-sm font-medium uppercase tracking-wider text-rose-600 flex items-center gap-2 mb-4">
                <Trash2Icon className="w-4 h-4" /> Danger Zone
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-rose-50 rounded-xl border border-rose-200">
                <div>
                    <p className="text-sm font-medium text-rose-800">Delete Account</p>
                    <p className="text-xs text-rose-600 mt-1">Permanently remove your account and all vault data. Irreversible.</p>
                </div>
                <Button
                    onClick={() => setShowModal(true)}
                    className="bg-rose-600 hover:bg-rose-700 text-white shrink-0"
                >
                    <Trash2Icon className="w-4 h-4 mr-2" />
                    Delete Account
                </Button>
            </div>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SecurityPage() {
    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-12">
            <header className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-near-black">Security</h1>
                <p className="text-olive-gray mt-2">Manage two-factor authentication, sessions, and account safety.</p>
            </header>

            <TwoFactorManager />
            <SessionTable />
            <ChangePasswordSection />
            <VaultExportButton />
            <DangerZone />
        </div>
    );
}
