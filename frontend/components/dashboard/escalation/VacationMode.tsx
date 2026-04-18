import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, differenceInDays } from "date-fns";
import { CalendarIcon, PlaneTakeoff, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface VacationModeProps {
    isActive: boolean;
    startDate: string | null;
    endDate: string | null;
    onToggle: (active: boolean, dates?: { start: string; end: string }) => void;
}

export function VacationMode({ isActive, startDate, endDate, onToggle }: VacationModeProps) {
    const [date, setDate] = useState<DateRange | undefined>(
        startDate && endDate ? { from: new Date(startDate), to: new Date(endDate) } : undefined
    );

    const handleToggle = (checked: boolean) => {
        if (checked) {
            if (date?.from && date?.to) {
                onToggle(true, { start: date.from.toISOString(), end: date.to.toISOString() });
            } else {
                // Should show error or prevent toggle
            }
        } else {
            onToggle(false);
        }
    };

    const isLongVacation = date?.from && date?.to && differenceInDays(date.to, date.from) > 180;

    return (
        <Card className="border-2 border-oat-border shadow-clay">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <PlaneTakeoff className="w-5 h-5 text-slushie-500" />
                        Vacation Mode
                    </CardTitle>
                    <Switch 
                        checked={isActive} 
                        onCheckedChange={handleToggle}
                        disabled={!isActive && (!date?.from || !date?.to || isLongVacation)}
                    />
                </div>
                <CardDescription>
                    Pause check-ins while you are away. Escalation will not trigger during this period.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col gap-2">
                    <Label className="text-sm font-medium">Select Dates</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal border-2 h-12 rounded-xl",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "LLL dd, y")} -{" "}
                                            {format(date.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                                disabled={(date) => date < new Date()}
                            />
                        </PopoverContent>
                    </Popover>
                    {isLongVacation && (
                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-semibold">
                            <Info className="w-3 h-3" />
                            Vacation mode cannot exceed 180 days.
                        </p>
                    )}
                </div>

                {isActive ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                            <CheckIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-emerald-800">Vacation Mode Active</p>
                            <p className="text-xs text-emerald-600">You're all set. Enjoy your trip!</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Setting dates will send a confirmation email once activated.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

function CheckIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}
