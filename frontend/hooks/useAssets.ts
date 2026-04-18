"use client";
import useSWR from "swr";

export interface Asset {
    id: string;
    nickname: string;
    asset_type: string;
    institution_name: string | null;
    account_identifier: string | null;
    estimated_value_inr: number | null;
    status: string;
    nominee_registered: boolean;
    primary_total_pct: number;
    primary_beneficiary_count: number;
    backup_beneficiary_count: number;
    created_at: string;
    updated_at: string;
}

export interface AssetMapping {
    id: string;
    asset_id: string;
    beneficiary_id: string;
    role: string;
    percentage: number;
    priority_order: number;
}

export interface MappingFormData {
    beneficiary_id: string;
    role: string;
    percentage: number;
    priority_order: number;
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

export function useAssets() {
    const apiUrl = `${getApiUrl()}/api/assets`;

    const { data: assets = [], error, isLoading, mutate } = useSWR<Asset[]>(apiUrl, fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 2000,
    });

    const updateAssetMappings = async (assetId: string, mappings: MappingFormData[]) => {
        const token = getToken();
        const res = await fetch(`${apiUrl}/${assetId}/mappings`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(mappings),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Failed to update mappings");
        }
        await mutate(); // Refresh assets to get updated percentages
        return res.json();
    };

    const getAssetMappings = async (assetId: string): Promise<AssetMapping[]> => {
        const token = getToken();
        const res = await fetch(`${apiUrl}/${assetId}/mappings`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) throw new Error("Failed to fetch mappings");
        return res.json();
    };

    return {
        assets,
        isLoading,
        error: error ? error.message : null,
        refetch: mutate,
        updateAssetMappings,
        getAssetMappings,
    };
}
