import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, UserCheck, ShieldAlert, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const levels = [
    {
        id: "level_0_normal",
        title: "Level 0: Normal",
        description: "Everything is fine. The vault is locked and you are checking in regularly.",
        icon: CheckCircle2,
        color: "text-emerald-500",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
    },
    {
        id: "level_1_concern",
        title: "Level 1: Concern",
        description: "You missed a check-in. We're sending reminders to your primary email and phone.",
        icon: AlertTriangle,
        color: "text-amber-500",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
    },
    {
        id: "level_2_alert",
        title: "Level 2: Alert",
        description: "Multiple check-ins missed. We are now contacting your designated emergency contact.",
        icon: UserCheck,
        color: "text-orange-500",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
    },
    {
        id: "level_3_suspected_death",
        title: "Level 3: Verification",
        description: "Emergency contact confirms concern. Guardians can now submit death certificates.",
        icon: ShieldAlert,
        color: "text-red-500",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
    },
    {
        id: "level_5_executed",
        title: "Level 4: Execution",
        description: "Verification complete. Vault contents are being released to your beneficiaries.",
        icon: Lock,
        color: "text-purple-500",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
    },
];

interface EscalationLadderProps {
    currentLevel: string;
}

export function EscalationLadder({ currentLevel }: EscalationLadderProps) {
    const currentIndex = levels.findIndex((l) => l.id === currentLevel);

    return (
        <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-muted-foreground/20">
            {levels.map((level, index) => {
                const isActive = index <= currentIndex;
                const isCurrent = level.id === currentLevel;
                const Icon = level.icon;

                return (
                    <motion.div
                        key={level.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                            "relative pl-12 transition-all duration-300",
                            !isActive && "opacity-50 grayscale"
                        )}
                    >
                        {/* Connection Dot */}
                        <div
                            className={cn(
                                "absolute left-0 top-1 w-10 h-10 rounded-full border-4 bg-background flex items-center justify-center z-10",
                                isActive ? level.borderColor : "border-muted",
                                isCurrent && "ring-4 ring-offset-2 ring-primary"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive ? level.color : "text-muted-foreground")} />
                        </div>

                        {/* Content Card */}
                        <div
                            className={cn(
                                "p-6 rounded-2xl border bg-card shadow-sm transition-all duration-300",
                                isCurrent ? cn("border-2", level.borderColor, level.bgColor) : "border-border"
                            )}
                        >
                            <h3 className={cn("text-lg font-bold mb-1", isActive ? "text-foreground" : "text-muted-foreground")}>
                                {level.title}
                                {isCurrent && (
                                    <span className="ml-3 text-xs uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold">
                                        Current State
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {level.description}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
