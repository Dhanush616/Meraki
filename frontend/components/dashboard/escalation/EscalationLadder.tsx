import React from "react";
import { CheckCircle2, AlertTriangle, UserCheck, ShieldAlert, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const levels = [
    {
        id: "level_0_normal",
        title: "Level 0: Normal",
        description: "Vault is secure. Standard monitoring active.",
        icon: CheckCircle2,
    },
    {
        id: "level_1_concern",
        title: "Level 1: Concern",
        description: "Missed check-in detected. Reminders dispatched.",
        icon: AlertTriangle,
    },
    {
        id: "level_2_alert",
        title: "Level 2: Alert",
        description: "Emergency contact is being notified for status check.",
        icon: UserCheck,
    },
    {
        id: "level_3_suspected_death",
        title: "Level 3: Suspected",
        description: "Protocol initiated. Human verification in progress.",
        icon: ShieldAlert,
    },
    {
        id: "level_4_death_claimed",
        title: "Level 4: Claimed",
        description: "Death certificate verified. Final liveness check active.",
        icon: ShieldAlert,
    },
    {
        id: "level_5_executed",
        title: "Level 5: Executed",
        description: "Protocol finalized. Vault content distribution complete.",
        icon: Lock,
    },
];

interface EscalationLadderProps {
    currentLevel: string;
}

export function EscalationLadder({ currentLevel }: EscalationLadderProps) {
    const currentIndex = levels.findIndex((l) => l.id === currentLevel);

    return (
        <div className="space-y-6 relative before:absolute before:left-[17px] before:top-4 before:bottom-4 before:w-[1px] before:bg-border">
            {levels.map((level, index) => {
                const isActive = index <= currentIndex;
                const isCurrent = level.id === currentLevel;
                const Icon = level.icon;

                return (
                    <div
                        key={level.id}
                        className={cn(
                            "relative pl-10 transition-opacity",
                            !isActive && "opacity-30 grayscale"
                        )}
                    >
                        {/* Dot */}
                        <div
                            className={cn(
                                "absolute left-0 top-1 w-9 h-9 rounded-full border border-border flex items-center justify-center bg-background z-10 transition-all",
                                isCurrent && "border-black border-2 ring-4 ring-muted"
                            )}
                        >
                            <Icon className={cn("w-4 h-4", isCurrent ? "text-black" : "text-muted-foreground")} />
                        </div>

                        {/* Text */}
                        <div className={cn(
                            "py-1",
                            isCurrent && "scale-[1.02] origin-left transition-transform"
                        )}>
                            <h3 className={cn(
                                "text-sm font-bold tracking-tight",
                                isCurrent ? "text-black" : "text-muted-foreground"
                            )}>
                                {level.title}
                                {isCurrent && (
                                    <span className="ml-2 text-[9px] font-black uppercase tracking-widest bg-black text-white px-2 py-0.5 rounded">
                                        Active
                                    </span>
                                )}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                {level.description}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
