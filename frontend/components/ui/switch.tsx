"use client";
import { cn } from "@/lib/utils/cn";

interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
}

export function Switch({ checked, onCheckedChange, disabled, className }: SwitchProps) {
    return (
        <button
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onCheckedChange(!checked)}
            className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground/20",
                checked ? "bg-foreground" : "bg-border",
                disabled && "cursor-not-allowed opacity-50",
                className
            )}
        >
            <span
                className={cn(
                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-sm transition-transform duration-200",
                    checked ? "translate-x-4" : "translate-x-0"
                )}
            />
        </button>
    );
}
