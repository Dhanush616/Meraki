"use client";
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Asset {
    id: string;
    asset_type: string;
    estimated_value_inr: string | null;
}

const CATEGORY_MAP: Record<string, string> = {
    bank_account: "Financial",
    fixed_deposit: "Financial",
    mutual_fund: "Financial",
    stocks_demat: "Financial",
    ppf_epf: "Financial",
    insurance: "Financial",
    business_ownership: "Financial",
    property: "Physical",
    vehicle: "Physical",
    gold_jewellery: "Physical",
    other: "Physical",
    crypto_wallet: "Digital",
};

// Strict grayscale minimalism
const COLORS = [
    "hsl(var(--foreground))", 
    "hsl(var(--muted-foreground))", 
    "hsl(var(--border))"
];

export function VaultDistributionChart({ assets }: { assets: Asset[] }) {
    const dataMap: Record<string, number> = { Financial: 0, Physical: 0, Digital: 0 };

    assets.forEach(a => {
        const cat = CATEGORY_MAP[a.asset_type] || "Physical";
        const valRaw = a.estimated_value_inr;
        let val = 0;
        if (typeof valRaw === "number") {
            val = valRaw;
        } else if (typeof valRaw === "string") {
            val = parseFloat(valRaw.replace(/,/g, ''));
        }
        if (!isNaN(val)) dataMap[cat] += val;
    });

    const data = Object.entries(dataMap)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({ name, value }));

    if (data.length === 0) return null;

    return (
        <div className="bg-card rounded-lg p-6 border border-border flex items-center justify-between gap-6">
            <div className="flex-1">
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">Vault Distribution</h3>
                <div className="space-y-3">
                    {data.map((entry, index) => (
                        <div key={entry.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                <span className="font-medium text-foreground">{entry.name}</span>
                            </div>
                            <span className="text-muted-foreground font-medium">
                                {Math.round((entry.value / data.reduce((a, b) => a + b.value, 0)) * 100)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-32 h-32 shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            formatter={(value: number) => `₹${value.toLocaleString()}`}
                            contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                            itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
