import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
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
            }
        } else {
            onToggle(false);
        }
    };

    const isLongVacation = date?.from && date?.to && differenceInDays(date.to, date.from) > 180;

    return (
        <Card className="border border-border rounded-xl shadow-sm h-full">
            <CardHeader className="bg-muted/30 border-b border-border py-3 px-5 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <PlaneTakeoff className="w-3.5 h-3.5" />
                    Vacation
                </CardTitle>
                <Switch 
                    checked={isActive} 
                    onCheckedChange={handleToggle}
                    className="scale-75"
                    disabled={!isActive && (!date?.from || !date?.to || isLongVacation)}
                />
            </CardHeader>
            <CardContent className="p-5 space-y-4">
                <div className="flex flex-col gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-medium border rounded-lg h-9 text-[10px] px-3",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-3 w-3" />
                                {date?.from ? (
                                    date.to ? (
                                        <>{format(date.from, "MMM d")} - {format(date.to, "MMM d")}</>
                                    ) : (
                                        format(date.from, "MMM d")
                                    )
                                ) : (
                                    <span>Select Dates</span>
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
                                numberOfMonths={1}
                                disabled={(date) => date < new Date()}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {isActive ? (
                    <div className="p-2 bg-zinc-900 text-white rounded-lg flex items-center gap-2">
                        <PlaneTakeoff className="w-3 h-3 text-white ml-1" />
                        <p className="text-[8px] font-black uppercase tracking-[0.2em]">Protection_Paused</p>
                    </div>
                ) : (
                    <p className="text-[9px] text-muted-foreground font-medium flex items-center gap-1.5 italic">
                        <Info className="w-2.5 h-2.5" /> Set dates to enable pause.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
