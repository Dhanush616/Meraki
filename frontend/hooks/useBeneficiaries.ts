"use client";
import { useState, useEffect, useCallback } from "react";

export interface Beneficiary {
    id: string;
    owner_id: string;
    full_name: string;
    relationship: string;
    email: string | null;
    phone: string | null;
    aadhaar: string | null;
    pan: string | null;
    address: string | null;
    bank_account_number: string | null;
    bank_ifsc: string | null;
    crypto_wallet_address: string | null;
    disclosure_level: "total_secrecy" | "partial_awareness" | "full_transparency";
    is_minor: boolean;
    trustee_id: string | null;
    personal_message: string | null;
    status: string;
    assets_assigned_count: number;
    created_at: string;
    updated_at: string;
}

export interface BeneficiaryFormData {
    full_name: string;
    relationship: string;
    email?: string;
    phone?: string;
    aadhaar?: string;
    pan?: string;
    address?: string;
    bank_account_number?: string;
    bank_ifsc?: string;
    crypto_wallet_address?: string;
    disclosure_level: string;
    is_minor: boolean;
    trustee_id?: string | null;
    personal_message?: string;
}

function getApiUrl() {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

function getToken() {
    return localStorage.getItem("paradosis_access_token");
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    };
}

export function useBeneficiaries() {
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBeneficiaries = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${getApiUrl()}/api/beneficiaries`, {
                headers: authHeaders(),
            });
            if (!res.ok) throw new Error("Failed to fetch beneficiaries");
            const data: Beneficiary[] = await res.json();
            setBeneficiaries(data);
            setError(null);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBeneficiaries();
    }, [fetchBeneficiaries]);

    const createBeneficiary = async (data: BeneficiaryFormData): Promise<Beneficiary> => {
        const res = await fetch(`${getApiUrl()}/api/beneficiaries`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Failed to create beneficiary");
        }
        const created: Beneficiary = await res.json();
        setBeneficiaries((prev) => [...prev, { ...created, assets_assigned_count: 0 }]);
        return created;
    };

    const updateBeneficiary = async (id: string, data: Partial<BeneficiaryFormData>): Promise<Beneficiary> => {
        const res = await fetch(`${getApiUrl()}/api/beneficiaries/${id}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Failed to update beneficiary");
        }
        const updated: Beneficiary = await res.json();
        setBeneficiaries((prev) =>
            prev.map((b) => (b.id === id ? { ...updated, assets_assigned_count: b.assets_assigned_count } : b))
        );
        return updated;
    };

    const deleteBeneficiary = async (id: string): Promise<void> => {
        const res = await fetch(`${getApiUrl()}/api/beneficiaries/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Failed to delete beneficiary");
        }
        setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
    };

    return {
        beneficiaries,
        isLoading,
        error,
        refetch: fetchBeneficiaries,
        createBeneficiary,
        updateBeneficiary,
        deleteBeneficiary,
    };
}
