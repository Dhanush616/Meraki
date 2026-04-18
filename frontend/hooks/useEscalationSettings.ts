"use client";
import { useState, useEffect, useCallback } from "react";

export interface EscalationSettings {
    id?: string;
    owner_id: string;
    current_escalation_level: string;
    check_in_frequency_days: number;
    inactivity_threshold_days: number;
    vacation_mode_active: boolean;
    vacation_mode_start: string | null;
    vacation_mode_end: string | null;
    last_check_in_responded_at: string | null;
    last_login_detected_at: string | null;
    login_baseline_avg_gap_days: number | null;
    escalation_started_at: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface EmergencyContact {
    id?: string;
    owner_id?: string;
    full_name: string;
    relationship: string;
    phone_number: string;
    email: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface BeneficiaryOrder {
    id: string;
    full_name: string;
    relationship: string;
    disclosure_level: string;
    contact_order?: number;
}

function getApiUrl() {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}
function getToken() {
    return localStorage.getItem("paradosis_access_token");
}
function authHeaders(json = true): Record<string, string> {
    const h: Record<string, string> = { Authorization: `Bearer ${getToken()}` };
    if (json) h["Content-Type"] = "application/json";
    return h;
}

export function useEscalationSettings() {
    const [settings, setSettings] = useState<EscalationSettings | null>(null);
    const [emergencyContact, setEmergencyContact] = useState<EmergencyContact | null>(null);
    const [beneficiaryOrder, setBeneficiaryOrder] = useState<BeneficiaryOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        try {
            setIsLoading(true);
            const base = getApiUrl();
            const [settingsRes, contactRes, orderRes] = await Promise.all([
                fetch(`${base}/api/escalation/settings`, { headers: authHeaders(false) }),
                fetch(`${base}/api/escalation/emergency-contact`, { headers: authHeaders(false) }),
                fetch(`${base}/api/escalation/beneficiary-order`, { headers: authHeaders(false) }),
            ]);

            if (!settingsRes.ok) throw new Error("Failed to fetch escalation settings");
            const settingsData = await settingsRes.json();
            setSettings(settingsData);

            if (contactRes.ok) {
                const contactData = await contactRes.json();
                setEmergencyContact(contactData);
            }

            if (orderRes.ok) {
                const orderData = await orderRes.json();
                setBeneficiaryOrder(orderData);
            }

            setError(null);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const updateSettings = async (data: Partial<EscalationSettings>) => {
        const res = await fetch(`${getApiUrl()}/api/escalation/settings`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update settings");
        setSettings((prev) => (prev ? { ...prev, ...data } : prev));
    };

    const activateVacation = async (startDate: string, endDate: string) => {
        const res = await fetch(`${getApiUrl()}/api/escalation/vacation`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ start_date: startDate, end_date: endDate }),
        });
        if (!res.ok) throw new Error("Failed to activate vacation mode");
        setSettings((prev) =>
            prev
                ? {
                      ...prev,
                      vacation_mode_active: true,
                      vacation_mode_start: startDate,
                      vacation_mode_end: endDate,
                  }
                : prev
        );
    };

    const deactivateVacation = async () => {
        const res = await fetch(`${getApiUrl()}/api/escalation/vacation`, {
            method: "DELETE",
            headers: authHeaders(false),
        });
        if (!res.ok) throw new Error("Failed to deactivate vacation mode");
        setSettings((prev) =>
            prev
                ? {
                      ...prev,
                      vacation_mode_active: false,
                      vacation_mode_start: null,
                      vacation_mode_end: null,
                  }
                : prev
        );
    };

    const updateEmergencyContact = async (data: EmergencyContact) => {
        const res = await fetch(`${getApiUrl()}/api/escalation/emergency-contact`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update emergency contact");
        setEmergencyContact(data);
    };

    const updateBeneficiaryOrder = async (orderedIds: string[]) => {
        const res = await fetch(`${getApiUrl()}/api/escalation/beneficiary-order`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify({ ordered_ids: orderedIds }),
        });
        if (!res.ok) throw new Error("Failed to update beneficiary order");
        // Re-sort local state
        const reordered = orderedIds
            .map((id, i) => {
                const b = beneficiaryOrder.find((x) => x.id === id);
                return b ? { ...b, contact_order: i } : null;
            })
            .filter(Boolean) as BeneficiaryOrder[];
        setBeneficiaryOrder(reordered);
    };

    return {
        settings,
        emergencyContact,
        beneficiaryOrder,
        isLoading,
        error,
        refetch: fetchAll,
        updateSettings,
        activateVacation,
        deactivateVacation,
        updateEmergencyContact,
        updateBeneficiaryOrder,
    };
}
