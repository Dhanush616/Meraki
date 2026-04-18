"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldIcon, MailIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function GuardianLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
            const res = await fetch(`${API}/api/guardian/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Login failed");
            }
            const data = await res.json();
            localStorage.setItem("guardian_token", data.token);
            router.push("/guardian/portal");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mb-3">
                        <ShieldIcon className="w-6 h-6 text-brand" />
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-near-black">Paradosis</h1>
                    <p className="text-sm text-olive-gray mt-1">Guardian Portal</p>
                </div>

                <div className="bg-ivory rounded-2xl p-8 border border-oat-border shadow-sm">
                    <h2 className="text-lg font-semibold text-near-black mb-1">Sign in as Guardian</h2>
                    <p className="text-sm text-olive-gray mb-6">
                        Enter the email address associated with your guardian account.
                    </p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-olive-gray mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-gray pointer-events-none" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}

                        <Button
                            type="submit"
                            disabled={!email || busy}
                            className="w-full bg-brand text-ivory hover:bg-[#b05637]"
                        >
                            {busy ? "Signing in…" : "Continue"}
                            {!busy && <ArrowRightIcon className="w-4 h-4 ml-2" />}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-xs text-olive-gray mt-6">
                    This portal is for authorized guardians only.
                </p>
            </div>
        </div>
    );
}
