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
                        <label className="text-sm font-medium text-foreground font-sans">Enter your email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-4 py-4 outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all font-sans text-foreground text-lg shadow-inner"
                            placeholder="you@example.com"
                            autoFocus
                            required
                        />
                        <p className="text-sm text-muted-foreground font-sans flex items-center gap-2 mt-4">
                            <ShieldCheckIcon className="w-4 h-4 text-primary" /> {steps[0].desc}
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
                        <label className="text-sm font-medium text-foreground font-sans">Create Master Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-background border-2 border-primary rounded-lg px-4 py-4 outline-none focus:ring-4 focus:ring-ring/20 transition-all font-sans text-foreground text-lg shadow-inner"
                            placeholder="••••••••"
                            autoFocus
                            required
                        />
                        <p className="text-sm text-muted-foreground font-sans flex items-center gap-2 mt-4">
                            <KeySquareIcon className="w-4 h-4 text-primary" /> {steps[1].desc}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-auto pt-12 flex justify-between items-center">
                {step === 1 ? (
                    <button type="button" onClick={() => setStep(0)} className="text-sm text-muted-foreground hover:text-foreground font-sans">
                        Back
                    </button>
                ) : (
                    <div />
                )}
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-[#b05637] transition-all rounded-full py-6 px-8 group self-end ml-auto border-none">
                    <span className="font-medium text-base ml-2">{step === 0 ? "Continue" : "Create Vault"}</span>
                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </form>
    );
}