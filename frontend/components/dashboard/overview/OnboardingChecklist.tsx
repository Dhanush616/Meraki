"use client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2Icon, CircleIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
    { label: "Complete your profile",          href: "/dashboard/settings" },
    { label: "Add your first asset",           href: "/dashboard/vault/add" },
    { label: "Add a beneficiary",              href: "/dashboard/beneficiaries" },
    { label: "Assign assets to beneficiaries", href: "/dashboard/vault" },
    { label: "Record your video will",         href: "/dashboard/intent" },
    { label: "Generate your will document",    href: "/dashboard/will" },
    { label: "Set an emergency contact",       href: "/dashboard/escalation" },
];

interface Props { step: number; onboardingDone: boolean; }

export function OnboardingChecklist({ step, onboardingDone }: Props) {
    const displayStep = Math.min(step, STEPS.length - 1);
    const activeStep = STEPS[displayStep];
    const progress = Math.min(Math.round((step / STEPS.length) * 100), 100);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-muted border border-border rounded-2xl p-6"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div>
                        <h3 className="font-semibold text-foreground">
                            {onboardingDone ? "Vault Setup Complete" : `Vault Setup — Step ${displayStep + 1} of ${STEPS.length}`}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {onboardingDone ? "You have successfully completed all setup steps." : "Complete all steps to fully protect your family."}
                        </p>
                    </div>
                    {!onboardingDone && (
                        <Link href={activeStep.href}>
                            <Button className="bg-primary text-primary-foreground hover:opacity-90 shrink-0">
                                Continue <ChevronRightIcon className="w-4 h-4 ml-1.5" />
                            </Button>
                        </Link>
                    )}
                </div>
                <div className="w-full bg-border rounded-full h-1.5 mb-5">
                    <motion.div className="bg-foreground h-1.5 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
                </div>
                <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {STEPS.map((s, i) => {
                        const done = i < step;
                        const active = i === step;
                        return (
                            <li key={i} className={`flex items-center gap-2.5 text-sm rounded-lg px-3 py-2 ${active ? "bg-foreground/10 text-foreground font-medium" : done ? "text-muted-foreground" : "text-muted-foreground/40"}`}>
                                {done ? (
                                    <CheckCircle2Icon className="w-4 h-4 text-foreground shrink-0" />
                                ) : active ? (
                                    <span className="w-4 h-4 shrink-0 relative flex items-center justify-center">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-50" />
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-foreground" />
                                    </span>
                                ) : (
                                    <CircleIcon className="w-4 h-4 shrink-0 opacity-25" />
                                )}
                                {s.label}
                            </li>
                        );
                    })}
                </ol>
            </motion.div>
        </AnimatePresence>
    );
}
