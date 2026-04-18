import { useState, useEffect, useCallback } from "react";

export interface TwoFASettings {
    email_otp_enabled: boolean;
    sms_otp_enabled: boolean;
    totp_enabled: boolean;
    preferred_method: string | null;
}

export function useSecurity() {
    const [twoFA, setTwoFA] = useState<TwoFASettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("paradosis_access_token");
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    };

    const fetch2FA = useCallback(async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
            const res = await fetch(`${baseUrl}/api/security/2fa`, {
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error("Failed to fetch 2FA settings");
            const data = await res.json();
            setTwoFA(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetch2FA();
    }, [fetch2FA]);

    const toggle2FA = async (method: "email_otp" | "sms_otp", enabled: boolean) => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
            const res = await fetch(`${baseUrl}/api/security/2fa/toggle`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ method, enabled }),
            });
            if (!res.ok) throw new Error("Update failed");
            await fetch2FA();
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        }
    };

    const disableTOTP = async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
            const res = await fetch(`${baseUrl}/api/security/2fa/totp/disable`, {
                method: "POST",
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error("Disable failed");
            await fetch2FA();
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        }
    };

    const changePassword = async (newPassword: string) => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
            const res = await fetch(`${baseUrl}/api/security/password`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ new_password: newPassword }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Password change failed");
            }
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        }
    };

    const deleteAccount = async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
            const res = await fetch(`${baseUrl}/api/security/account`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error("Deletion failed");
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        }
    };

    const exportVault = async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
            const res = await fetch(`${baseUrl}/api/security/vault-export`, {
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error("Export failed");
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `vault-export-${new Date().toISOString().split('T')[0]}.vault`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        }
    };

    return {
        twoFA,
        loading,
        error,
        toggle2FA,
        disableTOTP,
        changePassword,
        deleteAccount,
        exportVault,
        refresh: fetch2FA
    };
}
