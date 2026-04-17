"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignInForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Logic for Sign In
        console.log({ email, password });
    };

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
                <label className="text-sm font-medium text-near-black font-sans">Email address</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-parchment border border-border-cream rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all font-sans text-near-black shadow-inner"
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
                    className="w-full bg-parchment border border-border-cream rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all font-sans text-near-black shadow-inner"
                    placeholder="••••••••"
                    required
                />
            </div>
            <Button type="submit" className="w-full bg-brand text-ivory hover:bg-[#b05637] transition-all rounded-lg py-6 mt-4 group shadow-sm border-none">
                <span className="font-medium text-base">Sign In</span>
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
        </form>
    );
}