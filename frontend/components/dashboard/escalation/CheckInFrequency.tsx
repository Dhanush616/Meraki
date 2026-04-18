"use client";
import React, { useState, useEffect } from "react";
import { CalendarIcon, SaveIcon, Loader2Icon } from "lucide-react";

interface CheckInFrequencyProps {
    frequencyDays: number;
    lastCheckIn: string | null;
    onSave: (days: number) => Promise<void>;
}

export function CheckInFrequency({ frequencyDays, lastCheckIn, onSave }: CheckInFrequencyProps) {
    const [value, setValue] = useState(frequencyDays);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const isDirty = value !== frequencyDays;

    useEffect(() => {
        setValue(frequencyDays);
    }, [frequencyDays]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(value);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            // error handled upstream
        } finally {
            setIsSaving(false);
        }
    };

    // Calculate next check-in date
    const nextCheckIn = (() => {
        const base = lastCheckIn ? new Date(lastCheckIn) : new Date();
        const next = new Date(base.getTime() + value * 24 * 60 * 60 * 1000);
        return next.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    })();

    // Slider tick labels
    const ticks = [30, 60, 90, 120, 150, 180];

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Check-In Frequency</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                    How often Paradosis sends you a &ldquo;Are you okay?&rdquo; email.
                </p>
            </div>

            <div className="px-6 py-5 space-y-5">
                {/* Value display */}
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-foreground">{value}</span>
                        <span className="text-sm text-muted-foreground">days</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        Next: {nextCheckIn}
                    </div>
                </div>

                {/* Slider */}
                <div className="space-y-2">
                    <input
                        type="range"
                        min={30}
                        max={180}
                        step={1}
                        value={value}
                        onChange={(e) => setValue(Number(e.target.value))}
                        className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:w-5
                            [&::-webkit-slider-thumb]:h-5
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:bg-foreground
                            [&::-webkit-slider-thumb]:cursor-pointer
                            [&::-webkit-slider-thumb]:shadow-md
                            [&::-webkit-slider-thumb]:transition-transform
                            [&::-webkit-slider-thumb]:hover:scale-110
                            [&::-moz-range-thumb]:w-5
                            [&::-moz-range-thumb]:h-5
                            [&::-moz-range-thumb]:rounded-full
                            [&::-moz-range-thumb]:bg-foreground
                            [&::-moz-range-thumb]:border-none
                            [&::-moz-range-thumb]:cursor-pointer"
                    />
                    <div className="flex justify-between px-1">
                        {ticks.map((t) => (
                            <button
                                key={t}
                                onClick={() => setValue(t)}
                                className={`text-[10px] font-medium transition-colors ${
                                    value === t
                                        ? "text-foreground font-bold"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {t}d
                            </button>
                        ))}
                    </div>
                </div>

                {/* Save button */}
                {isDirty && (
                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2Icon className="w-4 h-4 animate-spin" />
                            ) : (
                                <SaveIcon className="w-4 h-4" />
                            )}
                            {saved ? "Saved!" : "Save"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
