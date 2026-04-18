import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { format, addDays } from "date-fns";
import { CalendarClock } from "lucide-react";

interface CheckInFrequencyProps {
    value: number;
    lastCheckIn: string | null;
    onChange: (val: number) => void;
}

export function CheckInFrequency({ value, lastCheckIn, onChange }: CheckInFrequencyProps) {
    // Sync local state with incoming value prop
    const [localValue, setLocalValue] = useState(value);
    
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const lastDate = lastCheckIn ? new Date(lastCheckIn) : new Date();
    const nextCheckIn = addDays(lastDate, localValue);

    const handleValueChange = (val: number | number[]) => {
        const newValue = Array.isArray(val) ? val[0] : val;
        setLocalValue(newValue);
    };

    const handleValueChangeEnd = (val: number | number[]) => {
        const finalValue = Array.isArray(val) ? val[0] : val;
        onChange(finalValue);
    };

    return (
        <Card className="border border-border rounded-xl shadow-sm h-full">
            <CardHeader className="bg-muted/30 border-b border-border py-3 px-5">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                    <CalendarClock className="w-3.5 h-3.5" />
                    Frequency
                </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Interval</span>
                        <span className="text-xs font-black font-mono">{localValue} Days</span>
                    </div>
                    <Slider
                        value={[localValue]}
                        max={180}
                        min={30}
                        step={15}
                        onValueChange={handleValueChange}
                        onValueChangeEnd={handleValueChangeEnd}
                        className="py-1"
                    />
                </div>

                <div className="bg-muted/50 border border-border px-3 py-2.5 rounded-lg flex items-center justify-between">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Next Poll</p>
                    <p className="text-[11px] font-bold text-foreground">
                        {format(nextCheckIn, "MMM d, yyyy")}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
