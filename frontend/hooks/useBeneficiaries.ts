"use client";
import useSWR from "swr";

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
    return typeof window !== "undefined" ? localStorage.getItem("paradosis_access_token") : null;
}

const fetcher = async (url: string) => {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to fetch data");
    }
    return res.json();
};

export function useBeneficiaries() {
    const apiUrl = `${getApiUrl()}/api/beneficiaries`;

    // SWR handles caching, revalidation, and loading states out of the box
    const { data: beneficiaries = [], error, isLoading, mutate } = useSWR<Beneficiary[]>(apiUrl, fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 2000,
    });

    const createBeneficiary = async (data: BeneficiaryFormData): Promise<Beneficiary> => {
        const token = getToken();
        const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Failed to create beneficiary");
        }
        const created: Beneficiary = await res.json();
        await mutate([...beneficiaries, { ...created, assets_assigned_count: 0 }], false);
        return created;
    };

    const updateBeneficiary = async (id: string, data: Partial<BeneficiaryFormData>): Promise<Beneficiary> => {
        const token = getToken();
        const res = await fetch(`${apiUrl}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Failed to update beneficiary");
        }
        const updated: Beneficiary = await res.json();
        await mutate(
            beneficiaries.map((b) => (b.id === id ? { ...updated, assets_assigned_count: b.assets_assigned_count } : b)),
            false
        );
        return updated;
    };

    const deleteBeneficiary = async (id: string): Promise<void> => {
        const token = getToken();
        const res = await fetch(`${apiUrl}/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Failed to delete beneficiary");
        }
        await mutate(beneficiaries.filter((b) => b.id !== id), false);
    };

    return {
        beneficiaries,
        isLoading,
        error: error ? error.message : null,
        refetch: mutate,
        createBeneficiary,
        updateBeneficiary,
        deleteBeneficiary,
    };
}
