"use client";
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { TrendingUpIcon } from "lucide-react";

// Mock historical data since the backend doesn't provide it yet
const data = [
    { value: 1200000 },
    { value: 1250000 },
    { value: 1240000 },
    { value: 1300000 },
    { value: 1450000 },
    { value: 1420000 },
    { value: 1580000 },
];

function formatINR(v: number) {
    if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(2)}Cr`;
    if (v >= 100_000) return `₹${(v / 100_000).toFixed(2)}L`;
    return `₹${v.toLocaleString()}`;
}

export function NetWorthTrend({ totalValue }: { totalValue: number }) {
    // If we had real historical data, we would push the current totalValue to the end.
    const displayValue = totalValue > 0 ? totalValue : 1580000; // Mock current value for demo

    return (
        <div className="bg-card rounded-lg p-6 border border-border flex flex-col justify-between">
            <div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
                    <TrendingUpIcon className="w-4 h-4" /> Total Vault Value
                </h3>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                    {formatINR(displayValue)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-primary font-medium">+12.5%</span> vs last month
                </p>
            </div>
            
            <div className="h-24 w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-background border border-border p-2 rounded-lg text-xs font-medium">
                                            {formatINR(payload[0].value as number)}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <YAxis domain={['dataMin', 'dataMax']} hide />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="hsl(var(--foreground))" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
