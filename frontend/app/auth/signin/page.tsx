"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-[420px]"
            >
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center shadow-lg">
                            <span className="w-4 h-4 bg-ivory rounded-full"></span>
                        </div>
                        <span className="font-serif text-3xl font-bold text-near-black">Paradosis</span>
                    </Link>
                    <h1 className="mt-6 text-2xl font-serif text-near-black">Welcome back</h1>
                    <p className="text-olive-gray font-sans mt-2">Enter your credentials to access your vault</p>
                </div>

                <div className="bg-ivory rounded-2xl p-8 border border-border-cream shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-near-black font-sans">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-parchment border border-border-cream rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all font-sans text-near-black"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium text-near-black font-sans">Password</label>
                                <Link href="#" className="text-sm text-brand hover:underline font-sans">Forgot password?</Link>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-parchment border border-border-cream rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all font-sans text-near-black"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full bg-brand text-ivory hover:bg-[#b05637] transition-all rounded-lg py-6 mt-4 group">
                            <span className="font-medium text-base">Sign In</span>
                            <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>
                </div>

                <p className="text-center mt-8 text-olive-gray font-sans text-sm">
                    Don't have a vault yet? <Link href="/auth/signup" className="text-brand font-medium hover:underline">Get started securely</Link>
                </p>
            </motion.div>
        </div>
    );
}