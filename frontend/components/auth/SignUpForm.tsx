"use client";
import React, { useState } from "react";
import { ArrowRightIcon, ShieldCheckIcon, KeySquareIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const steps = [
    { desc: "We use this to verify identity" },
    { desc: "Make it complex. We can't recover it." }
];

export function SignUpForm({
    step,
    setStep
}: {
    step: number;
    setStep: React.Dispatch<React.SetStateAction<number>>
}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 0 && email) setStep(1);
        if (step === 1 && password) {
            console.log({ email, password });
            // Final submission logic
        }
    };

    return (
        <form className="flex flex-col flex-1" onSubmit={handleNext}>
            <AnimatePresence mode="wait">
                {step === 0 ? (
                    <motion.div
                        key="step0"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        className="space-y-4"
                    >
                        <label className="text-sm font-medium text-near-black font-sans">Enter your email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-parchment border border-border-cream rounded-lg px-4 py-4 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all font-sans text-near-black text-lg shadow-inner"
                            placeholder="you@example.com"
                            autoFocus
                            required
                        />
                        <p className="text-sm text-olive-gray font-sans flex items-center gap-2 mt-4">
                            <ShieldCheckIcon className="w-4 h-4 text-brand" /> {steps[0].desc}
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="step1"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        className="space-y-4"
                    >
                        <label className="text-sm font-medium text-near-black font-sans">Create Master Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-parchment border-2 border-brand rounded-lg px-4 py-4 outline-none focus:ring-4 focus:ring-brand/20 transition-all font-sans text-near-black text-lg shadow-inner"
                            placeholder="••••••••"
                            autoFocus
                            required
                        />
                        <p className="text-sm text-olive-gray font-sans flex items-center gap-2 mt-4">
                            <KeySquareIcon className="w-4 h-4 text-brand" /> {steps[1].desc}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-auto pt-12 flex justify-between items-center">
                {step === 1 ? (
                    <button type="button" onClick={() => setStep(0)} className="text-sm text-olive-gray hover:text-near-black font-sans">
                        Back
                    </button>
                ) : (
                    <div />
                )}
                <Button type="submit" className="bg-brand text-ivory hover:bg-[#b05637] transition-all rounded-full py-6 px-8 group self-end ml-auto border-none">
                    <span className="font-medium text-base ml-2">{step === 0 ? "Continue" : "Create Vault"}</span>
                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </form>
    );
}