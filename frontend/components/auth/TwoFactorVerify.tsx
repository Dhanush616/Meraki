"use client";
import React, { useState } from "react";
import { CopyIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OTPInput } from "./OTPInput";

export function TwoFactorVerify() {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Verify logic here
        setTimeout(() => {
            setIsLoading(false);
            console.log("Verified OTP", otp);
        }, 1000);
    };

    return (
        <form onSubmit={handleVerify} className="flex flex-col items-center">
            <p className="text-muted-foreground font-sans text-center text-sm mb-6 leading-relaxed">
                Enter the 6-digit code from your authenticator app to access your vault.
            </p>

            <div className="w-full mb-8">
                <OTPInput value={otp} onChange={setOtp} length={6} />
            </div>

            <Button
                type="submit"
                disabled={otp.length !== 6 || isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-[#b05637] transition-all rounded-lg py-6 shadow-sm group border-none"
            >
                {isLoading ? (
                    <span className="animate-pulse">Verifying...</span>
                ) : (
                    <span className="font-medium text-base">Confirm Code</span>
                )}
            </Button>

            <button type="button" className="text-sm text-primary hover:underline font-sans mt-6">
                Having trouble? Use a backup code
            </button>
        </form>
    );
}