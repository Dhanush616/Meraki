import { useState, useEffect } from "react";

export interface EscalationSettings {
    owner_id: string;
    current_escalation_level: string;
    check_in_frequency_days: number;
    inactivity_threshold_days: number;
    vacation_mode_active: boolean;
    vacation_mode_start: string | null;
    vacation_mode_end: string | null;
    last_check_in_responded_at: string | null;
    last_login_detected_at: string | null;
}

export interface EmergencyContact {
    id: string;
    full_name: string;
    relationship: string;
    phone_number: string;
    email: string | null;
}

export interface BeneficiaryOrder {
    id: string;
    full_name: string;
    relationship: string;
    disclosure_level: string;
    contact_order: number | null;
}

export function useEscalationSettings() {
    const [settings, setSettings] = useState<EscalationSettings | null>(null);
    const [emergencyContact, setEmergencyContact] = useState<EmergencyContact | null>(null);
    const [beneficiaryOrder, setBeneficiaryOrder] = useState<BeneficiaryOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("paradosis_access_token");
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    };

    const fetchAll = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("paradosis_access_token");
            if (!token) throw new Error("No session found. Please sign in again.");

            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
            const headers = getAuthHeaders();

            const [settingsRes, contactRes, orderRes] = await Promise.all([
                fetch(`${baseUrl}/api/escalation/settings`, { headers }),
                fetch(`${baseUrl}/api/escalation/emergency-contact`, { headers }),
                fetch(`${baseUrl}/api/escalation/beneficiary-order`, { headers }),
            ]);

            if (!settingsRes.ok) throw new Error("Failed to fetch settings");
            if (!contactRes.ok) throw new Error("Failed to fetch emergency contact");
            if (!orderRes.ok) throw new Error("Failed to fetch beneficiary order");

            setSettings(await settingsRes.json());
            setEmergencyContact(await contactRes.json());
            setBeneficiaryOrder(await orderRes.json());
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const updateSettings = async (updates: Partial<EscalationSettings>) => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
            const res = await fetch(`${baseUrl}/api/escalation/settings`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(updates),
            });
            if (!res.ok) throw new Error("Update failed");
            await fetchAll();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const updateEmergencyContact = async (contact: Omit<EmergencyContact, "id">) => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
            const res = await fetch(`${baseUrl}/api/escalation/emergency-contact`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(contact),
            });
            if (!res.ok) throw new Error("Update failed");
            await fetchAll();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const updateBeneficiaryOrder = async (orderedIds: string[]) => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
            const res = await fetch(`${baseUrl}/api/escalation/beneficiary-order`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({ ordered_ids: orderedIds }),
            });
            if (!res.ok) throw new Error("Update failed");
            await fetchAll();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const toggleVacationMode = async (active: boolean, dates?: { start: string; end: string }) => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
            const method = active ? "POST" : "DELETE";
            const body = active ? JSON.stringify({ start_date: dates?.start, end_date: dates?.end }) : undefined;
            
            const res = await fetch(`${baseUrl}/api/escalation/vacation`, {
                method,
                headers: getAuthHeaders(),
                body,
            });
            if (!res.ok) throw new Error("Vacation mode update failed");
            await fetchAll();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return {
        settings,
        emergencyContact,
        beneficiaryOrder,
        loading,
        error,
        updateSettings,
        updateEmergencyContact,
        updateBeneficiaryOrder,
        toggleVacationMode,
        refresh: fetchAll
    };
}
