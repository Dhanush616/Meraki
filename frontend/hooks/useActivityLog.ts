import { useState, useEffect, useCallback } from "react";

export interface ActivityLog {
    id: string;
    action: string;
    entity_type: string | null;
    entity_id: string | null;
    metadata: Record<string, any>;
    created_at: string;
}

export function useActivityLog() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLogs = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("paradosis_access_token");
            if (!token) throw new Error("No session found");

            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
            const res = await fetch(`${baseUrl}/api/activity?page=${page}&limit=50`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to fetch activity logs");

            const data = await res.json();
            setLogs(data.logs || []);
            setTotal(data.total || 0);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return { logs, total, loading, error, refresh: fetchLogs };
}
