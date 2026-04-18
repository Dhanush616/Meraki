import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { format, addDays } from "date-fns";
import { CalendarClock } from "lucide-react";

interface CheckInFrequencyProps {
    value: number;
    lastCheckIn: string | null;
    onChange: (val: number) => void;
}

export function CheckInFrequency({ value, lastCheckIn, onChange }: CheckInFrequencyProps) {
    const [localValue, setLocalValue] = useState(value);
    
    const lastDate = lastCheckIn ? new Date(lastCheckIn) : new Date();
    const nextCheckIn = addDays(lastDate, localValue);

    return (
        <Card className="border-2 border-oat-border shadow-clay">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarClock className="w-5 h-5 text-matcha-600" />
                    Check-in Frequency
                </CardTitle>
                <CardDescription>
                    How often should we ask you to confirm you're doing okay?
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Frequency: <span className="text-primary font-bold">{localValue} days</span></Label>
                        <span className="text-xs text-muted-foreground">(Min: 30, Max: 180)</span>
                    </div>
                    <Slider
                        defaultValue={[localValue]}
                        max={180}
                        min={30}
                        step={15}
                        onValueChange={(vals) => setLocalValue(vals[0])}
                        onValueCommit={(vals) => onChange(vals[0])}
                        className="py-4"
                    />
                </div>

                <div className="bg-matcha-50 border border-matcha-200 p-4 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-matcha-600 font-bold mb-1">Next Check-In</p>
                        <p className="text-xl font-bold text-matcha-800">
                            {format(nextCheckIn, "MMMM do, yyyy")}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-matcha-600 shadow-sm border border-matcha-100">
                        <CalendarClock className="w-6 h-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
