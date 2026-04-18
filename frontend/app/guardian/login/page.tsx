"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GuardianLoginPageRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/auth/signin?role=guardian");
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-muted-foreground animate-pulse">Redirecting to secure login...</p>
        </div>
    );
}
