"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loginType, setLoginType] = useState<"owner" | "guardian">("owner");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (loginType === "guardian") {
            // Mock guardian login
            setTimeout(() => {
                setLoading(false);
                router.push("/guardian/portal");
            }, 800);
            return;
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to sign in");
            }

            console.log("Login successful", data);

            // Store the token in localStorage for authenticated requests
            if (data.access_token) {
                localStorage.setItem("paradosis_access_token", data.access_token);
            }

            // Redirect to dashboard on success
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-[420px]"
            >
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                            <span className="w-4 h-4 bg-background rounded-full"></span>
                        </div>
                        <span className="font-sans tracking-tight text-2xl font-bold text-foreground">Paradosis</span>
                    </Link>
                    <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
                    <p className="text-muted-foreground text-sm mt-2">Enter your credentials to access your vault</p>
                </div>

                <div className="bg-card rounded-lg p-8 border border-border">
                    
                    <div className="flex p-1 bg-muted rounded-lg mb-6 border border-border">
                        <button
                            type="button"
                            onClick={() => setLoginType("owner")}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${loginType === "owner" ? "bg-background text-foreground border border-border" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            Vault Owner
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginType("guardian")}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${loginType === "guardian" ? "bg-background text-foreground border border-border" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            Guardian
                        </button>
                    </div>

                    {error && (
                        <div className="p-3 mb-6 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
                            {error}
                        </div>
                    )}
                    <form className="space-y-4" onSubmit={handleLogin}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all text-foreground text-sm"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        
                        {loginType === "owner" && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-foreground">Password</label>
                                    <Link href="#" className="text-sm text-primary hover:underline">Forgot password?</Link>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all text-foreground text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        )}

                        <Button type="submit" disabled={loading} className="w-full rounded-full py-6 mt-4 group">
                            <span className="font-medium">{loading ? "Signing in..." : "Sign In"}</span>
                            {!loading && <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                        </Button>
                    </form>
                </div>

                <p className="text-center mt-8 text-muted-foreground text-sm">
                    Don't have a vault yet? <Link href="/auth/signup" className="text-primary font-medium hover:underline">Get started securely</Link>
                </p>
            </motion.div>
        </div>
    );
}