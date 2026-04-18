"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

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

// Decode the user_id from a Supabase JWT without a library
function getUserIdFromToken(token: string): string | null {
    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
        return decoded.sub ?? null;
    } catch {
        return null;
    }
}

export function useVaultSummary() {
    const [data, setData] = useState<VaultSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = useCallback(async () => {
        try {
            const token = localStorage.getItem("paradosis_access_token");
            if (!token) throw new Error("Not authenticated");

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiUrl}/api/vault/summary`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to load vault data. Please sign in again.");

            const json: VaultSummary = await res.json();
            setData(json);
            setError(null);
            return { token, userId: getUserIdFromToken(token) };
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unknown error");
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
        const supabase = createClient();

        fetchSummary().then((result) => {
            if (!isMounted || !result) return;
            const { token, userId } = result;
            if (!userId) return;

            // Realtime subscription for live activity feed updates
            supabase.realtime.setAuth(token);

            const channelName = `activity-feed-${userId}-${Date.now()}`;
            channel = supabase
                .channel(channelName)
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "activity_logs",
                        filter: `owner_id=eq.${userId}`,
                    },
                    (payload) => {
                        setData((prev) =>
                            prev
                                ? {
                                      ...prev,
                                      recent_activity: [
                                          payload.new as ActivityLog,
                                          ...prev.recent_activity,
                                      ].slice(0, 5),
                                  }
                                : prev
                        );
                    }
                )
                .subscribe();
        });

        return () => {
            isMounted = false;
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [fetchSummary]);

    return { data, isLoading, error, refetch: fetchSummary };
}
