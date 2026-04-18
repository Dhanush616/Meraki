"use client";
import useSWR from "swr";

export interface AssetTypeSummary {
    asset_type: string;
    count: number;
    total_value: number;
}

export interface ActivityLog {
    id: string;
    action: string;
    entity_type: string | null;
    entity_id: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
}

export interface VaultSummary {
    health_score: number;
    asset_count: number;
    beneficiary_count: number;
    escalation_level: string;
    last_check_in: string | null;
    recent_activity: ActivityLog[];
    onboarding_step: number;
    onboarding_done: boolean;
    assets_by_type: AssetTypeSummary[];
    check_in_frequency_days: number;
}

function getUserIdFromToken(token: string): string | null {
    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
        return decoded.sub ?? null;
    } catch {
        return null;
    }
}

const fetcher = async (url: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("paradosis_access_token") : null;
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to load vault data. Please sign in again.");

    return await res.json();
};

export function useVaultSummary() {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/vault/summary`;

    // Using SWR for aggressive caching and stale-while-revalidate behavior
    const { data, error, isLoading, mutate } = useSWR<VaultSummary>(
        apiUrl,
        fetcher,
        {
            revalidateOnFocus: true, // Revalidate when user clicks back to the tab
            refreshInterval: 15000, // Silently poll every 15 seconds for new activity feed logs
            dedupingInterval: 2000,
        }
    );

    return {
        data: data || null,
        isLoading,
        error: error ? error.message : null,
        refetch: mutate
    };
}